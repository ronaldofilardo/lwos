/**
 * @description Garante que usuários internos não sejam limitados por família e que
 * CLIENTE só obtenha acesso quando existir uma associação explícita.
 * @see server/features/access/family-access.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
vi.mock("../_shared/database", () => databaseMocks);

import { userHasFamilyAccess } from "./family-access";

const client = { id: 11, role: "CLIENTE" } as never;
const analyst = { id: 12, role: "ANALISTA" } as never;

describe("userHasFamilyAccess", () => {
  beforeEach(() => vi.clearAllMocks());

  it("libera papel interno sem consulta de associação familiar", async () => {
    await expect(userHasFamilyAccess(analyst, "familia-1")).resolves.toBe(true);
    expect(databaseMocks.requireDatabase).not.toHaveBeenCalled();
  });

  it("exige associação explícita para CLIENTE e retorna true somente quando há registro", async () => {
    const limit = vi.fn().mockResolvedValue([{ id: "acesso-1" }]);
    const where = vi.fn().mockReturnValue({ limit });
    const from = vi.fn().mockReturnValue({ where });
    databaseMocks.requireDatabase.mockResolvedValue({ select: vi.fn().mockReturnValue({ from }) });

    await expect(userHasFamilyAccess(client, "familia-1")).resolves.toBe(true);
    expect(limit).toHaveBeenCalledWith(1);
  });

  it("nega CLIENTE quando não encontra associação para a família solicitada", async () => {
    const limit = vi.fn().mockResolvedValue([]);
    databaseMocks.requireDatabase.mockResolvedValue({ select: vi.fn().mockReturnValue({ from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit }) }) }) });

    await expect(userHasFamilyAccess(client, "familia-sem-acesso")).resolves.toBe(false);
  });
});
