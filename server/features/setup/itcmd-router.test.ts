import { describe, expect, it, vi, beforeEach } from "vitest";
import { NOT_ADMIN_ERR_MSG } from "../../../shared/const";

const repoMocks = vi.hoisted(() => ({
  getBracketsByUf: vi.fn(),
  saveUfPolicy: vi.fn(),
}));

vi.mock("./itcmd-repository", () => repoMocks);

import { itcmdRouter } from "./itcmd-router";

describe("itcmdRouter", () => {
  const adminCtx = { user: { id: "user-1", role: "ADMIN" } } as any;
  const socioCtx = { user: { id: "user-3", role: "SOCIO" } } as any;
  const clienteCtx = { user: { id: "user-2", role: "CLIENTE" } } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lista UFs cadastradas com resumo", async () => {
    repoMocks.getBracketsByUf.mockResolvedValue([
      { uf: "SP", bracketOrder: 1, limitValue: 1000000, rate: 4, indexedUnitName: "UFESP", indexedUnitValue: 35.36 },
    ]);

    const caller = itcmdRouter.createCaller(adminCtx);
    const ufs = await caller.listUfs();

    expect(ufs.length).toBe(27);
    const sp = ufs.find(u => u.uf === "SP");
    expect(sp?.minRate).toBe(4);
    expect(sp?.indexedUnitName).toBe("UFESP");
  });

  it("busca política de uma UF específica", async () => {
    repoMocks.getBracketsByUf.mockResolvedValue([
      { uf: "RJ", bracketOrder: 1, limitValue: 300000, rate: 4 },
      { uf: "RJ", bracketOrder: 2, limitValue: 800000, rate: 4.5 },
    ]);

    const caller = itcmdRouter.createCaller(adminCtx);
    const result = await caller.getByUf({ uf: "RJ" });

    expect(result.uf).toBe("RJ");
    expect(result.brackets).toHaveLength(2);
  });

  it("permite atualização de política para ADMIN", async () => {
    repoMocks.saveUfPolicy.mockResolvedValue([
      { uf: "SP", bracketOrder: 1, limitValue: 5000000, rate: 4 },
    ]);

    const caller = itcmdRouter.createCaller(adminCtx);
    const res = await caller.updatePolicy({
      uf: "SP",
      brackets: [{ bracketOrder: 1, limitValue: 5000000, rate: 4, accumulatedTax: 0, deductionValue: 0 }],
    });

    expect(res.brackets).toHaveLength(1);
    expect(repoMocks.saveUfPolicy).toHaveBeenCalledWith("SP", expect.any(Array));
  });

  it("bloqueia atualização para perfil SOCIO", async () => {
    const caller = itcmdRouter.createCaller(socioCtx);
    await expect(
      caller.updatePolicy({
        uf: "SP",
        brackets: [{ bracketOrder: 1, limitValue: 1000, rate: 4, accumulatedTax: 0, deductionValue: 0 }],
      })
    ).rejects.toThrow(NOT_ADMIN_ERR_MSG);
    expect(repoMocks.saveUfPolicy).not.toHaveBeenCalled();
  });

  it("bloqueia atualização para perfil CLIENTE", async () => {
    const caller = itcmdRouter.createCaller(clienteCtx);
    await expect(
      caller.updatePolicy({
        uf: "SP",
        brackets: [{ bracketOrder: 1, limitValue: 1000, rate: 4, accumulatedTax: 0, deductionValue: 0 }],
      })
    ).rejects.toThrow(NOT_ADMIN_ERR_MSG);
  });

  it.each(["SOCIO", "CLIENTE"])("bloqueia leitura das políticas para %s", async role => {
    const caller = itcmdRouter.createCaller({ user: { id: "user-x", role } } as any);
    await expect(caller.listUfs()).rejects.toThrow(NOT_ADMIN_ERR_MSG);
    await expect(caller.getByUf({ uf: "SP" })).rejects.toThrow(NOT_ADMIN_ERR_MSG);
    expect(repoMocks.getBracketsByUf).not.toHaveBeenCalled();
  });

  it("calcula imposto para uma UF e patrimônio", async () => {
    repoMocks.getBracketsByUf.mockResolvedValue([
      { uf: "SP", bracketOrder: 1, limitValue: 999999999, rate: 4 },
    ]);

    const caller = itcmdRouter.createCaller(adminCtx);
    const res = await caller.calculate({ uf: "SP", patrimony: 1_000_000 });

    expect(res.totalTax).toBe(40_000);
    expect(res.effectiveRate).toBe(4.0);
  });
});

