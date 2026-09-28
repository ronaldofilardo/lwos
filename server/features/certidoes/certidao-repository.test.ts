/**
 * @description Cobre o repositório de certidões: geração idempotente com vínculo do
 * documento, backfill da família, listagem com nomes/versões e atualização de status.
 * @see server/features/certidoes/certidao-repository.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
const idsMocks = vi.hoisted(() => ({ createId: vi.fn() }));

vi.mock("../_shared/database", () => databaseMocks);
vi.mock("../_shared/ids", () => idsMocks);

import {
  certidoes,
  certidaoTypeValues,
  companies,
  documents,
  people,
} from "../../../drizzle/schema";
import {
  ensureCertidoesForSubject,
  ensureFamilyCertidoes,
  getCertidaoRecord,
  listCertidaoRecords,
  updateCertidaoRecord,
} from "./certidao-repository";

type Config = {
  existingQueue?: string[][];
  certidaoRows?: Record<string, unknown>[];
  peopleRows?: { id: string; name: string }[];
  companyRows?: { id: string; name: string }[];
  documentRows?: { id: string; currentVersion: number; updatedAt: Date }[];
  conflict?: boolean;
};

function certidaoDb(config: Config) {
  let existingIndex = 0;

  const select = vi.fn((projection?: Record<string, unknown>) => ({
    from: vi.fn((table: unknown) => {
      const rows = (): unknown[] => {
        if (table === certidoes) {
          if (projection && "type" in projection) {
            const batch = config.existingQueue ?? [];
            const types = batch[existingIndex++] ?? [];
            return types.map(type => ({ type }));
          }
          return config.certidaoRows ?? [];
        }
        if (table === people) return config.peopleRows ?? [];
        if (table === companies) return config.companyRows ?? [];
        if (table === documents) return config.documentRows ?? [];
        throw new Error("tabela inesperada no repositório de certidões");
      };
      const limit = vi.fn(async () => rows());
      return {
        limit,
        orderBy: vi.fn(() => ({ then: (resolve: (value: unknown) => unknown) => resolve(rows()) })),
        where: vi.fn(() => ({
          limit,
          orderBy: vi.fn(() => ({ then: (resolve: (value: unknown) => unknown) => resolve(rows()) })),
          then: (resolve: (value: unknown) => unknown) => resolve(rows()),
        })),
        then: (resolve: (value: unknown) => unknown) => resolve(rows()),
      };
    }),
  }));

  const returning = vi.fn(async () => (config.conflict ? [] : [{ id: "cert-inserted" }]));
  const certidaoValues = vi.fn(() => ({ onConflictDoNothing: vi.fn(() => ({ returning })) }));
  const documentValues = vi.fn(async () => undefined);
  const insert = vi.fn((table: unknown) =>
    table === certidoes ? { values: certidaoValues } : { values: documentValues }
  );
  const set = vi.fn(() => ({ where: vi.fn(async () => undefined) }));
  const update = vi.fn(() => ({ set }));
  const transaction = vi.fn(async (operation: (tx: unknown) => Promise<void>) => {
    await operation({ insert, update });
  });

  return { db: { select, insert, update, transaction }, certidaoValues, documentValues, set, transaction };
}

describe("ensureCertidoesForSubject", () => {
  beforeEach(() => vi.clearAllMocks());

  it("gera apenas as certidões faltantes e vincula o documento criado", async () => {
    const { db, certidaoValues, documentValues, set } = certidaoDb({
      existingQueue: [certidaoTypeValues.slice(0, 4).map(String)],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idsMocks.createId.mockReturnValue("cert-novo");

    await expect(
      ensureCertidoesForSubject({ familyId: "fam-1", scope: "PESSOA", subjectId: "p-1" })
    ).resolves.toBe(4);

    expect(certidaoValues).toHaveBeenCalledTimes(4);
    expect(certidaoValues.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        familyId: "fam-1",
        scope: "PESSOA",
        subjectId: "p-1",
        status: "PENDENTE",
      })
    );
    expect(documentValues).toHaveBeenCalledTimes(4);
    expect(documentValues.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        entityType: "CERTIDAO",
        entityId: "cert-novo",
        familyId: "fam-1",
        status: "PENDENTE",
      })
    );
    expect(set).toHaveBeenCalledTimes(4);
    expect(set.mock.calls[0][0]).toEqual({ documentId: "cert-novo" });
  });

  it("retorna zero e não transaciona quando o sujeito já tem todas", async () => {
    const { db, transaction } = certidaoDb({ existingQueue: [[...certidaoTypeValues]] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      ensureCertidoesForSubject({ familyId: "fam-1", scope: "SOCIEDADE", subjectId: "s-1" })
    ).resolves.toBe(0);
    expect(transaction).not.toHaveBeenCalled();
  });

  it("ignora registros que perderam a corrida pelo unique", async () => {
    const { db, documentValues, set } = certidaoDb({ existingQueue: [[]], conflict: true });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      ensureCertidoesForSubject({ familyId: "fam-1", scope: "PESSOA", subjectId: "p-2" })
    ).resolves.toBe(certidaoTypeValues.length);

    expect(documentValues).not.toHaveBeenCalled();
    expect(set).not.toHaveBeenCalled();
  });
});

describe("ensureFamilyCertidoes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("varre membros e holdings e soma o que foi criado", async () => {
    const { db, certidaoValues } = certidaoDb({
      existingQueue: [[...certidaoTypeValues], []],
      peopleRows: [{ id: "p-1", name: "Ana" }],
      companyRows: [{ id: "s-1", name: "Holding Alpha" }],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idsMocks.createId.mockReturnValue("cert-novo");

    await expect(ensureFamilyCertidoes("fam-1")).resolves.toBe(certidaoTypeValues.length);
    expect(db.select).toHaveBeenCalledTimes(4);
    expect(certidaoValues).toHaveBeenCalledTimes(certidaoTypeValues.length);
  });

  it("retorna zero para família sem membros nem holdings", async () => {
    const { db, transaction } = certidaoDb({ peopleRows: [], companyRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(ensureFamilyCertidoes("fam-vazia")).resolves.toBe(0);
    expect(transaction).not.toHaveBeenCalled();
  });
});

describe("consulta e atualização de certidões", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lê uma certidão ou devolve null", async () => {
    const found = certidaoDb({ certidaoRows: [{ id: "cert-1", status: "PENDENTE" }] });
    databaseMocks.requireDatabase.mockResolvedValue(found.db);
    await expect(getCertidaoRecord("cert-1")).resolves.toMatchObject({ id: "cert-1" });

    const missing = certidaoDb({ certidaoRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(missing.db);
    await expect(getCertidaoRecord("cert-x")).resolves.toBeNull();
  });

  it("lista vazia quando a família não tem certidões", async () => {
    const { db } = certidaoDb({ certidaoRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(db);
    await expect(listCertidaoRecords("fam-1")).resolves.toEqual([]);
    expect(db.select).toHaveBeenCalledTimes(1);
  });

  it("lista sem documentos anexados pula a consulta de arquivos", async () => {
    const { db } = certidaoDb({
      certidaoRows: [{ id: "cert-1", subjectId: "p-1", documentId: null }],
      peopleRows: [{ id: "p-1", name: "Ana" }],
      companyRows: [],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const rows = await listCertidaoRecords("fam-1");

    expect(rows).toEqual([
      expect.objectContaining({
        id: "cert-1",
        subjectName: "Ana",
        documentCurrentVersion: 0,
        documentUpdatedAt: null,
      }),
    ]);
    expect(db.select).toHaveBeenCalledTimes(3);
  });

  it("combina nomes, versão do documento e fallback para sujeito desconhecido", async () => {
    const updatedAt = new Date("2026-03-01T10:00:00.000Z");
    const { db } = certidaoDb({
      certidaoRows: [
        { id: "cert-1", subjectId: "s-1", documentId: "doc-1" },
        { id: "cert-2", subjectId: "p-sumido", documentId: "doc-sumido" },
        { id: "cert-3", subjectId: null, documentId: null },
      ],
      peopleRows: [{ id: "p-1", name: "Ana" }],
      companyRows: [{ id: "s-1", name: "Holding Alpha" }],
      documentRows: [{ id: "doc-1", currentVersion: 3, updatedAt }],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const rows = await listCertidaoRecords("fam-1");

    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({
      subjectName: "Holding Alpha",
      documentCurrentVersion: 3,
      documentUpdatedAt: updatedAt,
    });
    expect(rows[1]).toMatchObject({
      subjectName: null,
      documentCurrentVersion: 0,
      documentUpdatedAt: null,
    });
    expect(rows[2]).toMatchObject({
      subjectName: null,
      documentCurrentVersion: 0,
      documentUpdatedAt: null,
    });
  });

  it("atualiza apenas o status mantendo o validUntil atual", async () => {
    const { db, set } = certidaoDb({
      certidaoRows: [{ id: "cert-1", status: "PENDENTE", validUntil: "2026-12-31" }],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const current = await updateCertidaoRecord({ certidaoId: "cert-1", status: "VALIDADO" });

    expect(current).toMatchObject({ id: "cert-1", status: "PENDENTE" });
    expect(set.mock.calls[0][0]).toEqual(
      expect.objectContaining({ status: "VALIDADO", validUntil: "2026-12-31" })
    );
  });

  it("normaliza validUntil vazio para null e aceita data nova", async () => {
    const { db, set } = certidaoDb({
      certidaoRows: [{ id: "cert-1", status: "VALIDADO", validUntil: null }],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await updateCertidaoRecord({ certidaoId: "cert-1", validUntil: "" });
    expect(set.mock.calls[0][0]).toEqual(
      expect.objectContaining({ validUntil: null, status: "VALIDADO" })
    );

    await updateCertidaoRecord({
      certidaoId: "cert-1",
      status: "DISPENSADO",
      validUntil: "2030-01-01",
    });
    expect(set.mock.calls[1][0]).toEqual(
      expect.objectContaining({ status: "DISPENSADO", validUntil: "2030-01-01" })
    );
  });

  it("falha quando a certidão não existe", async () => {
    const { db } = certidaoDb({ certidaoRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(updateCertidaoRecord({ certidaoId: "cert-x" })).rejects.toThrow(
      "Certidão não encontrada."
    );
  });
});
