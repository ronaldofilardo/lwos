/**
 * @description Cobre os procedimentos do documentRouter: listagem/versionamento com
 * checagem de acesso, criação e geração de requisitos pela equipe, upload de versão e
 * as ações de revisão/ispensa restritas a sócio.
 * @see server/features/documents/document-router.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const repositoryMocks = vi.hoisted(() => ({
  findOrCreateDocumentRecord: vi.fn(),
  getDocumentRecord: vi.fn(),
  listDocumentRecords: vi.fn(),
  listVersions: vi.fn(),
}));
const reviewMocks = vi.hoisted(() => ({
  dispenseDocumentRecord: vi.fn(),
  reviewDocumentRecord: vi.fn(),
}));
const uploadMocks = vi.hoisted(() => ({ storeDocumentVersion: vi.fn() }));
const requirementsMocks = vi.hoisted(() => ({ ensureFamilyDocumentRequirements: vi.fn() }));
const accessMocks = vi.hoisted(() => ({ assertFamilyAccess: vi.fn() }));
const auditMocks = vi.hoisted(() => ({ recordAudit: vi.fn() }));

vi.mock("./document-repository", () => repositoryMocks);
vi.mock("./document-review", () => reviewMocks);
vi.mock("./document-upload", () => uploadMocks);
vi.mock("./document-requirements", () => requirementsMocks);
vi.mock("../access/family-access", () => accessMocks);
vi.mock("../audit/audit-repository", () => auditMocks);

import { documentRouter } from "./document-router";

const user = { id: 7, role: "SOCIO" };
const document = { id: "doc-1", familyId: "fam-1", status: "PENDENTE" };

function caller(role = "SOCIO") {
  return documentRouter.createCaller({
    req: { ip: "1.1.1.1" } as never,
    res: {} as never,
    user: { id: 7, role },
  } as never);
}

describe("document-router leitura", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accessMocks.assertFamilyAccess.mockResolvedValue(user);
    repositoryMocks.listDocumentRecords.mockResolvedValue([document]);
    repositoryMocks.listVersions.mockResolvedValue([{ versionNumber: 2 }]);
    repositoryMocks.getDocumentRecord.mockResolvedValue(document);
  });

  it("lista documentos da família com verificação de acesso", async () => {
    await expect(caller().list({ familyId: "fam-1" })).resolves.toEqual([document]);
    expect(accessMocks.assertFamilyAccess).toHaveBeenCalledWith(expect.anything(), "fam-1");
    expect(repositoryMocks.listDocumentRecords).toHaveBeenCalledWith("fam-1");
  });

  it("devolve lista vazia quando o documento não existe", async () => {
    repositoryMocks.getDocumentRecord.mockResolvedValue(null);
    await expect(caller().versions({ documentId: "sumido" })).resolves.toEqual([]);
    expect(accessMocks.assertFamilyAccess).not.toHaveBeenCalled();
    expect(repositoryMocks.listVersions).not.toHaveBeenCalled();
  });

  it("lista as versões do documento existente", async () => {
    await expect(caller().versions({ documentId: "doc-1" })).resolves.toEqual([
      { versionNumber: 2 },
    ]);
    expect(accessMocks.assertFamilyAccess).toHaveBeenCalledWith(expect.anything(), "fam-1");
    expect(repositoryMocks.listVersions).toHaveBeenCalledWith("doc-1");
  });
});

describe("document-router criação e requisitos", () => {
  const input = {
    familyId: "fam-1",
    entityType: "PESSOA",
    entityId: "p-1",
    category: "RG",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    accessMocks.assertFamilyAccess.mockResolvedValue(user);
    repositoryMocks.findOrCreateDocumentRecord.mockResolvedValue("doc-9");
    requirementsMocks.ensureFamilyDocumentRequirements.mockResolvedValue(4);
    auditMocks.recordAudit.mockResolvedValue(undefined);
  });

  it("cria o documento e audita", async () => {
    await expect(caller().create(input as never)).resolves.toEqual({ documentId: "doc-9" });
    expect(repositoryMocks.findOrCreateDocumentRecord).toHaveBeenCalledWith(input);
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "DOCUMENTO_CRIADO",
        entityType: "DOCUMENTO",
        entityId: "doc-9",
        actorUserId: 7,
      })
    );
  });

  it("cliente não cria documento", async () => {
    await expect(caller("CLIENTE").create(input as never)).rejects.toThrow(
      "Permissão insuficiente."
    );
    expect(repositoryMocks.findOrCreateDocumentRecord).not.toHaveBeenCalled();
  });

  it("gera os requisitos da família e audita a contagem", async () => {
    await expect(caller().generateRequirements({ familyId: "fam-1" })).resolves.toEqual({
      created: 4,
    });
    expect(requirementsMocks.ensureFamilyDocumentRequirements).toHaveBeenCalledWith("fam-1");
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "REQUISITOS_DOCUMENTAIS_GERADOS",
        metadata: { created: 4 },
      })
    );
  });

  it("cliente não gera requisitos", async () => {
    await expect(caller("CLIENTE").generateRequirements({ familyId: "fam-1" })).rejects.toThrow(
      "Permissão insuficiente."
    );
    expect(requirementsMocks.ensureFamilyDocumentRequirements).not.toHaveBeenCalled();
  });
});

describe("document-router upload, revisão e dispensa", () => {
  const uploadInput = {
    documentId: "doc-1",
    fileName: "rg.pdf",
    mimeType: "application/pdf",
    base64Data: "dGVzdA==",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    accessMocks.assertFamilyAccess.mockResolvedValue(user);
    repositoryMocks.getDocumentRecord.mockResolvedValue(document);
    uploadMocks.storeDocumentVersion.mockResolvedValue({ versionNumber: 3 });
    reviewMocks.reviewDocumentRecord.mockResolvedValue(undefined);
    reviewMocks.dispenseDocumentRecord.mockResolvedValue(undefined);
    auditMocks.recordAudit.mockResolvedValue(undefined);
  });

  it("faz upload da versão e audita o número da versão", async () => {
    await expect(caller().uploadVersion(uploadInput)).resolves.toEqual({ versionNumber: 3 });
    expect(uploadMocks.storeDocumentVersion).toHaveBeenCalledWith({
      ...uploadInput,
      userId: 7,
    });
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "VERSAO_DOCUMENTO_ENVIADA",
        metadata: { version: 3 },
      })
    );
  });

  it("falha no upload quando o documento não existe", async () => {
    repositoryMocks.getDocumentRecord.mockResolvedValue(null);
    await expect(caller().uploadVersion(uploadInput)).rejects.toThrow("Documento não encontrado.");
    expect(uploadMocks.storeDocumentVersion).not.toHaveBeenCalled();
  });

  it("sócio revisa o documento e audita o status aplicado", async () => {
    await expect(
      caller().review({ documentId: "doc-1", status: "VALIDADO" })
    ).resolves.toEqual({ success: true });
    expect(reviewMocks.reviewDocumentRecord).toHaveBeenCalledWith({
      documentId: "doc-1",
      status: "VALIDADO",
    });
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "DOCUMENTO_VALIDADO" })
    );
  });

  it("revisão exige sócio e documento existente", async () => {
    await expect(
      caller("ANALISTA").review({ documentId: "doc-1", status: "VALIDADO" })
    ).rejects.toThrow("Permissão insuficiente.");

    repositoryMocks.getDocumentRecord.mockResolvedValue(null);
    await expect(
      caller().review({ documentId: "sumido", status: "REJEITADO" })
    ).rejects.toThrow("Documento não encontrado.");
    expect(reviewMocks.reviewDocumentRecord).not.toHaveBeenCalled();
  });

  it("dispensa usando o solicitante informado", async () => {
    await expect(
      caller().dispense({ documentId: "doc-1", reason: "Duplicado", requestedBy: "9" })
    ).resolves.toEqual({ success: true });
    expect(reviewMocks.dispenseDocumentRecord).toHaveBeenCalledWith({
      documentId: "doc-1",
      reason: "Duplicado",
      requestedBy: "9",
      approvedBy: "7",
    });
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "DOCUMENTO_DISPENSADO",
        metadata: { reason: "Duplicado", requestedBy: "9" },
      })
    );
  });

  it("dispensa sem solicitante usa o próprio sócio como solicitante e rótulo padrão", async () => {
    await expect(
      caller().dispense({ documentId: "doc-1", reason: "Desatualizado" })
    ).resolves.toEqual({ success: true });
    expect(reviewMocks.dispenseDocumentRecord).toHaveBeenCalledWith(
      expect.objectContaining({ requestedBy: "7", approvedBy: "7" })
    );
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { reason: "Desatualizado", requestedBy: "SOLICITANTE_NAO_INFORMADO" },
      })
    );
  });

  it("dispensa falha para não-sócio e para documento inexistente", async () => {
    await expect(
      caller("ANALISTA").dispense({ documentId: "doc-1", reason: "Duplicado" })
    ).rejects.toThrow("Permissão insuficiente.");

    repositoryMocks.getDocumentRecord.mockResolvedValue(null);
    await expect(
      caller().dispense({ documentId: "sumido", reason: "Duplicado" })
    ).rejects.toThrow("Documento não encontrado.");
    expect(reviewMocks.dispenseDocumentRecord).not.toHaveBeenCalled();
  });
});
