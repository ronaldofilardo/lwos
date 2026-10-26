import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";

const appShellMocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useLocation: vi.fn(),
  useRoute: vi.fn(),
  birthdayQuery: vi.fn(),
  familyQuery: vi.fn(),
}));

// Fixa "hoje" para 2026-10-19 (segunda-feira) de modo que o aniversário de
// Ana (1990-10-19) caia nesta semana, tornando o teste determinístico
// independentemente da data de execução.
vi.mock("@shared/validation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@shared/validation")>();
  return {
    ...actual,
    hoje: () => "2026-10-19",
  };
});

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: appShellMocks.useAuth,
}));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    birthdays: { list: { useQuery: appShellMocks.birthdayQuery } },
    families: { get: { useQuery: appShellMocks.familyQuery } },
  },
}));
vi.mock("wouter", () => ({
  useLocation: appShellMocks.useLocation,
  useRoute: appShellMocks.useRoute,
}));

import { renderToStaticMarkup } from "react-dom/server";
import { AppShell } from "./AppShell";

function renderAppShell(
  role: string,
  people = [
    { id: "person-1", fullName: "Ana", birthDate: "1990-10-19" },
  ]
) {
  appShellMocks.useAuth.mockReturnValue({
    user: { name: "Usuário de teste", role },
    logout: vi.fn(),
  });
  appShellMocks.birthdayQuery.mockReturnValue({ data: people });
  appShellMocks.familyQuery.mockReturnValue({ data: undefined });
  return renderToStaticMarkup(
    createElement(
      AppShell,
      null,
      createElement("span", null, "Conteúdo de teste")
    )
  );
}

describe("AppShell aniversários", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appShellMocks.useLocation.mockReturnValue(["/", vi.fn()]);
    appShellMocks.useRoute.mockReturnValue([false, {}]);
  });

  it("shows the weekly alert and refreshes birthday data for Sócio", () => {
    const markup = renderAppShell("SOCIO");

    expect(markup).toContain('aria-label="Há aniversariantes esta semana"');
    expect(appShellMocks.birthdayQuery).toHaveBeenCalledWith(undefined, {
      enabled: true,
      refetchInterval: 60 * 60 * 1000,
    });
  });

  it("hides the weekly alert when no one has a birthday this week", () => {
    expect(renderAppShell("SOCIO", [])).not.toContain(
      'aria-label="Há aniversariantes esta semana"'
    );
  });

  it.each(["ADMIN", "ANALISTA", "CLIENTE"])(
    "does not query or show the alert for %s",
    role => {
      const markup = renderAppShell(role);

      expect(markup).not.toContain(
        'aria-label="Há aniversariantes esta semana"'
      );
      expect(markup).not.toContain("Aniversários");
      expect(appShellMocks.birthdayQuery).toHaveBeenCalledWith(undefined, {
        enabled: false,
        refetchInterval: 60 * 60 * 1000,
      });
    }
  );
});
