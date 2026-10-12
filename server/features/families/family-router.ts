import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull, gt } from "drizzle-orm";
import { z } from "zod";
import {
  familyAccess,
  firstAccessLinks,
  projectStatusValues,
} from "../../../drizzle/schema";
import { protectedProcedure, router } from "../../_core/trpc";
import { recordAudit, recordAuditSafe } from "../audit/audit-repository";
import { createId } from "../_shared/ids";
import { requireDatabase } from "../_shared/database";
import { assertFamilyAccess } from "../access/family-access";
import { requirePermission } from "../access/authorization";
import { Permission } from "../../../shared/domain/permissions";
import {
  getConclusionBlockers,
  listProjectAlertLevels,
} from "../alerts/project-alerts-repository";
import {
  createFamilyRecord,
  getFamilyRecord,
  listFamilyRecords,
  getDashboardData,
  listStorageFiles,
  getClientDashboardData,
  listClientStorageFiles,
  setProjectStatusRecord,
} from "./family-repository";
import { getFamilyTimelineRecord } from "./family-timeline-repository";
import { familyInputSchema } from "./family-types";
import { getPrimaryContact } from "../people/person-repository";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Anexa o alerta da Fase 9 (vermelho/amarelo por certidão) à lista de projetos. */
async function withAlerts<T extends { id: string }>(records: T[]) {
  const alerts = await listProjectAlertLevels(records.map(record => record.id));
  return records.map(record => ({
    ...record,
    alerts: alerts[record.id] ?? ("NENHUM" as const),
  }));
}

