import { TRPCError } from "@trpc/server";
import type { AppRole } from "@shared/domain/roles";
import type { TrpcContext } from "../../_core/context";

export function requireUser(ctx: TrpcContext) {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Autenticação necessária." });
  }
  return ctx.user;
}

export function requireRole(ctx: TrpcContext, allowed: readonly AppRole[]) {
  const user = requireUser(ctx);
  if (!allowed.includes(user.role as AppRole)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Permissão insuficiente." });
  }
  return user;
}
