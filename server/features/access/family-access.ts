import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { familyAccess } from "../../../drizzle/schema";
import type { User } from "../../../drizzle/schema";
import type { TrpcContext } from "../../_core/context";
import { requireDatabase } from "../_shared/database";
import { requireUser } from "./authorization";

/**
 * Núcleo da checagem de acesso a uma família — sem depender de contexto tRPC,
 * pra poder ser reaproveitado pela rota Express de download (/local-storage/*).
 */
export async function userHasFamilyAccess(user: User, familyId: string): Promise<boolean> {
  if (user.role !== "CLIENTE") return true;
  const db = await requireDatabase();
  const records = await db
    .select({ id: familyAccess.id })
    .from(familyAccess)
    .where(and(eq(familyAccess.familyId, familyId), eq(familyAccess.userId, user.id)))
    .limit(1);
  return Boolean(records[0]);
}

export async function assertFamilyAccess(ctx: TrpcContext, familyId: string) {
  const user = requireUser(ctx);
  const allowed = await userHasFamilyAccess(user, familyId);
  if (!allowed) throw new TRPCError({ code: "FORBIDDEN", message: "Acesso à família não autorizado." });
  return user;
}