export const familyRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    if (user.role !== "CLIENTE") return withAlerts(await listFamilyRecords());
    const db = await requireDatabase();
    const access = await db
      .select()
      .from(familyAccess)
      .where(eq(familyAccess.userId, user.id));
    const records = await Promise.all(
      access.map(item => getFamilyRecord(item.familyId))
    );
    return withAlerts(
      records.filter(
        (record): record is NonNullable<typeof record> => record !== null
      )
    );
  }),
  get: protectedProcedure
    .input(z.object({ familyId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertFamilyAccess(ctx, input.familyId);
      return getFamilyRecord(input.familyId);
    }),
  updateStatus: protectedProcedure
    .input(
      z.object({
        familyId: z.string().min(1),
        status: z.enum(projectStatusValues),
        justification: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = requirePermission(ctx, Permission.FAMILY_UPDATE_STATUS);
      await assertFamilyAccess(ctx, input.familyId);
      if (input.status === "CONCLUIDO") {
        const blockers = await getConclusionBlockers(
          input.familyId,
          input.justification
        );
        if (blockers.length) {
          throw new Error(
            `O projeto não pode ser concluído: ${blockers.join(" ")}`
          );
        }
      }
      await setProjectStatusRecord(input.familyId, input.status);
      await recordAudit({
        action: "PROJETO_STATUS_ATUALIZADO",
        entityType: "FAMILIA",
        entityId: input.familyId,
        actorUserId: user.id,
        familyId: input.familyId,
        metadata: {
          status: input.status,
          justification: input.justification ?? "",
        },
      });
      return { success: true, status: input.status };
    }),
  timeline: protectedProcedure
    .input(z.object({ familyId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertFamilyAccess(ctx, input.familyId);
      return getFamilyTimelineRecord(input.familyId);
    }),
  create: protectedProcedure
    .input(familyInputSchema)
    .mutation(async ({ ctx, input }) => {
      const user = requirePermission(ctx, Permission.FAMILY_CREATE);
      const result = await createFamilyRecord(input, user.id);
      await recordAuditSafe({
        action: "FAMILIA_CRIADA",
        entityType: "FAMILIA",
        entityId: result.familyId,
        actorUserId: user.id,
        familyId: result.familyId,
      });
      return result;
    }),
  grantClientAccess: protectedProcedure
    .input(z.object({ familyId: z.string(), userId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const user = requirePermission(ctx, Permission.FAMILY_GRANT_CLIENT_ACCESS);
      await assertFamilyAccess(ctx, input.familyId);
      const db = await requireDatabase();
      await db
        .insert(familyAccess)
        .values({
          id: createId(),
          familyId: input.familyId,
          userId: input.userId,
          accessRole: "CLIENTE",
        })
        .onConflictDoNothing();
      await recordAuditSafe({
        action: "ACESSO_CLIENTE_CONCEDIDO",
        entityType: "FAMILIA",
        entityId: input.familyId,
        actorUserId: user.id,
        familyId: input.familyId,
      });
      return { success: true };
    }),
  generateFirstAccessLink: protectedProcedure
    .input(z.object({ familyId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = requirePermission(ctx, Permission.FAMILY_GENERATE_FIRST_ACCESS_LINK);
      await assertFamilyAccess(ctx, input.familyId);
      const db = await requireDatabase();

      const existingAccess = await db
        .select({ id: familyAccess.id })
        .from(familyAccess)
        .where(
          and(
            eq(familyAccess.familyId, input.familyId),
            eq(familyAccess.accessRole, "CLIENTE")
          )
        )
        .limit(1);
      if (existingAccess[0])
        throw new Error(
          "Esta família já possui acesso de cliente ativo. Não é necessário gerar um novo link."
        );

      const contact = await getPrimaryContact(input.familyId);
      if (!contact)
        throw new Error(
          "Família sem titular. Defina um titular na seção Pessoas antes de gerar o link."
        );
      if (!contact.taxId) throw new Error("Titular sem CPF cadastrado.");

      const token = randomBytes(24).toString("base64url");
      const linkId = createId();
      await db.insert(firstAccessLinks).values({
        id: linkId,
        familyId: input.familyId,
        personId: contact.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: String(user.id),
      });
      await recordAuditSafe({
        action: "LINK_PRIMEIRO_ACESSO_GERADO",
        entityType: "FAMILIA",
        entityId: input.familyId,
        actorUserId: user.id,
        familyId: input.familyId,
      });

      return { token, fullName: contact.fullName };
    }),
  generatePasswordResetLink: protectedProcedure
    .input(z.object({ familyId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = requirePermission(ctx, Permission.FAMILY_GENERATE_PASSWORD_RESET_LINK);
      await assertFamilyAccess(ctx, input.familyId);
      const db = await requireDatabase();

      const existingAccess = await db
        .select({ id: familyAccess.id })
        .from(familyAccess)
        .where(
          and(
            eq(familyAccess.familyId, input.familyId),
            eq(familyAccess.accessRole, "CLIENTE")
          )
        )
        .limit(1);
      if (!existingAccess[0])
        throw new Error(
          "Esta família não possui acesso de cliente ativo. Gere um link de primeiro acesso."
        );

      const contact = await getPrimaryContact(input.familyId);
      if (!contact)
        throw new Error(
          "Família sem titular."
        );
      if (!contact.taxId) throw new Error("Titular sem CPF cadastrado.");

      const token = randomBytes(24).toString("base64url");
      const linkId = createId();
      await db.insert(firstAccessLinks).values({
        id: linkId,
        familyId: input.familyId,
        personId: contact.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: String(user.id),
      });
      await recordAuditSafe({
        action: "LINK_REDEFINICAO_SENHA_GERADO",
        entityType: "FAMILIA",
        entityId: input.familyId,
        actorUserId: user.id,
        familyId: input.familyId,
      });

      return { token, fullName: contact.fullName };
    }),
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    if (user.role === "CLIENTE") return getClientDashboardData(user.id);
    requirePermission(ctx, Permission.FAMILY_GET_DASHBOARD);
    return getDashboardData();
  }),
  listStorage: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    if (user.role === "CLIENTE") return listClientStorageFiles(user.id);
    requirePermission(ctx, Permission.FAMILY_LIST_STORAGE);
    return listStorageFiles();
  }),
});
