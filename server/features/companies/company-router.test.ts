/**
 * @description Cobre todos os procedimentos do companyRouter: consultas, criação de
 * sociedade/participações, detalhes holding e as permissões de equipe em cada mutação.
 * @see server/features/companies/company-router.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const repoMocks = vi.hoisted(() => ({
  createCompanyRecord: vi.fn(),
  createStakeholderRecord: vi.fn(),
  getCompanyRecord: vi.fn(),
  listCompanyRecords: vi.fn(),
  listStakeholderRecords: vi.fn(),
  removeCompanyRecord: vi.fn(),
  removeStakeholderRecord: vi.fn(),
  updateStakeholderRecord: vi.fn(),
}));
const detailsMocks = vi.hoisted(() => ({
  getCompanyDetailsRecord: vi.fn(),
  upsertCompanyDetailsRecord: vi.fn(),
  computePerShare: vi.fn(),
}));
const certidaoMocks = vi.hoisted(() => ({
  ensureCertidoesForSubject: vi.fn(),
  listCertidaoRecords: vi.fn(),
}));
const docRequirementMocks = vi.hoisted(() => ({
  reconcileEntityDocuments: vi.fn(),
  computeCompanyCategories: vi.fn(),
}));
const peopleMocks = vi.hoisted(() => ({ listPeopleByFamily: vi.fn() }));
const auditMocks = vi.hoisted(() => ({ recordAudit: vi.fn() }));
const brasilApiMocks = vi.hoisted(() => ({ fetchCompanyByCnpj: vi.fn() }));
const guardMocks = vi.hoisted(() => ({ assertPersonInFamily: vi.fn() }));

vi.mock("./company-repository", () => repoMocks);
vi.mock("./company-details-repository", () => detailsMocks);
vi.mock("../certidoes/certidao-repository", () => certidaoMocks);
vi.mock("../documents/document-requirements", () => docRequirementMocks);
vi.mock("../people/person-repository", () => peopleMocks);
vi.mock("../audit/audit-repository", () => auditMocks);
vi.mock("./brasilapi-client", () => brasilApiMocks);
vi.mock("../access/entity-guards", () => guardMocks);

import { badRequest } from "../_shared/errors";
import { companyRouter } from "./company-router";

const company = {
  id: "soc-1",
  familyId: "fam-1",
  legalName: "Holding Alpha",
  taxNumber: "11122233344",
  isOffshore: false,
};

function caller(role: string = "SOCIO", ip = "1.1.1.1") {
  return companyRouter.createCaller({
    req: { ip } as never,
    res: {} as never,
    user: { id: 1, role },
  } as never);
}

describe("company-router consultas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repoMocks.getCompanyRecord.mockResolvedValue(company);
    repoMocks.listCompanyRecords.mockResolvedValue([company]);
    repoMocks.listStakeholderRecords.mockResolvedValue([]);
    certidaoMocks.listCertidaoRecords.mockResolvedValue([]);
    peopleMocks.listPeopleByFamily.mockResolvedValue([]);
    detailsMocks.getCompanyDetailsRecord.mockResolvedValue(null);
    detailsMocks.computePerShare.mockReturnValue(0);
  });

  it("lista as sociedades da família e resolve stakeholders pela sociedade", async () => {
    await expect(caller().list({ familyId: "fam-1" })).resolves.toEqual([company]);
    expect(repoMocks.listCompanyRecords).toHaveBeenCalledWith("fam-1");

    repoMocks.listStakeholderRecords.mockResolvedValue([{ id: "st-1" }]);
    await expect(caller().stakeholders({ companyId: "soc-1" })).resolves.toEqual([{ id: "st-1" }]);
    expect(repoMocks.getCompanyRecord).toHaveBeenCalledWith("soc-1");
    expect(repoMocks.listStakeholderRecords).toHaveBeenCalledWith("soc-1");
  });

  it("falha quando a sociedade consultada não existe", async () => {
    repoMocks.getCompanyRecord.mockResolvedValue(null);
    await expect(caller().stakeholders({ companyId: "sumida" })).rejects.toThrow(
      "Sociedade não encontrada."
    );
    await expect(caller().stakeholders({ companyId: "sumida" })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    expect(repoMocks.listStakeholderRecords).not.toHaveBeenCalled();
  });

  it("monta os detalhes com nomes, certidões filtradas e perShare", async () => {
    detailsMocks.getCompanyDetailsRecord.mockResolvedValue({ capitalSocial: 1000 });
    detailsMocks.computePerShare.mockReturnValue(10);
    certidaoMocks.listCertidaoRecords.mockResolvedValue([
      { id: "c1", scope: "SOCIEDADE", subjectId: "soc-1" },
      { id: "c2", scope: "SOCIEDADE", subjectId: "soc-2" },
      { id: "c3", scope: "FAMILIA", subjectId: "soc-1" },
    ]);
    peopleMocks.listPeopleByFamily.mockResolvedValue([{ id: "p1", fullName: "Ana" }]);
    repoMocks.listStakeholderRecords.mockResolvedValue([
      { id: "s1", externalName: "Investidor Externo", personId: null },
      { id: "s2", externalName: null, personId: "p1" },
      { id: "s3", externalName: null, personId: "p-sumido" },
      { id: "s4", externalName: null, personId: null },
    ]);

    const result = await caller().getDetails({ companyId: "soc-1" });

    expect(result.company).toEqual({
      id: "soc-1",
      legalName: "Holding Alpha",
      taxNumber: "11122233344",
      isOffshore: false,
    });
    expect(result.stakeholders.map(row => row.displayName)).toEqual([
      "Investidor Externo",
      "Ana",
      null,
      null,
    ]);
    expect(result.certidoes.map(row => row.id)).toEqual(["c1"]);
    expect(result.perShare).toBe(10);
    expect(detailsMocks.computePerShare).toHaveBeenCalledWith({ capitalSocial: 1000 });
  });
});

describe("company-router mutações", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repoMocks.getCompanyRecord.mockResolvedValue(company);
    repoMocks.createCompanyRecord.mockResolvedValue("soc-9");
    repoMocks.createStakeholderRecord.mockResolvedValue("st-9");
    repoMocks.updateStakeholderRecord.mockResolvedValue(undefined);
    repoMocks.removeStakeholderRecord.mockResolvedValue(undefined);
    repoMocks.removeCompanyRecord.mockResolvedValue({ archivedDocuments: 0 });
    certidaoMocks.ensureCertidoesForSubject.mockResolvedValue(undefined);
    docRequirementMocks.reconcileEntityDocuments.mockResolvedValue({
      created: 2,
      removed: 0,
    });
    docRequirementMocks.computeCompanyCategories.mockReturnValue([
      "CONTRATO_SOCIAL",
    ]);
    detailsMocks.upsertCompanyDetailsRecord.mockResolvedValue(undefined);
    auditMocks.recordAudit.mockResolvedValue(undefined);
    brasilApiMocks.fetchCompanyByCnpj.mockResolvedValue(null);
    peopleMocks.listPeopleByFamily.mockResolvedValue([]);
  });

  it("cria a sociedade, gera certidões/requisitos e audita", async () => {
    const result = await caller().create({
      familyId: "fam-1",
      legalName: "Holding Beta",
      taxNumber: "11222333000181",
      isOffshore: false,
    });

    expect(result).toEqual({ companyId: "soc-9", fromApi: false });
    expect(certidaoMocks.ensureCertidoesForSubject).toHaveBeenCalledWith({
      familyId: "fam-1",
      scope: "SOCIEDADE",
      subjectId: "soc-9",
    });
    expect(docRequirementMocks.reconcileEntityDocuments).toHaveBeenCalledWith({
      familyId: "fam-1",
      entityType: "SOCIEDADE",
      entityId: "soc-9",
      categories: ["CONTRATO_SOCIAL"],
    });
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "SOCIEDADE_CRIADA",
        actorUserId: 1,
        metadata: { isOffshore: false, requirements: 2, fromApi: false },
      })
    );
  });

  it("cria a sociedade preenchendo dados oficiais quando a BrasilAPI responde", async () => {
    brasilApiMocks.fetchCompanyByCnpj.mockResolvedValue({
      cnpj: "11222333000181",
      razao_social: "OFICIAL HOLDING LTDA",
      uf: "SP",
      codigo_natureza_juridica: 2062,
      natureza_juridica: "Sociedade Empresária Limitada",
      capital_social: 100000,
      qsa: [{ nome_socio: "Carlos Sócio", qualificacao_socio: "Sócio-Administrador" }],
    });

    const result = await caller().create({
      familyId: "fam-1",
      legalName: "Nome Digitado",
      taxNumber: "11222333000181",
      isOffshore: false,
    });

    expect(result).toEqual({ companyId: "soc-9", fromApi: true });
    expect(repoMocks.createCompanyRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        legalName: "OFICIAL HOLDING LTDA",
      })
    );
    expect(detailsMocks.upsertCompanyDetailsRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: "soc-9",
        fields: expect.objectContaining({
          uf: "SP",
          societaryType: "LTDA",
          capitalSocial: 100000,
          administrator1: "Carlos Sócio",
        }),
      })
    );
    expect(repoMocks.createStakeholderRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: "soc-9",
        externalName: "Carlos Sócio",
        percentage: 0,
      })
    );
  });

  it("bloqueia criação para quem não é da equipe", async () => {
    await expect(
      caller("CLIENTE").create({
        familyId: "fam-1",
        legalName: "Holding Beta",
        taxNumber: "11222333000181",
        isOffshore: false,
      })
    ).rejects.toThrow("Permiss");
    expect(repoMocks.createCompanyRecord).not.toHaveBeenCalled();
  });

  it("recusa criação nacional sem CNPJ e offshore com CNPJ", async () => {
    await expect(
      caller().create({ familyId: "fam-1", legalName: "Hold X", isOffshore: false })
    ).rejects.toThrow("Informe o CNPJ");
    await expect(
      caller().create({
        familyId: "fam-1",
        legalName: "Hold Off",
        taxNumber: "11222333000181",
        isOffshore: true,
      })
    ).rejects.toThrow("offshore não possui CNPJ");
    expect(repoMocks.createCompanyRecord).not.toHaveBeenCalled();
  });

  it("cria offshore sem CNPJ", async () => {
    await expect(
      caller().create({ familyId: "fam-1", legalName: "Hold Off", isOffshore: true })
    ).resolves.toEqual({ companyId: "soc-9", fromApi: false });
  });

  it("exclui a sociedade e audita", async () => {
    repoMocks.removeCompanyRecord.mockResolvedValue({ archivedDocuments: 1 });
    const result = await caller().remove({
      familyId: "fam-1",
      companyId: "soc-1",
    });

    expect(result).toEqual({ archivedDocuments: 1 });
    expect(repoMocks.removeCompanyRecord).toHaveBeenCalledWith("fam-1", "soc-1");
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "SOCIEDADE_EXCLUIDA",
        entityType: "SOCIEDADE",
        entityId: "soc-1",
      })
    );
  });

  it("bloqueia exclusao de sociedade para cliente", async () => {
    await expect(
      caller("CLIENTE").remove({ familyId: "fam-1", companyId: "soc-1" })
    ).rejects.toThrow("Permissão insuficiente.");
  });

  it("adiciona participacao de membro e de nao-membro com metadados distintos", async () => {
    await expect(
      caller().addStakeholder({ companyId: "soc-1", personId: "p1", percentage: 40 })
    ).resolves.toEqual({ stakeholderId: "st-9" });
    expect(auditMocks.recordAudit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        action: "PARTICIPACAO_SOCIETARIA_REGISTRADA",
        metadata: { stakeholderId: "st-9", percentage: 40, personId: "p1", externalName: "" },
      })
    );

    await expect(
      caller().addStakeholder({ companyId: "soc-1", externalName: "Fundo Externo", percentage: 60 })
    ).resolves.toEqual({ stakeholderId: "st-9" });
    expect(auditMocks.recordAudit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        metadata: { stakeholderId: "st-9", percentage: 60, personId: "", externalName: "Fundo Externo" },
      })
    );
  });

  it("valida que o membro informado pertence à família da sociedade", async () => {
    guardMocks.assertPersonInFamily.mockResolvedValue(undefined);
    await caller().addStakeholder({ companyId: "soc-1", personId: "p1", percentage: 40 });
    expect(guardMocks.assertPersonInFamily).toHaveBeenCalledWith("p1", "fam-1");

    guardMocks.assertPersonInFamily.mockClear();
    await caller().addStakeholder({ companyId: "soc-1", externalName: "Fundo Externo", percentage: 10 });
    expect(guardMocks.assertPersonInFamily).not.toHaveBeenCalled();
  });

  it("não cria participação de pessoa de outra família", async () => {
    guardMocks.assertPersonInFamily.mockRejectedValue(
      badRequest("A pessoa informada não pertence a esta família.")
    );

    await expect(
      caller().addStakeholder({ companyId: "soc-1", personId: "p-outra", percentage: 40 })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(repoMocks.createStakeholderRecord).not.toHaveBeenCalled();

    await expect(
      caller().updateStakeholder({ companyId: "soc-1", stakeholderId: "st-1", personId: "p-outra" })
    ).rejects.toThrow("não pertence a esta família");
    expect(repoMocks.updateStakeholderRecord).not.toHaveBeenCalled();
    guardMocks.assertPersonInFamily.mockReset();
  });

  it("atualiza e remove participacoes com auditoria", async () => {
    await expect(
      caller().updateStakeholder({ companyId: "soc-1", stakeholderId: "st-1", percentage: 25 })
    ).resolves.toEqual({ success: true });
    expect(repoMocks.updateStakeholderRecord).toHaveBeenCalledWith({
      companyId: "soc-1",
      stakeholderId: "st-1",
      percentage: 25,
    });

    await expect(
      caller().removeStakeholder({ companyId: "soc-1", stakeholderId: "st-1" })
    ).resolves.toEqual({ success: true });
    expect(repoMocks.removeStakeholderRecord).toHaveBeenCalledWith({
      companyId: "soc-1",
      stakeholderId: "st-1",
    });
    expect(auditMocks.recordAudit).toHaveBeenLastCalledWith(
      expect.objectContaining({ action: "PARTICIPACAO_SOCIETARIA_REMOVIDA" })
    );
  });
});

describe("company-router detalhes da holding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repoMocks.getCompanyRecord.mockResolvedValue(company);
    detailsMocks.upsertCompanyDetailsRecord.mockResolvedValue(undefined);
    docRequirementMocks.reconcileEntityDocuments.mockResolvedValue({
      created: 0,
      removed: 0,
    });
    docRequirementMocks.computeCompanyCategories.mockReturnValue([
      "CONTRATO_SOCIAL",
    ]);
    auditMocks.recordAudit.mockResolvedValue(undefined);
  });

  it("salva os detalhes da holding e audita", async () => {
    const result = await caller().upsertDetails({
      companyId: "soc-1",
      fields: { capitalSocial: 5000, jurisdiction: null },
    });

    expect(result).toEqual({ success: true });
    expect(detailsMocks.upsertCompanyDetailsRecord).toHaveBeenCalledWith({
      companyId: "soc-1",
      fields: { capitalSocial: 5000, jurisdiction: null },
    });
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "DETALHES_HOLDING_SALVOS",
        metadata: expect.objectContaining({
          isOffshore: false,
          capitalSocial: 5000,
        }),
      })
    );
  });

  it("salva detalhes mesmo com campos vazios", async () => {
    await expect(
      caller().upsertDetails({ companyId: "soc-1", fields: {} })
    ).resolves.toEqual({ success: true });
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: expect.objectContaining({ capitalSocial: 0 }) })
    );
  });

  it("falha quando a sociedade não existe", async () => {
    repoMocks.getCompanyRecord.mockResolvedValue(null);
    await expect(
      caller().upsertDetails({ companyId: "sumida", fields: {} })
    ).rejects.toThrow("Sociedade não encontrada.");
  });

  it("offshore exige jurisdição e identificador e recusa regime brasileiro", async () => {
    const offshore = { ...company, isOffshore: true, taxNumber: null };
    repoMocks.getCompanyRecord.mockResolvedValue(offshore);

    await expect(
      caller().upsertDetails({ companyId: "soc-1", fields: {} })
    ).rejects.toThrow("jurisdição");
    // Erro de negócio tipado: a mensagem chega ao usuário (não vira "Erro interno").
    await expect(
      caller().upsertDetails({ companyId: "soc-1", fields: {} })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    await expect(
      caller().upsertDetails({
        companyId: "soc-1",
        fields: { jurisdiction: "BVI", companyNumber: null },
      })
    ).rejects.toThrow("identificador estrangeiro");

    await expect(
      caller().upsertDetails({
        companyId: "soc-1",
        fields: {
          jurisdiction: "BVI",
          companyNumber: "12345",
          taxRegime: "LUCRO_REAL",
        },
      })
    ).rejects.toThrow("regime tributário brasileiro");

    await expect(
      caller().upsertDetails({
        companyId: "soc-1",
        fields: { jurisdiction: "BVI", companyNumber: "12345" },
      })
    ).resolves.toEqual({ success: true });
  });

  it("valida que administrador pessoa física pertence à família", async () => {
    guardMocks.assertPersonInFamily.mockResolvedValue(undefined);
    await caller().upsertDetails({
      companyId: "soc-1",
      fields: {
        administrator1PersonId: "person-1",
        administrator2PersonId: "person-2",
      },
    });

    expect(guardMocks.assertPersonInFamily).toHaveBeenCalledWith("person-1", "fam-1");
    expect(guardMocks.assertPersonInFamily).toHaveBeenCalledWith("person-2", "fam-1");
  });

  it("getDetails retorna ficha, sócios, certidões e lista de pessoas da família", async () => {
    detailsMocks.getCompanyDetailsRecord.mockResolvedValue({ capitalSocial: "5000.00" });
    repoMocks.listStakeholderRecords.mockResolvedValue([
      { id: "st-1", personId: "p1", externalName: null, externalCpf: null, percentage: "60.00" },
      { id: "st-2", personId: null, externalName: "Investidor", externalCpf: "52998224725", percentage: "40.00" },
    ]);
    certidaoMocks.listCertidaoRecords.mockResolvedValue([]);
    peopleMocks.listPeopleByFamily.mockResolvedValue([
      { id: "p1", fullName: "Ana Silva" },
    ]);
    detailsMocks.computePerShare.mockReturnValue({ contabil: 5, patrimonial: null, mercado: null });

    const result = await caller().getDetails({ companyId: "soc-1" });
    expect(result.company.id).toBe("soc-1");
    expect(result.stakeholders).toHaveLength(2);
    expect(result.stakeholders[0].displayName).toBe("Ana Silva");
    expect(result.stakeholders[1].displayName).toBe("Investidor");
    expect(result.stakeholders[1].externalCpf).toBe("52998224725");
    expect(result.people).toEqual([{ id: "p1", fullName: "Ana Silva" }]);
  });
});

