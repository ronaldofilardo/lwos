import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";

const mobileNavMocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useLocation: vi.fn(),
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: mobileNavMocks.useAuth,
}));
vi.mock("wouter", () => ({
  useLocation: mobileNavMocks.useLocation,
}));

import { renderToStaticMarkup } from "react-dom/server";
import { MobileNavSheet } from "./MobileNavSheet";

function renderMobileNav(role: string, pathname: string) {
  mobileNavMocks.useAuth.mockReturnValue({
    user: { name: "Usuário de teste", role },
    logout: vi.fn(),
  });
  mobileNavMocks.useLocation.mockReturnValue([pathname, vi.fn()]);
  return renderToStaticMarkup(
    createElement(MobileNavSheet, { user: { name: "Usuário de teste", role } })
  );
}

describe("MobileNavSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza o botão trigger do menu hambúrguer", () => {
    const markup = renderMobileNav("SOCIO", "/");
    expect(markup).toContain("Abrir menu");
    expect(markup).toContain("lg:hidden");
  });

  it("não renderiza conteúdo da gaveta quando fechada", () => {
    const markup = renderMobileNav("SOCIO", "/");
    expect(markup).not.toContain("Início");
    expect(markup).not.toContain("Sair");
  });
});
