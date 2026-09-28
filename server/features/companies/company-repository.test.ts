/**
 * @description Quadro societário da holding: membros da família e não-membros
 * somam no máximo 100%, sem duplicidade de participante.
 * @see server/features/companies/company-repository.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
const idMocks = vi.hoisted(() => ({ createId: vi.fn() }));

vi.mock("../_shared/database", () => databaseMocks);
vi.mock("../_shared/ids", () => idMocks);

import { companies, companyStakeholders } from "../../../drizzle/schema";
import {
  createCompanyRecord,
  createContributionRecord,
  createStakeholderRecord,
  getCompanyRecord,
  listCompanyRecords,
  listStakeholderRecords,
  removeStakeholderRecord,
  updateStakeholderRecord,
} from "./company-repository";
import { stakeholderInputSchema } from "./company-stakeholder";

type StakeholderRow = {
  id: string;
  companyId: string;
  personId: string | null;
  externalName: string | null;
  percentage: string;
};

function mockDb(existing: StakeholderRow[]) {
  const insertValues = vi.fn().mockResolvedValue(undefined);
  const tx = {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(existing),
      }),
    }),
    insert: vi.fn().mockReturnValue({ values: insertValues }),
  };
  const db = {
    transaction: vi.fn(
      async (operation: (value: typeof tx) => Promise<unknown>) => operation(tx)
    ),
    select: tx.select,
    insert: tx.insert,
  };
  return { db, insertValues };
}

const stakeholder = (
  id: string,
  percentage: string,
  personId: string | null = null,
  externalName: string | null = null
): StakeholderRow => ({
  id,
  companyId: "hold-1",
  personId,
  externalName,
  percentage,
});

describe("company-repository — participações", () => {
  beforeEach(() => vi.clearAllMocks());

  it("aceita um membro da família com 100%", async () => {
    const { db, insertValues } = mockDb([]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await createStakeholderRecord({
      companyId: "hold-1",
      personId: "p1",
      percentage: 100,
    } as never);

    expect(insertValues).toHaveBeenCalledTimes(1);
    expect(insertValues.mock.calls[0][0]).toMatchObject({
      personId: "p1",
      externalName: null,
      percentage: "100.00",
    });
  });

  it("aceita não-membro informado pelo nome", async () => {
    const { db, insertValues } = mockDb([]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await createStakeholderRecord({
      companyId: "hold-1",
      externalName: "Investidor Externo",
      percentage: 30,
    } as never);

    expect(insertValues.mock.calls[0][0]).toMatchObject({
      personId: null,
      externalName: "Investidor Externo",
    });
  });

  it("rejeita quando a soma de membros e não-membros passa de 100%", async () => {
    const { db, insertValues } = mockDb([
      stakeholder("s1", "70.00", "p1", null),
      stakeholder("s2", "20.00", null, "Fundo Externo"),
    ]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      createStakeholderRecord({
        companyId: "hold-1",
        personId: "p2",
        percentage: 20,
      } as never)
    ).rejects.toThrow("soma das participações não pode passar de 100%");

    expect(insertValues).not.toHaveBeenCalled();
  });

  it("rejeita não-membro duplicado ignorando maiúsculas e acentos de espaços", async () => {
    const { db, insertValues } = mockDb([
      stakeholder("s1", "50.00", null, "Fundo Externo"),
    ]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      createStakeholderRecord({
        companyId: "hold-1",
        externalName: "  Fundo Externo ",
        percentage: 10,
      } as never)
    ).rejects.toThrow("já participa da sociedade");

    expect(insertValues).not.toHaveBeenCalled();
  });

  it("exige membro ou não-membro (validação do schema)", async () => {
    const parsed = stakeholderInputSchema.safeParse({
      companyId: "hold-1",
      percentage: 10,
    });

    expect(parsed.success).toBe(false);
  });
});

type FullConfig = {
  companyRows?: Record<string, unknown>[];
  stakeholderRows?: StakeholderRow[];
  currentRows?: StakeholderRow[];
  removedRows?: { id: string; companyId: string }[];
};

function fullDb(config: FullConfig = {}) {
  const insertValues = vi.fn(async () => undefined);
  const setValues = vi.fn(() => ({ where: vi.fn(async () => undefined) }));
  const update = vi.fn(() => ({ set: setValues }));
  const returning = vi.fn(async () => config.removedRows ?? []);
  const remove = vi.fn(() => ({ where: vi.fn(() => ({ returning })) }));

  const select = vi.fn(() => ({
    from: vi.fn((table: unknown) => {
      const baseRows = (): unknown[] =>
        table === companies ? config.companyRows ?? [] : config.stakeholderRows ?? [];
      const limit = vi.fn(async () => (table === companies ? baseRows() : config.currentRows ?? []));
      return {
        limit,
        where: vi.fn(() => ({ limit, then: (resolve: (value: unknown) => unknown) => resolve(baseRows()) })),
        then: (resolve: (value: unknown) => unknown) => resolve(baseRows()),
      };
    }),
  }));
  const insert = vi.fn(() => ({ values: insertValues }));
  const transaction = vi.fn(async (operation: (tx: unknown) => Promise<unknown>) =>
    operation({ select, insert, update })
  );
  const db = { select, insert, update, delete: remove, transaction };
  return { db, insertValues, setValues, remove, transaction };
}

describe("company-repository — escrita e consultas básicas", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cria a sociedade normalizando o CNPJ vazio", async () => {
    const { db, insertValues } = fullDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idMocks.createId.mockReturnValue("hold-9");

    await expect(
      createCompanyRecord({ familyId: "fam-1", legalName: "Holding Beta", taxNumber: "", type: "HOLDING_NACIONAL" } as never)
    ).resolves.toBe("hold-9");
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ id: "hold-9", taxNumber: null, legalName: "Holding Beta" })
    );

    await createCompanyRecord({
      familyId: "fam-1",
      legalName: "Holding Gamma",
      taxNumber: "11122233344",
      type: "SOCIEDADE_NACIONAL",
    } as never);
    expect(insertValues.mock.calls[1][0]).toEqual(
      expect.objectContaining({ taxNumber: "11122233344" })
    );
  });

  it("lê uma sociedade ou devolve null", async () => {
    const found = fullDb({ companyRows: [{ id: "hold-1" }] });
    databaseMocks.requireDatabase.mockResolvedValue(found.db);
    await expect(getCompanyRecord("hold-1")).resolves.toEqual({ id: "hold-1" });

    const missing = fullDb({ companyRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(missing.db);
    await expect(getCompanyRecord("hold-x")).resolves.toBeNull();
  });

  it("lista sociedades e participações da família", async () => {
    const { db } = fullDb({
      companyRows: [{ id: "hold-1" }],
      stakeholderRows: [stakeholder("s1", "10.00", "p1", null)],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(listCompanyRecords("fam-1")).resolves.toEqual([{ id: "hold-1" }]);
    await expect(listStakeholderRecords("hold-1")).resolves.toHaveLength(1);
  });

  it("registra integralização com porcentagem formatada", async () => {
    const { db, insertValues } = fullDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idMocks.createId.mockReturnValue("int-1");

    await expect(
      createContributionRecord({ propertyId: "im-1", companyId: "hold-1", percentage: 12.5 } as never)
    ).resolves.toBe("int-1");
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ id: "int-1", percentage: "12.50" })
    );
  });
});

describe("company-repository — atualização e remoção de participações", () => {
  beforeEach(() => vi.clearAllMocks());

  it("atualiza mantendo os campos não informados", async () => {
    const { db, setValues } = fullDb({
      currentRows: [stakeholder("s1", "40.00", "p1", null)],
      stakeholderRows: [stakeholder("s1", "40.00", "p1", null), stakeholder("s2", "10.00", "p2", null)],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await updateStakeholderRecord({
      companyId: "hold-1",
      stakeholderId: "s1",
      externalName: "  Fundo Novo ",
    } as never);
    expect(setValues.mock.calls[0][0]).toEqual({
      personId: "p1",
      externalName: "Fundo Novo",
      percentage: "40.00",
    });

    await updateStakeholderRecord({
      companyId: "hold-1",
      stakeholderId: "s1",
      percentage: 25,
    } as never);
    expect(setValues.mock.calls[1][0]).toEqual({
      personId: "p1",
      externalName: null,
      percentage: "25.00",
    });
  });

  it("falha quando a participação não existe ou é de outra sociedade", async () => {
    const missing = fullDb({ currentRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(missing.db);
    await expect(
      updateStakeholderRecord({ companyId: "hold-1", stakeholderId: "sumido", percentage: 10 } as never)
    ).rejects.toThrow("Participação não encontrada.");

    const otherCompany = fullDb({
      currentRows: [{ ...stakeholder("s1", "10.00", "p1", null), companyId: "hold-2" }],
    });
    databaseMocks.requireDatabase.mockResolvedValue(otherCompany.db);
    await expect(
      updateStakeholderRecord({ companyId: "hold-1", stakeholderId: "s1", percentage: 10 } as never)
    ).rejects.toThrow("Participação não encontrada.");
  });

  it("exige membro ou não-membro depois de limpar os dois", async () => {
    const { db, setValues } = fullDb({
      currentRows: [stakeholder("s1", "10.00", null, "Fundo Externo")],
      stakeholderRows: [stakeholder("s1", "10.00", null, "Fundo Externo")],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      updateStakeholderRecord({
        companyId: "hold-1",
        stakeholderId: "s1",
        personId: undefined,
        externalName: "   ",
      } as never)
    ).rejects.toThrow("Informe um membro da família ou o nome do não-membro.");
    expect(setValues).not.toHaveBeenCalled();
  });

  it("bloqueia membro ou não-membro já presentes nos demais", async () => {
    const { db, setValues } = fullDb({
      currentRows: [stakeholder("s1", "10.00", "p1", null)],
      stakeholderRows: [stakeholder("s1", "10.00", "p1", null), stakeholder("s2", "10.00", "p2", null), stakeholder("s3", "10.00", null, "Fundo Externo")],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      updateStakeholderRecord({ companyId: "hold-1", stakeholderId: "s1", personId: "p2" } as never)
    ).rejects.toThrow("Este membro já participa da sociedade.");

    await expect(
      updateStakeholderRecord({
        companyId: "hold-1",
        stakeholderId: "s1",
        personId: undefined,
        externalName: " fundo externo ",
      } as never)
    ).rejects.toThrow("Este não-membro já participa da sociedade.");
    expect(setValues).not.toHaveBeenCalled();
  });

  it("recusa atualização que estoura a soma de 100%", async () => {
    const { db, setValues } = fullDb({
      currentRows: [stakeholder("s1", "40.00", "p1", null)],
      stakeholderRows: [stakeholder("s1", "40.00", "p1", null), stakeholder("s2", "55.00", "p2", null)],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      updateStakeholderRecord({ companyId: "hold-1", stakeholderId: "s1", percentage: 50 } as never)
    ).rejects.toThrow("soma das participações não pode passar de 100%");
    expect(setValues).not.toHaveBeenCalled();
  });

  it("remove a participação devolvendo o id", async () => {
    const { db, remove } = fullDb({ removedRows: [{ id: "s1", companyId: "hold-1" }] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      removeStakeholderRecord({ companyId: "hold-1", stakeholderId: "s1" })
    ).resolves.toBe("s1");
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it("falha ao remover participação inexistente ou de outra sociedade", async () => {
    const missing = fullDb({ removedRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(missing.db);
    await expect(
      removeStakeholderRecord({ companyId: "hold-1", stakeholderId: "sumido" })
    ).rejects.toThrow("Participação não encontrada.");

    const otherCompany = fullDb({ removedRows: [{ id: "s1", companyId: "hold-2" }] });
    databaseMocks.requireDatabase.mockResolvedValue(otherCompany.db);
    await expect(
      removeStakeholderRecord({ companyId: "hold-1", stakeholderId: "s1" })
    ).rejects.toThrow("Participação não encontrada.");
  });
});
