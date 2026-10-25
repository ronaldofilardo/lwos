/**
 * @description Cobre o repositório de alertas da Fase 9: resumo por projeto
 * (nível por assunto, contagem, gravames pendentes e gate), bloqueio com
 * justificativa e o nível máximo por família para a lista de projetos.
 * @see server/features/alerts/project-alerts-repository.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));

vi.mock("../_shared/database", () => databaseMocks);

import {
  certidoes as certidoesTable,
  companies as companiesTable,
  documents as documentsTable,
  people as peopleTable,
  properties as propertiesTable,
} from "../../../drizzle/schema";
import {
  getConclusionBlockers,
  getProjectAlertSummary,
  listProjectAlertLevels,
} from "./project-alerts-repository";

type TableRows = {
  certidoes?: unknown[];
  properties?: unknown[];
  people?: unknown[];
  companies?: unknown[];
  documents?: unknown[];
};

function fakeDb(rows: TableRows) {
  const select = vi.fn(() => ({
    from: vi.fn((table: unknown) => ({
      where: vi.fn(async () => {
        if (table === certidoesTable) return rows.certidoes ?? [];
        if (table === propertiesTable) return rows.properties ?? [];
        if (table === peopleTable) return rows.people ?? [];
        if (table === companiesTable) return rows.companies ?? [];
        if (table === documentsTable) return rows.documents ?? [];
        return [];
      }),
    })),
  }));
  return { db: { select } };
}

describe("getProjectAlertSummary", () => {
  beforeEach(() => vi.clearAllMocks());

  it("resumo com certidão vermelha, gravame pendente e nomes resolvidos", async () => {
    const { db } = fakeDb({
      certidoes: [
        {
          scope: "PESSOA",
          subjectId: "p1",
          type: "CND_FEDERAL",
          status: "POSITIVA",
          validUntil: null,
        },
        {
          scope: "SOCIEDADE",
          subjectId: "s1",
          type: "CNDT",
          status: "PENDENTE",
          validUntil: null,
        },
      ],
      properties: [
        { id: "im1", description: "Casa de campo", encumbranceType: "PENDENTE" },
        { id: "im2", description: "Apartamento", encumbranceType: "NAO_HA" },
      ],
      people: [{ id: "p1", fullName: "Ana Silva" }],
      companies: [{ id: "s1", legalName: "Holding Costa" }],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const summary = await getProjectAlertSummary("fam-1");
    expect(summary.bySubject).toEqual({
      "PESSOA:p1": "VERMELHO",
      "SOCIEDADE:s1": "AMARELO",
    });
    expect(summary.counts).toEqual({ vermelho: 1, amarelo: 1 });
    expect(summary.pendenteGravames).toEqual([
      { propertyId: "im1", description: "Casa de campo" },
    ]);
    expect(summary.canConclude).toBe(false);
    expect(summary.hardBlockers[0]).toContain("Casa de campo");
    expect(summary.redCertidoes).toEqual(["CND Federal de Ana Silva"]);
    expect(summary.blockers).toHaveLength(2);
  });

  it("resumo liberado quando não há gravame pendente nem certidão vermelha", async () => {
    const { db } = fakeDb({
      certidoes: [
        {
          scope: "PESSOA",
          subjectId: "p1",
          type: "CND_FEDERAL",
          status: "NEGATIVA",
          validUntil: "2027-01-01",
        },
      ],
      properties: [
        { id: "im1", description: "Casa", encumbranceType: "NAO_HA" },
      ],
      people: [{ id: "p1", fullName: "Ana Silva" }],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const summary = await getProjectAlertSummary("fam-1");
    expect(summary.bySubject).toEqual({});
    expect(summary.counts).toEqual({ vermelho: 0, amarelo: 0 });
    expect(summary.canConclude).toBe(true);
    expect(summary.blockers).toEqual([]);
  });
});

describe("getConclusionBlockers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("a justificativa cobre a certidão vermelha, mas não o gravame pendente", async () => {
    const rows: TableRows = {
      certidoes: [
        {
          scope: "PESSOA",
          subjectId: "p1",
          type: "CND_MUNICIPAL",
          status: "SOMENTE_FISICA",
          validUntil: null,
        },
      ],
      properties: [
        { id: "im1", description: "Terreno", encumbranceType: "PENDENTE" },
      ],
      people: [{ id: "p1", fullName: "Ana Silva" }],
    };
    const { db } = fakeDb(rows);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const semJustificativa = await getConclusionBlockers("fam-1");
    expect(semJustificativa).toHaveLength(2);

    const comJustificativa = await getConclusionBlockers("fam-1", "avaliado");
    expect(comJustificativa).toHaveLength(1);
    expect(comJustificativa[0]).toContain("gravame Pendente");
  });
});

describe("listProjectAlertLevels", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reduz ao nível máximo de cada família e respeita lista vazia", async () => {
    const { db } = fakeDb({
      certidoes: [
        {
          familyId: "fam-red",
          scope: "PESSOA",
          subjectId: "p1",
          status: "POSITIVA",
          validUntil: null,
        },
        {
          familyId: "fam-red",
          scope: "PESSOA",
          subjectId: "p2",
          status: "NEGATIVA",
          validUntil: null,
        },
        {
          familyId: "fam-yellow",
          scope: "SOCIEDADE",
          subjectId: "s1",
          status: "PENDENTE",
          validUntil: null,
        },
      ],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(listProjectAlertLevels([])).resolves.toEqual({});

    const levels = await listProjectAlertLevels(["fam-red", "fam-yellow", "fam-none"]);
    expect(levels).toEqual({
      "fam-red": "VERMELHO",
      "fam-yellow": "AMARELO",
      "fam-none": "NENHUM",
    });
  });
});

describe("certidões dispensadas ou \"Não possui\" não geram alerta", () => {
  beforeEach(() => vi.clearAllMocks());

  const certidao = (documentId: string, status: string, subjectId = "p1") => ({
    documentId,
    familyId: "fam-1",
    scope: "PESSOA",
    subjectId,
    type: "CNDT",
    status,
    validUntil: null,
  });

  it("resumo ignora certidão cujo documento foi dispensado ou marcado Não possui", async () => {
    const { db } = fakeDb({
      certidoes: [
        certidao("doc-disp", "PENDENTE", "p1"),
        certidao("doc-np", "POSITIVA", "p2"),
        certidao("doc-pend", "PENDENTE", "p3"),
      ],
      documents: [
        { id: "doc-disp", status: "DISPENSADO" },
        { id: "doc-np", status: "NAO_POSSUI" },
        { id: "doc-pend", status: "PENDENTE" },
      ],
      people: [
        { id: "p1", fullName: "Ana" },
        { id: "p2", fullName: "Bia" },
        { id: "p3", fullName: "Caio" },
      ],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const summary = await getProjectAlertSummary("fam-1");
    expect(summary.bySubject).toEqual({ "PESSOA:p3": "AMARELO" });
    expect(summary.counts).toEqual({ vermelho: 0, amarelo: 1 });
    expect(summary.redCertidoes).toEqual([]);
  });

  it("nível da lista de projetos também ignora certidões resolvidas", async () => {
    const { db } = fakeDb({
      certidoes: [certidao("doc-np", "POSITIVA")],
      documents: [{ id: "doc-np", status: "NAO_POSSUI" }],
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(listProjectAlertLevels(["fam-1"])).resolves.toEqual({
      "fam-1": "NENHUM",
    });
  });
});
