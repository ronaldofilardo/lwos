/**
 * @description Valida o rate limit por IP da criação pública de interessados
 * (leads.create): 10 inserções por janela e isolamento entre IPs distintos.
 * @see server/features/leads/lead-router.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const leadMocks = vi.hoisted(() => ({
  createLeadRecord: vi.fn(),
  listLeadRecords: vi.fn(),
  acceptLeadRecord: vi.fn(),
  rejectLeadRecord: vi.fn(),
}));
const auditMocks = vi.hoisted(() => ({ recordAudit: vi.fn() }));

vi.mock("./lead-repository", () => leadMocks);
vi.mock("../audit/audit-repository", () => auditMocks);

import { resetRateLimits } from "../../_core/rateLimit";
import { leadRouter } from "./lead-router";

const leadInput = {
  familyId: "family-123",
  fullName: "Interessado Teste",
  taxId: "11122233344",
  email: "interessado@exemplo.com",
  birthDate: "1990-01-01",
  fileName: "identificacao.pdf",
  mimeType: "application/pdf",
  base64Data: "dGVzdA==",
};

function caller(ip: string) {
  return leadRouter.createCaller({ req: { ip } as never, res: {} as never, user: { role: "SOCIO" } });
}

describe("leads.create rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimits();
    leadMocks.createLeadRecord.mockResolvedValue({ id: "lead-1" });
  });

  it("permite 10 criações por IP e bloqueia a 11ª", async () => {
    const ctx = caller("1.1.1.1");

    for (let i = 0; i < 10; i++) {
      await expect(ctx.create(leadInput)).resolves.toEqual({ id: "lead-1" });
    }

    await expect(ctx.create(leadInput)).rejects.toThrow("Muitas tentativas. Tente novamente mais tarde.");
    expect(leadMocks.createLeadRecord).toHaveBeenCalledTimes(10);
  });

  it("não bloqueia outro IP no mesmo intervalo", async () => {
    const first = caller("2.2.2.2");
    for (let i = 0; i < 10; i++) await first.create(leadInput);
    await expect(first.create(leadInput)).rejects.toThrow("Muitas tentativas. Tente novamente mais tarde.");

    const other = caller("3.3.3.3");
    await expect(other.create(leadInput)).resolves.toEqual({ id: "lead-1" });
  });
});
