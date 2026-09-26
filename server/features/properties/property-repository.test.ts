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

import {
  addPropertyOwnerRecord,
  removePropertyOwnerRecord,
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
