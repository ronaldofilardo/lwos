import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const alertsMocks = vi.hoisted(() => ({
  useProjectAlerts: vi.fn(),
  calcQuery: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    calculations: { getData: { useQuery: alertsMocks.calcQuery } },
  },
}));

vi.mock("@/features/alerts/useProjectAlerts", () => ({
  useProjectAlerts: alertsMocks.useProjectAlerts,
}));

import { ProjectAlertsList } from "./ProjectAlertsList";

describe("ProjectAlertsList", () => {
  it("renderiza lista acionável de alertas com ações recomendadas", () => {
    alertsMocks.useProjectAlerts.mockReturnValue({
      loading: false,
      redCertidoes: ["Certidão Negativa de Débitos Federais vencida"],
      hardBlockers: ["Certidão Negativa de Débitos Federais vencida"],
      blockers: ["Certidão Estadual pendente de validação"],
      counts: { vermelho: 1, amarelo: 1 },
    });
    alertsMocks.calcQuery.mockReturnValue({
      data: {
        properties: [
          { utility: "LOCACAO_ARRENDAMENTO", rentValue: 30_000 },
        ],
      },
    });

    const markup = renderToStaticMarkup(
      createElement(ProjectAlertsList, { familyId: "fam-1" })
    );

    expect(markup).toContain("Alertas do Projeto");
    expect(markup).toContain("Certidão Negativa de Débitos Federais vencida");
    expect(markup).toContain("Renovar ou justificar em Documentos e Certidões");
    expect(markup).toContain("Certidão Estadual pendente de validação");
    // Alerta de IBS/CBS por receita de locação (30k * 12 = 360k > 288k)
    expect(markup).toContain("Gatilho IBS/CBS atingido");
    expect(markup).toContain("Avaliar holding imobiliária na aba Cálculos");
  });

  it("exibe mensagem positiva quando não há alertas abertos", () => {
    alertsMocks.useProjectAlerts.mockReturnValue({
      loading: false,
      redCertidoes: [],
      hardBlockers: [],
      blockers: [],
      counts: { vermelho: 0, amarelo: 0 },
    });
    alertsMocks.calcQuery.mockReturnValue({ data: null });

    const markup = renderToStaticMarkup(
      createElement(ProjectAlertsList, { familyId: "fam-1" })
    );

    expect(markup).toContain("Nenhum alerta aberto — projeto em ordem");
  });
});

