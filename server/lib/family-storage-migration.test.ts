/**
 * @description Garante que a migração atualiza apenas versões pertencentes à família
 * e somente quando suas chaves usam o prefixo de storage anterior.
 * @see server/lib/family-storage-migration.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
const storageMocks = vi.hoisted(() => ({ moveFolder: vi.fn() }));
vi.mock("../features/_shared/database", () => databaseMocks);
vi.mock("../storage", () => storageMocks);

import { migrateFamilyStorageFolder } from "./family-storage-migration";

describe("migrateFamilyStorageFolder", () => {
  beforeEach(() => vi.clearAllMocks());

  it("não consulta infraestrutura quando a pasta antiga e a nova são iguais", async () => {
    await expect(migrateFamilyStorageFolder("familia-1", "cpf-1", "cpf-1")).resolves.toEqual({ migratedFiles: 0 });
    expect(databaseMocks.requireDatabase).not.toHaveBeenCalled();
    expect(storageMocks.moveFolder).not.toHaveBeenCalled();
  });

  it("move pasta e atualiza somente versões com prefixo antigo", async () => {
    const updateWhere = vi.fn().mockResolvedValue(undefined);
    const db = {
      select: vi.fn()
        .mockReturnValueOnce({ from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([{ id: "doc-1" }, { id: "doc-2" }]) }) })
        .mockReturnValueOnce({ from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([
          { id: "v-1", storageKey: "cpf-antigo/a.pdf" },
          { id: "v-2", storageKey: "outra/chave.pdf" },
          { id: "v-3", storageKey: "cpf-antigo/b.pdf" },
        ]) }) }),
      update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: updateWhere }) }),
    };
    databaseMocks.requireDatabase.mockResolvedValue(db);
    storageMocks.moveFolder.mockResolvedValue({ moved: true });

    await expect(migrateFamilyStorageFolder("familia-1", "cpf-antigo", "cpf-novo")).resolves.toEqual({ migratedFiles: 2 });

    expect(storageMocks.moveFolder).toHaveBeenCalledWith("cpf-antigo", "cpf-novo");
    expect(db.update).toHaveBeenCalledTimes(2);
    expect(updateWhere).toHaveBeenCalledTimes(2);
  });
});
