import { describe, expect, it } from "vitest";
import {
  buildProcessTimeline,
  type ProcessTimelineInput,
} from "./family-timeline";

const base: ProcessTimelineInput = {
  family: { id: "fam-1", createdAt: "2026-01-01T10:00:00.000Z" },
  lead: {
    id: "lead-1",
    status: "ACEITO",
    createdAt: "2025-12-20T10:00:00.000Z",
    reviewedAt: "2025-12-21T10:00:00.000Z",
  },
  people: { total: 3, hasTitular: true },
  patrimony: { properties: 2, companies: 1, assets: 0 },
  documents: { total: 10, resolved: 4 },
  lwr: { versions: 1 },
  proposal: {
    id: "prop-1",
    status: "ENVIADA",
    createdAt: "2026-02-01T10:00:00.000Z",
  },
  access: { hasClientAccess: false, activePortalLinks: 1 },
};

describe("buildProcessTimeline", () => {
  it("monta as 8 etapas do interesse ao portal em ordem", () => {
    const timeline = buildProcessTimeline(base);
    expect(timeline.stages.map(s => s.id)).toEqual([
      "interesse",
      "abertura",
      "familia",
      "patrimonio",
      "documentos",
      "lwr",
      "proposta",
      "portal",
    ]);
  });

  it("marca etapas concluídas e aponta a etapa atual corretamente", () => {
    const timeline = buildProcessTimeline(base);
    const byId = Object.fromEntries(timeline.stages.map(s => [s.id, s]));

    expect(byId.interesse?.status).toBe("CONCLUIDO");
    expect(byId.abertura?.status).toBe("CONCLUIDO");
    expect(byId.familia?.status).toBe("CONCLUIDO");
    expect(byId.patrimonio?.status).toBe("EM_ANDAMENTO");
    expect(byId.documentos?.status).toBe("EM_ANDAMENTO");
    expect(byId.lwr?.status).toBe("CONCLUIDO");
    expect(byId.proposta?.status).toBe("EM_ANDAMENTO");
    expect(byId.portal?.status).toBe("EM_ANDAMENTO");

    expect(timeline.currentStageId).toBe("patrimonio");
    expect(timeline.overallPercent).toBeGreaterThan(0);
    expect(timeline.overallPercent).toBeLessThan(100);
  });

  it("lead pendente deixa a etapa interesse em andamento", () => {
    const timeline = buildProcessTimeline({
      ...base,
      lead: {
        id: "lead-2",
        status: "PENDENTE",
        createdAt: "2025-12-20T10:00:00.000Z",
      },
      people: { total: 0, hasTitular: false },
      patrimony: { properties: 0, companies: 0, assets: 0 },
      documents: { total: 0, resolved: 0 },
      lwr: { versions: 0 },
      proposal: null,
      access: { hasClientAccess: false, activePortalLinks: 0 },
    });

    const byId = Object.fromEntries(timeline.stages.map(s => [s.id, s]));
    expect(byId.interesse?.status).toBe("EM_ANDAMENTO");
    expect(byId.familia?.status).toBe("PENDENTE");
    expect(byId.patrimonio?.status).toBe("PENDENTE");
    expect(byId.documentos?.status).toBe("PENDENTE");
    expect(byId.lwr?.status).toBe("PENDENTE");
    expect(byId.proposta?.status).toBe("PENDENTE");
    expect(byId.portal?.status).toBe("PENDENTE");
    expect(timeline.currentStageId).toBe("interesse");
    expect(timeline.overallPercent).toBeLessThan(50);
  });

  it("sem lead público, interesse conta como abertura direta da equipe", () => {
    const timeline = buildProcessTimeline({
      ...base,
      lead: null,
      proposal: null,
      documents: { total: 5, resolved: 5 },
      access: { hasClientAccess: true, activePortalLinks: 0 },
    });

    const byId = Object.fromEntries(timeline.stages.map(s => [s.id, s]));
    expect(byId.interesse?.status).toBe("CONCLUIDO");
    expect(byId.interesse?.detail).toContain("criação direta");
    expect(byId.documentos?.status).toBe("CONCLUIDO");
    expect(byId.portal?.status).toBe("CONCLUIDO");
    expect(byId.proposta?.status).toBe("PENDENTE");
    expect(timeline.currentStageId).toBe("patrimonio");
  });

  it("proposta aceita e lead recusado refletem status bloqueado/concluído", () => {
    const accepted = buildProcessTimeline({
      ...base,
      proposal: {
        id: "prop-2",
        status: "ACEITA",
        createdAt: "2026-02-01T10:00:00.000Z",
        acceptedAt: "2026-02-10T10:00:00.000Z",
      },
      access: { hasClientAccess: true, activePortalLinks: 0 },
      documents: { total: 10, resolved: 10 },
      patrimony: { properties: 0, companies: 0, assets: 0 },
    });
    const acceptedById = Object.fromEntries(
      accepted.stages.map(s => [s.id, s])
    );
    expect(acceptedById.proposta?.status).toBe("CONCLUIDO");
    expect(acceptedById.portal?.status).toBe("CONCLUIDO");

    const rejected = buildProcessTimeline({
      ...base,
      lead: {
        id: "lead-3",
        status: "RECUSADO",
        createdAt: "2025-12-20T10:00:00.000Z",
        reviewedAt: "2025-12-22T10:00:00.000Z",
      },
    });
    const rejectedById = Object.fromEntries(
      rejected.stages.map(s => [s.id, s])
    );
    expect(rejectedById.interesse?.status).toBe("BLOQUEADO");
  });
});
