import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";

const roleGateMocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useLocation: vi.fn(),
}));

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: roleGateMocks.useAuth }));
vi.mock("wouter", () => ({ useLocation: roleGateMocks.useLocation }));

import { renderToStaticMarkup } from "react-dom/server";
import type { AppRole } from "@shared/domain/roles";
import { RoleGate } from "./RoleGate";

const ALLOW = ["SOCIO", "ANALISTA"] as readonly AppRole[];

/** Renderiza o gate com um papel fixo (SSR não roda o useEffect do redirect). */
function renderRoleGate(role: AppRole | null, loading = false) {
  roleGateMocks.useAuth.mockReturnValue({
    user: role ? { name: "Teste", role } : null,
    loading,
  });
  roleGateMocks.useLocation.mockReturnValue(["/", vi.fn()]);
  return renderToStaticMarkup(
    createElement(
      RoleGate,
      { allow: ALLOW },
      createElement("span", null, "conteúdo protegido")
    )
  );
}

describe("RoleGate", () => {
  it("renderiza o conteúdo para os papéis liberados", () => {
    expect(renderRoleGate("SOCIO")).toContain("conteúdo protegido");
    expect(renderRoleGate("ANALISTA")).toContain("conteúdo protegido");
  });

  it.each(["ADMIN", "CLIENTE"] as AppRole[])(
    "não renderiza o conteúdo para %s",
    role => {
      expect(renderRoleGate(role)).toBe("");
    }
  );

  it("não renderiza enquanto carrega a sessão", () => {
    expect(renderRoleGate(null, true)).toBe("");
  });

  it("não renderiza sem sessão", () => {
    expect(renderRoleGate(null)).toBe("");
  });
});
