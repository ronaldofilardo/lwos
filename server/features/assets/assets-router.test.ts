/**
 * @description Cobre o assetRouter: listagem, criação com requisitos + auditoria,
 * atualização, exclusão com arquivamento e permissões de equipe.
 * @see server/features/assets/assets-router.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const assetRepoMocks = vi.hoisted(() => ({
  createAssetRecord: vi.fn(),
  getAssetRecord: vi.fn(),
  listAssetRecords: vi.fn(),
  removeAssetRecord: vi.fn(),
  updateAssetRecord: vi.fn(),
}));
const auditMocks = vi.hoisted(() => ({ recordAudit: vi.fn() }));
const documentRequirementMocks = vi.hoisted(() => ({
  ensureDocumentRequirements: vi.fn(),
  ASSET_DOCUMENT_CATEGORIES: ["Comprovação de titularidade"],
}));
const accessMocks = vi.hoisted(() => ({
  assertFamilyAccess: vi.fn(),
  requireRole: vi.fn(),
}));

vi.mock("./assets-repository", () => assetRepoMocks);
vi.mock("../audit/audit-repository", () => auditMocks);
vi.mock("../documents/document-requirements", () => ({
  ensureDocumentRequirements: documentRequirementMocks.ensureDocumentRequirements,
  ASSET_DOCUMENT_CATEGORIES: documentRequirementMocks.ASSET_DOCUMENT_CATEGORIES,
}));
vi.mock("../access/family-access", () => ({
  assertFamilyAccess: accessMocks.assertFamilyAccess,
}));
vi.mock("../access/authorization", () => ({
  requireRole: accessMocks.requireRole,
}));

import { assetRouter } from "./assets-router";

function caller(role = "SOCIO") {
  return assetRouter.createCaller({
    req: { ip: "1.1.1.1" } as never,
    res: {} as never,
    user: { id: 7, role },
  } as never);
}

const validInput = {
  familyId: "fam-1",
  category: "INVESTIMENTOS" as const,
  description: "Conta XP Investimentos",
  declaredValue: 150000,
  ownerPersonId: "p1",
};

describe("assetRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accessMocks.requireRole.mockImplementation((_ctx: never, role: never) => ({
      id: 7,
      role,
    }));
    accessMocks.assertFamilyAccess.mockResolvedValue(undefined);
    auditMocks.recordAudit.mockResolvedValue(undefined);
    documentRequirementMocks.ensureDocumentRequirements.mockResolvedValue([
      { id: "req-1" },
      { id: "req-2" },
    ]);
    assetRepoMocks.listAssetRecords.mockResolvedValue([{ id: "ativo-1" }]);
    assetRepoMocks.getAssetRecord.mockResolvedValue({
      id: "ativo-1",
      familyId: "fam-1",
    });
    assetRepoMocks.createAssetRecord.mockResolvedValue("ativo-9");
    assetRepoMocks.updateAssetRecord.mockResolvedValue({ assetId: "ativo-1" });
    assetRepoMocks.removeAssetRecord.mockResolvedValue({ archivedDocuments: 2 });
  });

  it("lista ativos após verificar acesso à família", async () => {
    await expect(caller().list({ familyId: "fam-1" })).resolves.toEqual([
      { id: "ativo-1" },
    ]);
    expect(accessMocks.assertFamilyAccess).toHaveBeenCalledWith(
      expect.anything(),
      "fam-1"
    );
  });

  it("cria ativo, gera requisitos e audita ATIVO_CRIADO", async () => {
    await expect(caller().create(validInput)).resolves.toEqual({
      assetId: "ativo-9",
    });
    expect(
      documentRequirementMocks.ensureDocumentRequirements
    ).toHaveBeenCalledWith(
      expect.objectContaining({ familyId: "fam-1", entityType: "ATIVO" })
    );
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ATIVO_CRIADO",
        entityType: "ATIVO",
        entityId: "ativo-9",
        actorUserId: 7,
        familyId: "fam-1",
        metadata: expect.objectContaining({ category: "INVESTIMENTOS" }),
      })
    );
  });

  it("atualiza ativo e audita ATIVO_ATUALIZADO", async () => {
    await expect(
      caller().update({ ...validInput, assetId: "ativo-1" })
    ).resolves.toEqual({ assetId: "ativo-1" });
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ATIVO_ATUALIZADO",
        entityId: "ativo-1",
      })
    );

    assetRepoMocks.getAssetRecord.mockResolvedValue(null);
    await expect(
      caller().update({ ...validInput, assetId: "sumido" })
    ).rejects.toThrow("Ativo não encontrado.");
  });

  it("exclui ativo, audita com archivedDocuments", async () => {
    await expect(
      caller().remove({ familyId: "fam-1", assetId: "ativo-1" })
    ).resolves.toEqual({ archivedDocuments: 2 });
    expect(assetRepoMocks.removeAssetRecord).toHaveBeenCalledWith(
      "fam-1",
      "ativo-1"
    );
    expect(auditMocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ATIVO_EXCLUIDO",
        entityId: "ativo-1",
        metadata: { archivedDocuments: 2 },
      })
    );
  });

  it("exige papel de equipe para criar, atualizar e excluir", async () => {
    accessMocks.requireRole.mockImplementation(() => {
      throw new Error("Permissão insuficiente.");
    });
    await expect(caller("CLIENTE").create(validInput)).rejects.toThrow(
      "Permissão insuficiente."
    );
    await expect(
      caller("CLIENTE").update({ ...validInput, assetId: "a1" })
    ).rejects.toThrow("Permissão insuficiente.");
    await expect(
      caller("CLIENTE").remove({ familyId: "fam-1", assetId: "a1" })
    ).rejects.toThrow("Permissão insuficiente.");
    expect(assetRepoMocks.createAssetRecord).not.toHaveBeenCalled();
    expect(assetRepoMocks.updateAssetRecord).not.toHaveBeenCalled();
    expect(assetRepoMocks.removeAssetRecord).not.toHaveBeenCalled();
  });
});
