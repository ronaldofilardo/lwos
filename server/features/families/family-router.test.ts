/**
 * @description Cobre o familyRouter: listagem por papel (equipe x cliente), criação com
 * auditoria tolerante a falha, concessão de acesso e geração de links de primeiro acesso
 * e de redefinição de senha (com as três validações de titular).
 * @see server/features/families/family-router.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const familyRepoMocks = vi.hoisted(() => ({
  createFamilyRecord: vi.fn(),
  getFamilyRecord: vi.fn(),
  listFamilyRecords: vi.fn(),
  getDashboardData: vi.fn(),
  listStorageFiles: vi.fn(),
  getClientDashboardData: vi.fn(),
  listClientStorageFiles: vi.fn(),
}));
const timelineMocks = vi.hoisted(() => ({ getFamilyTimelineRecord: vi.fn() }));
const auditMocks = vi.hoisted(() => ({ recordAudit: vi.fn() }));
const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
const idsMocks = vi.hoisted(() => ({ createId: vi.fn() }));
const peopleMocks = vi.hoisted(() => ({ getPrimaryContact: vi.fn() }));

vi.mock("./family-repository", () => familyRepoMocks);
vi.mock("./family-timeline-repository", () => timelineMocks);
vi.mock("../audit/audit-repository", () => auditMocks);
vi.mock("../_shared/database", () => databaseMocks);
vi.mock("../_shared/ids", () => idsMocks);
vi.mock("../people/person-repository", () => peopleMocks);

import { familyRouter } from "./family-router";

const family = { id: "fam-1", name: "Família Silva" };
const titular = { id: "p-1", fullName: "Ana Silva", taxId: "11122233344" };

function caller(role = "SOCIO") {
  return familyRouter.createCaller({
    req: { ip: "1.1.1.1" } as never,
    res: {} as never,
    user: { id: 7, role },
  } as never);
}

function fakeDb(options?: { accessRows?: unknown[]; existingAccess?: unknown[] }) {
  const accessRows = options?.accessRows ?? [];
  const existingAccess = options?.existingAccess ?? [];
  const onConflictDoNothing = vi.fn().mockResolvedValue(undefined);
  const values = vi.fn().mockReturnValue({ onConflictDoNothing });
  const insert = vi.fn().mockReturnValue({ values });
  const limit = vi.fn().mockResolvedValue(existingAccess);
  const where = vi.fn().mockReturnValue({
    limit,
    then: (resolve: (value: unknown) => unknown) => resolve(accessRows),
  });
  const from = vi.fn().mockReturnValue({ where });
  const select = vi.fn().mockReturnValue({ from });
  return { db: { select, insert }, values, onConflictDoNothing };
}

describe("family-router consultas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    idsMocks.createId.mockReturnValue("id-1");
    familyRepoMocks.listFamilyRecords.mockResolvedValue([family]);
    familyRepoMocks.getFamilyRecord.mockResolvedValue(family);
    familyRepoMocks.getDashboardData.mockResolvedValue({ families: 3 });
    familyRepoMocks.listStorageFiles.mockResolvedValue(["doc.pdf"]);
    familyRepoMocks.getClientDashboardData.mockResolvedValue({ families: 1 });
    familyRepoMocks.listClientStorageFiles.mockResolvedValue(["meu.pdf"]);
    timelineMocks.getFamilyTimelineRecord.mockResolvedValue({ events: [] });
    databaseMocks.requireDatabase.mockResolvedValue(fakeDb().db);
  });

  it("lista todas as famílias para a equipe", async () => {
    await expect(caller("SOCIO").list()).resolves.toEqual([family]);
    expect(familyRepoMocks.listFamilyRecords).toHaveBeenCalled();
    expect(databaseMocks.requireDatabase).not.toHaveBeenCalled();
  });

  it("lista apenas as famílias com vínculo para o cliente e descarta as inexistentes", async () => {
    const { db } = fakeDb({ accessRows: [{ familyId: "fam-1" }, { familyId: "fam-sumida" }] });
    databaseMocks.requireDatabase.mockResolvedValue(db);
    familyRepoMocks.getFamilyRecord.mockResolvedValueOnce(family).mockResolvedValueOnce(null);

    await expect(caller("CLIENTE").list()).resolves.toEqual([family]);
    expect(familyRepoMocks.getFamilyRecord).toHaveBeenCalledWith("fam-1");
    expect(familyRepoMocks.getFamilyRecord).toHaveBeenCalledWith("fam-sumida");
  });

  it("lê família e timeline com verificação de acesso", async () => {
    await expect(caller().get({ familyId: "fam-1" })).resolves.toEqual(family);
    await expect(caller().timeline({ familyId: "fam-1" })).resolves.toEqual({ events: [] });
    expect(timelineMocks.getFamilyTimelineRecord).toHaveBeenCalledWith("fam-1");
  });

  it("nega o cliente sem vínculo na família", async () => {
    const { db } = fakeDb({ accessRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(caller("CLIENTE").get({ familyId: "fam-2" })).rejects.toThrow(
      "Acesso à família não autorizado."
    );
    expect(familyRepoMocks.getFamilyRecord).not.toHaveBeenCalled();
  });

  it("exige autenticação", async () => {
    const anon = familyRouter.createCaller({
      req: {} as never,
      res: {} as never,
      user: null,
    } as never);
    await expect(anon.list()).rejects.toThrow();
  });

  it("expõe painel e arquivos conforme o papel", async () => {
    await expect(caller("CLIENTE").getDashboard()).resolves.toEqual({ families: 1 });
    expect(familyRepoMocks.getClientDashboardData).toHaveBeenCalledWith(7);

    await expect(caller("SOCIO").getDashboard()).resolves.toEqual({ families: 3 });
    await expect(caller("ADMIN").getDashboard()).resolves.toEqual({ families: 3 });
    await expect(caller("CLIENTE").listStorage()).resolves.toEqual(["meu.pdf"]);
    expect(familyRepoMocks.listClientStorageFiles).toHaveBeenCalledWith(7);
    await expect(caller("SOCIO").listStorage()).resolves.toEqual(["doc.pdf"]);
    expect(familyRepoMocks.listStorageFiles).toHaveBeenCalled();
  });

  it("bloqueia analista no painel e no armazenamento", async () => {
    await expect(caller("ANALISTA").getDashboard()).rejects.toThrow("Permissão insuficiente.");
    await expect(caller("ANALISTA").listStorage()).rejects.toThrow("Permissão insuficiente.");
    expect(familyRepoMocks.getDashboardData).not.toHaveBeenCalled();
    expect(familyRepoMocks.listStorageFiles).not.toHaveBeenCalled();
  });
});

describe("family-router criação e acesso do cliente", () => {
  const input = {
    name: "Família Nova",
    civilStatus: "CASADO",
    maritalRegime: "CPB",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    idsMocks.createId.mockReturnValue("id-1");
    familyRepoMocks.createFamilyRecord.mockResolvedValue({ familyId: "fam-9" });
    auditMocks.recordAudit.mockResolvedValue(undefined);
    databaseMocks.requireDatabase.mockResolvedValue(fakeDb().db);
  });

  it("cria a família e audita", async () => {
    await expect(caller().create(input as never)).resolves.toEqual({ familyId: "fam-9" });
    expect(familyRepoMocks.createFamilyRecord).toHaveBeenCalledWith(input, 7);
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "FAMILIA_CRIADA",
        entityType: "FAMILIA",
        entityId: "fam-9",
        actorUserId: 7,
      })
    );
  });

  it("mantém a criação mesmo quando a auditoria falha", async () => {
    auditMocks.recordAudit.mockRejectedValue(new Error("audit down"));
    await expect(caller().create(input as never)).resolves.toEqual({ familyId: "fam-9" });
  });

  it("não deixa cliente criar família", async () => {
    await expect(caller("CLIENTE").create(input as never)).rejects.toThrow(
      "Permissão insuficiente."
    );
    expect(familyRepoMocks.createFamilyRecord).not.toHaveBeenCalled();
  });

  it("concede acesso ao cliente com upsert idempotente e auditoria tolerante a falha", async () => {
    const { onConflictDoNothing } = fakeDb();
    const db = { ...fakeDb().db, insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ onConflictDoNothing }) }) };
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      caller().grantClientAccess({ familyId: "fam-1", userId: 42 })
    ).resolves.toEqual({ success: true });
    expect(onConflictDoNothing).toHaveBeenCalled();
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "ACESSO_CLIENTE_CONCEDIDO" })
    );

    auditMocks.recordAudit.mockRejectedValue(new Error("audit down"));
    await expect(
      caller().grantClientAccess({ familyId: "fam-1", userId: 42 })
    ).resolves.toEqual({ success: true });
  });

  it("exige sócio para conceder acesso", async () => {
    await expect(
      caller("ANALISTA").grantClientAccess({ familyId: "fam-1", userId: 42 })
    ).rejects.toThrow("Permissão insuficiente.");
    expect(auditMocks.recordAudit).not.toHaveBeenCalled();
  });
});

describe("family-router links de acesso", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    idsMocks.createId.mockReturnValue("link-1");
    auditMocks.recordAudit.mockResolvedValue(undefined);
    peopleMocks.getPrimaryContact.mockResolvedValue(titular);
  });

  it("recusa primeiro acesso quando já existe vínculo de cliente", async () => {
    const { db } = fakeDb({ existingAccess: [{ id: "acc-1" }] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(caller().generateFirstAccessLink({ familyId: "fam-1" })).rejects.toThrow(
      "Esta família já possui acesso de cliente ativo. Não é necessário gerar um novo link."
    );
    expect(peopleMocks.getPrimaryContact).not.toHaveBeenCalled();
  });

  it("recusa primeiro acesso sem titular ou sem CPF", async () => {
    const { db } = fakeDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);
    peopleMocks.getPrimaryContact.mockResolvedValue(null);
    await expect(caller().generateFirstAccessLink({ familyId: "fam-1" })).rejects.toThrow(
      "Família sem titular. Defina um titular na seção Pessoas antes de gerar o link."
    );

    peopleMocks.getPrimaryContact.mockResolvedValue({ ...titular, taxId: null });
    await expect(caller().generateFirstAccessLink({ familyId: "fam-1" })).rejects.toThrow(
      "Titular sem CPF cadastrado."
    );
  });

  it("gera o link de primeiro acesso com hash do token e auditoria", async () => {
    const { db, values } = fakeDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const result = await caller().generateFirstAccessLink({ familyId: "fam-1" });

    expect(result.fullName).toBe("Ana Silva");
    expect(typeof result.token).toBe("string");
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "link-1",
        familyId: "fam-1",
        personId: "p-1",
        createdBy: "7",
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      })
    );
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "LINK_PRIMEIRO_ACESSO_GERADO" })
    );
  });

  it("mantém o link mesmo quando a auditoria falha", async () => {
    const { db } = fakeDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);
    auditMocks.recordAudit.mockRejectedValue(new Error("audit down"));

    await expect(caller().generateFirstAccessLink({ familyId: "fam-1" })).resolves.toEqual({
      token: expect.any(String),
      fullName: "Ana Silva",
    });
  });

  it("exige sócio para gerar o link de primeiro acesso", async () => {
    await expect(caller("CLIENTE").generateFirstAccessLink({ familyId: "fam-1" })).rejects.toThrow(
      "Permissão insuficiente."
    );
  });

  it("recusa redefinição sem vínculo de cliente ativo", async () => {
    const { db } = fakeDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(caller().generatePasswordResetLink({ familyId: "fam-1" })).rejects.toThrow(
      "Esta família não possui acesso de cliente ativo. Gere um link de primeiro acesso."
    );
    expect(peopleMocks.getPrimaryContact).not.toHaveBeenCalled();
  });

  it("recusa redefinição sem titular ou sem CPF", async () => {
    const { db } = fakeDb({ existingAccess: [{ id: "acc-1" }] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    peopleMocks.getPrimaryContact.mockResolvedValue(null);
    await expect(caller().generatePasswordResetLink({ familyId: "fam-1" })).rejects.toThrow(
      "Família sem titular."
    );

    peopleMocks.getPrimaryContact.mockResolvedValue({ ...titular, taxId: "" });
    await expect(caller().generatePasswordResetLink({ familyId: "fam-1" })).rejects.toThrow(
      "Titular sem CPF cadastrado."
    );
  });

  it("gera o link de redefinição de senha e audita", async () => {
    const { db, values } = fakeDb({ existingAccess: [{ id: "acc-1" }] });
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const result = await caller().generatePasswordResetLink({ familyId: "fam-1" });

    expect(result.fullName).toBe("Ana Silva");
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ personId: "p-1", createdBy: "7" })
    );
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "LINK_REDEFINICAO_SENHA_GERADO" })
    );

    auditMocks.recordAudit.mockRejectedValue(new Error("audit down"));
    await expect(caller().generatePasswordResetLink({ familyId: "fam-1" })).resolves.toEqual({
      token: expect.any(String),
      fullName: "Ana Silva",
    });
  });
});
