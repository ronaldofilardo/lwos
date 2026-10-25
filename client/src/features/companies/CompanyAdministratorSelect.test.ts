import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CompanyAdministratorSelect } from "./CompanyAdministratorSelect";

describe("CompanyAdministratorSelect", () => {
  const people = [
    { id: "p1", fullName: "Ana Silva" },
    { id: "p2", fullName: "Bruno Silva" },
  ];

  it("renderiza opções de membros da família e opção de terceiro", () => {
    const markup = renderToStaticMarkup(
      createElement(CompanyAdministratorSelect, {
        label: "1º Administrador/Diretor",
        personIdValue: "",
        thirdPartyNameValue: "",
        people,
        onSelectPerson: vi.fn(),
        onChangeThirdPartyName: vi.fn(),
        onClear: vi.fn(),
      })
    );

    expect(markup).toContain("1º Administrador/Diretor");
    expect(markup).toContain("Não informado");
    expect(markup).toContain("Ana Silva");
    expect(markup).toContain("Bruno Silva");
    expect(markup).toContain("Terceiro (não-membro)");
    // Campo de texto de terceiro não é exibido quando não está selecionado
    expect(markup).not.toContain("Nome completo do terceiro");
  });

  it("exibe campo de texto quando terceiro está selecionado", () => {
    const markup = renderToStaticMarkup(
      createElement(CompanyAdministratorSelect, {
        label: "2º Administrador/Diretor",
        personIdValue: "",
        thirdPartyNameValue: "Carlos Consultor",
        people,
        onSelectPerson: vi.fn(),
        onChangeThirdPartyName: vi.fn(),
        onClear: vi.fn(),
      })
    );

    expect(markup).toContain("Carlos Consultor");
    expect(markup).toContain("Nome completo do terceiro");
  });

  it("seleciona membro da família quando personIdValue está preenchido", () => {
    const markup = renderToStaticMarkup(
      createElement(CompanyAdministratorSelect, {
        label: "1º Director",
        personIdValue: "p1",
        thirdPartyNameValue: "",
        people,
        onSelectPerson: vi.fn(),
        onChangeThirdPartyName: vi.fn(),
        onClear: vi.fn(),
      })
    );

    expect(markup).toContain("1º Director");
    expect(markup).toContain('value="p1" selected=""');
    expect(markup).not.toContain("Nome completo do terceiro");
  });
});
