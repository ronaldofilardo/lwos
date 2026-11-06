import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const pillarMocks = vi.hoisted(() => ({
  peopleQuery: vi.fn(),
  documentsQuery: vi.fn(),
  propertiesQuery: vi.fn(),
  companiesQuery: vi.fn(),
  assetsQuery: vi.fn(),
  useProjectAlerts: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    people: { list: { useQuery: pillarMocks.peopleQuery } },
    documents: { list: { useQuery: pillarMocks.documentsQuery } },
    properties: { list: { useQuery: pillarMocks.propertiesQuery } },
    companies: { list: { useQuery: pillarMocks.companiesQuery } },
    assets: { list: { useQuery: pillarMocks.assetsQuery } },
  },
}));

vi.mock("@/features/alerts/useProjectAlerts", () => ({
  useProjectAlerts: pillarMocks.useProjectAlerts,
}));

import { ProjectPillarCards } from "./ProjectPillarCards";

describe("ProjectPillarCards", () => {
  it("renderiza os pilares de Due Diligence e Patrimônio lado a lado", () => {
    pillarMocks.peopleQuery.mockReturnValue({
      isLoading: false,
      data: [{ id: "1" }],
    });
    pillarMocks.documentsQuery.mockReturnValue({
      isLoading: false,
      data: [
        { id: "d1", status: "VALIDADO" },
        { id: "d2", status: "VALIDADO" },
      ],
    });
    pillarMocks.propertiesQuery.mockReturnValue({
      isLoading: false,
      data: [
        { id: "p1", marketValue: "2000000", utility: "LOCACAO_ARRENDAMENTO" },
      ],
    });
    pillarMocks.companiesQuery.mockReturnValue({
      isLoading: false,
      data: [{ id: "c1", legalName: "Holding Alfa" }],
    });
    pillarMocks.assetsQuery.mockReturnValue({
      isLoading: false,
      data: [{ id: "a1", declaredValue: "100000" }],
    });
    pillarMocks.useProjectAlerts.mockReturnValue({
      counts: { vermelho: 0, amarelo: 0 },
      redCertidoes: [],
    });

    const markup = renderToStaticMarkup(
      createElement(ProjectPillarCards, { familyId: "fam-1" })
    );

    // Pilar Due Diligence
    expect(markup).toContain("Pilar — Due Diligence");
    expect(markup).toContain("Documentos entregues");
    expect(markup).toContain("2 / 2");
    expect(markup).toContain("Certidões em risco");

    // Pilar Patrimônio
    expect(markup).toContain("Pilar — Patrimônio do Projeto");
    expect(markup).toContain("Imóveis");
    expect(markup).toContain("Sociedades / Holdings");
    expect(markup).toContain("Cobertura de holding");
    expect(markup).toContain("Imóveis em locação");
  });
});
