/**
 * @description Valida o repositório de pessoas na Fase 4: CPF duplicado no
 * projeto, segundo cônjuge, menor sempre solteiro, coerência de nascimento
 * entre gerações, edição com migração de storage do titular e exclusão
 * bloqueada por vínculos (titularidade, sociedade, ativos, dependentes).
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
const dependentIrpfMocks = vi.hoisted(() => ({
  syncDependentIrpfStatus: vi.fn(),
}));

vi.mock("../_shared/database", () => databaseMocks);
vi.mock("../families/family-repository", () => familyMocks);
vi.mock("../../lib/family-storage-path", () => pathMocks);
vi.mock("../../lib/family-storage-migration", () => migrationMocks);
vi.mock("../_shared/ids", () => idMocks);
vi.mock("../documents/dependent-irpf", () => dependentIrpfMocks);

import {
  addPersonRecord,
  getPersonRecord,
  getPrimaryContact,
  listPeopleByFamily,
  removePersonRecord,
  setPrimaryContact,
  updatePersonRecord,
} from "./person-repository";

import {
  documents as documentsTable,
  people as peopleTable,
  propertyOwners,
  companyStakeholders,
  otherAssets,
} from "../../../drizzle/schema";

/**
 * Banco fake com fila de respostas por chamada de select().from().where().limit().
 * Cada entrada da fila atende uma chamada sequencial (importante porque
 * consultas diferentes usam a mesma tabela `people`).
 */
function queuedDb(selectQueue: unknown[][]) {
  const queue = [...selectQueue];
  const insertValues = vi.fn().mockResolvedValue(undefined);
  const updateWhere = vi.fn().mockResolvedValue(undefined);
  const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
  const update = vi.fn().mockReturnValue({ set: updateSet });
  const deleteWhere = vi.fn().mockResolvedValue(undefined);
  const remove = vi.fn().mockReturnValue({ where: deleteWhere });
  const where = vi.fn(() => {
    const rows = queue.shift() ?? [];
    const chain = Object.assign(Promise.resolve(rows), {
      limit: vi.fn(() => Promise.resolve(rows)),
    });
    return chain;
  });
  const from = vi.fn().mockReturnValue({ where });
  const select = vi.fn().mockReturnValue({ from });
  const insert = vi.fn().mockReturnValue({ values: insertValues });
  const tx = { insert, update, select, delete: remove };
  const transaction = vi.fn(async (operation: (value: typeof tx) => Promise<void>) =>
    operation(tx)
  );
  return {
    db: { select, insert, update, delete: remove, transaction },
    insertValues,
    update,
    updateWhere,
    deleteWhere,
    transaction,
    select,
  };
}

const titularInput = {
  familyId: "familia-1",
  fullName: "Ana Silva",
  email: "ana@lucathi.com.br",
  taxId: "52998224725",
  birthDate: "1990-01-01",
  phone: "11999998888",
  vinculo: "TITULAR",
  civilStatus: "CASADO",
  maritalRegime: "CPB",
  spouseName: "João Silva",
  city: "São Paulo",
  uf: "SP",
  isPrimaryContact: true,
} as never;

