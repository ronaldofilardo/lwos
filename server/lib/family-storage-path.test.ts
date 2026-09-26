/**
 * @description Valida normalização de CPF, fallback de pasta familiar e prevenção
 * de colisão de titular entre famílias diferentes.
 * @see server/lib/family-storage-path.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
vi.mock("../features/_shared/database", () => databaseMocks);

import { findFamilyIdByPrimaryContactCpf, onlyDigits, resolveFamilyStorageFolder } from "./family-storage-path";

describe("family-storage-path", () => {
  beforeEach(() => vi.clearAllMocks());

  it("normaliza CPF/CNPJ para dígitos e usa fallback quando não há titular com CPF", async () => {
    const limit = vi.fn().mockResolvedValue([]);
    databaseMocks.requireDatabase.mockResolvedValue({ select: vi.fn().mockReturnValue({ from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit }) }) }) });

    expect(onlyDigits("111.222.333-44")).toBe("11122233344");
    await expect(resolveFamilyStorageFolder("familia-1")).resolves.toBe("familia-familia-1");
  });

  it("encontra CPF conflitante em outra família e ignora a família excluída", async () => {
    const rows = [
      { familyId: "familia-atual", taxId: "111.222.333-44" },
      { familyId: "familia-conflito", taxId: "555.666.777-88" },
    ];
    databaseMocks.requireDatabase.mockResolvedValue({ select: vi.fn().mockReturnValue({ from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(rows) }) }) });

    await expect(findFamilyIdByPrimaryContactCpf("11122233344", "familia-atual")).resolves.toBeNull();
    await expect(findFamilyIdByPrimaryContactCpf("555.666.777-88", "familia-atual")).resolves.toBe("familia-conflito");
    await expect(findFamilyIdByPrimaryContactCpf("---")).resolves.toBeNull();
  });
});
