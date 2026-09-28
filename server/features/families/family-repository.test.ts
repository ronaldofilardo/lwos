/**
 * @description Cobre o repositório de famílias: criação transacional, listagem com
 * marcador de acesso do cliente, dashboard com e sem escopo e o agrupamento do
 * storage por pasta (inclusive no modo restrito ao cliente).
 * @see server/features/families/family-repository.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
const idsMocks = vi.hoisted(() => ({ createId: vi.fn() }));
const storagePathMocks = vi.hoisted(() => ({ resolveFamilyStorageFolder: vi.fn() }));

vi.mock("../_shared/database", () => databaseMocks);
vi.mock("../_shared/ids", () => idsMocks);
vi.mock("../../lib/family-storage-path", () => storagePathMocks);

import {
  documents as documentsTable,
  families,
  familyAccess,
  fileBlobs,
  projects,
} from "../../../drizzle/schema";
import {
  createFamilyRecord,
  getDashboardData,
  getClientDashboardData,
  getFamilyRecord,
  listClientStorageFiles,
  listFamilyRecords,
  listStorageFiles,
} from "./family-repository";

type Scenario = {
  familyList?: Record<string, unknown>[];
  familyGet?: Record<string, unknown>[];
  familyTotal?: number;
  peoplePerFamily?: number;
  documentsPerFamily?: number;
  peopleTotal?: number;
  documentsTotal?: number;
  accessRows?: { familyId: string }[];
  blobs?: { key: string; sizeBytes: number | null }[];
};

function repoDb(scenario: Scenario) {
  const insertCalls: { table: unknown; payload: Record<string, unknown> }[] = [];

  const rowsFor = (table: unknown, kind: "where" | "list" | "count") => {
    if (table === families) {
      if (kind === "where") return scenario.familyGet ?? [];
      if (kind === "list") return scenario.familyList ?? [];
      return [{ count: scenario.familyTotal ?? 0 }];
    }
    if (table === familyAccess) return scenario.accessRows ?? [];
    if (table === fileBlobs) return scenario.blobs ?? [];
    const perFamily = table === documentsTable ? scenario.documentsPerFamily ?? 0 : scenario.peoplePerFamily ?? 0;
    const total = table === documentsTable ? scenario.documentsTotal ?? 0 : scenario.peopleTotal ?? 0;
    if (kind === "where") return [{ count: perFamily }];
    if (kind === "count") return [{ count: total }];
    return [{ count: perFamily }];
  };

  const select = vi.fn(() => ({
    from: vi.fn((table: unknown) => {
      const limit = vi.fn(async () => rowsFor(table, "where"));
      const whereRows = () => rowsFor(table, "where");
      const listRows = () => rowsFor(table, "list");
      return {
        limit,
        where: vi.fn(() => ({
          limit,
          orderBy: vi.fn(() => ({ then: (resolve: (value: unknown) => unknown) => resolve(listRows()) })),
          then: (resolve: (value: unknown) => unknown) => resolve(whereRows()),
        })),
        orderBy: vi.fn(() => ({ then: (resolve: (value: unknown) => unknown) => resolve(listRows()) })),
        then: (resolve: (value: unknown) => unknown) => resolve(rowsFor(table, "count")),
      };
    }),
  }));

  const insert = vi.fn((table: unknown) => ({
    values: vi.fn(async (payload: Record<string, unknown>) => {
      insertCalls.push({ table, payload });
    }),
  }));

  const transaction = vi.fn(async (operation: (tx: unknown) => Promise<void>) => {
    await operation({ insert });
  });

  return { db: { select, insert, transaction }, insertCalls, transaction };
}

const familyRow = {
  id: "fam-1",
  name: "Família Silva",
  civilStatus: "CASADO",
  maritalRegime: "CPB",
  updatedAt: new Date("2026-01-01T10:00:00.000Z"),
};

describe("family-repository escrita", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cria família e projeto na mesma transação", async () => {
    const { db, insertCalls, transaction } = repoDb({});
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idsMocks.createId.mockReturnValueOnce("fam-9").mockReturnValueOnce("proj-9");

    await expect(
      createFamilyRecord(
        { name: "Família Nova", civilStatus: "CASADO", maritalRegime: "CPB" } as never,
        7
      )
    ).resolves.toEqual({ familyId: "fam-9", projectId: "proj-9" });

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(insertCalls).toHaveLength(2);
    expect(insertCalls[0].table).toBe(families);
    expect(insertCalls[0].payload).toEqual(
      expect.objectContaining({ id: "fam-9", name: "Família Nova", createdBy: "7" })
    );
    expect(insertCalls[1].table).toBe(projects);
    expect(insertCalls[1].payload).toEqual(
      expect.objectContaining({ id: "proj-9", familyId: "fam-9", title: "Família Nova" })
    );
  });
});

describe("family-repository listagem", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna vazio quando não há famílias", async () => {
    const { db } = repoDb({ familyList: [] });
    databaseMocks.requireDatabase.mockResolvedValue(db);
    await expect(listFamilyRecords()).resolves.toEqual([]);
    expect(db.select).toHaveBeenCalledTimes(1);
  });

  it("marca as famílias que já têm acesso de cliente", async () => {
    const { db } = repoDb({
      familyList: [familyRow, { ...familyRow, id: "fam-2" }],
      accessRows: [{ familyId: "fam-2" }],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const records = await listFamilyRecords();

    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({ id: "fam-1", hasClientAccess: false });
    expect(records[1]).toMatchObject({ id: "fam-2", hasClientAccess: true });
  });

  it("lê uma família específica ou devolve null", async () => {
    const found = repoDb({ familyGet: [familyRow] });
    databaseMocks.requireDatabase.mockResolvedValue(found.db);
    await expect(getFamilyRecord("fam-1")).resolves.toMatchObject({ id: "fam-1" });

    const missing = repoDb({ familyGet: [] });
    databaseMocks.requireDatabase.mockResolvedValue(missing.db);
    await expect(getFamilyRecord("fam-x")).resolves.toBeNull();
  });
});

describe("family-repository dashboard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("agrega totais gerais no modo sem escopo", async () => {
    const { db } = repoDb({
      familyList: [familyRow],
      peoplePerFamily: 4,
      documentsPerFamily: 9,
      peopleTotal: 4,
      documentsTotal: 9,
      familyTotal: 1,
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const dashboard = await getDashboardData();

    expect(dashboard.totalFamilies).toBe(1);
    expect(dashboard.totalPeople).toBe(4);
    expect(dashboard.totalDocuments).toBe(9);
    expect(dashboard.families[0]).toMatchObject({
      id: "fam-1",
      peopleCount: 4,
      documentsCount: 9,
    });
  });

  it("devolve estrutura vazia quando o escopo não tem famílias", async () => {
    const { db } = repoDb({});
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(getDashboardData([])).resolves.toEqual({
      totalFamilies: 0,
      totalPeople: 0,
      totalDocuments: 0,
      families: [],
    });
    expect(db.select).not.toHaveBeenCalled();
  });

  it("restringe o dashboard às famílias permitidas sem consultar os totais globais", async () => {
    const { db } = repoDb({
      familyList: [familyRow],
      peoplePerFamily: 2,
      documentsPerFamily: 3,
      peopleTotal: 99,
      documentsTotal: 99,
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const dashboard = await getDashboardData(["fam-1"]);

    expect(dashboard).toEqual({
      totalFamilies: 1,
      totalPeople: 2,
      totalDocuments: 3,
      families: [expect.objectContaining({ id: "fam-1" })],
    });
    expect(db.select).toHaveBeenCalledTimes(3);
  });

  it("dashboard do cliente sem famílias acessíveis retorna zeros", async () => {
    const { db } = repoDb({ accessRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(getClientDashboardData(7)).resolves.toEqual({
      totalFamilies: 0,
      totalPeople: 0,
      totalDocuments: 0,
      families: [],
    });
  });
});

describe("family-repository storage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("agrupa as keys por pasta raiz e soma tamanhos tolerando sizeBytes nulo", async () => {
    const { db } = repoDb({
      blobs: [
        { key: "fam-1/docs/certidao.pdf", sizeBytes: 100 },
        { key: "fam-1/contratos/acao.pdf", sizeBytes: 50 },
        { key: "fam-2/foto.png", sizeBytes: null },
      ],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const folders = await listStorageFiles();

    expect(folders).toEqual([
      { path: "fam-1", size: 150, isDirectory: true },
      { path: "fam-2", size: 0, isDirectory: true },
    ]);
  });

  it("no modo restrito lista apenas as pastas solicitadas", async () => {
    const { db } = repoDb({
      blobs: [
        { key: "fam-1/a.pdf", sizeBytes: 10 },
        { key: "fam-2/b.pdf", sizeBytes: 20 },
      ],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(listStorageFiles(["fam-1", "fam-inexistente"])).resolves.toEqual([
      { path: "fam-1", size: 10, isDirectory: true },
    ]);
  });

  it("cliente sem famílias não consulta o storage", async () => {
    const { db } = repoDb({ accessRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(listClientStorageFiles(7)).resolves.toEqual([]);
    expect(storagePathMocks.resolveFamilyStorageFolder).not.toHaveBeenCalled();
  });

  it("cliente com famílias resolve as pastas das famílias acessíveis", async () => {
    const { db } = repoDb({
      accessRows: [{ familyId: "fam-1" }, { familyId: "fam-2" }],
      blobs: [{ key: "fam-1/a.pdf", sizeBytes: 10 }],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);
    storagePathMocks.resolveFamilyStorageFolder.mockImplementation(async (id: string) => id);

    await expect(listClientStorageFiles(7)).resolves.toEqual([
      { path: "fam-1", size: 10, isDirectory: true },
    ]);
    expect(storagePathMocks.resolveFamilyStorageFolder).toHaveBeenCalledWith("fam-1");
    expect(storagePathMocks.resolveFamilyStorageFolder).toHaveBeenCalledWith("fam-2");
  });
});