describe("person-repository criação", () => {
  beforeEach(() => vi.clearAllMocks());

  it("bloqueia novo titular quando o CPF já pertence a outra família", async () => {
    const { db } = queuedDb([[]]);
    databaseMocks.requireDatabase.mockResolvedValue(db);
    pathMocks.findFamilyIdByPrimaryContactCpf.mockResolvedValue(
      "familia-conflito"
    );
    familyMocks.getFamilyRecord.mockResolvedValue({ name: "Família Costa" });

    await expect(addPersonRecord(titularInput)).rejects.toThrow("Família Costa");
    expect(db.transaction).toHaveBeenCalledTimes(1);
  });

  it("cria pessoa titular em transação, desmarca titular anterior e gera requisitos", async () => {
    const { db, insertValues, transaction } = queuedDb([[]]);
    databaseMocks.requireDatabase.mockResolvedValue(db);
    pathMocks.findFamilyIdByPrimaryContactCpf.mockResolvedValue(null);
    idMocks.createId
      .mockReturnValueOnce("pessoa-1")
      .mockReturnValue("doc");

    await expect(addPersonRecord(titularInput)).resolves.toBe("pessoa-1");

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(insertValues).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ category: "IRPF" })])
    );
  });

  it("define como default que o primeiro membro cadastrado é o Titular com isPrimaryContact true", async () => {
    const { db, insertValues } = queuedDb([[]]);
    databaseMocks.requireDatabase.mockResolvedValue(db);
    pathMocks.findFamilyIdByPrimaryContactCpf.mockResolvedValue(null);
    idMocks.createId.mockReturnValueOnce("pessoa-primeira").mockReturnValue("doc");

    await addPersonRecord({
      familyId: "familia-nova",
      fullName: "Primeiro Membro",
      taxId: "52998224725",
      birthDate: "1985-01-01",
      civilStatus: "SOLTEIRO",
      city: "São Paulo",
      uf: "SP",
    } as never);

    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "pessoa-primeira",
        vinculo: "TITULAR",
        isPrimaryContact: true,
      })
    );
  });

  it("recusa CPF já cadastrado em outra pessoa do projeto", async () => {
    const { db } = queuedDb([[{ id: "outra-pessoa", fullName: "Outra" }]]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(addPersonRecord(titularInput)).rejects.toThrow(
      "Este CPF já está cadastrado neste projeto (Outra)."
    );
  });

  it("recusa segundo cônjuge no projeto", async () => {
    const { db } = queuedDb([[], [{ id: "conjuge-existente" }]]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      addPersonRecord({
        ...titularInput,
        fullName: "Cônjuge",
        taxId: "11144477735",
        vinculo: "CONJUGE",
        civilStatus: undefined,
        maritalRegime: undefined,
        spouseName: undefined,
        isPrimaryContact: false,
      } as never)
    ).rejects.toThrow("Este projeto já possui um cônjuge.");
  });

  it("aplica default CASADO/CPB para cônjuge sem estado civil", async () => {
    const { db, insertValues } = queuedDb([[], []]);
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idMocks.createId.mockReturnValueOnce("pessoa-conj").mockReturnValue("doc");

    await addPersonRecord({
      familyId: "familia-1",
      fullName: "Cônjuge",
      taxId: "11144477735",
      birthDate: "1992-05-05",
      phone: "11988887777",
      city: "São Paulo",
      uf: "SP",
      vinculo: "CONJUGE",
    } as never);

    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        civilStatus: "CASADO",
        maritalRegime: "CPB",
        vinculo: "CONJUGE",
      })
    );
  });

  it("força SOLTEIRO/NA para menor de 18 anos", async () => {
    const { db, insertValues } = queuedDb([[]]);
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idMocks.createId.mockReturnValueOnce("pessoa-filho").mockReturnValue("doc");
    const menor = `${new Date().getFullYear() - 10}-06-15`;

    await addPersonRecord({
      familyId: "familia-1",
      fullName: "Filho Menor",
      taxId: "11144477735",
      birthDate: menor,
      city: "São Paulo",
      uf: "SP",
      vinculo: "FILHO",
      civilStatus: "SOLTEIRO",
    } as never);

    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        civilStatus: "SOLTEIRO",
        maritalRegime: "NA",
      })
    );
  });

  it("recusa nascimento anterior ao do pai/mãe", async () => {
    const parent = {
      id: "pessoa-pai",
      vinculo: "FILHO",
      fullName: "Pai",
      birthDate: "2000-01-01",
    };
    // 1) assertParentMatches, 2) assertBirthAfterParent, 3) dup CPF
    const { db } = queuedDb([[parent], [parent], []]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      addPersonRecord({
        familyId: "familia-1",
        fullName: "Neto",
        taxId: "11144477735",
        birthDate: "1999-01-01",
        city: "São Paulo",
        uf: "SP",
        vinculo: "NETO",
        parentPersonId: "pessoa-pai",
        civilStatus: "SOLTEIRO",
      } as never)
    ).rejects.toThrow("Data de nascimento anterior à do pai/mãe");
  });

  it("recusa neto quando o pai indicado não tem vínculo FILHO", async () => {
    const { db } = queuedDb([[{ id: "pessoa-x", vinculo: "TITULAR", fullName: "Zé" }]]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      addPersonRecord({
        familyId: "familia-1",
        fullName: "Neto",
        taxId: "11144477735",
        birthDate: "2015-01-01",
        city: "São Paulo",
        uf: "SP",
        vinculo: "NETO",
        parentPersonId: "pessoa-x",
        civilStatus: "SOLTEIRO",
      } as never)
    ).rejects.toThrow("Filho(a)");
  });

  it("recusa pai/mãe inexistente na família", async () => {
    const { db } = queuedDb([[]]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      addPersonRecord({
        familyId: "familia-1",
        fullName: "Neto",
        taxId: "11144477735",
        birthDate: "2015-01-01",
        city: "São Paulo",
        uf: "SP",
        vinculo: "NETO",
        parentPersonId: "sumido",
        civilStatus: "SOLTEIRO",
      } as never)
    ).rejects.toThrow("Pai/mãe não encontrado");
  });

  it("recusa bisneto cujo pai não tem vínculo NETO", async () => {
    const { db } = queuedDb([
      [{ id: "p-filho", vinculo: "FILHO", fullName: "Filho", birthDate: "1980-01-01" }],
    ]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      addPersonRecord({
        familyId: "familia-1",
        fullName: "Bisneto",
        taxId: "11144477735",
        birthDate: "2015-01-01",
        city: "São Paulo",
        uf: "SP",
        vinculo: "BISNETO",
        parentPersonId: "p-filho",
        civilStatus: "SOLTEIRO",
      } as never)
    ).rejects.toThrow("Neto(a)");
  });

  it("usa rótulo alternativo quando a família conflitante não tem nome", async () => {
    const { db } = queuedDb([[]]);
    databaseMocks.requireDatabase.mockResolvedValue(db);
    pathMocks.findFamilyIdByPrimaryContactCpf.mockResolvedValue("fam-x");
    familyMocks.getFamilyRecord.mockResolvedValue(null);

    await expect(addPersonRecord(titularInput)).rejects.toThrow("fam-x");
  });

  it("cria neto com pai FILHO válido e nascimento coerente", async () => {
    const pai = {
      id: "pessoa-filho",
      vinculo: "FILHO",
      fullName: "Filho",
      birthDate: "1990-06-01",
    };
    // 1) parent match, 2) parent birth, 3) dup CPF
    const { db, insertValues } = queuedDb([[pai], [pai], []]);
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idMocks.createId.mockReturnValueOnce("neto-1").mockReturnValue("doc");

    await addPersonRecord({
      familyId: "familia-1",
      fullName: "Neto",
      taxId: "11144477735",
      birthDate: "2015-01-01",
      city: "São Paulo",
      uf: "SP",
      vinculo: "NETO",
      parentPersonId: "pessoa-filho",
      civilStatus: "SOLTEIRO",
    } as never);

    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ vinculo: "NETO", parentPersonId: "pessoa-filho" })
    );
  });

  it("cria bisneto com pai NETO válido", async () => {
    const neto = {
      id: "pessoa-neto",
      vinculo: "NETO",
      fullName: "Neto",
      birthDate: "2010-01-01",
    };
    const { db, insertValues } = queuedDb([[neto], [neto], []]);
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idMocks.createId.mockReturnValueOnce("bisneto-1").mockReturnValue("doc");

    await addPersonRecord({
      familyId: "familia-1",
      fullName: "Bisneto",
      taxId: "11144477735",
      birthDate: "2025-01-01",
      city: "São Paulo",
      uf: "SP",
      vinculo: "BISNETO",
      parentPersonId: "pessoa-neto",
      civilStatus: "SOLTEIRO",
    } as never);

    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ vinculo: "BISNETO" })
    );
  });

  it("pula a checagem de nascimento quando o pai não tem data", async () => {
    const paiSemData = {
      id: "pessoa-filho",
      vinculo: "FILHO",
      fullName: "Filho",
      birthDate: null,
    };
    const { db, insertValues } = queuedDb([[paiSemData], [paiSemData], []]);
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idMocks.createId.mockReturnValueOnce("neto-1").mockReturnValue("doc");

    await expect(
      addPersonRecord({
        familyId: "familia-1",
        fullName: "Neto",
        taxId: "11144477735",
        birthDate: "2015-01-01",
        city: "São Paulo",
        uf: "SP",
        vinculo: "NETO",
        parentPersonId: "pessoa-filho",
        civilStatus: "SOLTEIRO",
      } as never)
    ).resolves.toBe("neto-1");
    expect(insertValues).toHaveBeenCalled();
  });
});

