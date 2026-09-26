/**
 * @description Dispensa automática da cópia do cônjuge quando o titular
 * apresenta um documento do casal (certidão de casamento / comprovante).
 * @see server/features/documents/couple-docs.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
vi.mock("../_shared/database", () => databaseMocks);

import { releaseSpouseCoupleDocs } from "./couple-docs";

function dbWithSpouse(spouseId: string | null) {
  const limitSelect = vi
    .fn()
    .mockResolvedValue(spouseId ? [{ id: spouseId }] : []);
  const whereSelect = vi.fn().mockReturnValue({ limit: limitSelect });
  const fromSelect = vi.fn().mockReturnValue({ where: whereSelect });
  const select = vi.fn().mockReturnValue({ from: fromSelect });

  const returning = vi
    .fn()
    .mockResolvedValue(spouseId ? [{ id: "doc-conj" }] : []);
  const whereUpdate = vi.fn().mockReturnValue({ returning });
  const setUpdate = vi.fn().mockReturnValue({ where: whereUpdate });
  const update = vi.fn().mockReturnValue({ set: setUpdate });

  return { select, update, returning, setUpdate };
}

const titularDoc = {
  familyId: "fam-1",
  entityType: "PESSOA",
  entityId: "titular-1",
  category: "Certidão de casamento/UE",
};

describe("releaseSpouseCoupleDocs", () => {
  beforeEach(() => vi.clearAllMocks());

  it("dispensa a cópia pendente do cônjuge quando o titular apresenta documento do casal", async () => {
    const mocks = dbWithSpouse("conjuge-1");
    databaseMocks.requireDatabase.mockResolvedValue(mocks);

    const released = await releaseSpouseCoupleDocs(titularDoc);

    expect(released).toBe(1);
    expect(mocks.update).toHaveBeenCalledTimes(1);
    expect(mocks.setUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "DISPENSADO",
        dispensationApprovedBy: "SISTEMA",
      })
    );
  });

  it("não faz nada quando a categoria não é do casal", async () => {
    const mocks = dbWithSpouse("conjuge-1");
    databaseMocks.requireDatabase.mockResolvedValue(mocks);

    const released = await releaseSpouseCoupleDocs({
      ...titularDoc,
      category: "IRPF",
    });

    expect(released).toBe(0);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("não faz nada quando não há cônjuge na família", async () => {
    const mocks = dbWithSpouse(null);
    databaseMocks.requireDatabase.mockResolvedValue(mocks);

    const released = await releaseSpouseCoupleDocs(titularDoc);

    expect(released).toBe(0);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("ignora documentos que não são de pessoa", async () => {
    const mocks = dbWithSpouse("conjuge-1");
    databaseMocks.requireDatabase.mockResolvedValue(mocks);

    const released = await releaseSpouseCoupleDocs({
      ...titularDoc,
      entityType: "IMOVEL",
    });

    expect(released).toBe(0);
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
