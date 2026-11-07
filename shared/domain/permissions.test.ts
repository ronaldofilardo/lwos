import { describe, expect, it } from "vitest";
import { hasPermission, canEdit, canReview, canManage, isTeam, isSocio, isClient, isAdmin, canCreate, Permission } from "./permissions";

describe("matriz de permiss�es", () => {
  it("SOCIO tem todas as permiss�es", () => {
    for (const perm of Object.values(Permission)) {
      expect(hasPermission("SOCIO", perm)).toBe(true);
    }
  });

  it("ANALISTA tem permiss�es de team operations", () => {
    expect(hasPermission("ANALISTA", Permission.PEOPLE_CREATE)).toBe(true);
    expect(hasPermission("ANALISTA", Permission.DOCUMENT_CREATE)).toBe(true);
    expect(hasPermission("ANALISTA", Permission.COMPANY_CREATE)).toBe(true);
  });

  it("ANALISTA N�O tem permiss�es exclusivas de SOCIO", () => {
    expect(hasPermission("ANALISTA", Permission.DOCUMENT_REVIEW)).toBe(false);
    expect(hasPermission("ANALISTA", Permission.DOCUMENT_DISPENSE)).toBe(false);
    expect(hasPermission("ANALISTA", Permission.CERTIDAO_UPDATE_STATUS)).toBe(false);
    expect(hasPermission("ANALISTA", Permission.FAMILY_GRANT_CLIENT_ACCESS)).toBe(false);
    expect(hasPermission("ANALISTA", Permission.USER_LIST)).toBe(false);
  });

  it("ADMIN tem permiss�es de leitura administrativa", () => {
    expect(hasPermission("ADMIN", Permission.AUDIT_LIST_BY_FAMILY)).toBe(true);
    expect(hasPermission("ADMIN", Permission.FAMILY_GET_DASHBOARD)).toBe(false);
    expect(hasPermission("ADMIN", Permission.FAMILY_LIST_STORAGE)).toBe(false);
    expect(hasPermission("ADMIN", Permission.LEAD_LIST)).toBe(false);
  });

  it("ADMIN não tem permissões de team operations", () => {
    expect(hasPermission("ADMIN", Permission.PEOPLE_CREATE)).toBe(false);
    expect(hasPermission("ADMIN", Permission.DOCUMENT_CREATE)).toBe(false);
    expect(hasPermission("ADMIN", Permission.COMPANY_CREATE)).toBe(false);
    expect(hasPermission("ADMIN", Permission.CERTIDAO_GENERATE)).toBe(false);
    expect(hasPermission("ADMIN", Permission.PROPOSAL_CREATE)).toBe(false);
    expect(hasPermission("ADMIN", Permission.LWR_CREATE)).toBe(false);
    expect(hasPermission("ADMIN", Permission.USER_LIST)).toBe(false);
    expect(hasPermission("ADMIN", Permission.PORTAL_LIST_LINKS)).toBe(false);
  });

  it("matriz do ADMIN é só auditoria", () => {
    const adminPerms = Object.values(Permission).filter(perm =>
      hasPermission("ADMIN", perm)
    );
    expect(adminPerms).toEqual([Permission.AUDIT_LIST_BY_FAMILY]);
  });

  it("CLIENTE n�o tem permiss�es de escrita", () => {
    for (const perm of Object.values(Permission)) {
      expect(hasPermission("CLIENTE", perm)).toBe(false);
    }
  });

  it("derivadores de UI", () => {
    expect(canEdit("SOCIO")).toBe(true);
    expect(canEdit("ANALISTA")).toBe(true);
    expect(canEdit("ADMIN")).toBe(false);
    expect(canEdit("CLIENTE")).toBe(false);
    expect(canEdit(null)).toBe(false);

    expect(canReview("SOCIO")).toBe(true);
    expect(canReview("ANALISTA")).toBe(false);
    expect(canReview("ADMIN")).toBe(false);

    expect(canManage("SOCIO")).toBe(true);
    expect(canManage("ANALISTA")).toBe(true);
    expect(canManage("ADMIN")).toBe(false);

    expect(isTeam("SOCIO")).toBe(true);
    expect(isTeam("ANALISTA")).toBe(true);
    expect(isTeam("ADMIN")).toBe(true);
    expect(isTeam("CLIENTE")).toBe(false);

    expect(isSocio("SOCIO")).toBe(true);
    expect(isSocio("ANALISTA")).toBe(false);

    expect(isClient("CLIENTE")).toBe(true);
    expect(isClient("SOCIO")).toBe(false);

    expect(isAdmin("SOCIO")).toBe(true);
    expect(isAdmin("ADMIN")).toBe(true);
    expect(isAdmin("ANALISTA")).toBe(false);

    expect(canCreate("SOCIO")).toBe(true);
    expect(canCreate("ANALISTA")).toBe(true);
    expect(canCreate("ADMIN")).toBe(false);
  });
});
