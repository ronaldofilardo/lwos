/**
 * @description Cobre o repositório de documentos: criação com validUntil normalizado,
 * find-or-create do requisito, leituras por família, versões e a busca reversa pela
 * storageKey usada na autorização de download.
 * @see server/features/documents/document-repository.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
const idsMocks = vi.hoisted(() => ({ createId: vi.fn() }));

vi.mock("../_shared/database", () => databaseMocks);
vi.mock("../_shared/ids", () => idsMocks);

import { documentVersions, documents } from "../../../drizzle/schema";
import {
  createDocumentRecord,
  findOrCreateDocumentRecord,
  getDocumentRecord,
  getDocumentVersionByStorageKey,
  listDocumentRecords,
  listVersions,
} from "./document-repository";

type Config = {
  documentLookup?: { id: string }[];
  documentRows?: Record<string, unknown>[];
  documentListRows?: Record<string, unknown>[];
  versionRows?: Record<string, unknown>[];
  storageRows?: { familyId: string; documentId: string }[];
};

function documentDb(config: Config) {
  const insertValues = vi.fn(async () => undefined);

  const select = vi.fn((projection?: Record<string, unknown>) => ({
    from: vi.fn((table: unknown) => {
      const rows = (): unknown[] => {
        if (projection && "familyId" in projection) return config.storageRows ?? [];
        if (table === documentVersions) return config.versionRows ?? [];
        if (projection) return config.documentLookup ?? [];
        return config.documentRows ?? [];
      };
      const listRows = (): unknown[] =>
        table === documentVersions ? config.versionRows ?? [] : config.documentListRows ?? [];
      const limit = vi.fn(async () => rows());
      const orderBy = vi.fn(() => ({ then: (resolve: (value: unknown) => unknown) => resolve(listRows()) }));
      const where = vi.fn(() => ({ limit, orderBy, then: (resolve: (value: unknown) => unknown) => resolve(rows()) }));
      return {
        limit,
        orderBy,
        where,
        innerJoin: vi.fn(() => ({ where })),
        then: (resolve: (value: unknown) => unknown) => resolve(listRows()),
      };
    }),
  }));

  const insert = vi.fn(() => ({ values: insertValues }));
  return { db: { select, insert }, insertValues };
}

describe("createDocumentRecord", () => {
  beforeEach(() => vi.clearAllMocks());

  it("normaliza validUntil vazio para null e devolve o id gerado", async () => {
    const { db, insertValues } = documentDb({});
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idsMocks.createId.mockReturnValue("doc-1");

    await expect(
      createDocumentRecord({
        familyId: "fam-1",
        entityType: "PESSOA",
        entityId: "p-1",
        category: "RG",
        status: "PENDENTE",
        currentVersion: 0,
        validUntil: "",
      } as never)
    ).resolves.toBe("doc-1");

    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ id: "doc-1", validUntil: null, category: "RG" })
    );
  });

  it("mantém a data de validade informada", async () => {
    const { db, insertValues } = documentDb({});
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idsMocks.createId.mockReturnValue("doc-2");

    await createDocumentRecord({
      familyId: "fam-1",
      entityType: "PESSOA",
      entityId: "p-1",
      category: "Certidão",
      status: "PENDENTE",
      currentVersion: 0,
      validUntil: "2030-01-01",
    } as never);

    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ validUntil: "2030-01-01" })
    );
  });
});

describe("findOrCreateDocumentRecord", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reaproveita o requisito existente sem inserir de novo", async () => {
    const { db, insertValues } = documentDb({ documentLookup: [{ id: "doc-7" }] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      findOrCreateDocumentRecord({
        familyId: "fam-1",
        entityType: "PESSOA",
        entityId: "p-1",
        category: "RG",
      })
    ).resolves.toBe("doc-7");
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("cria o requisito quando a categoria ainda não existe", async () => {
    const { db, insertValues } = documentDb({ documentLookup: [] });
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idsMocks.createId.mockReturnValue("doc-9");

    await expect(
      findOrCreateDocumentRecord({
        familyId: "fam-1",
        entityType: "PESSOA",
        entityId: "p-1",
        category: "Certidão de estado civil",
      })
    ).resolves.toBe("doc-9");
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "doc-9",
        category: "Certidão de estado civil",
        status: "PENDENTE",
      })
    );
  });
});

describe("consultas de documentos", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lê um documento ou devolve null", async () => {
    const found = documentDb({ documentRows: [{ id: "doc-1" }] });
    databaseMocks.requireDatabase.mockResolvedValue(found.db);
    await expect(getDocumentRecord("doc-1")).resolves.toEqual({ id: "doc-1" });

    const missing = documentDb({ documentRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(missing.db);
    await expect(getDocumentRecord("doc-x")).resolves.toBeNull();
  });

  it("lista documentos da família e versões do documento", async () => {
    const db1 = documentDb({ documentListRows: [{ id: "doc-1" }, { id: "doc-2" }] });
    databaseMocks.requireDatabase.mockResolvedValue(db1.db);
    await expect(listDocumentRecords("fam-1")).resolves.toHaveLength(2);

    const db2 = documentDb({ versionRows: [{ versionNumber: 2 }, { versionNumber: 1 }] });
    databaseMocks.requireDatabase.mockResolvedValue(db2.db);
    await expect(listVersions("doc-1")).resolves.toHaveLength(2);
  });

  it("resolve a família a partir da storageKey ou devolve null", async () => {
    const found = documentDb({
      storageRows: [{ familyId: "fam-1", documentId: "doc-1" }],
    });
    databaseMocks.requireDatabase.mockResolvedValue(found.db);
    await expect(getDocumentVersionByStorageKey("fam-1/doc-1/1.bin")).resolves.toEqual({
      familyId: "fam-1",
      documentId: "doc-1",
    });

    const missing = documentDb({ storageRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(missing.db);
    await expect(getDocumentVersionByStorageKey("sumida")).resolves.toBeNull();
  });
});
