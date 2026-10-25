import { TRPCError } from "@trpc/server";

/**
 * Erros de negócio tipados. Um `throw new Error(...)` simples vira
 * INTERNAL_SERVER_ERROR e o `errorFormatter` (server/_core/trpc.ts) troca a
 * mensagem por "Erro interno" — o usuário nunca veria, por exemplo, "A soma
 * das participações não pode passar de 100%". Estes helpers preservam a
 * mensagem e devolvem o status HTTP correto (400/404/409).
 *
 * Uso: `throw badRequest("Informe a jurisdição.")`.
 */
export const badRequest = (message: string) =>
  new TRPCError({ code: "BAD_REQUEST", message });

export const notFound = (message: string) =>
  new TRPCError({ code: "NOT_FOUND", message });

export const conflict = (message: string) =>
  new TRPCError({ code: "CONFLICT", message });
