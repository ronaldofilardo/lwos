/**
 * @description Cobre o agregador da timeline da Visão Unificada: uma query por entidade,
 * contagem de documentos resolvidos, ausência de lead/proposta e família inexistente.
 * @see server/features/families/family-timeline-repository.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
vi.mock("../_shared/database", () => databaseMocks);

import {
  companies,
  documents,
  families,
  familyAccess,
  financialProposals,
  leads,
  lwrReports,
  otherAssets,
  people,
  portalLinks,
  properties,
} from "../../../drizzle/schema";
import { getFamilyTimelineRecord } from "./family-timeline-repository";

type Scenario = {
  family?: { id: string; createdAt: string } | null;
  lead?: { id: string; status: string; createdAt: string; updatedAt: string } | null;
  peopleTotal?: number;
  titularCount?: number;
  propertiesTotal?: number;
  companiesTotal?: number;
  assetsTotal?: number;
  documentStatuses?: string[];
  lwrVersions?: number;
  proposal?: { id: string; status: string; createdAt: string; acceptedAt: string | null } | null;
  clientAccessCount?: number;
  activePortalLinks?: number;
};

function timelineDb(scenario: Scenario) {
  let peopleQueries = 0;

  const rowsFor = (table: unknown): unknown[] => {
    if (table === families) return scenario.family ? [scenario.family] : [];
    if (table === leads) return scenario.lead ? [scenario.lead] : [];
    if (table === people) {
      peopleQueries += 1;
      return [
        { total: peopleQueries === 1 ? (scenario.peopleTotal ?? 0) : (scenario.titularCount ?? 0) },
      ];
    }
    if (table === properties) return [{ total: scenario.propertiesTotal ?? 0 }];
    if (table === companies) return [{ total: scenario.companiesTotal ?? 0 }];
    if (table === otherAssets) return [{ total: scenario.assetsTotal ?? 0 }];
    if (table === documents)
      return (scenario.documentStatuses ?? []).map(status => ({ status }));
    if (table === lwrReports) return [{ total: scenario.lwrVersions ?? 0 }];
    if (table === financialProposals) return scenario.proposal ? [scenario.proposal] : [];
    if (table === familyAccess) return [{ total: scenario.clientAccessCount ?? 0 }];
    if (table === portalLinks) return [{ total: scenario.activePortalLinks ?? 0 }];
    throw new Error("tabela inesperada na timeline");
  };

  const select = vi.fn(() => ({
    from: vi.fn((table: unknown) => {
      const rows = rowsFor(table);
      const limit = vi.fn(async () => rows);
      return {
        where: vi.fn(() => ({
          limit,
          orderBy: vi.fn(() => ({ limit })),
          then: (resolve: (value: unknown) => unknown) => resolve(rows),
        })),
        limit,
        then: (resolve: (value: unknown) => unknown) => resolve(rows),
      };
    }),
  }));

  return { db: { select } };
}

const scenario: Scenario = {
  family: { id: "fam-1", createdAt: "2026-01-01T10:00:00.000Z" },
  lead: {
    id: "lead-1",
    status: "ACEITO",
    createdAt: "2025-12-01T10:00:00.000Z",
    updatedAt: "2025-12-05T10:00:00.000Z",
  },
  peopleTotal: 3,
  titularCount: 1,
  propertiesTotal: 2,
  companiesTotal: 1,
  assetsTotal: 4,
  documentStatuses: ["VALIDADO", "PENDENTE", "DISPENSADO", "PENDENTE"],
  lwrVersions: 2,
  proposal: {
    id: "prop-1",
    status: "ACEITA",
    createdAt: "2026-02-01T10:00:00.000Z",
    acceptedAt: "2026-02-10T10:00:00.000Z",
  },
  clientAccessCount: 1,
  activePortalLinks: 3,
};

describe("getFamilyTimelineRecord", () => {
  beforeEach(() => vi.clearAllMocks());

  it("agrega todas as entidades da família em uma única passagem", async () => {
    const { db } = timelineDb(scenario);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const timeline = await getFamilyTimelineRecord("fam-1");

    expect(timeline?.stages).toHaveLength(8);
    expect(timeline?.stages.map(stage => stage.id)).toEqual([
      "interesse",
      "abertura",
      "familia",
      "patrimonio",
      "documentos",
      "lwr",
      "proposta",
      "portal",
    ]);
    expect(db.select).toHaveBeenCalledTimes(12);
    expect(timeline?.overallPercent).toBeGreaterThan(0);
  });

  it("devolve null quando a família não existe", async () => {
    const { db } = timelineDb({ ...scenario, family: null });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(getFamilyTimelineRecord("fam-sumida")).resolves.toBeNull();
    expect(db.select).toHaveBeenCalledTimes(1);
  });

  it("trata ausência de lead e de proposta sem travar o cálculo", async () => {
    const { db } = timelineDb({
      family: { id: "fam-2", createdAt: "2026-01-01T10:00:00.000Z" },
      lead: null,
      proposal: null,
      peopleTotal: 0,
      documentStatuses: ["PENDENTE"],
      clientAccessCount: 0,
      activePortalLinks: 0,
    });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const timeline = await getFamilyTimelineRecord("fam-2");

    expect(timeline?.stages).toHaveLength(8);
    const byId = Object.fromEntries(timeline!.stages.map(stage => [stage.id, stage]));
    expect(byId.familia?.status).toBe("PENDENTE");
    expect(byId.proposta?.status).toBe("PENDENTE");
    expect(byId.portal?.status).toBe("PENDENTE");
  });
});
