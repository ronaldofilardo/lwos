import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull, gt } from "drizzle-orm";
import { z } from "zod";
import { familyAccess, firstAccessLinks } from "../../../drizzle/schema";
import { protectedProcedure, router } from "../../_core/trpc";
import { recordAudit } from "../audit/audit-repository";
import { createId } from "../_shared/ids";
import { requireDatabase } from "../_shared/database";
import { assertFamilyAccess } from "../access/family-access";
import { requireRole } from "../access/authorization";
import { TEAM_ROLES } from "@shared/domain/roles";
import {
  createFamilyRecord,
  getFamilyRecord,
  listFamilyRecords,
  getDashboardData,
  listStorageFiles,
  getClientDashboardData,
  listClientStorageFiles,
} from "./family-repository";
import { getFamilyTimelineRecord } from "./family-timeline-repository";
import { familyInputSchema } from "./family-types";
import { getPrimaryContact } from "../people/person-repository";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export const familyRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    if (user.role !== "CLIENTE") return listFamilyRecords();
    const db = await requireDatabase();
    const access = await db
      .select()
      .from(familyAccess)
      .where(eq(familyAccess.userId, user.id));
    const records = await Promise.all(
      access.map(item => getFamilyRecord(item.familyId))
    );
    return records.filter(Boolean);
  }),
  get: protectedProcedure
    .input(z.object({ familyId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertFamilyAccess(ctx, input.familyId);
      return getFamilyRecord(input.familyId);
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
      const user = requireRole(ctx, TEAM_ROLES);
      const result = await createFamilyRecord(input, user.id);
      try {
        await recordAudit({
          action: "FAMILIA_CRIADA",
          entityType: "FAMILIA",
          entityId: result.familyId,
          actorUserId: user.id,
          familyId: result.familyId,
        });
      } catch {
        /* audit failure should not break main operation */
      }
      return result;
    }),
  grantClientAccess: protectedProcedure
    .input(z.object({ familyId: z.string(), userId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const user = requireRole(ctx, ["SOCIO"]);
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
      try {
        await recordAudit({
          action: "ACESSO_CLIENTE_CONCEDIDO",
          entityType: "FAMILIA",
          entityId: input.familyId,
          actorUserId: user.id,
          familyId: input.familyId,
        });
      } catch {
        /* audit failure should not break main operation */
      }
      return { success: true };
    }),
  generateFirstAccessLink: protectedProcedure
    .input(z.object({ familyId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = requireRole(ctx, ["SOCIO"]);
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

      try {
        await recordAudit({
          action: "LINK_PRIMEIRO_ACESSO_GERADO",
          entityType: "FAMILIA",
          entityId: input.familyId,
          actorUserId: user.id,
          familyId: input.familyId,
        });
      } catch {
        /* audit failure should not break main operation */
      }

      return { token, fullName: contact.fullName };
    }),
  generatePasswordResetLink: protectedProcedure
    .input(z.object({ familyId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = requireRole(ctx, ["SOCIO"]);
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

      try {
        await recordAudit({
          action: "LINK_REDEFINICAO_SENHA_GERADO",
          entityType: "FAMILIA",
          entityId: input.familyId,
          actorUserId: user.id,
          familyId: input.familyId,
        });
      } catch {
        /* audit failure should not break main operation */
      }

      return { token, fullName: contact.fullName };
    }),
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    if (user.role === "CLIENTE") return getClientDashboardData(user.id);
    requireRole(ctx, ["SOCIO", "ADMIN"]);
    return getDashboardData();
  }),
  listStorage: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    if (user.role === "CLIENTE") return listClientStorageFiles(user.id);
    requireRole(ctx, ["SOCIO", "ADMIN"]);
    return listStorageFiles();
  }),
});
