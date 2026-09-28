/**
 * @description Cobre a matriz de requisitos documentais: deduplicação e idempotência
 * por entidade e o backfill da família inteira (pessoas, imóveis com/sem matrícula,
 * sociedades e ativos).
 * @see server/features/documents/document-requirements.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
const idsMocks = vi.hoisted(() => ({ createId: vi.fn() }));

vi.mock("../_shared/database", () => databaseMocks);
vi.mock("../_shared/ids", () => idsMocks);

import {
  companies,
  documents,
  otherAssets,
  people,
  properties,
} from "../../../drizzle/schema";
import {
  ASSET_DOCUMENT_CATEGORIES,
  COMPANY_DOCUMENT_CATEGORIES,
  PROPERTY_DOCUMENT_CATEGORIES,
  ensureDocumentRequirements,
  ensureFamilyDocumentRequirements,
} from "./document-requirements";
import { documentCategoriesForVinculo } from "./person-document-categories";

type Config = {
  existingCategories?: string[];
  peopleRows?: { id: string; vinculo: string }[];
  propertyRows?: { id: string; hasRegistration: boolean }[];
  companyRows?: { id: string }[];
  assetRows?: { id: string }[];
};

function requirementDb(config: Config) {
  const insertValues = vi.fn(async () => undefined);

  const select = vi.fn(() => ({
    from: vi.fn((table: unknown) => {
      const rows = (): unknown[] => {
        if (table === documents)
          return (config.existingCategories ?? []).map(category => ({ category }));
        if (table === people) return config.peopleRows ?? [];
        if (table === properties) return config.propertyRows ?? [];
        if (table === companies) return config.companyRows ?? [];
        if (table === otherAssets) return config.assetRows ?? [];
        throw new Error("tabela inesperada na matriz de requisitos");
      };
      return {
        where: vi.fn(() => ({ then: (resolve: (value: unknown) => unknown) => resolve(rows()) })),
        limit: vi.fn(async () => rows()),
        then: (resolve: (value: unknown) => unknown) => resolve(rows()),
      };
    }),
  }));

  const insert = vi.fn(() => ({ values: insertValues }));
  return { db: { select, insert }, insertValues };
}

describe("ensureDocumentRequirements", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna vazio quando a entidade não tem categorias", async () => {
    const { db } = requirementDb({});
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      ensureDocumentRequirements({
        familyId: "fam-1",
        entityType: "PESSOA",
        entityId: "p-1",
        categories: [],
      })
    ).resolves.toEqual([]);
    expect(db.select).not.toHaveBeenCalled();
  });

  it("não duplica categorias já existentes nem repetidas no pedido", async () => {
    const { db, insertValues } = requirementDb({ existingCategories: ["RG"] });
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idsMocks.createId.mockReturnValue("req-1");

    await expect(
      ensureDocumentRequirements({
        familyId: "fam-1",
        entityType: "PESSOA",
        entityId: "p-1",
        categories: ["RG", "CPF", "CPF"],
      })
    ).resolves.toEqual(["req-1"]);
    expect(insertValues).toHaveBeenCalledTimes(1);
    expect(insertValues).toHaveBeenCalledWith([
      expect.objectContaining({
        id: "req-1",
        familyId: "fam-1",
        entityType: "PESSOA",
        entityId: "p-1",
        category: "CPF",
        status: "PENDENTE",
        currentVersion: 0,
      }),
    ]);
  });

  it("devolve lista vazia quando todos os requisitos já foram gerados", async () => {
    const { db, insertValues } = requirementDb({ existingCategories: ["RG", "CPF"] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      ensureDocumentRequirements({
        familyId: "fam-1",
        entityType: "PESSOA",
        entityId: "p-1",
        categories: ["RG", "CPF"],
      })
    ).resolves.toEqual([]);
    expect(insertValues).not.toHaveBeenCalled();
  });
});

describe("ensureFamilyDocumentRequirements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    idsMocks.createId.mockImplementation(() => `req-${Math.random().toString(36).slice(2, 8)}`);
  });

  it("gera os requisitos de pessoas, imóveis, sociedades e ativos da família", async () => {
    const { db, insertValues } = requirementDb({
      existingCategories: [],
      peopleRows: [{ id: "p-1", vinculo: "TITULAR" }],
      propertyRows: [
        { id: "im-1", hasRegistration: true },
        { id: "im-2", hasRegistration: false },
      ],
      companyRows: [{ id: "soc-1" }],
      assetRows: [{ id: "ativo-1" }],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const created = await ensureFamilyDocumentRequirements("fam-1");

    expect(insertValues).toHaveBeenCalledTimes(5);

    const payloads = insertValues.mock.calls.map(([rows]) => rows as Record<string, unknown>[]);
    const categoriesOf = (entityType: string, entityId: string) =>
      payloads.find(
        rows => rows[0]?.entityType === entityType && rows[0]?.entityId === entityId
      )!.map(row => row.category);

    expect(categoriesOf("PESSOA", "p-1")).toEqual(
      documentCategoriesForVinculo("TITULAR")
    );
    expect(categoriesOf("IMOVEL", "im-1")).toEqual([
      ...PROPERTY_DOCUMENT_CATEGORIES.withRegistration,
    ]);
    expect(categoriesOf("IMOVEL", "im-2")).toEqual([
      ...PROPERTY_DOCUMENT_CATEGORIES.withoutRegistration,
    ]);
    expect(categoriesOf("SOCIEDADE", "soc-1")).toEqual([...COMPANY_DOCUMENT_CATEGORIES]);
    expect(categoriesOf("ATIVO", "ativo-1")).toEqual([...ASSET_DOCUMENT_CATEGORIES]);

    expect(created).toBe(
      documentCategoriesForVinculo("TITULAR").length +
        PROPERTY_DOCUMENT_CATEGORIES.withRegistration.length +
        PROPERTY_DOCUMENT_CATEGORIES.withoutRegistration.length +
        COMPANY_DOCUMENT_CATEGORIES.length +
        ASSET_DOCUMENT_CATEGORIES.length
    );
  });

  it("retorna zero para família sem entidades", async () => {
    const { db, insertValues } = requirementDb({
      peopleRows: [],
      propertyRows: [],
      companyRows: [],
      assetRows: [],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(ensureFamilyDocumentRequirements("fam-vazia")).resolves.toBe(0);
    expect(insertValues).not.toHaveBeenCalled();
    expect(db.select).toHaveBeenCalledTimes(4);
  });
});
