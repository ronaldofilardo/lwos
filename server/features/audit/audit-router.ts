import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { auditLogs } from "../../../drizzle/schema";
import { protectedProcedure, router } from "../../_core/trpc";
import { requireDatabase } from "../_shared/database";
import { assertFamilyAccess } from "../access/family-access";
import { requirePermission } from "../access/authorization";
import { Permission } from "../../../shared/domain/permissions";

export const auditRouter = router({
  listByFamily: protectedProcedure.input(z.object({ familyId: z.string() })).query(async ({ ctx, input }) => {
    requirePermission(ctx, Permission.AUDIT_LIST_BY_FAMILY);
    await assertFamilyAccess(ctx, input.familyId);
    const db = await requireDatabase();
    return db.select().from(auditLogs).where(eq(auditLogs.familyId, input.familyId)).orderBy(desc(auditLogs.createdAt));
  }),
});
