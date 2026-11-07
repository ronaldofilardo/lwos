import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { InstitutionalEmptyState } from "./InstitutionalEmptyState";

describe("InstitutionalEmptyState", () => {
  it("renderiza título, descrição e ícone padrão", () => {
    const markup = renderToStaticMarkup(
      createElement(InstitutionalEmptyState, {
        title: "Nenhum imóvel cadastrado",
        description: "Comece adicionando o primeiro imóvel da família.",
      })
    );
    expect(markup).toContain("Nenhum imóvel cadastrado");
    expect(markup).toContain("Comece adicionando o primeiro imóvel da família.");
  });

  it("renderiza botão de ação quando informado", () => {
    const markup = renderToStaticMarkup(
      createElement(InstitutionalEmptyState, {
        title: "Vazio",
        description: "Sem registros.",
        actionLabel: "Adicionar",
        onAction: () => {},
      })
    );
    expect(markup).toContain("Adicionar");
  });

  it("não renderiza botão quando actionLabel não é fornecido", () => {
    const markup = renderToStaticMarkup(
      createElement(InstitutionalEmptyState, {
        title: "Vazio",
        description: "Sem registros.",
      })
    );
    expect(markup).not.toContain("button");
  });
});
