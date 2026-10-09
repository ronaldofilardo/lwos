/**
 * @description Repositório de demais ativos: criação, atualização e exclusão
 * com arquivamento de documentos (DISPENSADO).
 * @see server/features/assets/assets-repository.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
const idMocks = vi.hoisted(() => ({ createId: vi.fn() }));

vi.mock("../_shared/database", () => databaseMocks);
vi.mock("../_shared/ids", () => idMocks);

import { documents, otherAssets } from "../../../drizzle/schema";
import {
  createAssetRecord,
  getAssetRecord,
  listAssetRecords,
  removeAssetRecord,
  updateAssetRecord,
} from "./assets-repository";

type AssetDbConfig = {
  assetRows?: Record<string, unknown>[];
  documentRows?: { id: string }[];
  currentRows?: Record<string, unknown>[];
};

function assetDb(config: AssetDbConfig = {}) {
  const insertValues = vi.fn(async () => undefined);
  const setValues = vi.fn(() => ({ where: vi.fn(async () => undefined) }));
  const update = vi.fn(() => ({ set: setValues }));
  const deleteValues = vi.fn(() => ({ where: vi.fn(async () => undefined) }));

  const select = vi.fn(() => ({
    from: vi.fn((table: unknown) => {
      const baseRows = (): unknown[] => {
        if (table === otherAssets) return config.assetRows ?? [];
        if (table === documents) return config.documentRows ?? [];
        return [];
      };
      const limit = vi.fn(async () => baseRows().slice(0, 1));
      const orderBy = vi.fn(() => ({ then: (resolve: (value: unknown) => unknown) => resolve(baseRows()) }));
      return {
        limit,
        orderBy,
        where: vi.fn(() => ({ limit, orderBy, then: (resolve: (value: unknown) => unknown) => resolve(baseRows()) })),
        then: (resolve: (value: unknown) => unknown) => resolve(baseRows()),
      };
    }),
  }));
  const insert = vi.fn(() => ({ values: insertValues }));
  const db = { select, insert, update, delete: deleteValues };
  return { db, insertValues, setValues, update, deleteValues };
}

const asset = {
  id: "ativo-1",
  familyId: "fam-1",
  category: "INVESTIMENTOS",
  description: "Conta XP",
  declaredValue: "150000.00",
  ownerPersonId: "p1",
  notes: null,
};

describe("assets-repository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cria ativo normalizando o valor para string decimal", async () => {
    const { db, insertValues } = assetDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idMocks.createId.mockReturnValue("ativo-9");

    await expect(
      createAssetRecord({
        familyId: "fam-1",
        category: "INVESTIMENTOS",
        description: "Conta XP",
        declaredValue: 150000,
        ownerPersonId: "p1",
      } as never)
    ).resolves.toBe("ativo-9");
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "ativo-9",
        declaredValue: "150000.00",
        notes: null,
      })
    );
  });

  it("lista ativos e lê um ativo específico", async () => {
    const listed = assetDb({ assetRows: [asset] });
    databaseMocks.requireDatabase.mockResolvedValue(listed.db);
    await expect(listAssetRecords("fam-1")).resolves.toHaveLength(1);

    const found = assetDb({ assetRows: [asset] });
    databaseMocks.requireDatabase.mockResolvedValue(found.db);
    await expect(getAssetRecord("ativo-1")).resolves.toEqual(asset);

    const missing = assetDb({ assetRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(missing.db);
    await expect(getAssetRecord("sumido")).resolves.toBeNull();
  });

  it("atualiza os campos do ativo e falha quando não existe", async () => {
    const found = assetDb({ assetRows: [asset] });
    databaseMocks.requireDatabase.mockResolvedValue(found.db);

    await expect(
      updateAssetRecord({
        assetId: "ativo-1",
        category: "OUTROS",
        description: "Conta XP Editada",
        declaredValue: 200000,
        ownerPersonId: "p2",
      } as never)
    ).resolves.toEqual({ assetId: "ativo-1" });
    expect(found.setValues).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "OUTROS",
        description: "Conta XP Editada",
        declaredValue: "200000.00",
        ownerPersonId: "p2",
      })
    );

    const missing = assetDb({ assetRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(missing.db);
    await expect(
      updateAssetRecord({
        assetId: "sumido",
        category: "OUTROS",
        description: "X",
        declaredValue: 1,
        ownerPersonId: "p1",
      } as never)
    ).rejects.toThrow("Ativo não encontrado.");
  });

  it("falha ao excluir ativo de outra família ou inexistente", async () => {
    const missing = assetDb({ assetRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(missing.db);
    await expect(
      removeAssetRecord("fam-1", "sumido")
    ).rejects.toThrow("Ativo não encontrado nesta família.");
  });

  it("sem documentos: exclui o ativo direto", async () => {
    const { db, deleteValues } = assetDb({ assetRows: [asset], documentRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      removeAssetRecord("fam-1", "ativo-1")
    ).resolves.toEqual({ archivedDocuments: 0 });
    expect(deleteValues).toHaveBeenCalled();
  });

  it("com documentos: arquiva como DISPENSADO e depois exclui", async () => {
    const { db, setValues, deleteValues } = assetDb({
      assetRows: [asset],
      documentRows: [{ id: "doc-1" }, { id: "doc-2" }],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      removeAssetRecord("fam-1", "ativo-1")
    ).resolves.toEqual({ archivedDocuments: 2 });
    expect(setValues).toHaveBeenCalledWith({ status: "DISPENSADO" });
    expect(setValues).toHaveBeenCalledTimes(2);
    expect(deleteValues).toHaveBeenCalled();
  });
});
