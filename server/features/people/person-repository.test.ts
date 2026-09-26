/**
 * @description Valida proteção de CPF de titular, atualização transacional do
 * contato principal e migração de storage associada à família.
 * @see server/features/people/person-repository.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
const familyMocks = vi.hoisted(() => ({ getFamilyRecord: vi.fn() }));
const pathMocks = vi.hoisted(() => ({
  findFamilyIdByPrimaryContactCpf: vi.fn(),
  resolveFamilyStorageFolder: vi.fn(),
}));
const migrationMocks = vi.hoisted(() => ({
  migrateFamilyStorageFolder: vi.fn(),
}));
const idMocks = vi.hoisted(() => ({ createId: vi.fn() }));

vi.mock("../_shared/database", () => databaseMocks);
vi.mock("../families/family-repository", () => familyMocks);
vi.mock("../../lib/family-storage-path", () => pathMocks);
vi.mock("../../lib/family-storage-migration", () => migrationMocks);
vi.mock("../_shared/ids", () => idMocks);

import { addPersonRecord, setPrimaryContact } from "./person-repository";

function transactionDatabase(candidate: unknown) {
  const updateWhere = vi.fn().mockResolvedValue(undefined);
  const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
  const update = vi.fn().mockReturnValue({ set: updateSet });
  const selectFrom = vi.fn().mockReturnValue({
    where: vi.fn().mockReturnValue({
      limit: vi.fn().mockResolvedValue(candidate ? [candidate] : []),
    }),
  });
  const tx = {
    update,
    insert: vi.fn(),
    select: vi.fn().mockReturnValue({ from: selectFrom }),
  };
  const limit = vi.fn().mockResolvedValue(candidate ? [candidate] : []);
  const where = vi.fn().mockReturnValue({ limit });
  const from = vi.fn().mockReturnValue({ where });
  return {
    transaction: vi.fn(async (operation: (value: typeof tx) => Promise<void>) =>
      operation(tx)
    ),
    select: vi.fn().mockReturnValue({ from }),
    update,
  };
}

describe("person-repository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("bloqueia novo titular quando o CPF já pertence a outra família", async () => {
    pathMocks.findFamilyIdByPrimaryContactCpf.mockResolvedValue(
      "familia-conflito"
    );
    familyMocks.getFamilyRecord.mockResolvedValue({ name: "Família Costa" });
    const db = transactionDatabase(undefined);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      addPersonRecord({
        familyId: "familia-atual",
        fullName: "Ana",
        email: "",
        taxId: "111.222.333-44",
        birthDate: "",
        vinculo: "TITULAR",
        civilStatus: "CASADO",
        maritalRegime: "CPB",
        exSpouseNote: "",
        isPrimaryContact: true,
      } as never)
    ).rejects.toThrow("Família Costa");

    expect(db.transaction).toHaveBeenCalledTimes(1);
  });

  it("cria pessoa titular em transação, desmarca titular anterior e gera cinco requisitos", async () => {
    const updateWhere = vi.fn().mockResolvedValue(undefined);
    const insertValues = vi.fn().mockResolvedValue(undefined);
    const tx = {
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({ where: updateWhere }),
      }),
      insert: vi.fn().mockReturnValue({ values: insertValues }),
    };
    const db = {
      transaction: vi.fn(
        async (operation: (value: typeof tx) => Promise<void>) => operation(tx)
      ),
    };
    databaseMocks.requireDatabase.mockResolvedValue(db);
    pathMocks.findFamilyIdByPrimaryContactCpf.mockResolvedValue(null);
    idMocks.createId
      .mockReturnValueOnce("pessoa-1")
      .mockReturnValueOnce("doc-1")
      .mockReturnValueOnce("doc-2")
      .mockReturnValueOnce("doc-3")
      .mockReturnValueOnce("doc-4")
      .mockReturnValueOnce("doc-5");

    await expect(
      addPersonRecord({
        familyId: "familia-1",
        fullName: "Ana",
        email: "ana@lucathi.com.br",
        taxId: "11122233344",
        birthDate: "1990-01-01",
        vinculo: "TITULAR",
        civilStatus: "CASADO",
        maritalRegime: "CPB",
        exSpouseNote: "",
        isPrimaryContact: true,
      } as never)
    ).resolves.toBe("pessoa-1");

    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(tx.update).toHaveBeenCalledTimes(1);
    expect(tx.insert).toHaveBeenCalledTimes(2);
    expect(insertValues).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ category: "IRPF" })])
    );
  });

  it("recusa neto quando o pai indicado não tem vínculo FILHO", async () => {
    const db = transactionDatabase({
      id: "pessoa-x",
      vinculo: "TITULAR",
      familyId: "familia-1",
      fullName: "Zé",
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      addPersonRecord({
        familyId: "familia-1",
        fullName: "Neto",
        vinculo: "NETO",
        parentPersonId: "pessoa-x",
        civilStatus: "SOLTEIRO",
        maritalRegime: "NA",
      } as never)
    ).rejects.toThrow("Filho(a)");
  });

  it("preenche estado civil e regime da família para cônjuge sem documentos do casal", async () => {
    familyMocks.getFamilyRecord.mockResolvedValue({
      name: "Família",
      civilStatus: "UNIAO_ESTAVEL",
      maritalRegime: "CUB",
    });
    const personValues = vi.fn().mockResolvedValue(undefined);
    const docsValues = vi.fn().mockResolvedValue(undefined);
    const insert = vi
      .fn()
      .mockReturnValueOnce({ values: personValues })
      .mockReturnValue({ values: docsValues });
    const tx = { insert };
    const db = {
      transaction: vi.fn(
        async (operation: (value: typeof tx) => Promise<void>) => operation(tx)
      ),
    };
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idMocks.createId.mockReturnValue("pessoa-conj").mockReturnValue("doc");

    await addPersonRecord({
      familyId: "familia-1",
      fullName: "Cônjuge",
      vinculo: "CONJUGE",
    } as never);

    expect(personValues).toHaveBeenCalledWith(
      expect.objectContaining({
        civilStatus: "UNIAO_ESTAVEL",
        maritalRegime: "CUB",
        vinculo: "CONJUGE",
      })
    );
    // Só IRPF, CPF/RG e Passaporte — sem certidão de casamento nem comprovante.
    expect(docsValues).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ category: "IRPF" }),
        expect.objectContaining({ category: "CPF/RG ou CNH" }),
        expect.objectContaining({ category: "Passaporte" }),
      ])
    );
    const categories = docsValues.mock.calls[0][0].map(
      (row: { category: string }) => row.category
    );
    expect(categories).toHaveLength(3);
    expect(categories).not.toContain("Certidão de casamento/UE");
    expect(categories).not.toContain("Comprovante de endereço");
  });

  it("recusa troca de titular quando a pessoa não pertence à família", async () => {
    databaseMocks.requireDatabase.mockResolvedValue(
      transactionDatabase(undefined)
    );

    await expect(
      setPrimaryContact({
        familyId: "familia-1",
        personId: "pessoa-inexistente",
      } as never)
    ).rejects.toThrow("Pessoa não encontrada nesta família.");
    expect(pathMocks.resolveFamilyStorageFolder).not.toHaveBeenCalled();
  });

  it("troca o titular em transação e migra as chaves de storage da família", async () => {
    const db = transactionDatabase({
      id: "pessoa-2",
      taxId: "11122233344",
      familyId: "familia-1",
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);
    pathMocks.findFamilyIdByPrimaryContactCpf.mockResolvedValue(null);
    pathMocks.resolveFamilyStorageFolder
      .mockResolvedValueOnce("cpf-antigo")
      .mockResolvedValueOnce("cpf-novo");
    migrationMocks.migrateFamilyStorageFolder.mockResolvedValue({
      migratedFiles: 3,
    });

    await expect(
      setPrimaryContact({
        familyId: "familia-1",
        personId: "pessoa-2",
      } as never)
    ).resolves.toEqual({ migratedFiles: 3 });

    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(pathMocks.resolveFamilyStorageFolder).toHaveBeenCalledTimes(2);
    expect(migrationMocks.migrateFamilyStorageFolder).toHaveBeenCalledWith(
      "familia-1",
      "cpf-antigo",
      "cpf-novo"
    );
  });

  it("resolve a pasta do titular antigo antes de desmarcá-lo e a nova depois da troca", async () => {
    const order: string[] = [];
    pathMocks.resolveFamilyStorageFolder.mockImplementation(async () => {
      order.push("resolve");
      return order.filter(step => step === "resolve").length === 1
        ? "cpf-antigo"
        : "cpf-novo";
    });

    const updateWhere = vi.fn().mockImplementation(async () => {
      order.push("update");
    });
    const tx = {
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({ where: updateWhere }),
      }),
      insert: vi.fn(),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi
              .fn()
              .mockResolvedValue([
                { id: "pessoa-2", taxId: "11122233344", familyId: "familia-1" },
              ]),
          }),
        }),
      }),
    };
    const db = {
      transaction: vi.fn(
        async (operation: (value: typeof tx) => Promise<void>) => operation(tx)
      ),
    };
    databaseMocks.requireDatabase.mockResolvedValue(db);
    pathMocks.findFamilyIdByPrimaryContactCpf.mockResolvedValue(null);
    migrationMocks.migrateFamilyStorageFolder.mockResolvedValue({
      migratedFiles: 1,
    });

    await setPrimaryContact({
      familyId: "familia-1",
      personId: "pessoa-2",
    } as never);

    expect(order[0]).toBe("resolve");
    expect(order[1]).toBe("update");
    expect(pathMocks.resolveFamilyStorageFolder).toHaveBeenCalledTimes(2);
    expect(migrationMocks.migrateFamilyStorageFolder).toHaveBeenCalledWith(
      "familia-1",
      "cpf-antigo",
      "cpf-novo"
    );
  });
});
