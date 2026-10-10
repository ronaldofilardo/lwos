/**
 * @description Cobre o propertyRouter: listagem, criação com requisitos de
 * documento + auditoria, atualização, exclusão (arquiva documentos), e o ciclo
 * de titularidades (pessoa/sociedade) com a trava de gravame vermelho.
 * @see server/features/properties/property-router.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const propertyRepoMocks = vi.hoisted(() => ({
  addPropertyOwnerRecord: vi.fn(),
  assertCompanyOwnershipAllowed: vi.fn(),
  createPropertyRecord: vi.fn(),
  getPropertyRecord: vi.fn(),
  listPropertyOwners: vi.fn(),
  listPropertyRecords: vi.fn(),
  removePropertyRecord: vi.fn(),
  removePropertyOwnerRecord: vi.fn(),
  updatePropertyOwnerRecord: vi.fn(),
  updatePropertyRecord: vi.fn(),
}));
const auditMocks = vi.hoisted(() => ({ recordAudit: vi.fn() }));
const documentRequirementMocks = vi.hoisted(() => ({
  reconcileEntityDocuments: vi.fn(),
  computePropertyCategories: vi.fn(),
}));
const accessMocks = vi.hoisted(() => ({
  assertFamilyAccess: vi.fn(),
  requireRole: vi.fn(),
}));

vi.mock("./property-repository", () => propertyRepoMocks);
vi.mock("../audit/audit-repository", () => auditMocks);
vi.mock("../documents/document-requirements", () => ({
  reconcileEntityDocuments: documentRequirementMocks.reconcileEntityDocuments,
  computePropertyCategories: documentRequirementMocks.computePropertyCategories,
}));
vi.mock("../access/family-access", () => ({
  assertFamilyAccess: accessMocks.assertFamilyAccess,
}));
vi.mock("../access/authorization", () => ({
  requireRole: accessMocks.requireRole,
}));

import { propertyRouter } from "./property-router";

function caller(role = "SOCIO") {
  return propertyRouter.createCaller({
    req: { ip: "1.1.1.1" } as never,
    res: {} as never,
    user: { id: 7, role },
  } as never);
}

const validInput = {
  familyId: "fam-1",
  description: "Casa de praia",
  propertyCity: "Paraty",
  uf: "RJ",
  kind: "URBANO",
  inscricaoImobiliaria: "12345",
  hasRegistration: true,
  hasLaudemio: false,
  utility: "RESIDENCIAL",
  encumbranceType: "NAO_HA",
};

describe("propertyRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accessMocks.requireRole.mockImplementation((_ctx: never, role: never) => ({
      id: 7,
      role,
    }));
    accessMocks.assertFamilyAccess.mockResolvedValue(undefined);
    auditMocks.recordAudit.mockResolvedValue(undefined);
    documentRequirementMocks.reconcileEntityDocuments.mockResolvedValue({
      created: 2,
      removed: 0,
    });
    documentRequirementMocks.computePropertyCategories.mockImplementation(
      (property: { hasRegistration?: boolean | null }) =>
        property.hasRegistration === false ? ["IPTU"] : ["MATRICULA", "IPTU"]
    );
    propertyRepoMocks.listPropertyRecords.mockResolvedValue([{ id: "imovel-1" }]);
    propertyRepoMocks.getPropertyRecord.mockResolvedValue({
      id: "imovel-1",
      familyId: "fam-1",
    });
    propertyRepoMocks.createPropertyRecord.mockResolvedValue("imovel-9");
    propertyRepoMocks.updatePropertyRecord.mockResolvedValue({
      propertyId: "imovel-1",
    });
    propertyRepoMocks.removePropertyRecord.mockResolvedValue({
      archivedDocuments: 3,
    });
    propertyRepoMocks.listPropertyOwners.mockResolvedValue([{ id: "own-1" }]);
    propertyRepoMocks.addPropertyOwnerRecord.mockResolvedValue("own-1");
    propertyRepoMocks.updatePropertyOwnerRecord.mockResolvedValue(undefined);
    propertyRepoMocks.removePropertyOwnerRecord.mockResolvedValue("own-1");
    propertyRepoMocks.assertCompanyOwnershipAllowed.mockResolvedValue(undefined);
  });

  it("lista imóveis após verificar acesso à família", async () => {
    await expect(
      caller().list({ familyId: "fam-1" })
    ).resolves.toEqual([{ id: "imovel-1" }]);
    expect(accessMocks.assertFamilyAccess).toHaveBeenCalledWith(
      expect.anything(),
      "fam-1"
    );
  });

  it("lista os titulares após verificar o acesso à família do imóvel", async () => {
    await expect(
      caller().owners({ propertyId: "imovel-1" })
    ).resolves.toEqual([{ id: "own-1" }]);
    expect(accessMocks.assertFamilyAccess).toHaveBeenCalledWith(
      expect.anything(),
      "fam-1"
    );
    propertyRepoMocks.getPropertyRecord.mockResolvedValue(null);
    await expect(
      caller().owners({ propertyId: "sumido" })
    ).resolves.toEqual([]);
  });

  it("cria imóvel, gera requisitos de documento e audita IMOVEL_CRIADO", async () => {
    await expect(caller().create(validInput as never)).resolves.toEqual({
      propertyId: "imovel-9",
    });
    expect(
      documentRequirementMocks.reconcileEntityDocuments
    ).toHaveBeenCalledWith(
      expect.objectContaining({ familyId: "fam-1", entityType: "IMOVEL" })
    );
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "IMOVEL_CRIADO",
        entityType: "IMOVEL",
        entityId: "imovel-9",
        actorUserId: 7,
        familyId: "fam-1",
        metadata: { requirements: 2, requirementsRemoved: 0 },
      })
    );
  });

  it("cria imóvel sem matrícula com os requisitos alternativos", async () => {
    await expect(
      caller().create({
        ...validInput,
        hasRegistration: false,
        alternativeDocType: "ESCRITURA_PUBLICA",
        noRegistrationReason: "Matrícula inexistente",
      } as never)
    ).resolves.toEqual({ propertyId: "imovel-9" });
    expect(
      documentRequirementMocks.reconcileEntityDocuments
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: ["IPTU"],
      })
    );
  });

  it("atualiza imóvel e audita IMOVEL_ATUALIZADO", async () => {
    await expect(
      caller().update({ ...validInput, propertyId: "imovel-1" } as never)
    ).resolves.toEqual({ propertyId: "imovel-1" });
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "IMOVEL_ATUALIZADO",
        entityId: "imovel-1",
      })
    );

    propertyRepoMocks.getPropertyRecord.mockResolvedValue(null);
    await expect(
      caller().update({ ...validInput, propertyId: "sumido" } as never)
    ).rejects.toThrow("Imóvel não encontrado.");
  });

  it("exclui imóvel, audita com archivedDocuments", async () => {
    await expect(
      caller().remove({ familyId: "fam-1", propertyId: "imovel-1" })
    ).resolves.toEqual({ archivedDocuments: 3 });
    expect(propertyRepoMocks.removePropertyRecord).toHaveBeenCalledWith(
      "fam-1",
      "imovel-1"
    );
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "IMOVEL_EXCLUIDO",
        entityId: "imovel-1",
        metadata: { archivedDocuments: 3 },
      })
    );
  });

  it("registra titularidade pessoa e audita TITULARIDADE_REGISTRADA", async () => {
    await expect(
      caller().addOwner({
        propertyId: "imovel-1",
        personId: "p1",
        ownershipPercentage: 100,
        rightType: "PROPRIEDADE",
      })
    ).resolves.toEqual({ ownerId: "own-1" });
    expect(
      propertyRepoMocks.assertCompanyOwnershipAllowed
    ).not.toHaveBeenCalled();
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "TITULARIDADE_REGISTRADA",
        metadata: expect.objectContaining({
          ownerId: "own-1",
          personId: "p1",
          ownershipPercentage: 100,
        }),
      })
    );
  });

  it("sociedade passa pela trava de gravame vermelho", async () => {
    propertyRepoMocks.assertCompanyOwnershipAllowed.mockRejectedValue(
      new Error("Este imóvel possui gravame ativo.")
    );
    await expect(
      caller().addOwner({
        propertyId: "imovel-1",
        companyId: "hold-1",
        ownershipPercentage: 100,
        rightType: "PROPRIEDADE",
      })
    ).rejects.toThrow("gravame ativo");
    expect(
      propertyRepoMocks.assertCompanyOwnershipAllowed
    ).toHaveBeenCalledWith("imovel-1");
    expect(propertyRepoMocks.addPropertyOwnerRecord).not.toHaveBeenCalled();
  });

  it("atualiza titularidade e audita TITULARIDADE_ATUALIZADA", async () => {
    await expect(
      caller().updateOwner({
        propertyId: "imovel-1",
        ownerId: "own-1",
        ownershipPercentage: 40,
      })
    ).resolves.toEqual({ success: true });
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "TITULARIDADE_ATUALIZADA",
        metadata: { ownerId: "own-1" },
      })
    );
  });

  it("troca de dono para sociedade dispara a trava de gravame", async () => {
    propertyRepoMocks.assertCompanyOwnershipAllowed.mockRejectedValue(
      new Error("Este imóvel possui gravame ativo.")
    );
    await expect(
      caller().updateOwner({
        propertyId: "imovel-1",
        ownerId: "own-1",
        companyId: "hold-1",
      })
    ).rejects.toThrow("gravame ativo");
    expect(propertyRepoMocks.updatePropertyOwnerRecord).not.toHaveBeenCalled();
  });

  it("remove titularidade e audita TITULARIDADE_REMOVIDA", async () => {
    await expect(
      caller().removeOwner({ propertyId: "imovel-1", ownerId: "own-1" })
    ).resolves.toEqual({ success: true });
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "TITULARIDADE_REMOVIDA",
        metadata: { ownerId: "own-1" },
      })
    );

    propertyRepoMocks.getPropertyRecord.mockResolvedValue(null);
    await expect(
      caller().removeOwner({ propertyId: "sumido", ownerId: "own-1" })
    ).rejects.toThrow("Imóvel não encontrado.");
  });

  it("exige papel de equipe para excluir imóvel", async () => {
    accessMocks.requireRole.mockImplementation(() => {
      throw new Error("Permissão insuficiente.");
    });
    await expect(
      caller("CLIENTE").remove({ familyId: "fam-1", propertyId: "imovel-1" })
    ).rejects.toThrow("Permissão insuficiente.");
    expect(propertyRepoMocks.removePropertyRecord).not.toHaveBeenCalled();
  });
});
