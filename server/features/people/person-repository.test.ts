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

import {
  addPersonRecord,
  getPersonRecord,
  getPrimaryContact,
  listPeopleByFamily,
  setPrimaryContact,
} from "./person-repository";

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

describe("consultas de pessoas por família", () => {
  beforeEach(() => vi.clearAllMocks());

  function selectDb(rows: Record<string, unknown>[]) {
    const limit = vi.fn().mockResolvedValue(rows.slice(0, 1));
    const result = Object.assign(Promise.resolve(rows), { limit });
    const where = vi.fn().mockReturnValue(result);
    const from = vi.fn().mockReturnValue({ where });
    return { db: { select: vi.fn().mockReturnValue({ from }) }, limit, where };
  }

  it("retorna a pessoa pelo id e null quando ela não existe", async () => {
    const found = selectDb([{ id: "pessoa-1", fullName: "Ana" }]);
    databaseMocks.requireDatabase.mockResolvedValue(found.db);

    await expect(getPersonRecord("pessoa-1")).resolves.toEqual({
      id: "pessoa-1",
      fullName: "Ana",
    });
    expect(found.limit).toHaveBeenCalledWith(1);

    const missing = selectDb([]);
    databaseMocks.requireDatabase.mockResolvedValue(missing.db);
    await expect(getPersonRecord("inexistente")).resolves.toBeNull();
  });

  it("lista todas as pessoas da família sem aplicar limite", async () => {
    const rows = [{ id: "a" }, { id: "b" }];
    const listed = selectDb(rows);
    databaseMocks.requireDatabase.mockResolvedValue(listed.db);

    await expect(listPeopleByFamily("familia-1")).resolves.toEqual(rows);
    expect(listed.limit).not.toHaveBeenCalled();
  });

  it("localiza o titular da família ou devolve null", async () => {
    const primary = selectDb([{ id: "titular", isPrimaryContact: true }]);
    databaseMocks.requireDatabase.mockResolvedValue(primary.db);

    await expect(getPrimaryContact("familia-1")).resolves.toEqual({
      id: "titular",
      isPrimaryContact: true,
    });
    expect(primary.limit).toHaveBeenCalledWith(1);

    const none = selectDb([]);
    databaseMocks.requireDatabase.mockResolvedValue(none.db);
    await expect(getPrimaryContact("familia-2")).resolves.toBeNull();
  });
});

