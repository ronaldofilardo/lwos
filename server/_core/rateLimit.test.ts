/**
 * @description Valida o limitador em memória compartilhado: teto por chave,
 * janela de tempo, isolamento entre chaves, reset global e evicção por teto
 * de chaves (MEMORY PRESSURE).
 * @see server/_core/rateLimit.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  RATE_LIMIT_MAX_KEYS,
  RateLimitError,
  checkRateLimit,
  resetRateLimit,
  resetRateLimits,
} from "./rateLimit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimits();
  });

  it("bloqueia a tentativa acima do máximo na mesma janela", () => {
    for (let i = 0; i < 10; i++) checkRateLimit("login", 10);

    expect(() => checkRateLimit("login", 10)).toThrow(RateLimitError);
    expect(() => checkRateLimit("login", 10)).toThrow("Muitas tentativas. Tente novamente mais tarde.");
  });

  it("mantém contadores independentes por chave", () => {
    for (let i = 0; i < 10; i++) checkRateLimit("ip1", 10);

    expect(() => checkRateLimit("ip1", 10)).toThrow(RateLimitError);
    expect(() => checkRateLimit("ip2", 10)).not.toThrow();
  });

  it("reinicia a janela após windowMs", async () => {
    for (let i = 0; i < 10; i++) checkRateLimit("janela", 10, 50);
    expect(() => checkRateLimit("janela", 10, 50)).toThrow(RateLimitError);

    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(() => checkRateLimit("janela", 10, 50)).not.toThrow();
  });

  it("resetRateLimit libera somente a chave informada", () => {
    for (let i = 0; i < 10; i++) checkRateLimit("a", 10);
    for (let i = 0; i < 10; i++) checkRateLimit("b", 10);

    resetRateLimit("a");

    expect(() => checkRateLimit("a", 10)).not.toThrow();
    expect(() => checkRateLimit("b", 10)).toThrow(RateLimitError);
  });

  it("resetRateLimits limpa todos os contadores", () => {
    for (let i = 0; i < 10; i++) checkRateLimit("a", 10);
    expect(() => checkRateLimit("a", 10)).toThrow(RateLimitError);

    resetRateLimits();

    expect(() => checkRateLimit("a", 10)).not.toThrow();
  });

  it("descarta a chave mais antiga quando excede RATE_LIMIT_MAX_KEYS", () => {
    for (let i = 0; i < 10; i++) checkRateLimit("antiga", 10);
    expect(() => checkRateLimit("antiga", 10)).toThrow(RateLimitError);

    for (let i = 0; i < RATE_LIMIT_MAX_KEYS; i++) checkRateLimit(`k${i}`, 10);

    expect(() => checkRateLimit("antiga", 10)).not.toThrow();
  });
});
