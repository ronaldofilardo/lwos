/**
 * @description Valida o guard otimista de status do lead: aceite/recusa só
 * persistem quando o lead ainda está PENDENTE (concorrência entre sócios).
 * @see server/features/leads/lead-repository.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
const idMocks = vi.hoisted(() => ({ createId: vi.fn() }));
const storageMocks = vi.hoisted(() => ({ storagePut: vi.fn(), storageGetSignedUrl: vi.fn() }));

vi.mock("../_shared/database", () => databaseMocks);
vi.mock("../_shared/ids", () => idMocks);
vi.mock("../../storage", () => storageMocks);
// A matriz de certidões é coberta no próprio repositório; aqui validamos o
// guard de status do lead, então isola a chamada lateral do aceite.
vi.mock("../certidoes/certidao-repository", () => ({
  ensureCertidoesForSubject: vi.fn().mockResolvedValue(0),
}));

import { acceptLeadRecord, rejectLeadRecord } from "./lead-repository";

const pendingLead = {
  id: "lead-1",
  fullName: "Interessado Teste",
  email: "interessado@email.com",
  taxId: "11122233344",
  birthDate: "1990-01-01",
  status: "PENDENTE",
  familyId: null,
  reviewedBy: null,
};

function mockDb({ lead, guardedRows }: { lead: typeof pendingLead | null; guardedRows: { id: string }[] }) {
  const selectFromWhere = vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue(lead ? [lead] : []) });
  const select = vi.fn().mockReturnValue({ from: vi.fn().mockReturnValue({ where: selectFromWhere }) });
  const updateReturning = vi.fn().mockResolvedValue(guardedRows);
  const updateWhere = vi.fn().mockReturnValue({ returning: updateReturning });
  const update = vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: updateWhere }) });
  const insertValues = vi.fn().mockResolvedValue(undefined);
  const insert = vi.fn().mockReturnValue({ values: insertValues });
  const tx = { select, update, insert };
  const db = {
    transaction: vi.fn(async (operation: (value: typeof tx) => Promise<unknown>) => operation(tx)),
    select,
    update,
    insert,
  };
  return { db, tx, insertValues, updateReturning };
}

const acceptInput = { leadId: "lead-1", familyName: "Família Teste", civilStatus: "CASADO", maritalRegime: "CPB" };

describe("lead-repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    idMocks.createId.mockReturnValue("id-gerado");
  });

  it("aceita o lead quando o guard de status atualiza a linha", async () => {
    const { db, insertValues } = mockDb({ lead: pendingLead, guardedRows: [{ id: "lead-1" }] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const result = await acceptLeadRecord(acceptInput as never, 7);

    expect(result).toEqual({ familyId: "id-gerado", personId: "id-gerado" });
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(insertValues).toHaveBeenCalledTimes(4);
  });

  it("aborta o aceite quando outro sócio processou o lead em paralelo", async () => {
    const { db, insertValues } = mockDb({ lead: pendingLead, guardedRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(acceptLeadRecord(acceptInput as never, 7)).rejects.toThrow("Este interessado já foi analisado.");
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(insertValues).toHaveBeenCalledTimes(4);
  });

  it("recusa aceite quando o lead não está PENDENTE", async () => {
    const { db, insertValues } = mockDb({ lead: { ...pendingLead, status: "ACEITO" }, guardedRows: [{ id: "lead-1" }] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(acceptLeadRecord(acceptInput as never, 7)).rejects.toThrow("Este interessado já foi analisado.");
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("lança erro quando o lead não existe", async () => {
    const { db } = mockDb({ lead: null, guardedRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(acceptLeadRecord(acceptInput as never, 7)).rejects.toThrow("Interessado não encontrado.");
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it("rejeita o lead quando o guard de status atualiza a linha", async () => {
    const { db } = mockDb({ lead: pendingLead, guardedRows: [{ id: "lead-1" }] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(rejectLeadRecord("lead-1", 7, "sem perfil")).resolves.toEqual({
      success: true,
      leadId: "lead-1",
      fullName: "Interessado Teste",
    });
    expect(db.update).toHaveBeenCalledTimes(1);
  });

  it("aborta a recusa quando outro sócio processou o lead em paralelo", async () => {
    const { db } = mockDb({ lead: pendingLead, guardedRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(rejectLeadRecord("lead-1", 7)).rejects.toThrow("Este interessado já foi analisado.");
  });
});