describe("person-repository edição", () => {
  const filha = {
    id: "pessoa-2",
    familyId: "familia-1",
    vinculo: "FILHO",
    taxId: "52998224725",
    isPrimaryContact: false,
    parentPersonId: null,
  };

  beforeEach(() => vi.clearAllMocks());

  it("falha quando a pessoa não existe na família", async () => {
    const { db } = queuedDb([[]]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      updatePersonRecord({
        familyId: "familia-1",
        personId: "sumida",
        fullName: "Ana",
        taxId: "52998224725",
        birthDate: "1990-01-01",
        email: "ana@x.com",
        phone: "11999998888",
        city: "São Paulo",
        uf: "SP",
      } as never)
    ).rejects.toThrow("Pessoa não encontrada nesta família.");
  });

  it("atualiza os campos editáveis da pessoa", async () => {
    const person = {
      id: "pessoa-1",
      familyId: "familia-1",
      vinculo: "FILHO",
      taxId: "52998224725",
      isPrimaryContact: false,
      parentPersonId: null,
      civilStatus: "SOLTEIRO",
      maritalRegime: "NA",
    };
    // 1) load person, 2) dup CPF (mesmo CPF não consulta extra? mudou → não)
    const { db, updateWhere } = queuedDb([[person]]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      updatePersonRecord({
        familyId: "familia-1",
        personId: "pessoa-1",
        fullName: "Ana Editada",
        taxId: "52998224725",
        birthDate: "1990-01-01",
        email: "ana@x.com",
        phone: "11999998888",
        city: "São Paulo",
        uf: "SP",
        civilStatus: "SOLTEIRO",
      } as never)
    ).resolves.toEqual({ personId: "pessoa-1", migratedFiles: 0 });
    expect(updateWhere).toHaveBeenCalledWith(
      expect.objectContaining({})
    );
  });

  it("migra o storage quando o CPF do titular muda", async () => {
    const person = {
      id: "pessoa-1",
      familyId: "familia-1",
      vinculo: "TITULAR",
      taxId: "52998224725",
      isPrimaryContact: true,
      parentPersonId: null,
      civilStatus: "CASADO",
      maritalRegime: "CPB",
    };
    // 1) load, 2) dup CPF com novo CPF → vazio
    const { db } = queuedDb([[person], []]);
    databaseMocks.requireDatabase.mockResolvedValue(db);
    pathMocks.findFamilyIdByPrimaryContactCpf.mockResolvedValue(null);
    pathMocks.resolveFamilyStorageFolder
      .mockResolvedValueOnce("cpf-antigo")
      .mockResolvedValueOnce("cpf-novo");
    migrationMocks.migrateFamilyStorageFolder.mockResolvedValue({
      migratedFiles: 2,
    });

    await expect(
      updatePersonRecord({
        familyId: "familia-1",
        personId: "pessoa-1",
        fullName: "Ana Silva",
        taxId: "11144477735",
        birthDate: "1990-01-01",
        email: "ana@x.com",
        phone: "11999998888",
        city: "São Paulo",
        uf: "SP",
        civilStatus: "CASADO",
        maritalRegime: "CPB",
        spouseName: "João Silva",
      } as never)
    ).resolves.toEqual({ personId: "pessoa-1", migratedFiles: 2 });
    expect(migrationMocks.migrateFamilyStorageFolder).toHaveBeenCalledWith(
      "familia-1",
      "cpf-antigo",
      "cpf-novo"
    );
  });

  it("valida nascimento contra o pai/mãe na edição", async () => {
    const parent = {
      id: "pessoa-pai",
      vinculo: "FILHO",
      fullName: "Pai",
      birthDate: "2000-01-01",
    };
    // 1) load person (com parentPersonId), 2) parent birth, 3) dup CPF
    const { db } = queuedDb([
      [{ ...filha, parentPersonId: "pessoa-pai" }],
      [parent],
      [],
    ]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      updatePersonRecord({
        familyId: "familia-1",
        personId: "pessoa-2",
        fullName: "Neto",
        taxId: "52998224725",
        birthDate: "1999-06-01",
        city: "São Paulo",
        uf: "SP",
        civilStatus: "SOLTEIRO",
      } as never)
    ).rejects.toThrow("Data de nascimento anterior");
  });

  it("força solteiro na edição de menor e zera o endereço quando herda do titular", async () => {
    const menor = `${new Date().getFullYear() - 10}-06-15`;
    const { db, updateWhere } = queuedDb([
      [
        {
          id: "pessoa-2",
          familyId: "familia-1",
          vinculo: "FILHO",
          taxId: "52998224725",
          isPrimaryContact: false,
          parentPersonId: null,
          civilStatus: "CASADO",
          maritalRegime: "CPB",
        },
      ],
    ]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      updatePersonRecord({
        familyId: "familia-1",
        personId: "pessoa-2",
        fullName: "Filho Menor",
        taxId: "52998224725",
        birthDate: menor,
        city: "São Paulo",
        uf: "SP",
        civilStatus: "SOLTEIRO",
        addressSameAsPrimary: true,
      } as never)
    ).resolves.toEqual({ personId: "pessoa-2", migratedFiles: 0 });
    expect(updateWhere).toHaveBeenCalledWith(expect.objectContaining({}));
  });

  it("aplica default CASADO/CPB na edição de cônjuge sem estado civil", async () => {
    const { db } = queuedDb([
      [
        {
          id: "pessoa-c",
          familyId: "familia-1",
          vinculo: "CONJUGE",
          taxId: "52998224725",
          isPrimaryContact: false,
          parentPersonId: null,
          civilStatus: null,
          maritalRegime: null,
        },
      ],
    ]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      updatePersonRecord({
        familyId: "familia-1",
        personId: "pessoa-c",
        fullName: "Cônjuge Editado",
        taxId: "52998224725",
        birthDate: "1992-05-05",
        phone: "11988887777",
        city: "São Paulo",
        uf: "SP",
      } as never)
    ).resolves.toEqual({ personId: "pessoa-c", migratedFiles: 0 });
  });

  it("pula a checagem de nascimento na edição quando a pessoa não tem pai/mãe", async () => {
    const { db } = queuedDb([[filha]]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      updatePersonRecord({
        familyId: "familia-1",
        personId: "pessoa-2",
        fullName: "Filha Editada",
        taxId: "52998224725",
        birthDate: "2015-01-01",
        city: "São Paulo",
        uf: "SP",
        civilStatus: "SOLTEIRO",
      } as never)
    ).resolves.toEqual({ personId: "pessoa-2", migratedFiles: 0 });
  });

  it("trata vínculo nulo do banco como string vazia na edição", async () => {
    const { db } = queuedDb([
      [
        {
          id: "pessoa-x",
          familyId: "familia-1",
          vinculo: null,
          taxId: "52998224725",
          isPrimaryContact: false,
          parentPersonId: null,
          civilStatus: null,
          maritalRegime: null,
        },
      ],
    ]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      updatePersonRecord({
        familyId: "familia-1",
        personId: "pessoa-x",
        fullName: "Sem Vínculo",
        taxId: "52998224725",
        birthDate: "1990-01-01",
        email: "x@x.com",
        phone: "11999998888",
        city: "São Paulo",
        uf: "SP",
        civilStatus: "SOLTEIRO",
      } as never)
    ).resolves.toEqual({ personId: "pessoa-x", migratedFiles: 0 });
  });
});

