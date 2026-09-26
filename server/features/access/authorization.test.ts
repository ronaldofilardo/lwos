import { describe, expect, it } from "vitest";
import type { TrpcContext } from "../../_core/context";
import { requireRole } from "./authorization";

function contextWithRole(role: "SOCIO" | "ANALISTA" | "ADMIN" | "CLIENTE"): TrpcContext {
  return { user: { id: 1, name: "Teste", email: "teste@lucathi.com", passwordHash: "x", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("requireRole", () => {
  it("permite SOCIO em ação exclusiva", () => {
    expect(requireRole(contextWithRole("SOCIO"), ["SOCIO"]).role).toBe("SOCIO");
  });

  it("nega CLIENTE em ação exclusiva do SOCIO", () => {
    expect(() => requireRole(contextWithRole("CLIENTE"), ["SOCIO"])).toThrow("Permissão insuficiente");
  });
});
