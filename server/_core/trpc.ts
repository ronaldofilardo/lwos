import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '../../shared/const';
import { initTRPC, TRPCError, type TRPC_ERROR_CODE_KEY } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { logError } from "../lib/logger";
import type { TrpcContext } from "./context";

type ErrorShape = {
  message: string;
  code: number;
  data: { code: TRPC_ERROR_CODE_KEY; httpStatus: number; stack?: string; path?: string; fields?: Record<string, string> };
};

/**
 * Formata erros do tRPC para a UI. Sem isso, uma falha de validação de input
 * expõe ao usuário o dump JSON do ZodError (a mensagem herdada do cause).
 * Exportada para permitir teste unitário direto — o createCaller de teste não
 * passa pelo adaptador HTTP onde o formatter roda de verdade.
 */
export function formatTrpcError(opts: { shape: ErrorShape; error: TRPCError }): ErrorShape {
  const { shape, error } = opts;
  if (error.cause instanceof ZodError) {
    const issues = error.cause.issues;
    return {
      ...shape,
      message: issues[0]?.message ?? "Dados inválidos.",
      data: {
        ...shape.data,
        fields: Object.fromEntries(
          issues.map(issue => [issue.path.join("."), issue.message])
        ),
      },
    };
  }
  if (error.code === "INTERNAL_SERVER_ERROR") {
    logError("trpc.internal_error", {
      path: shape.data?.path,
      message: error.message,
    });
    return { ...shape, message: "Erro interno. Tente novamente em instantes." };
  }
  return shape;
}

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter: formatTrpcError,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== "ADMIN") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
