import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { users } from "../../../drizzle/schema";
import { APP_ROLES } from "@shared/domain/roles";
import { protectedProcedure, router } from "../../_core/trpc";
import { requireDatabase } from "../_shared/database";
import { requireRole } from "../access/authorization";
import { recordAudit } from "../audit/audit-repository";

export const userRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    requireRole(ctx, ["SOCIO", "ADMIN"]);
    const db = await requireDatabase();
    return db.select({ id: users.id, name: users.name, email: users.email, role: users.role }).from(users).orderBy(desc(users.lastSignedIn));
  }),
  changeRole: protectedProcedure.input(z.object({ userId: z.number().int(), role: z.enum(APP_ROLES) })).mutation(async ({ ctx, input }) => {
    const actor = requireRole(ctx, ["SOCIO"]);
    if (input.userId === actor.id && input.role !== "SOCIO") throw new Error("O SOCIO responsável não pode remover o próprio papel.");
    const db = await requireDatabase();
    await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
    await recordAudit({ action: "PAPEL_ALTERADO", entityType: "USUARIO", entityId: String(input.userId), actorUserId: actor.id, metadata: { role: input.role } });
    return { success: true };
  }),
});
