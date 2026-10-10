/**
 * @description Cobre o personRouter: listagem com verificação de acesso, criação
 * com certidões + auditoria, atualização, exclusão (ambas auditadas) e
 * titularidade. Permissões e autenticação.
 * @see server/features/people/person-router.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const personRepoMocks = vi.hoisted(() => ({
  addPersonRecord: vi.fn(),
  getPersonRecord: vi.fn(),
  listPeopleByFamily: vi.fn(),
  removePersonRecord: vi.fn(),
  setPrimaryContact: vi.fn(),
  updatePersonRecord: vi.fn(),
}));
const auditMocks = vi.hoisted(() => ({ recordAudit: vi.fn() }));
const certidaoMocks = vi.hoisted(() => ({
  ensureCertidoesForSubject: vi.fn(),
}));
const documentRepoMocks = vi.hoisted(() => ({
  findOrCreateDocumentRecord: vi.fn(),
}));
const documentUploadMocks = vi.hoisted(() => ({
  storeDocumentVersion: vi.fn(),
}));
const requirementsMocks = vi.hoisted(() => ({
  reconcileEntityDocuments: vi.fn(),
  computePersonCategories: vi.fn(),
}));
const accessMocks = vi.hoisted(() => ({
  assertFamilyAccess: vi.fn(),
  requireRole: vi.fn(),
}));

vi.mock("./person-repository", () => personRepoMocks);
vi.mock("../audit/audit-repository", () => auditMocks);
vi.mock("../certidoes/certidao-repository", () => certidaoMocks);
vi.mock("../documents/document-repository", () => documentRepoMocks);
vi.mock("../documents/document-upload", () => documentUploadMocks);
vi.mock("../documents/document-requirements", () => requirementsMocks);
vi.mock("../documents/person-document-categories", () => ({
  computePersonCategories: requirementsMocks.computePersonCategories,
}));
vi.mock("./../access/family-access", () => ({
  assertFamilyAccess: accessMocks.assertFamilyAccess,
}));
vi.mock("./../access/authorization", () => ({
  requireRole: accessMocks.requireRole,
}));

import { personRouter } from "./person-router";

function caller(role = "SOCIO") {
  return personRouter.createCaller({
    req: { ip: "1.1.1.1" } as never,
    res: {} as never,
    user: { id: 7, role },
  } as never);
}

const validInput = {
  familyId: "fam-1",
  fullName: "Ana Silva",
  email: "ana@x.com",
  taxId: "52998224725",
  birthDate: "1990-01-01",
  phone: "11999998888",
  vinculo: "TITULAR",
  civilStatus: "CASADO",
  maritalRegime: "CPB",
  spouseName: "João",
  city: "São Paulo",
  uf: "SP",
  isPrimaryContact: true,
};

const validAttachment = {
  category: "IDENTIFICACAO",
  fileName: "rg.pdf",
  mimeType: "application/pdf",
  base64Data: "aGVsbG8td29ybGQ=",
};

describe("personRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accessMocks.requireRole.mockImplementation((_ctx: never, role: never) => ({
      id: 7,
      role,
    }));
    accessMocks.assertFamilyAccess.mockResolvedValue(undefined);
    auditMocks.recordAudit.mockResolvedValue(undefined);
    certidaoMocks.ensureCertidoesForSubject.mockResolvedValue(undefined);
    personRepoMocks.addPersonRecord.mockResolvedValue("pessoa-1");
    personRepoMocks.getPersonRecord.mockResolvedValue({
      id: "p-1",
      vinculo: "TITULAR",
      civilStatus: "CASADO",
      isDependent: false,
    });
    requirementsMocks.reconcileEntityDocuments.mockResolvedValue({
      created: 1,
      removed: 0,
    });
    requirementsMocks.computePersonCategories.mockReturnValue([
      "IRPF",
      "CPF/RG ou CNH",
      "Certidão de casamento",
      "Comprovante de endereço",
      "Passaporte",
    ]);
    personRepoMocks.listPeopleByFamily.mockResolvedValue([{ id: "p-1" }]);
    personRepoMocks.updatePersonRecord.mockResolvedValue({
      personId: "p-1",
      migratedFiles: 0,
    });
    personRepoMocks.removePersonRecord.mockResolvedValue({
      archivedDocuments: 2,
    });
    personRepoMocks.setPrimaryContact.mockResolvedValue({ migratedFiles: 1 });
  });

  it("lista pessoas após verificar acesso à família", async () => {
    await expect(caller().list({ familyId: "fam-1" })).resolves.toEqual([
      { id: "p-1" },
    ]);
    expect(accessMocks.assertFamilyAccess).toHaveBeenCalledWith(
      expect.anything(),
      "fam-1"
    );
    expect(personRepoMocks.listPeopleByFamily).toHaveBeenCalledWith("fam-1");
  });

  it("cria pessoa com certidões e auditoria PESSOA_CRIADA", async () => {
    await expect(caller().create(validInput as never)).resolves.toEqual({
      personId: "pessoa-1",
    });
    expect(personRepoMocks.addPersonRecord).toHaveBeenCalledWith(validInput);
    expect(certidaoMocks.ensureCertidoesForSubject).toHaveBeenCalledWith({
      familyId: "fam-1",
      scope: "PESSOA",
      subjectId: "pessoa-1",
    });
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "PESSOA_CRIADA",
        entityType: "PESSOA",
        entityId: "pessoa-1",
        actorUserId: 7,
        familyId: "fam-1",
      })
    );
  });

  it("atualiza pessoa e audita com migratedFiles", async () => {
    personRepoMocks.updatePersonRecord.mockResolvedValue({
      personId: "p-1",
      migratedFiles: 3,
    });

    await expect(
      caller().update({ ...validInput, personId: "p-1" } as never)
    ).resolves.toEqual({ personId: "p-1", migratedFiles: 3 });
    expect(accessMocks.assertFamilyAccess).toHaveBeenCalledWith(
      expect.anything(),
      "fam-1"
    );
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "PESSOA_ATUALIZADA",
        entityId: "p-1",
        metadata: expect.objectContaining({ migratedFiles: 3 }),
      })
    );
    expect(
      requirementsMocks.reconcileEntityDocuments
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        familyId: "fam-1",
        entityType: "PESSOA",
        entityId: "p-1",
      })
    );
  });

  it("exclui pessoa e audita com archivedDocuments", async () => {
    await expect(
      caller().remove({ familyId: "fam-1", personId: "p-1" })
    ).resolves.toEqual({ archivedDocuments: 2 });
    expect(personRepoMocks.removePersonRecord).toHaveBeenCalledWith(
      "fam-1",
      "p-1"
    );
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "PESSOA_EXCLUIDA",
        entityId: "p-1",
        metadata: { archivedDocuments: 2 },
      })
    );
  });

  it("define titular e audita com migratedFiles", async () => {
    await expect(
      caller().setPrimaryContact({ familyId: "fam-1", personId: "p-1" })
    ).resolves.toEqual({ success: true, migratedFiles: 1 });
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "TITULAR_FAMILIA_DEFINIDO",
        metadata: { migratedFiles: 1 },
      })
    );
  });

  it("exige papel de equipe para criar", async () => {
    accessMocks.requireRole.mockImplementation(() => {
      throw new Error("Permissão insuficiente.");
    });
    await expect(caller("CLIENTE").create(validInput as never)).rejects.toThrow(
      "Permissão insuficiente."
    );
    expect(personRepoMocks.addPersonRecord).not.toHaveBeenCalled();
  });

  it("anexa documentos de pessoa com auditoria", async () => {
    personRepoMocks.getPersonRecord.mockResolvedValue({
      id: "p-1",
      familyId: "fam-1",
    });
    documentRepoMocks.findOrCreateDocumentRecord.mockResolvedValue("doc-1");
    documentUploadMocks.storeDocumentVersion.mockResolvedValue({
      versionNumber: 1,
    });

    await expect(
      caller().attachDocuments({
        familyId: "fam-1",
        personId: "p-1",
        attachments: [validAttachment],
      } as never)
    ).resolves.toEqual({
      stored: [
        { documentId: "doc-1", versionNumber: 1, category: "IDENTIFICACAO" },
      ],
    });
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ANEXOS_PESSOA_ENVIADOS",
        metadata: expect.objectContaining({ count: 1 }),
      })
    );
  });

  it("recusa anexos quando a pessoa pertence a outra família", async () => {
    personRepoMocks.getPersonRecord.mockResolvedValue({
      id: "p-1",
      familyId: "outra-fam",
    });

    await expect(
      caller().attachDocuments({
        familyId: "fam-1",
        personId: "p-1",
        attachments: [validAttachment],
      } as never)
    ).rejects.toThrow("Pessoa não encontrada nesta família.");
    expect(documentUploadMocks.storeDocumentVersion).not.toHaveBeenCalled();
  });

  it("recusa anexos quando a pessoa não existe", async () => {
    personRepoMocks.getPersonRecord.mockResolvedValue(null);

    await expect(
      caller().attachDocuments({
        familyId: "fam-1",
        personId: "sumido",
        attachments: [validAttachment],
      } as never)
    ).rejects.toThrow("Pessoa não encontrada nesta família.");
  });
});