describe("person-repository exclusão", () => {
  beforeEach(() => vi.clearAllMocks());

  const semVinculos = {
    id: "pessoa-2",
    familyId: "familia-1",
    fullName: "Filho",
    vinculo: "FILHO",
    isPrimaryContact: false,
  };

  it("recusa excluir o titular", async () => {
    const { db } = queuedDb([[{ ...semVinculos, isPrimaryContact: true }]]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      removePersonRecord("familia-1", "pessoa-2")
    ).rejects.toThrow("titular do projeto");
  });

  it("recusa excluir pessoa com dependentes na árvore", async () => {
    const { db } = queuedDb([[semVinculos], [{ id: "neto-1" }]]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      removePersonRecord("familia-1", "pessoa-2")
    ).rejects.toThrow("filhos/netos dependentes");
  });

  it("recusa excluir pessoa titular de imóvel", async () => {
    const { db } = queuedDb([[semVinculos], [], [{ id: "own-1" }]]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      removePersonRecord("familia-1", "pessoa-2")
    ).rejects.toThrow("titular de imóvel");
  });

  it("recusa excluir sócio de sociedade", async () => {
    const { db } = queuedDb([[semVinculos], [], [], [{ id: "st-1" }]]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      removePersonRecord("familia-1", "pessoa-2")
    ).rejects.toThrow("participação em sociedade");
  });

  it("recusa excluir responsável por ativo", async () => {
    const { db } = queuedDb([[semVinculos], [], [], [], [{ id: "asset-1" }]]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      removePersonRecord("familia-1", "pessoa-2")
    ).rejects.toThrow("responsável por ativos");
  });

  it("sem vínculos: arquiva documentos e remove a pessoa", async () => {
    const { db, deleteWhere } = queuedDb([
      [semVinculos],
      [],
      [],
      [],
      [],
      [{ id: "doc-1" }, { id: "doc-2" }],
    ]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      removePersonRecord("familia-1", "pessoa-2")
    ).resolves.toEqual({ archivedDocuments: 2 });
    expect(db.update).toHaveBeenCalledWith(documentsTable);
    expect(deleteWhere).toHaveBeenCalled();
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

  it("localiza o titular por vinculo TITULAR como fallback se isPrimaryContact for false", async () => {
    const { db } = queuedDb([
      [],
      [{ id: "titular-legado", vinculo: "TITULAR", isPrimaryContact: false }],
    ]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(getPrimaryContact("familia-1")).resolves.toEqual({
      id: "titular-legado",
      vinculo: "TITULAR",
      isPrimaryContact: false,
    });
  });
});

describe("person-repository titular e storage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("recusa troca de titular quando a pessoa não pertence à família", async () => {
    const { db } = queuedDb([[]]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      setPrimaryContact({
        familyId: "familia-1",
        personId: "pessoa-inexistente",
      } as never)
    ).rejects.toThrow("Pessoa não encontrada nesta família.");
    expect(pathMocks.resolveFamilyStorageFolder).not.toHaveBeenCalled();
  });

  it("troca o titular em transação e migra as chaves de storage da família", async () => {
    const { db, updateWhere } = queuedDb([
      [{ id: "pessoa-2", taxId: "52998224725", familyId: "familia-1" }],
    ]);
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
    expect(updateWhere).toHaveBeenCalled();
    expect(migrationMocks.migrateFamilyStorageFolder).toHaveBeenCalledWith(
      "familia-1",
      "cpf-antigo",
      "cpf-novo"
    );
  });

  it("ao trocar titular, atualiza titular anterior para OUTRO e novo para TITULAR", async () => {
    const updateSet = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
    const update = vi.fn().mockReturnValue({ set: updateSet });
    const tx = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { id: "pessoa-nova", taxId: "52998224725", familyId: "familia-1" },
            ]),
          }),
        }),
      }),
      update,
      insert: vi.fn(),
      delete: vi.fn(),
    };
    const db = {
      transaction: vi.fn(async (op: (val: typeof tx) => Promise<void>) => op(tx)),
      select: tx.select,
      update,
    };
    databaseMocks.requireDatabase.mockResolvedValue(db);
    pathMocks.findFamilyIdByPrimaryContactCpf.mockResolvedValue(null);
    pathMocks.resolveFamilyStorageFolder.mockResolvedValue("cpf");
    migrationMocks.migrateFamilyStorageFolder.mockResolvedValue({ migratedFiles: 0 });

    await setPrimaryContact({ familyId: "familia-1", personId: "pessoa-nova" });

    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ isPrimaryContact: true, vinculo: "TITULAR" })
    );
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ vinculo: null })
    );
  });
});

