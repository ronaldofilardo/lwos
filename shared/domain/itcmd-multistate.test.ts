import { describe, expect, it } from "vitest";
import {
  computeMultiStateSuccessionTax,
  computePropertyIndividualItcmd,
} from "./itcmd-multistate";

describe("itcmd-multistate", () => {
  it("calcula o ITCMD individual do imóvel pela UF de situação", () => {
    // Imóvel no RJ: R$ 300.000 (tributado a 4%)
    const rjRes = computePropertyIndividualItcmd(
      { marketValue: 300000, uf: "RJ" },
      "SP"
    );
    expect(rjRes.uf).toBe("RJ");
    expect(rjRes.tax).toBe(12000);

    // Imóvel em SP: R$ 1.000.000 (tributado a 4% fixo)
    const spRes = computePropertyIndividualItcmd(
      { marketValue: 1000000, uf: "SP" },
      "RJ"
    );
    expect(spRes.uf).toBe("SP");
    expect(spRes.tax).toBe(40000);
  });

  it("consolida patrimônio familiar multi-estado conforme Art. 155 da CF", () => {
    // Família domiciliada em SP:
    // - Imóvel em SP: R$ 1.000.000 (4% = 40.000)
    // - Imóvel no RJ: R$ 300.000 (4% = 12.000)
    // - Cotas de Holding e Demais Ativos: R$ 2.000.000 (no domicílio SP @ 4% = 80.000)
    // Total = 40.000 (SP) + 12.000 (RJ) + 80.000 (SP) = 132.000 sobre R$ 3.300.000 (4%)
    const res = computeMultiStateSuccessionTax(
      [
        { id: "p1", description: "Apto SP", marketValue: 1000000, uf: "SP" },
        { id: "p2", description: "Apto RJ", marketValue: 300000, uf: "RJ" },
      ],
      2000000,
      "SP"
    );

    expect(res.totalPatrimony).toBe(3300000);
    expect(res.totalTax).toBe(132000);
    expect(res.effectiveRate).toBe(4.0);
    expect(res.byState).toHaveLength(3);

    const spImovel = res.byState.find(s => s.uf === "SP" && s.scope.includes("imóvel"));
    expect(spImovel?.taxAmount).toBe(40000);

    const rjImovel = res.byState.find(s => s.uf === "RJ");
    expect(rjImovel?.taxAmount).toBe(12000);

    const mobile = res.byState.find(s => s.scope.includes("Sociedades"));
    expect(mobile?.taxAmount).toBe(80000);
  });
});

