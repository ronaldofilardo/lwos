/**
 * @description Matriz pura de requisitos documentais (Fase 8): compute* puras
 * por escopo e reconcileEntityDocuments (cria faltantes, remove apenas
 * pendências sem arquivo) + reconcileFamilyDocumentRequirements (família).
 * @see server/features/documents/document-requirements.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
const idsMocks = vi.hoisted(() => ({ createId: vi.fn() }));

vi.mock("../_shared/database", () => databaseMocks);
vi.mock("../_shared/ids", () => idsMocks);

import {
  companies,
  companyDetails,
  documents,
  otherAssets,
  people,
  properties,
} from "../../../drizzle/schema";
import {
  computeAssetCategories,
  computeCompanyCategories,
  computePropertyCategories,
  reconcileEntityDocuments,
  reconcileFamilyDocumentRequirements,
} from "./document-requirements";
import { computePersonCategories } from "./person-document-categories";

type ExistingDoc = {
  id: string;
  category: string;
  status: string;
  currentVersion: number;
};

type Config = {
  existingDocs?: ExistingDoc[];
  peopleRows?: {
    id: string;
    vinculo: string;
    civilStatus: string | null;
  }[];
  propertyRows?: {
    id: string;
    kind: string | null;
    hasRegistration: boolean;
  }[];
  companyRows?: { id: string; isOffshore: boolean }[];
  detailRows?: { companyId: string; societaryType: string | null }[];
  assetRows?: { id: string }[];
};

function requirementDb(config: Config) {
  const insertValues = vi.fn(async () => undefined);
  const deleteWhere = vi.fn(async () => undefined);

  const select = vi.fn(() => ({
    from: vi.fn((table: unknown) => {
      const rows = (): unknown[] => {
        if (table === documents) return config.existingDocs ?? [];
        if (table === people) return config.peopleRows ?? [];
        if (table === properties) return config.propertyRows ?? [];
        if (table === companies) return config.companyRows ?? [];
        if (table === companyDetails) return config.detailRows ?? [];
        if (table === otherAssets) return config.assetRows ?? [];
        throw new Error("tabela inesperada na matriz de requisitos");
      };
      return {
        where: vi.fn(() => ({
          then: (resolve: (value: unknown) => unknown) => resolve(rows()),
          limit: vi.fn(async () => rows()),
          orderBy: vi.fn(() => ({ then: (r: (v: unknown) => unknown) => r(rows()) })),
        })),
        limit: vi.fn(async () => rows()),
        then: (resolve: (value: unknown) => unknown) => resolve(rows()),
      };
    }),
  }));

  const insert = vi.fn(() => ({ values: insertValues }));
  const del = vi.fn(() => ({ where: deleteWhere }));
  return { db: { select, insert, delete: del }, insertValues, deleteWhere };
}

describe("computePropertyCategories", () => {
  it("urbano com matrícula: IPTU + matrícula atualizada", () => {
    expect(
      computePropertyCategories({ kind: "URBANO", hasRegistration: true })
    ).toEqual(["IPTU", "Matrícula atualizada"]);
  });

  it("rural: ITR, matrícula, CAR e CCIR", () => {
    expect(
      computePropertyCategories({ kind: "RURAL", hasRegistration: true })
    ).toEqual(["ITR", "Matrícula atualizada", "CAR", "CCIR"]);
  });

  it("sem matrícula: escritura/contrato", () => {
    expect(
      computePropertyCategories({ kind: "URBANO", hasRegistration: false })
    ).toEqual(["IPTU", "Escritura ou contrato de compra e venda"]);
  });

  it("kind não informado mantém a lista histórica", () => {
    expect(computePropertyCategories({ hasRegistration: true })).toEqual([
      "Matrícula atualizada",
      "IPTU ou ITR",
    ]);
    expect(computePropertyCategories({ hasRegistration: false })).toEqual([
      "Escritura ou contrato de compra e venda",
      "IPTU ou ITR",
    ]);
  });
});

describe("computeCompanyCategories", () => {
  it("LTDA/SCP sem detalhe: lista nacional padrão", () => {
    expect(computeCompanyCategories({ societaryType: null })).toEqual([
      "Comprovante de Inscrição no CNPJ",
      "Contrato Social Consolidado",
      "Balanço Fechado",
      "Balancete Atualizado",
      "Acordo de Sócios",
      "Livro Razão do Imobilizado",
    ]);
  });

  it("S/A soma livros de ações", () => {
    const categories = computeCompanyCategories({ societaryType: "SA" });
    expect(categories).toContain("Livro de Registro de Ações Nominativas");
    expect(categories).toContain("Livro de Transferência de Ações");
    expect(categories).toHaveLength(8);
  });

  it("offshore: documentos estrangeiros + cláusulas sucessórias", () => {
    const categories = computeCompanyCategories({ isOffshore: true });
    expect(categories).toContain("Certificate of Incorporation");
    expect(categories).toContain("Register of Members");
    expect(categories).toContain("Cláusulas sucessórias");
    expect(categories).toContain("Testamento local da jurisdição");
    expect(categories).not.toContain("Contrato Social Consolidado");
  });
});

describe("computeAssetCategories", () => {
  it("padrão por categoria: comprovação de titularidade", () => {
    expect(computeAssetCategories()).toEqual(["Comprovação de titularidade"]);
  });
});

describe("reconcileEntityDocuments", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna vazio quando a entidade não tem categorias", async () => {
    const { db } = requirementDb({});
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      reconcileEntityDocuments({
        familyId: "fam-1",
        entityType: "PESSOA",
        entityId: "p-1",
        categories: [],
      })
    ).resolves.toEqual({ created: 0, removed: 0 });
    expect(db.select).not.toHaveBeenCalled();
  });

  it("cria só as categorias faltantes e deduplica o pedido", async () => {
    const { db, insertValues } = requirementDb({
      existingDocs: [
        {
          id: "d1",
          category: "CPF/RG ou CNH",
          status: "PENDENTE",
          currentVersion: 0,
        },
      ],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idsMocks.createId.mockReturnValue("req-1");

    await expect(
      reconcileEntityDocuments({
        familyId: "fam-1",
        entityType: "PESSOA",
        entityId: "p-1",
        categories: ["CPF/RG ou CNH", "IRPF", "IRPF"],
      })
    ).resolves.toEqual({ created: 1, removed: 0 });
    expect(insertValues).toHaveBeenCalledTimes(1);
    expect(insertValues).toHaveBeenCalledWith([
      expect.objectContaining({
        id: "req-1",
        familyId: "fam-1",
        entityType: "PESSOA",
        entityId: "p-1",
        category: "IRPF",
        status: "PENDENTE",
        currentVersion: 0,
      }),
    ]);
    expect(db.delete).not.toHaveBeenCalled();
  });

  it("é idempotente quando tudo já existe", async () => {
    const { db, insertValues } = requirementDb({
      existingDocs: [
        { id: "d1", category: "RG", status: "PENDENTE", currentVersion: 0 },
        { id: "d2", category: "CPF", status: "VALIDADO", currentVersion: 1 },
      ],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      reconcileEntityDocuments({
        familyId: "fam-1",
        entityType: "PESSOA",
        entityId: "p-1",
        categories: ["RG", "CPF"],
      })
    ).resolves.toEqual({ created: 0, removed: 0 });
    expect(insertValues).not.toHaveBeenCalled();
    expect(db.delete).not.toHaveBeenCalled();
  });

  it("remove apenas pendências obsoletas sem arquivo (nunca um arquivo enviado)", async () => {
    const { db, insertValues, deleteWhere } = requirementDb({
      existingDocs: [
        {
          id: "stale",
          category: "Certidão de casamento/UE",
          status: "PENDENTE",
          currentVersion: 0,
        },
        {
          id: "anexado",
          category: "IPTU ou ITR",
          status: "PENDENTE",
          currentVersion: 2,
        },
        {
          id: "validado",
          category: "Contrato social e alterações consolidadas",
          status: "VALIDADO",
          currentVersion: 1,
        },
      ],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idsMocks.createId.mockReturnValue("req-new");

    const result = await reconcileEntityDocuments({
      familyId: "fam-1",
      entityType: "PESSOA",
      entityId: "p-1",
      categories: ["IRPF"],
    });

    expect(result).toEqual({ created: 1, removed: 1 });
    expect(insertValues).toHaveBeenCalledWith([
      expect.objectContaining({ category: "IRPF" }),
    ]);
    expect(deleteWhere).toHaveBeenCalledTimes(1);
    // Só a pendência antiga sem arquivo é apagada.
    expect(db.delete).toHaveBeenCalledTimes(1);
  });
});

describe("reconcileFamilyDocumentRequirements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    idsMocks.createId.mockImplementation(
      () => `req-${Math.random().toString(36).slice(2, 8)}`
    );
  });

  it("gera os requisitos de pessoas, imóveis, sociedades e ativos da família", async () => {
    const { db, insertValues } = requirementDb({
      existingDocs: [],
      peopleRows: [{ id: "p-1", vinculo: "TITULAR", civilStatus: "CASADO" }],
      propertyRows: [
        { id: "im-1", kind: "URBANO", hasRegistration: true },
        { id: "im-2", kind: null, hasRegistration: false },
      ],
      companyRows: [{ id: "soc-1", isOffshore: false }],
      detailRows: [{ companyId: "soc-1", societaryType: "LTDA" }],
      assetRows: [{ id: "ativo-1" }],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const result = await reconcileFamilyDocumentRequirements("fam-1");

    expect(insertValues).toHaveBeenCalledTimes(5);

    const payloads = insertValues.mock.calls.map(
      ([rows]) => rows as Record<string, unknown>[]
    );
    const categoriesOf = (entityType: string, entityId: string) =>
      payloads.find(
        rows =>
          rows[0]?.entityType === entityType && rows[0]?.entityId === entityId
      )!.map(row => row.category);

    expect(categoriesOf("PESSOA", "p-1")).toEqual(
      computePersonCategories({ vinculo: "TITULAR", civilStatus: "CASADO" })
    );
    expect(categoriesOf("IMOVEL", "im-1")).toEqual([
      "IPTU",
      "Matrícula atualizada",
    ]);
    expect(categoriesOf("IMOVEL", "im-2")).toEqual([
      "Escritura ou contrato de compra e venda",
      "IPTU ou ITR",
    ]);
    expect(categoriesOf("SOCIEDADE", "soc-1")).toEqual([
      ...computeCompanyCategories({ societaryType: "LTDA" }),
    ]);
    expect(categoriesOf("ATIVO", "ativo-1")).toEqual([
      "Comprovação de titularidade",
    ]);

    expect(result.created).toBe(
      computePersonCategories({ vinculo: "TITULAR", civilStatus: "CASADO" })
        .length +
        2 +
        2 +
        6 +
        1
    );
    expect(result.removed).toBe(0);
  });

  it("retorna zero para família sem entidades", async () => {
    const { db, insertValues } = requirementDb({
      peopleRows: [],
      propertyRows: [],
      companyRows: [],
      assetRows: [],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      reconcileFamilyDocumentRequirements("fam-vazia")
    ).resolves.toEqual({ created: 0, removed: 0 });
    expect(insertValues).not.toHaveBeenCalled();
    expect(db.select).toHaveBeenCalledTimes(4);
  });
});
