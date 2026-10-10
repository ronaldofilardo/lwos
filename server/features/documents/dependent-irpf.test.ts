/**
 * @description Cobre a herança do IRPF do titular para dependentes (Fase 8):
 * sincronização de status do IRPF titular → dependentes e bloqueio de upload
 * do IRPF de quem não é o titular.
 * @see server/features/documents/dependent-irpf.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));

vi.mock("../_shared/database", () => databaseMocks);

import { documents, people } from "../../../drizzle/schema";
import {
  assertIrpfUploadAllowed,
  syncDependentIrpfStatus,
} from "./dependent-irpf";

/**
 * Banco fake com fila de respostas por tabela: cada select().from() desempilha
 * a próxima fila (people e documents têm filas independentes).
 */
function fakeDb(options: {
  peopleSelects?: unknown[][];
  documentSelects?: unknown[][];
  updated?: unknown[];
}) {
  const peopleQueue = [...(options.peopleSelects ?? [])];
  const documentQueue = [...(options.documentSelects ?? [])];
  const returning = vi.fn(async () => options.updated ?? []);
  const updateWhere = vi.fn(() => ({ returning }));
  const updateSet = vi.fn(() => ({ where: updateWhere }));
  const update = vi.fn(() => ({ set: updateSet }));
  const select = vi.fn(() => ({
    from: vi.fn((table: unknown) => ({
      where: vi.fn(() => {
        const rows =
          table === documents
            ? (documentQueue.shift() ?? [])
            : (peopleQueue.shift() ?? []);
        const chain = Object.assign(Promise.resolve(rows), {
          limit: vi.fn(() => Promise.resolve(rows)),
        });
        return chain;
      }),
    })),
  }));
  return { db: { select, update }, returning, updateSet };
}

describe("syncDependentIrpfStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna 0 quando a família não tem titular", async () => {
    const { db } = fakeDb({ peopleSelects: [[]] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(syncDependentIrpfStatus("fam-1")).resolves.toBe(0);
    expect(db.update).not.toHaveBeenCalled();
  });

  it("retorna 0 quando o titular não tem IRPF", async () => {
    const { db } = fakeDb({
      peopleSelects: [[{ id: "titular-1" }]],
      documentSelects: [[]],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(syncDependentIrpfStatus("fam-1")).resolves.toBe(0);
    expect(db.update).not.toHaveBeenCalled();
  });

  it("retorna 0 quando a família não tem dependentes marcados", async () => {
    const { db } = fakeDb({
      peopleSelects: [[{ id: "titular-1" }], []],
      documentSelects: [[{ status: "VALIDADO" }]],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(syncDependentIrpfStatus("fam-1")).resolves.toBe(0);
    expect(db.update).not.toHaveBeenCalled();
  });

  it("espelha o status do IRPF titular nos dependentes e retorna a contagem", async () => {
    const { db, updateSet, returning } = fakeDb({
      peopleSelects: [[{ id: "titular-1" }], [{ id: "d1" }, { id: "d2" }]],
      documentSelects: [[{ status: "VALIDADO" }]],
      updated: [{ id: "doc-1" }, { id: "doc-2" }],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(syncDependentIrpfStatus("fam-1")).resolves.toBe(2);
    expect(updateSet).toHaveBeenCalledWith({ status: "VALIDADO" });
    expect(returning).toHaveBeenCalledTimes(1);
  });
});

describe("assertIrpfUploadAllowed", () => {
  beforeEach(() => vi.clearAllMocks());

  it("não consulta pessoas quando o documento não é IRPF de pessoa", async () => {
    const { db } = fakeDb({});
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      assertIrpfUploadAllowed({
        familyId: "fam-1",
        entityType: "IMOVEL",
        entityId: "imovel-1",
        category: "IPTU",
      })
    ).resolves.toBeUndefined();
    expect(db.select).not.toHaveBeenCalled();
  });

  it("permite o IRPF de quem não é dependente", async () => {
    const { db } = fakeDb({
      peopleSelects: [[{ isDependent: false, vinculo: "FILHO" }]],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      assertIrpfUploadAllowed({
        familyId: "fam-1",
        entityType: "PESSOA",
        entityId: "pessoa-1",
        category: "IRPF",
      })
    ).resolves.toBeUndefined();
  });

  it("permite o IRPF do titular mesmo marcado como dependente", async () => {
    const { db } = fakeDb({
      peopleSelects: [[{ isDependent: true, vinculo: "TITULAR" }]],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      assertIrpfUploadAllowed({
        familyId: "fam-1",
        entityType: "PESSOA",
        entityId: "pessoa-1",
        category: "IRPF",
      })
    ).resolves.toBeUndefined();
  });

  it("bloqueia o upload do IRPF de um dependente", async () => {
    const { db } = fakeDb({
      peopleSelects: [[{ isDependent: true, vinculo: "FILHO" }]],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      assertIrpfUploadAllowed({
        familyId: "fam-1",
        entityType: "PESSOA",
        entityId: "pessoa-2",
        category: "IRPF",
      })
    ).rejects.toThrow(
      "O IRPF do dependente herda o IRPF do titular — upload bloqueado."
    );
  });
});
