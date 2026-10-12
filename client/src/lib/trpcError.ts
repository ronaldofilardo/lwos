/**
 * Traduz erros do tRPC em mensagens legíveis para o usuário final.
 *
 * O `errorFormatter` do servidor (server/_core/trpc.ts) devolve, para falhas de
 * validação, `message` com o primeiro issue em pt-BR e `data.fields` no formato
 * `{ "caminho.do.campo": "mensagem" }`. Para erros internos, o servidor devolve
 * uma mensagem genérica. Este helper garante que a UI nunca exiba um dump
 * técnico (JSON, stack ou texto de rede) no toast.
 */

type FieldErrors = Record<string, string>;

type TrpcLikeError = {
  message?: string;
  data?: { fields?: FieldErrors; code?: string } | null;
};

function asTrpcError(error: unknown): TrpcLikeError | null {
  if (typeof error !== "object" || error === null) return null;
  return error as TrpcLikeError;
}

/** Mensagem amigável (pt-BR) para exibir em toast/erro global. */
export function errorMessage(error: unknown): string {
  const trpc = asTrpcError(error);
  const message = trpc?.message?.trim();
  if (!message) return "Não foi possível concluir a operação. Tente novamente.";
  // Rede/transporte: fetch rejeitado sem resposta do servidor.
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return "Não foi possível conectar. Verifique sua conexão e tente novamente.";
  }
  return message;
}

/** Mensagem de validação de um campo específico, se houver. */
export function fieldError(error: unknown, field: string): string | undefined {
  return asTrpcError(error)?.data?.fields?.[field];
}

/** Mapa completo de erros por campo (para formulários com react-hook-form). */
export function fieldErrors(error: unknown): FieldErrors {
  return asTrpcError(error)?.data?.fields ?? {};
}
