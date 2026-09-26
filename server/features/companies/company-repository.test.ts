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

import { createStakeholderRecord } from "./company-repository";
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
