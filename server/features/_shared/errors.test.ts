/**
 * @description Erros de negócio tipados: carregam o code tRPC correto e a
 * mensagem chega ao cliente (um Error comum viraria "Erro interno").
 * @see server/features/_shared/errors.ts
 */
import { describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";

const loggerMocks = vi.hoisted(() => ({ logError: vi.fn(), logInfo: vi.fn() }));
vi.mock("../../lib/logger", () => loggerMocks);

import { formatTrpcError } from "../../_core/trpc";
import { badRequest, conflict, notFound } from "./errors";

describe("erros de negócio tipados", () => {
  it("usa o code tRPC de cada tipo", () => {
    expect(badRequest("x")).toBeInstanceOf(TRPCError);
    expect(badRequest("x").code).toBe("BAD_REQUEST");
    expect(notFound("x").code).toBe("NOT_FOUND");
    expect(conflict("x").code).toBe("CONFLICT");
  });

  it("preserva a mensagem de negócio no formatter", () => {
    const error = badRequest("A soma das participações não pode passar de 100%.");
    const shape = {
      message: error.message,
      code: -32600,
      data: { code: "BAD_REQUEST", httpStatus: 400 },
    } as never;

    const out = formatTrpcError({ shape, error });

    expect(out.message).toBe("A soma das participações não pode passar de 100%.");
  });

  it("um Error comum continua mascarado como erro interno", () => {
    const error = new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "detalhe interno" });
    const shape = {
      message: error.message,
      code: -32603,
      data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500 },
    } as never;

    expect(formatTrpcError({ shape, error }).message).not.toContain("detalhe interno");
  });
});
