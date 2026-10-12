import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { lwrReports } from "../../../drizzle/schema";
import { protectedProcedure, router } from "../../_core/trpc";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import { assertFamilyAccess } from "../access/family-access";
import { requirePermission } from "../access/authorization";
import { Permission } from "../../../shared/domain/permissions";
import { recordAudit } from "../audit/audit-repository";
import { lwrInputSchema } from "./lwr-types";
import { withAdvisoryLock, AdvisoryLockKey } from "../../_shared/advisory-lock";

export const lwrRouter = router({
  list: protectedProcedure.input(z.object({ familyId: z.string() })).query(async ({ ctx, input }) => {
    requirePermission(ctx, Permission.LWR_CREATE);
    await assertFamilyAccess(ctx, input.familyId);
    const db = await requireDatabase();
    return db.select().from(lwrReports).where(eq(lwrReports.familyId, input.familyId)).orderBy(desc(lwrReports.version));
  }),
  create: protectedProcedure.input(lwrInputSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.LWR_CREATE);
    await assertFamilyAccess(ctx, input.familyId);

    return withAdvisoryLock(
      requireDatabase(),
      "LWR_CREATE",
      input.familyId,
      async (tx) => {
        const previous = await tx
          .select({ version: lwrReports.version })
          .from(lwrReports)
          .where(eq(lwrReports.familyId, input.familyId))
          .orderBy(desc(lwrReports.version))
          .limit(1);
        const version = (previous[0]?.version ?? 0) + 1;
        const reportId = createId();
        await tx.insert(lwrReports).values({
          id: reportId,
          familyId: input.familyId,
          version,
          responsibleUserId: String(user.id),
          baseDate: input.baseDate,
          proposedStructure: input.proposedStructure,
          financialProposal: input.financialProposal || "Proposta financeira gerenciada no módulo autônomo.",
          canvaUrl: input.canvaUrl || null,
          presentationFileKey: input.presentationFileKey || null,
        });
        await recordAudit({ action: "LWR_CRIADO", entityType: "LWR", entityId: reportId, actorUserId: user.id, familyId: input.familyId, metadata: { version } });
        return { reportId, version };
      }
    );
  }),
});
