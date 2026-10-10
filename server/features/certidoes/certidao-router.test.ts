/**
 * @description Controle de acesso do certidao-router: o list é leitura e aceita
 * o titular (CLIENTE) com vínculo na família; gerar e atualizar status seguem
 * restritos à equipe (TEAM_ROLES / SOCIO).
 * @see server/features/certidoes/certidao-router.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const repositoryMocks = vi.hoisted(() => ({
  listCertidaoRecords: vi.fn(),
  ensureFamilyCertidoes: vi.fn(),
  getCertidaoRecord: vi.fn(),
  updateCertidaoRecord: vi.fn(),
}));
const alertMocks = vi.hoisted(() => ({ getProjectAlertSummary: vi.fn() }));
const accessMocks = vi.hoisted(() => ({ assertFamilyAccess: vi.fn() }));
const auditMocks = vi.hoisted(() => ({ recordAudit: vi.fn() }));

vi.mock("./certidao-repository", () => repositoryMocks);
vi.mock("../alerts/project-alerts-repository", () => alertMocks);
vi.mock("../access/family-access", () => accessMocks);
vi.mock("../audit/audit-repository", () => auditMocks);

import { certidaoRouter } from "./certidao-router";

const clientCtx = { req: {} as never, res: {} as never, user: { id: 7, role: "CLIENTE" } } as never;

describe("certidao-router acesso", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accessMocks.assertFamilyAccess.mockResolvedValue({ id: 7, role: "CLIENTE" });
    repositoryMocks.listCertidaoRecords.mockResolvedValue([{ id: "cert-1" }]);
    repositoryMocks.ensureFamilyCertidoes.mockResolvedValue(2);
    repositoryMocks.getCertidaoRecord.mockResolvedValue({ id: "cert-1", familyId: "fam-1", type: "CNDT" });
    repositoryMocks.updateCertidaoRecord.mockResolvedValue(undefined);
    alertMocks.getProjectAlertSummary.mockResolvedValue({
      bySubject: { "PESSOA:p1": "VERMELHO" },
      canConclude: false,
    });
  });

  it("CLIENTE com vínculo lista certidões (leitura)", async () => {
    const caller = certidaoRouter.createCaller(clientCtx);
    await expect(caller.list({ familyId: "fam-1" })).resolves.toEqual([{ id: "cert-1" }]);
    expect(accessMocks.assertFamilyAccess).toHaveBeenCalledWith(expect.anything(), "fam-1");
    expect(repositoryMocks.listCertidaoRecords).toHaveBeenCalledWith("fam-1");
  });

  it("CLIENTE sem vínculo é negado no list", async () => {
    accessMocks.assertFamilyAccess.mockRejectedValue(new Error("Acesso negado."));
    const caller = certidaoRouter.createCaller(clientCtx);
    await expect(caller.list({ familyId: "fam-2" })).rejects.toThrow("Acesso negado.");
    expect(repositoryMocks.listCertidaoRecords).not.toHaveBeenCalled();
  });

  it("CLIENTE não pode gerar certidões", async () => {
    const caller = certidaoRouter.createCaller(clientCtx);
    await expect(caller.generate({ familyId: "fam-1" })).rejects.toThrow(
      "Permissão insuficiente"
    );
    expect(repositoryMocks.ensureFamilyCertidoes).not.toHaveBeenCalled();
  });

  it("CLIENTE não pode atualizar status de certidão", async () => {
    const caller = certidaoRouter.createCaller(clientCtx);
    await expect(
      caller.updateStatus({ certidaoId: "cert-1", status: "POSITIVA" })
    ).rejects.toThrow("Permissão insuficiente");
    expect(repositoryMocks.updateCertidaoRecord).not.toHaveBeenCalled();
  });

  it("CLIENTE com vinculo le o resumo de alertas do projeto", async () => {
    const caller = certidaoRouter.createCaller(clientCtx);
    await expect(caller.summary({ familyId: "fam-1" })).resolves.toEqual({
      bySubject: { "PESSOA:p1": "VERMELHO" },
      canConclude: false,
    });
    expect(accessMocks.assertFamilyAccess).toHaveBeenCalledWith(
      expect.anything(),
      "fam-1"
    );
    expect(alertMocks.getProjectAlertSummary).toHaveBeenCalledWith("fam-1");
  });

  it("resumo negado sem vinculo na familia", async () => {
    accessMocks.assertFamilyAccess.mockRejectedValue(new Error("Acesso negado."));
    const caller = certidaoRouter.createCaller(clientCtx);
    await expect(caller.summary({ familyId: "fam-2" })).rejects.toThrow(
      "Acesso negado."
    );
    expect(alertMocks.getProjectAlertSummary).not.toHaveBeenCalled();
  });
});