describe("person-repository dependente (IRPF do titular)", () => {
  const dependenteInput = {
    familyId: "familia-1",
    fullName: "Pedro Silva",
    email: "pedro@example.com",
    taxId: "12345678909",
    birthDate: "2005-06-15",
    phone: "11999997777",
    vinculo: "FILHO",
    civilStatus: "SOLTEIRO",
    city: "São Paulo",
    uf: "SP",
    isDependent: true,
  } as never;

  const filhoDaCasa = {
    id: "pessoa-1",
    familyId: "familia-1",
    vinculo: "FILHO",
    taxId: "52998224725",
    isPrimaryContact: false,
    parentPersonId: null,
    civilStatus: "SOLTEIRO",
    maritalRegime: "NA",
    isDependent: false,
  };

  beforeEach(() => vi.clearAllMocks());

  it("recusa marcar dependente quando a família ainda não tem titular", async () => {
    const { db } = queuedDb([[], []]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(addPersonRecord(dependenteInput)).rejects.toThrow(
      "Esta família ainda não tem titular marcado. Defina o titular antes de marcar um dependente."
    );
    expect(db.transaction).not.toHaveBeenCalled();
    expect(dependentIrpfMocks.syncDependentIrpfStatus).not.toHaveBeenCalled();
  });

  it("permite marcar dependente com o titular existente mesmo com IRPF pendente", async () => {
    const { db, insertValues } = queuedDb([
      [],
      [{ id: "titular-1" }],
      [{ id: "titular-1" }],
    ]);
    databaseMocks.requireDatabase.mockResolvedValue(db);
    dependentIrpfMocks.syncDependentIrpfStatus.mockResolvedValue(1);
    idMocks.createId.mockReturnValueOnce("pessoa-1").mockReturnValue("doc");

    await expect(addPersonRecord(dependenteInput)).resolves.toBe("pessoa-1");
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ isDependent: true, vinculo: "FILHO" })
    );
    expect(dependentIrpfMocks.syncDependentIrpfStatus).toHaveBeenCalledWith(
      "familia-1"
    );
  });

  it("cria dependente com IRPF do titular recebido e sincroniza o status", async () => {
    const { db, insertValues } = queuedDb([
      [],
      [{ id: "titular-1" }],
      [{ status: "RECEBIDO_EM_ANALISE" }],
    ]);
    databaseMocks.requireDatabase.mockResolvedValue(db);
    dependentIrpfMocks.syncDependentIrpfStatus.mockResolvedValue(1);
    idMocks.createId.mockReturnValueOnce("pessoa-1").mockReturnValue("doc");

    await expect(addPersonRecord(dependenteInput)).resolves.toBe("pessoa-1");
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ isDependent: true, vinculo: "FILHO" })
    );
    expect(dependentIrpfMocks.syncDependentIrpfStatus).toHaveBeenCalledWith(
      "familia-1"
    );
  });

  it("marca o dependente na edição quando o IRPF do titular já foi recebido", async () => {
    const { db } = queuedDb([
      [filhoDaCasa],
      [{ id: "titular-1" }],
      [{ status: "VALIDADO" }],
    ]);
    databaseMocks.requireDatabase.mockResolvedValue(db);
    dependentIrpfMocks.syncDependentIrpfStatus.mockResolvedValue(1);

    await expect(
      updatePersonRecord({
        familyId: "familia-1",
        personId: "pessoa-1",
        fullName: "Pedro Silva",
        taxId: "52998224725",
        birthDate: "2005-06-15",
        email: "pedro@example.com",
        phone: "11999997777",
        city: "São Paulo",
        uf: "SP",
        civilStatus: "SOLTEIRO",
        isDependent: true,
      } as never)
    ).resolves.toEqual({ personId: "pessoa-1", migratedFiles: 0 });
    expect(dependentIrpfMocks.syncDependentIrpfStatus).toHaveBeenCalledWith(
      "familia-1"
    );
  });

  it("usa o isDependent já gravado na edição e valida o IRPF do titular", async () => {
    const { db } = queuedDb([[{ ...filhoDaCasa, isDependent: true }], []]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      updatePersonRecord({
        familyId: "familia-1",
        personId: "pessoa-1",
        fullName: "Pedro Silva",
        taxId: "52998224725",
        birthDate: "2005-06-15",
        email: "pedro@example.com",
        phone: "11999997777",
        city: "São Paulo",
        uf: "SP",
        civilStatus: "SOLTEIRO",
      } as never)
    ).rejects.toThrow("Esta família ainda não tem titular marcado. Defina o titular antes de marcar um dependente.");
    expect(dependentIrpfMocks.syncDependentIrpfStatus).not.toHaveBeenCalled();
  });
});
