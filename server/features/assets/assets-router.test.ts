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
  reconcileEntityDocuments: vi.fn(),
  computeAssetCategories: vi.fn(),
}));
const guardMocks = vi.hoisted(() => ({ assertPersonInFamily: vi.fn() }));
const accessMocks = vi.hoisted(() => ({
  assertFamilyAccess: vi.fn(),
  requireRole: vi.fn(),
  requirePermission: vi.fn(),
}));

vi.mock("./assets-repository", () => assetRepoMocks);
vi.mock("../audit/audit-repository", () => auditMocks);
vi.mock("../access/entity-guards", () => guardMocks);
vi.mock("../documents/document-requirements", () => ({
  reconcileEntityDocuments: documentRequirementMocks.reconcileEntityDocuments,
  computeAssetCategories: documentRequirementMocks.computeAssetCategories,
}));
vi.mock("../access/family-access", () => ({
  assertFamilyAccess: accessMocks.assertFamilyAccess,
}));
vi.mock("../access/authorization", () => ({
  requireRole: accessMocks.requireRole,
  requirePermission: accessMocks.requirePermission,
}));

import { badRequest } from "../_shared/errors";
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
    accessMocks.requireRole.mockImplementation((_ctx: never, role: never) => {
      if (role === "CLIENTE") throw new Error("Permissão insuficiente.");
      return { id: 7, role };
    });
    accessMocks.requirePermission.mockImplementation((ctx: never) => {
      const role = (ctx as { user: { role: string } }).user?.role;
      if (role === "CLIENTE") throw new Error("Permissão insuficiente.");
      return { id: 7 };
    });
    accessMocks.assertFamilyAccess.mockResolvedValue(undefined);
    guardMocks.assertPersonInFamily.mockResolvedValue(undefined);
    auditMocks.recordAudit.mockResolvedValue(undefined);
    documentRequirementMocks.reconcileEntityDocuments.mockResolvedValue({
      created: 2,
      removed: 0,
    });
    documentRequirementMocks.computeAssetCategories.mockReturnValue([
      "Comprovação de titularidade",
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
      documentRequirementMocks.reconcileEntityDocuments
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        familyId: "fam-1",
        entityType: "ATIVO",
        entityId: "ativo-9",
        categories: ["Comprovação de titularidade"],
      })
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
    ).rejects.toMatchObject({ code: "NOT_FOUND", message: "Ativo não encontrado." });
  });

  it("valida que o responsável pertence à família ao criar e atualizar", async () => {
    await caller().create(validInput);
    expect(guardMocks.assertPersonInFamily).toHaveBeenCalledWith("p1", "fam-1");

    guardMocks.assertPersonInFamily.mockClear();
    await caller().update({ ...validInput, assetId: "ativo-1" });
    expect(guardMocks.assertPersonInFamily).toHaveBeenCalledWith("p1", "fam-1");
  });

  it("recusa responsável de outra família sem gravar", async () => {
    guardMocks.assertPersonInFamily.mockRejectedValue(
      badRequest("A pessoa informada não pertence a esta família.")
    );

    await expect(caller().create(validInput)).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      caller().update({ ...validInput, assetId: "ativo-1" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(assetRepoMocks.createAssetRecord).not.toHaveBeenCalled();
    expect(assetRepoMocks.updateAssetRecord).not.toHaveBeenCalled();
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
