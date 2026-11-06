import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const dashboardMocks = vi.hoisted(() => ({
  familyQuery: vi.fn(),
  useProjectAlerts: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    families: { get: { useQuery: dashboardMocks.familyQuery } },
  },
}));

vi.mock("@/features/alerts/useProjectAlerts", () => ({
  useProjectAlerts: dashboardMocks.useProjectAlerts,
}));

vi.mock("./ProjectKpiGrid", () => ({
  ProjectKpiGrid: () => createElement("div", null, "MockKpiGrid"),
}));

vi.mock("./ProjectPillarCards", () => ({
  ProjectPillarCards: () => createElement("div", null, "MockPillarCards"),
}));

vi.mock("./ProjectAlertsList", () => ({
  ProjectAlertsList: () => createElement("div", null, "MockAlertsList"),
}));

vi.mock("@/features/families/common/UnifiedRequirementsMap", () => ({
  UnifiedRequirementsMap: () => createElement("div", null, "MockRequirementsMap"),
}));

vi.mock("@/features/families/common/ProcessTimeline", () => ({
  ProcessTimeline: () => createElement("div", null, "MockTimeline"),
}));

import { ProjectHealthDashboard } from "./ProjectHealthDashboard";

describe("ProjectHealthDashboard", () => {
  it("renderiza o cockpit executivo com resumo de status e todas as zonas", () => {
    dashboardMocks.familyQuery.mockReturnValue({
      data: { name: "Família Bragança" },
      isLoading: false,
    });
    dashboardMocks.useProjectAlerts.mockReturnValue({
      counts: { vermelho: 2, amarelo: 1 },
      loading: false,
    });

    const markup = renderToStaticMarkup(
      createElement(ProjectHealthDashboard, { familyId: "fam-1" })
    );

    expect(markup).toContain("Família Bragança");
    expect(markup).toContain("2 alerta(s) crítico(s) exigem atenção imediata");
    expect(markup).toContain("MockKpiGrid");
    expect(markup).toContain("MockPillarCards");
    expect(markup).toContain("MockAlertsList");
    expect(markup).toContain("MockRequirementsMap");
    expect(markup).toContain("MockTimeline");
  });

  it("renderiza mensagem positiva quando o projeto está sem bloqueios", () => {
    dashboardMocks.familyQuery.mockReturnValue({
      data: { name: "Família Oliveira" },
      isLoading: false,
    });
    dashboardMocks.useProjectAlerts.mockReturnValue({
      counts: { vermelho: 0, amarelo: 0 },
      loading: false,
    });

    const markup = renderToStaticMarkup(
      createElement(ProjectHealthDashboard, { familyId: "fam-2" })
    );

    expect(markup).toContain("Família Oliveira");
    expect(markup).toContain("Projeto em ordem — sem bloqueios identificados");
  });
});

