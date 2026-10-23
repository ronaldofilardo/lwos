/**
 * @description Regras de titularidade do imóvel: a soma dos % dos membros da
 * família não pode passar de 100% e o mesmo membro não pode entrar duas vezes.
 * @see server/features/properties/property-repository.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
const idMocks = vi.hoisted(() => ({ createId: vi.fn() }));

vi.mock("../_shared/database", () => databaseMocks);
vi.mock("../_shared/ids", () => idMocks);

import { documents, properties, propertyOwners } from "../../../drizzle/schema";
import {
  addPropertyOwnerRecord,
  assertCompanyOwnershipAllowed,
  createPropertyRecord,
  getPropertyRecord,
  listPropertyOwners,
  listPropertyRecords,
  removePropertyOwnerRecord,
  removePropertyRecord,
  updatePropertyOwnerRecord,
  updatePropertyRecord,
} from "./property-repository";

type OwnerRow = {
  id: string;
  propertyId: string;
  personId: string;
  ownershipPercentage: string;
  rightType: string;
};

function mockDb(existing: OwnerRow[]) {
  const insertValues = vi.fn().mockResolvedValue(undefined);
  const deleted = existing[0]
    ? [{ id: existing[0].id, propertyId: existing[0].propertyId }]
    : [];
  const tx = {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(existing),
        limit: vi.fn().mockResolvedValue(existing[0] ? [existing[0]] : []),
      }),
    }),
    insert: vi.fn().mockReturnValue({ values: insertValues }),
    update: vi.fn(),
  };
  const db = {
    transaction: vi.fn(
      async (operation: (value: typeof tx) => Promise<unknown>) => operation(tx)
    ),
    select: tx.select,
    insert: tx.insert,
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue(deleted),
      }),
    }),
  };
  return { db, insertValues };
}

const owner = (personId: string, ownershipPercentage: string): OwnerRow => ({
  id: `own-${personId}`,
  propertyId: "imovel-1",
  personId,
  ownershipPercentage,
  rightType: "PROPRIEDADE",
});

describe("property-repository — titularidades", () => {
  beforeEach(() => vi.clearAllMocks());

  it("aceita o primeiro membro com 100%", async () => {
    const { db, insertValues } = mockDb([]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await addPropertyOwnerRecord({
      propertyId: "imovel-1",
      personId: "p1",
      ownershipPercentage: 100,
      rightType: "PROPRIEDADE",
    } as never);

    expect(insertValues).toHaveBeenCalledTimes(1);
  });

  it("rejeita quando a soma das titularidades passa de 100%", async () => {
    const { db, insertValues } = mockDb([owner("p1", "60.00")]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      addPropertyOwnerRecord({
        propertyId: "imovel-1",
        personId: "p2",
        ownershipPercentage: 50,
        rightType: "PROPRIEDADE",
      } as never)
    ).rejects.toThrow("soma das titularidades não pode passar de 100%");

    expect(insertValues).not.toHaveBeenCalled();
  });

  it("rejeita o mesmo membro vinculado duas vezes ao imóvel", async () => {
    const { db, insertValues } = mockDb([owner("p1", "40.00")]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      addPropertyOwnerRecord({
        propertyId: "imovel-1",
        personId: "p1",
        ownershipPercentage: 10,
        rightType: "PROPRIEDADE",
      } as never)
    ).rejects.toThrow("já está vinculado");

    expect(insertValues).not.toHaveBeenCalled();
  });

  it("permite completar 100% com um segundo membro", async () => {
    const { db, insertValues } = mockDb([owner("p1", "60.00")]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await addPropertyOwnerRecord({
      propertyId: "imovel-1",
      personId: "p2",
      ownershipPercentage: 40,
      rightType: "USUFRUTO",
    } as never);

    expect(insertValues).toHaveBeenCalledTimes(1);
  });

  it("remove a titularidade informando o imóvel correto", async () => {
    const { db } = mockDb([owner("p1", "100.00")]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      removePropertyOwnerRecord({
        propertyId: "imovel-1",
        ownerId: "own-p1",
      } as never)
    ).resolves.toBe("own-p1");
  });
});

type PropertyDbConfig = {
  propertyLimitQueue?: Record<string, unknown>[][];
  propertyRows?: Record<string, unknown>[];
  ownerRows?: OwnerRow[];
  currentOwnerRows?: OwnerRow[];
  documentRows?: { id: string }[];
  removedRows?: { id: string; propertyId: string }[];
};

function propertyDb(config: PropertyDbConfig = {}) {
  const insertValues = vi.fn(async () => undefined);
  const setValues = vi.fn(() => ({ where: vi.fn(async () => undefined) }));
  const update = vi.fn(() => ({ set: setValues }));
  const returning = vi.fn(async () => config.removedRows ?? []);
  const remove = vi.fn(() => ({ where: vi.fn(() => ({ returning })) }));
  let propertyLimitIndex = 0;

  const select = vi.fn(() => ({
    from: vi.fn((table: unknown) => {
      const baseRows = (): unknown[] => {
        if (table === properties) return config.propertyRows ?? [];
        if (table === propertyOwners) return config.ownerRows ?? [];
        if (table === documents) return config.documentRows ?? [];
        return [];
      };
      const limit = vi.fn(async () => {
        if (table === properties) {
          const queue = config.propertyLimitQueue ?? [];
          return queue[propertyLimitIndex++] ?? [];
        }
        if (table === propertyOwners) return config.currentOwnerRows ?? [];
        return [];
      });
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
  const transaction = vi.fn(async (operation: (tx: unknown) => Promise<unknown>) =>
    operation({ select, insert, update })
  );
  const db = { select, insert, update, delete: remove, transaction };
  return { db, insertValues, setValues, remove };
}

describe("property-repository — imóveis e consultas", () => {
  beforeEach(() => vi.clearAllMocks());

  it("devolve o id do imóvel já cadastrado com a mesma descrição e cidade", async () => {
    const { db, insertValues } = propertyDb({ propertyLimitQueue: [[{ id: "imovel-7" }]] });
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idMocks.createId.mockReturnValue("imovel-novo");

    await expect(
      createPropertyRecord({
        familyId: "fam-1",
        description: "Casa de praia",
        propertyCity: "Paraty",
      } as never)
    ).resolves.toBe("imovel-7");
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("cria imóvel com matrícula normalizando campos vazios", async () => {
    const { db, insertValues } = propertyDb({ propertyLimitQueue: [[]] });
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idMocks.createId.mockReturnValue("imovel-9");

    await expect(
      createPropertyRecord({
        familyId: "fam-1",
        description: "Apartamento",
        propertyCity: "São Paulo",
        hasRegistration: true,
        registrationNumber: "",
        alternativeDocType: "IPTU",
        noRegistrationReason: "sem motivo",
        registryCity: "",
        acquisitionDate: "",
        declaredValue: 100000,
      } as never)
    ).resolves.toBe("imovel-9");

    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "imovel-9",
        hasRegistration: true,
        registrationNumber: null,
        alternativeDocType: null,
        noRegistrationReason: null,
        registryCity: null,
        acquisitionDate: null,
        irpfBalanceValue: "100000.00",
        marketValue: null,
      })
    );
  });

  it("cria imóvel sem matrícula preservando o documento alternativo", async () => {
    const { db, insertValues } = propertyDb({ propertyLimitQueue: [[]] });
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idMocks.createId.mockReturnValue("imovel-10");

    await createPropertyRecord({
      familyId: "fam-1",
      description: "Terreno",
      propertyCity: "Campinas",
      hasRegistration: false,
      registrationNumber: "123",
      alternativeDocType: "IPTU",
      noRegistrationReason: "Matrícula inexistente",
      marketValue: 50000,
    } as never);

    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        hasRegistration: false,
        registrationNumber: null,
        alternativeDocType: "IPTU",
        noRegistrationReason: "Matrícula inexistente",
        irpfBalanceValue: null,
        marketValue: "50000.00",
      })
    );
  });

  it("lista imóveis, lê um imóvel específico e devolve null quando não existe", async () => {
    const listed = propertyDb({ propertyRows: [{ id: "imovel-1" }] });
    databaseMocks.requireDatabase.mockResolvedValue(listed.db);
    await expect(listPropertyRecords("fam-1")).resolves.toEqual([{ id: "imovel-1" }]);

    const found = propertyDb({ propertyLimitQueue: [[{ id: "imovel-1" }]] });
    databaseMocks.requireDatabase.mockResolvedValue(found.db);
    await expect(getPropertyRecord("imovel-1")).resolves.toEqual({ id: "imovel-1" });

    const missing = propertyDb({ propertyLimitQueue: [[]] });
    databaseMocks.requireDatabase.mockResolvedValue(missing.db);
    await expect(getPropertyRecord("imovel-x")).resolves.toBeNull();
  });

  it("lista os titulares do imóvel", async () => {
    const { db } = propertyDb({ ownerRows: [owner("p1", "100.00")] });
    databaseMocks.requireDatabase.mockResolvedValue(db);
    await expect(listPropertyOwners("imovel-1")).resolves.toHaveLength(1);
  });
});

describe("property-repository — atualização e remoção de titularidades", () => {
  beforeEach(() => vi.clearAllMocks());

  it("atualiza mantendo os campos não informados", async () => {
    const { db, setValues } = propertyDb({
      currentOwnerRows: [owner("p1", "40.00")],
      ownerRows: [owner("p1", "40.00")],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await updatePropertyOwnerRecord({ propertyId: "imovel-1", ownerId: "own-p1" } as never);
    expect(setValues.mock.calls[0][0]).toEqual({
      personId: "p1",
      companyId: null,
      ownershipPercentage: "40.00",
      rightType: "PROPRIEDADE",
    });

    await updatePropertyOwnerRecord({
      propertyId: "imovel-1",
      ownerId: "own-p1",
      personId: "p2",
      ownershipPercentage: 25,
      rightType: "USUFRUTO",
    } as never);
    expect(setValues.mock.calls[1][0]).toEqual({
      personId: "p2",
      companyId: null,
      ownershipPercentage: "25.00",
      rightType: "USUFRUTO",
    });
  });

  it("falha quando a titularidade não existe ou é de outro imóvel", async () => {
    const missing = propertyDb({ currentOwnerRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(missing.db);
    await expect(
      updatePropertyOwnerRecord({ propertyId: "imovel-1", ownerId: "sumido" } as never)
    ).rejects.toThrow("Titularidade não encontrada.");

    const otherProperty = propertyDb({
      currentOwnerRows: [{ ...owner("p1", "10.00"), propertyId: "imovel-2" }],
    });
    databaseMocks.requireDatabase.mockResolvedValue(otherProperty.db);
    await expect(
      updatePropertyOwnerRecord({ propertyId: "imovel-1", ownerId: "own-p1" } as never)
    ).rejects.toThrow("Titularidade não encontrada.");
  });

  it("bloqueia membro já vinculado e soma acima de 100%", async () => {
    const duplicate = propertyDb({
      currentOwnerRows: [owner("p1", "10.00")],
      ownerRows: [owner("p1", "10.00"), owner("p2", "10.00")],
    });
    databaseMocks.requireDatabase.mockResolvedValue(duplicate.db);
    await expect(
      updatePropertyOwnerRecord({
        propertyId: "imovel-1",
        ownerId: "own-p1",
        personId: "p2",
      } as never)
    ).rejects.toThrow("Este membro já está vinculado a este imóvel.");

    const overflow = propertyDb({
      currentOwnerRows: [owner("p1", "40.00")],
      ownerRows: [owner("p1", "40.00"), owner("p2", "55.00")],
    });
    databaseMocks.requireDatabase.mockResolvedValue(overflow.db);
    await expect(
      updatePropertyOwnerRecord({
        propertyId: "imovel-1",
        ownerId: "own-p1",
        ownershipPercentage: 50,
      } as never)
    ).rejects.toThrow("soma das titularidades não pode passar de 100%");
  });

  it("rejeita atualização que deixa a titularidade sem dono ou com dois donos", async () => {
    const none = propertyDb({
      currentOwnerRows: [owner("p1", "10.00")],
      ownerRows: [owner("p1", "10.00")],
    });
    databaseMocks.requireDatabase.mockResolvedValue(none.db);
    await expect(
      updatePropertyOwnerRecord({
        propertyId: "imovel-1",
        ownerId: "own-p1",
        personId: "",
      } as never)
    ).rejects.toThrow("exatamente um dono");

    const two = propertyDb({
      currentOwnerRows: [owner("p1", "10.00")],
      ownerRows: [owner("p1", "10.00")],
    });
    databaseMocks.requireDatabase.mockResolvedValue(two.db);
    await expect(
      updatePropertyOwnerRecord({
        propertyId: "imovel-1",
        ownerId: "own-p1",
        personId: "p1",
        companyId: "hold-1",
      } as never)
    ).rejects.toThrow("exatamente um dono");
  });

  it("remove a titularidade ou falha quando não confere com o imóvel", async () => {
    const ok = propertyDb({ removedRows: [{ id: "own-p1", propertyId: "imovel-1" }] });
    databaseMocks.requireDatabase.mockResolvedValue(ok.db);
    await expect(
      removePropertyOwnerRecord({ propertyId: "imovel-1", ownerId: "own-p1" } as never)
    ).resolves.toBe("own-p1");

    const missing = propertyDb({ removedRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(missing.db);
    await expect(
      removePropertyOwnerRecord({ propertyId: "imovel-1", ownerId: "sumido" } as never)
    ).rejects.toThrow("Titularidade não encontrada.");

    const otherProperty = propertyDb({
      removedRows: [{ id: "own-p1", propertyId: "imovel-2" }],
    });
    databaseMocks.requireDatabase.mockResolvedValue(otherProperty.db);
    await expect(
      removePropertyOwnerRecord({ propertyId: "imovel-1", ownerId: "own-p1" } as never)
    ).rejects.toThrow("Titularidade não encontrada.");
  });

  it("rejeita a mesma sociedade vinculada duas vezes ao imóvel", async () => {
    const { db, insertValues } = mockDb([]);
    // ownerRows do mockDb é usado como existing — simular row de empresa
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          {
            id: "own-hold",
            propertyId: "imovel-1",
            personId: null,
            companyId: "hold-1",
            ownershipPercentage: "40.00",
            rightType: "PROPRIEDADE",
          },
        ]),
        limit: vi.fn().mockResolvedValue([]),
      }),
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      addPropertyOwnerRecord({
        propertyId: "imovel-1",
        companyId: "hold-1",
        ownershipPercentage: 10,
        rightType: "PROPRIEDADE",
      } as never)
    ).rejects.toThrow("já está vinculado");
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("aceita titular sociedade quando não há duplicidade", async () => {
    const { db, insertValues } = mockDb([]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await addPropertyOwnerRecord({
      propertyId: "imovel-1",
      companyId: "hold-1",
      ownershipPercentage: 100,
      rightType: "PROPRIEDADE",
    } as never);
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ companyId: "hold-1", personId: null })
    );
  });
});

describe("property-repository — edição e exclusão do imóvel", () => {
  beforeEach(() => vi.clearAllMocks());

  it("atualiza os campos do imóvel e falha quando não existe", async () => {
    const found = propertyDb({ propertyLimitQueue: [[{ id: "imovel-1" }]] });
    const setValues = found.setValues;
    databaseMocks.requireDatabase.mockResolvedValue(found.db);

    await expect(
      updatePropertyRecord({
        propertyId: "imovel-1",
        description: "Casa Editada",
        propertyCity: "São Paulo",
        hasRegistration: true,
        hasLaudemio: false,
        utility: "PENDENTE",
        encumbranceType: "PENDENTE",
        declaredValue: 250000,
        kind: "URBANO",
        inscricaoImobiliaria: "12345",
        registryOfficeNumber: 12,
        registryUf: "SP",
        itbiRate: 3,
        rentValue: undefined,
      } as never)
    ).resolves.toEqual({ propertyId: "imovel-1" });
    expect(setValues).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Casa Editada",
        irpfBalanceValue: "250000.00",
        kind: "URBANO",
        inscricaoImobiliaria: "12345",
        registryOfficeNumber: 12,
        registryUf: "SP",
        itbiRate: "3.00",
        laudemioRate: null,
        rentValue: null,
      })
    );

    const missing = propertyDb({ propertyLimitQueue: [[]] });
    databaseMocks.requireDatabase.mockResolvedValue(missing.db);
    await expect(
      updatePropertyRecord({
        propertyId: "sumido",
        description: "X",
        propertyCity: "Y",
        hasRegistration: true,
        hasLaudemio: false,
        utility: "PENDENTE",
        encumbranceType: "PENDENTE",
      } as never)
    ).rejects.toThrow("Imóvel não encontrado.");
  });

  it("bloqueia exclusão enquanto houver titularidade", async () => {
    const { db } = propertyDb({
      propertyLimitQueue: [[{ id: "imovel-1", familyId: "fam-1" }]],
      currentOwnerRows: [owner("p1", "100.00")],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      removePropertyRecord("fam-1", "imovel-1")
    ).rejects.toThrow("titularidades");
  });

  it("sem titularidade: arquiva documentos e exclui o imóvel", async () => {
    const docs = propertyDb({
      propertyLimitQueue: [[{ id: "imovel-1", familyId: "fam-1" }]],
      currentOwnerRows: [],
      documentRows: [{ id: "doc-1" }, { id: "doc-2" }],
    });
    databaseMocks.requireDatabase.mockResolvedValue(docs.db);

    await expect(
      removePropertyRecord("fam-1", "imovel-1")
    ).resolves.toEqual({ archivedDocuments: 2 });
    expect(docs.remove).toHaveBeenCalled();
    expect(docs.setValues).toHaveBeenCalledWith({ status: "DISPENSADO" });
  });

  it("falha ao excluir imóvel de outra família ou inexistente", async () => {
    const missing = propertyDb({ propertyLimitQueue: [[]] });
    databaseMocks.requireDatabase.mockResolvedValue(missing.db);
    await expect(
      removePropertyRecord("fam-1", "sumido")
    ).rejects.toThrow("Imóvel não encontrado nesta família.");
  });
});

