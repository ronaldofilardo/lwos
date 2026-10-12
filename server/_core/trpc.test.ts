/**
 * @description Cobre o formatTrpcError: falha de validação (ZodError) vira
 * mensagem legível + data.fields; erro interno vira mensagem genérica (não
 * vaza detalhe) e é logado; demais erros passam intactos. Garante que a UI
 * nunca receba dump de JSON do ZodError.
 *
 * Os erros são construídos pelo caminho fiel ao runtime: catch do .parse() do
 * Zod -> new TRPCError({ cause }) — porque getCauseFromUnknown embrulha apenas
 * causas que não são instanceof Error, e um ZodError real é Error (issues
 * preservados), enquanto new ZodError([]) não é.
 * @see server/_core/trpc.ts
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { z, ZodError, ZodRealError } from "zod";
import { TRPCError } from "@trpc/server";

const loggerMocks = vi.hoisted(() => ({ logError: vi.fn(), logInfo: vi.fn() }));
vi.mock("../lib/logger", () => loggerMocks);

import { formatTrpcError } from "./trpc";

function baseShape(message: string, code: number, data: Record<string, unknown>) {
  return { message, code, data } as never;
}

/** Reproduz o caminho real do tRPC: erro lançado por .parse() vira TRPCError. */
function trpcFromParse(fn: () => void): TRPCError {
  try {
    fn();
  } catch (cause) {
    return new TRPCError({ code: "BAD_REQUEST", cause });
  }
  throw new Error("esperava falha de parse");
}

describe("formatTrpcError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("traduz falha de validação em mensagem legível e expõe data.fields", () => {
    const trpcErr = trpcFromParse(() =>
      z.object({ nome: z.string().min(3, "Informe o nome (mínimo 3 caracteres).") }).parse({ nome: "ab" })
    );

    const shape = baseShape(trpcErr.message, 400, { code: "BAD_REQUEST", httpStatus: 400 });
    const out = formatTrpcError({ shape, error: trpcErr });

    expect(out.message).toBe("Informe o nome (mínimo 3 caracteres).");
    expect(out.message).not.toContain("{");
    expect(out.message).not.toContain("issues");
    expect(out.data.fields).toEqual({ nome: "Informe o nome (mínimo 3 caracteres)." });
  });

  it("usa fallback Dados inválidos quando o ZodError não tem issues", () => {
    // ZodRealError estende Error -> sobrevive ao getCauseFromUnknown sem embrulho.
    const trpcErr = new TRPCError({ code: "BAD_REQUEST", cause: new ZodRealError([]) });
    expect(trpcErr.cause).toBeInstanceOf(ZodError);

    const shape = baseShape(trpcErr.message, 400, { code: "BAD_REQUEST", httpStatus: 400 });
    const out = formatTrpcError({ shape, error: trpcErr });

    expect(out.message).toBe("Dados inválidos.");
    expect(out.data.fields).toEqual({});
  });

  it("mascara erro interno com mensagem genérica e loga no servidor", () => {
    const trpcErr = new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "detalhe interno sensível",
    });
    const shape = baseShape(trpcErr.message, 500, {
      code: "INTERNAL_SERVER_ERROR",
      httpStatus: 500,
      path: "people.create",
    });

    const out = formatTrpcError({ shape, error: trpcErr });
    expect(out.message).toBe("Erro interno. Tente novamente em instantes.");
    expect(out.message).not.toContain("detalhe interno sensível");
    expect(loggerMocks.logError).toHaveBeenCalledWith(
      "trpc.internal_error",
      expect.objectContaining({ message: "detalhe interno sensível", path: "people.create" })
    );
  });

  it("preserva mensagem de erros de autorização/semânticos (sem ZodError)", () => {
    const trpcErr = new TRPCError({ code: "FORBIDDEN", message: "Permissão insuficiente." });
    const shape = baseShape(trpcErr.message, 403, { code: "FORBIDDEN", httpStatus: 403 });

    const out = formatTrpcError({ shape, error: trpcErr });
    expect(out.message).toBe("Permissão insuficiente.");
    expect(out.data.fields).toBeUndefined();
    expect(loggerMocks.logError).not.toHaveBeenCalled();
  });
});
