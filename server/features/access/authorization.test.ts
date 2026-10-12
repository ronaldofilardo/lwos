import { describe, expect, it } from "vitest";
import type { TrpcContext } from "../../_core/context";
import { requireRole, requirePermission } from "./authorization";
import { Permission } from "../../../shared/domain/permissions";

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

describe("requirePermission", () => {
  it("permite SOCIO com permissão de revisão de documento", () => {
    expect(requirePermission(contextWithRole("SOCIO"), Permission.DOCUMENT_REVIEW).role).toBe("SOCIO");
  });

  it("nega ANALISTA em permissão exclusiva de SOCIO", () => {
    expect(() => requirePermission(contextWithRole("ANALISTA"), Permission.DOCUMENT_REVIEW)).toThrow("Permissão insuficiente");
  });

  it("permite ANALISTA em permissão de team operations", () => {
    expect(requirePermission(contextWithRole("ANALISTA"), Permission.PEOPLE_CREATE).role).toBe("ANALISTA");
  });

  it("nega CLIENTE em qualquer permissão de escrita", () => {
    expect(() => requirePermission(contextWithRole("CLIENTE"), Permission.PEOPLE_CREATE)).toThrow("Permissão insuficiente");
  });

  it("permite ADMIN em permissões administrativas", () => {
    expect(requirePermission(contextWithRole("ADMIN"), Permission.AUDIT_LIST_BY_FAMILY).role).toBe("ADMIN");
    expect(requirePermission(contextWithRole("ADMIN"), Permission.FAMILY_GET_DASHBOARD).role).toBe("ADMIN");
  });

  it("nega ADMIN em permissões exclusivas de SOCIO", () => {
    expect(() => requirePermission(contextWithRole("ADMIN"), Permission.FAMILY_GRANT_CLIENT_ACCESS)).toThrow("Permissão insuficiente");
  });
});