describe("validações de vínculo e campos opcionais", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cria NETO sem parentPersonId e normaliza regime para NA em estado civil não casado", async () => {
    const insertValues = vi.fn().mockResolvedValue(undefined);
    const tx = {
      insert: vi.fn().mockReturnValue({ values: insertValues }),
      update: vi.fn(),
    };
    databaseMocks.requireDatabase.mockResolvedValue({
      transaction: vi.fn(
        async (operation: (value: typeof tx) => Promise<void>) => operation(tx)
      ),
    });
    idMocks.createId.mockReturnValue("pessoa-neto");

    await expect(
      addPersonRecord({
        familyId: "familia-1",
        fullName: "Neto",
        vinculo: "NETO",
        civilStatus: "SOLTEIRO",
        maritalRegime: "CPB",
      } as never)
    ).resolves.toBe("pessoa-neto");

    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        maritalRegime: "NA",
        isPrimaryContact: false,
        email: null,
        taxId: null,
        birthDate: null,
        parentPersonId: null,
        spouseName: null,
      })
    );
  });

  it("exige que o pai/mãe de um neto exista na família", async () => {
    databaseMocks.requireDatabase.mockResolvedValue(transactionDatabase(undefined));

    await expect(
      addPersonRecord({
        familyId: "familia-1",
        fullName: "Neto",
        vinculo: "NETO",
        parentPersonId: "pessoa-sumida",
        civilStatus: "SOLTEIRO",
        maritalRegime: "NA",
      } as never)
    ).rejects.toThrow("Pai/mãe não encontrado nesta família.");
  });

  it("exige vínculo Neto para o pai/mãe de um bisneto", async () => {
    databaseMocks.requireDatabase.mockResolvedValue(
      transactionDatabase({
        id: "pessoa-filha",
        vinculo: "FILHO",
        familyId: "familia-1",
        fullName: "Filha",
      })
    );

    await expect(
      addPersonRecord({
        familyId: "familia-1",
        fullName: "Bisneto",
        vinculo: "BISNETO",
        parentPersonId: "pessoa-filha",
        civilStatus: "SOLTEIRO",
        maritalRegime: "NA",
      } as never)
    ).rejects.toThrow("O pai/mãe de um bisneto(a) deve ter vínculo Neto(a).");
  });

  it("falha quando o cônjuge aponta para família inexistente", async () => {
    familyMocks.getFamilyRecord.mockResolvedValue(null);
    databaseMocks.requireDatabase.mockResolvedValue(transactionDatabase(undefined));

    await expect(
      addPersonRecord({
        familyId: "familia-fantasma",
        fullName: "Cônjuge",
        vinculo: "CONJUGE",
      } as never)
    ).rejects.toThrow("Família não encontrada.");
  });

  function parentAndInsertDb(parent: Record<string, unknown> | undefined) {
    const parentLimit = vi.fn().mockResolvedValue(parent ? [parent] : []);
    const parentWhere = vi.fn().mockReturnValue({ limit: parentLimit });
    const insertValues = vi.fn().mockResolvedValue(undefined);
    const tx = {
      insert: vi.fn().mockReturnValue({ values: insertValues }),
      update: vi.fn(),
      select: vi.fn(),
    };
    const db = {
      select: vi.fn().mockReturnValue({ from: vi.fn().mockReturnValue({ where: parentWhere }) }),
      transaction: vi.fn(
        async (operation: (value: typeof tx) => Promise<void>) => operation(tx)
      ),
    };
    return { db, insertValues, parentLimit };
  }

  it("cria NETO com pai de vínculo Filho válido e apelido do cônjuge normalizado", async () => {
    const { db, insertValues, parentLimit } = parentAndInsertDb({
      id: "pessoa-filha",
      vinculo: "FILHO",
      familyId: "familia-1",
      fullName: "Filha",
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idMocks.createId.mockReturnValue("pessoa-neto");

    await expect(
      addPersonRecord({
        familyId: "familia-1",
        fullName: "Neto",
        vinculo: "NETO",
        parentPersonId: "pessoa-filha",
        civilStatus: "SOLTEIRO",
        maritalRegime: "NA",
        spouseName: "  Maria  ",
      } as never)
    ).resolves.toBe("pessoa-neto");

    expect(parentLimit).toHaveBeenCalledWith(1);
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ vinculo: "NETO", parentPersonId: "pessoa-filha", spouseName: "Maria" })
    );
  });

  it("cria BISNETO com pai de vínculo Neto válido", async () => {
    const { db, insertValues } = parentAndInsertDb({
      id: "pessoa-neta",
      vinculo: "NETO",
      familyId: "familia-1",
      fullName: "Neta",
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idMocks.createId.mockReturnValue("pessoa-bisneto");

    await expect(
      addPersonRecord({
        familyId: "familia-1",
        fullName: "Bisneto",
        vinculo: "BISNETO",
        parentPersonId: "pessoa-neta",
        civilStatus: "SOLTEIRO",
        maritalRegime: "NA",
      } as never)
    ).resolves.toBe("pessoa-bisneto");

    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ vinculo: "BISNETO", parentPersonId: "pessoa-neta" })
    );
  });

  it("usa o id da família como rótulo quando o CPF conflitante não tem nome cadastrado", async () => {
    pathMocks.findFamilyIdByPrimaryContactCpf.mockResolvedValue("familia-desconhecida");
    familyMocks.getFamilyRecord.mockResolvedValue(null);
    databaseMocks.requireDatabase.mockResolvedValue(transactionDatabase(undefined));

    await expect(
      addPersonRecord({
        familyId: "familia-1",
        fullName: "Titular",
        vinculo: "TITULAR",
        taxId: "11122233344",
        civilStatus: "SOLTEIRO",
        maritalRegime: "NA",
        isPrimaryContact: true,
      } as never)
    ).rejects.toThrow(
      "Este CPF já é o titular de outra família (família familia-desconhecida)."
    );
  });
});
