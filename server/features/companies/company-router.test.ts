/**
 * @description Cobre todos os procedimentos do companyRouter: consultas, criação de
 * sociedade/integralização/participações, detalhes holding (docs válidos por tipo) e
 * as permissões de equipe em cada mutação.
 * @see server/features/companies/company-router.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const repoMocks = vi.hoisted(() => ({
  createCompanyRecord: vi.fn(),
  createContributionRecord: vi.fn(),
  createStakeholderRecord: vi.fn(),
  getCompanyRecord: vi.fn(),
  listCompanyRecords: vi.fn(),
  listStakeholderRecords: vi.fn(),
  removeStakeholderRecord: vi.fn(),
  updateStakeholderRecord: vi.fn(),
}));
const detailsMocks = vi.hoisted(() => ({
  getCompanyDetailsRecord: vi.fn(),
  listCompanyDetailDocs: vi.fn(),
  updateCompanyDetailDocRecord: vi.fn(),
  upsertCompanyDetailsRecord: vi.fn(),
  computePerShare: vi.fn(),
}));
const certidaoMocks = vi.hoisted(() => ({
  ensureCertidoesForSubject: vi.fn(),
  listCertidaoRecords: vi.fn(),
}));
const docRequirementMocks = vi.hoisted(() => ({
  ensureDocumentRequirements: vi.fn(),
  COMPANY_DOCUMENT_CATEGORIES: ["CONTRATO_SOCIAL"],
}));
const propertyMocks = vi.hoisted(() => ({ getPropertyRecord: vi.fn() }));
const peopleMocks = vi.hoisted(() => ({ listPeopleByFamily: vi.fn() }));
const auditMocks = vi.hoisted(() => ({ recordAudit: vi.fn() }));

vi.mock("./company-repository", () => repoMocks);
vi.mock("./company-details-repository", () => detailsMocks);
vi.mock("../certidoes/certidao-repository", () => certidaoMocks);
vi.mock("../documents/document-requirements", () => docRequirementMocks);
vi.mock("../properties/property-repository", () => propertyMocks);
vi.mock("../people/person-repository", () => peopleMocks);
vi.mock("../audit/audit-repository", () => auditMocks);

import { companyRouter } from "./company-router";

const company = {
  id: "soc-1",
  familyId: "fam-1",
  legalName: "Holding Alpha",
  taxNumber: "11122233344",
  type: "HOLDING_NACIONAL",
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
    detailsMocks.listCompanyDetailDocs.mockResolvedValue([]);
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
      type: "HOLDING_NACIONAL",
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
    repoMocks.createContributionRecord.mockResolvedValue("int-1");
    repoMocks.createStakeholderRecord.mockResolvedValue("st-9");
    repoMocks.updateStakeholderRecord.mockResolvedValue(undefined);
    repoMocks.removeStakeholderRecord.mockResolvedValue(undefined);
    certidaoMocks.ensureCertidoesForSubject.mockResolvedValue(undefined);
    docRequirementMocks.ensureDocumentRequirements.mockResolvedValue(["r1", "r2"]);
    detailsMocks.upsertCompanyDetailsRecord.mockResolvedValue(undefined);
    detailsMocks.updateCompanyDetailDocRecord.mockResolvedValue(undefined);
    auditMocks.recordAudit.mockResolvedValue(undefined);
  });

  it("cria a sociedade, gera certidões/requisitos e audita", async () => {
    const result = await caller().create({
      familyId: "fam-1",
      legalName: "Holding Beta",
      type: "HOLDING_NACIONAL",
    });

    expect(result).toEqual({ companyId: "soc-9" });
    expect(certidaoMocks.ensureCertidoesForSubject).toHaveBeenCalledWith({
      familyId: "fam-1",
      scope: "SOCIEDADE",
      subjectId: "soc-9",
    });
    expect(docRequirementMocks.ensureDocumentRequirements).toHaveBeenCalledWith({
      familyId: "fam-1",
      entityType: "SOCIEDADE",
      entityId: "soc-9",
      categories: ["CONTRATO_SOCIAL"],
    });
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "SOCIEDADE_CRIADA",
        actorUserId: 1,
        metadata: { type: "HOLDING_NACIONAL", requirements: 2 },
      })
    );
  });

  it("bloqueia criação para quem não é da equipe", async () => {
    await expect(
      caller("CLIENTE").create({ familyId: "fam-1", legalName: "Holding Beta", type: "HOLDING_NACIONAL" })
    ).rejects.toThrow("Permiss");
    expect(repoMocks.createCompanyRecord).not.toHaveBeenCalled();
  });

  it("registra integralização no imóvel vinculado", async () => {
    propertyMocks.getPropertyRecord.mockResolvedValue({ id: "im-1", familyId: "fam-1" });

    await expect(
      caller().createContribution({ propertyId: "im-1", companyId: "soc-1", percentage: 12.5 })
    ).resolves.toEqual({ contributionId: "int-1" });
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "INTEGRALIZACAO_REGISTRADA",
        familyId: "fam-1",
        metadata: { contributionId: "int-1" },
      })
    );
  });

  it("falha quando o imóvel da integralização não existe", async () => {
    propertyMocks.getPropertyRecord.mockResolvedValue(null);
    await expect(
      caller().createContribution({ propertyId: "im-x", companyId: "soc-1", percentage: 10 })
    ).rejects.toThrow("Imóvel não encontrado.");
    expect(repoMocks.createContributionRecord).not.toHaveBeenCalled();
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
    detailsMocks.updateCompanyDetailDocRecord.mockResolvedValue(undefined);
    auditMocks.recordAudit.mockResolvedValue(undefined);
  });

  it("salva detalhes e documentos permitidos para o tipo nacional", async () => {
    const result = await caller().upsertDetails({
      companyId: "soc-1",
      fields: { capitalSocial: 5000, jurisdiction: null },
      docs: [{ docType: "CONTRATO_SOCIAL", status: "RECEBIDO" }],
    });

    expect(result).toEqual({ success: true });
    expect(detailsMocks.upsertCompanyDetailsRecord).toHaveBeenCalledWith({
      companyId: "soc-1",
      fields: { capitalSocial: 5000, jurisdiction: null },
    });
    expect(detailsMocks.updateCompanyDetailDocRecord).toHaveBeenCalledWith({
      companyId: "soc-1",
      docType: "CONTRATO_SOCIAL",
      status: "RECEBIDO",
    });
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "DETALHES_HOLDING_SALVOS",
        metadata: { type: "HOLDING_NACIONAL", documents: 1, capitalSocial: 5000 },
      })
    );
  });

  it("salva detalhes sem documentos quando o payload não traz a lista", async () => {
    await expect(
      caller().upsertDetails({ companyId: "soc-1", fields: {} })
    ).resolves.toEqual({ success: true });
    expect(detailsMocks.updateCompanyDetailDocRecord).not.toHaveBeenCalled();
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: expect.objectContaining({ documents: 0 }) })
    );
  });

  it("rejeita documento inexistente no tipo da sociedade", async () => {
    await expect(
      caller().upsertDetails({
        companyId: "soc-1",
        fields: {},
        docs: [{ docType: "BALANCE_SHEET", status: "PENDENTE" }],
      })
    ).rejects.toThrow("Documento inválido para o tipo desta sociedade.");
    expect(detailsMocks.upsertCompanyDetailsRecord).not.toHaveBeenCalled();
  });

  it("atualiza o status de um documento permitido e recusa o incompativel", async () => {
    await expect(
      caller().updateDetailDoc({ companyId: "soc-1", docType: "ACORDO_SOCIOS", status: "NA" })
    ).resolves.toEqual({ success: true });
    expect(detailsMocks.updateCompanyDetailDocRecord).toHaveBeenCalledWith({
      companyId: "soc-1",
      docType: "ACORDO_SOCIOS",
      status: "NA",
    });
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "DETALHES_HOLDING_DOC_STATUS" })
    );

    await expect(
      caller().updateDetailDoc({ companyId: "soc-1", docType: "SHARE_CERTIFICATE", status: "NA" })
    ).rejects.toThrow("Documento inválido para o tipo desta sociedade.");
    expect(detailsMocks.updateCompanyDetailDocRecord).toHaveBeenCalledTimes(1);
  });

  it("aceita documento internacional apenas em holding no exterior", async () => {
    repoMocks.getCompanyRecord.mockResolvedValue({ ...company, type: "HOLDING_INTERNACIONAL" });

    await expect(
      caller().updateDetailDoc({ companyId: "soc-1", docType: "SHARE_CERTIFICATE", status: "NA" })
    ).resolves.toEqual({ success: true });
  });
});
