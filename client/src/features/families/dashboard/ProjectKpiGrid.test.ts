import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const kpiMocks = vi.hoisted(() => ({
  peopleQuery: vi.fn(),
  propertiesQuery: vi.fn(),
  companiesQuery: vi.fn(),
  assetsQuery: vi.fn(),
  documentsQuery: vi.fn(),
  useProjectAlerts: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    people: { list: { useQuery: kpiMocks.peopleQuery } },
    properties: { list: { useQuery: kpiMocks.propertiesQuery } },
    companies: { list: { useQuery: kpiMocks.companiesQuery } },
    assets: { list: { useQuery: kpiMocks.assetsQuery } },
    documents: { list: { useQuery: kpiMocks.documentsQuery } },
  },
}));

vi.mock("@/features/alerts/useProjectAlerts", () => ({
  useProjectAlerts: kpiMocks.useProjectAlerts,
}));

import { ProjectKpiGrid } from "./ProjectKpiGrid";

describe("ProjectKpiGrid", () => {
  it("renderiza os 4 KPIs executivos do projeto com dados agregados", () => {
    kpiMocks.peopleQuery.mockReturnValue({
      isLoading: false,
      data: [{ id: "1" }, { id: "2" }, { id: "3" }],
    });
    kpiMocks.propertiesQuery.mockReturnValue({
      isLoading: false,
      data: [{ id: "prop1", marketValue: "1000000" }],
    });
    kpiMocks.companiesQuery.mockReturnValue({
      isLoading: false,
      data: [{ id: "comp1", propertyValue: 0, capitalSocial: 500000, equity: 500000 }],
    });
    kpiMocks.assetsQuery.mockReturnValue({
      isLoading: false,
      data: [{ id: "asset1", declaredValue: "200000" }],
    });
    kpiMocks.documentsQuery.mockReturnValue({
      isLoading: false,
      data: [
        { id: "d1", status: "VALIDADO" },
        { id: "d2", status: "PENDENTE" },
      ],
    });
    kpiMocks.useProjectAlerts.mockReturnValue({
      counts: { vermelho: 1, amarelo: 2 },
      loading: false,
    });

    const markup = renderToStaticMarkup(
      createElement(ProjectKpiGrid, { familyId: "fam-1" })
    );

    expect(markup).toContain("Membros da família");
    expect(markup).toContain(">3<");
    expect(markup).toContain("Patrimônio total");
    expect(markup).toContain("Documentos");
    expect(markup).toContain("1/2");
    expect(markup).toContain("Alertas abertos");
    expect(markup).toContain("1 🔴");
    expect(markup).toContain("2 🟡");
  });

  it("exibe estado sem alertas quando projeto está regular", () => {
    kpiMocks.peopleQuery.mockReturnValue({ isLoading: false, data: [] });
    kpiMocks.propertiesQuery.mockReturnValue({ isLoading: false, data: [] });
    kpiMocks.companiesQuery.mockReturnValue({ isLoading: false, data: [] });
    kpiMocks.assetsQuery.mockReturnValue({ isLoading: false, data: [] });
    kpiMocks.documentsQuery.mockReturnValue({ isLoading: false, data: [] });
    kpiMocks.useProjectAlerts.mockReturnValue({
      counts: { vermelho: 0, amarelo: 0 },
      loading: false,
    });

    const markup = renderToStaticMarkup(
      createElement(ProjectKpiGrid, { familyId: "fam-1" })
    );

    expect(markup).toContain("Sem alertas");
    expect(markup).toContain("Nenhuma certidão em risco");
  });
});

