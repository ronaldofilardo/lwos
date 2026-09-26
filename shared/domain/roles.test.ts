import { describe, expect, it } from "vitest";
import { APP_ROLES, isAppRole } from "./roles";

describe("papéis da Lucathi", () => {
  it("mantém o catálogo obrigatório de quatro papéis", () => {
    expect(APP_ROLES).toEqual(["SOCIO", "ANALISTA", "ADMIN", "CLIENTE"]);
  });

  it("rejeita um papel fora do catálogo", () => {
    expect(isAppRole("GESTOR")).toBe(false);
  });
});
