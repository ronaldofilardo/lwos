import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";

const locationMocks = vi.hoisted(() => ({
  useLocation: vi.fn(),
}));

vi.mock("wouter", () => ({
  useLocation: locationMocks.useLocation,
}));

import { renderToStaticMarkup } from "react-dom/server";
import { WorkspaceTabsNav } from "./WorkspaceTabsNav";

function renderTabsNav(pathname: string) {
  locationMocks.useLocation.mockReturnValue([pathname, vi.fn()]);
  return renderToStaticMarkup(
    createElement(WorkspaceTabsNav, {
      tabs: [
        { value: "due-diligence", content: createElement("div", null, "Conteúdo Due Diligence") },
        { value: "patrimonio", content: createElement("div", null, "Conteúdo Patrimônio") },
      ],
    })
  );
}

describe("WorkspaceTabsNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza as abas com rótulos e ícones", () => {
    const markup = renderTabsNav("/familias/f1");
    expect(markup).toContain("Due Diligence");
    expect(markup).toContain("Documentos e Certidões");
    expect(markup).toContain("Patrimônio");
    expect(markup).toContain("Cálculos");
    expect(markup).toContain("LWR &amp; Proposta Financeira");
    expect(markup).toContain("Portal &amp; Governança");
    expect(markup).toContain("Visão Unificada Completa");
  });

  it("renderiza o conteúdo da aba ativa com o value correspondente", () => {
    const markup = renderTabsNav("/familias/f1");
    expect(markup).toContain("Conteúdo Due Diligence");
  });

  it("oculta o conteúdo de abas inativas (comportamento do Radix Tabs)", () => {
    const markup = renderTabsNav("/familias/f1");
    expect(markup).toContain('hidden=""');
  });

  it("possui rolagem horizontal e sem quebra de linha", () => {
    const markup = renderTabsNav("/familias/f1");
    expect(markup).toContain("overflow-x-auto");
    expect(markup).toContain("whitespace-nowrap");
  });
});
