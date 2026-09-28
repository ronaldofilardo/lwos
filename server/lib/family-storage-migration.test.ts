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

  function failingUpdateDb() {
    const updateWhere = vi.fn().mockRejectedValue(new Error("banco fora do ar"));
    return {
      select: vi
        .fn()
        .mockReturnValueOnce({ from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([{ id: "doc-1" }]) }) })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ id: "v-1", storageKey: "cpf-antigo/a.pdf" }]),
          }),
        }),
      update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: updateWhere }) }),
    };
  }

  it("compensa revertendo o moveFolder quando os UPDATEs falham", async () => {
    const db = failingUpdateDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);
    storageMocks.moveFolder.mockResolvedValue({ moved: true });

    await expect(migrateFamilyStorageFolder("familia-1", "cpf-antigo", "cpf-novo")).rejects.toThrow(
      "Migração de storage falhou após mover arquivos. 0/1 registros atualizados. Pasta revertida."
    );

    expect(storageMocks.moveFolder).toHaveBeenNthCalledWith(1, "cpf-antigo", "cpf-novo");
    expect(storageMocks.moveFolder).toHaveBeenNthCalledWith(2, "cpf-novo", "cpf-antigo");
  });

  it("mantém o mesmo erro mesmo quando a compensação também falha", async () => {
    const db = failingUpdateDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);
    storageMocks.moveFolder
      .mockResolvedValueOnce({ moved: true })
      .mockRejectedValueOnce(new Error("fs indisponível"));

    await expect(migrateFamilyStorageFolder("familia-1", "cpf-antigo", "cpf-novo")).rejects.toThrow(
      "Migração de storage falhou após mover arquivos. 0/1 registros atualizados. Pasta revertida."
    );
    expect(storageMocks.moveFolder).toHaveBeenCalledTimes(2);
  });

  it("não move nada quando a família ainda não tem documentos", async () => {
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }),
      }),
    };
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(migrateFamilyStorageFolder("familia-1", "cpf-antigo", "cpf-novo")).resolves.toEqual({
      migratedFiles: 0,
    });
    expect(storageMocks.moveFolder).not.toHaveBeenCalled();
  });
});
