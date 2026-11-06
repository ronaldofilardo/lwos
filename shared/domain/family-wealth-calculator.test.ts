/**
 * @description Agregação patrimonial (aba «Cálculos»): visão dos Patriarcas,
 * patrimônio por membro, valor de mercado da sociedade com os imóveis da PJ e
 * quadro «Totais por Proprietário» ponderado pela cota-parte.
 * @see shared/domain/family-wealth-calculator.ts
 */
import { describe, expect, it } from "vitest";
import {
  computeCompanyMarketValues,
  computeCompanyPropertyValues,
  computeMembersWealth,
  computePatriarchWealth,
  computePropertyOwnerTotals,
  isPatriarch,
  shareOfValue,
  type WealthInput,
} from "./family-wealth-calculator";

const input: WealthInput = {
  people: [
    { id: "p1", fullName: "Titular", vinculo: "TITULAR", isPrimaryContact: true },
    { id: "p2", fullName: "Cônjuge", vinculo: "CONJUGE" },
    { id: "p3", fullName: "Filho", vinculo: "FILHO" },
  ],
  properties: [
    {
      id: "prop1",
      marketValue: "1000000.00",
      irpfBalanceValue: "500000.00",
      rentValue: "5000.00",
      utility: "LOCACAO_ARRENDAMENTO",
      itbiRate: "2.00",
      emolumentsValue: "10000.00",
      hasLaudemio: false,
    },
    { id: "prop2", marketValue: 400_000 },
    { id: "prop3", marketValue: 300_000 },
  ],
  owners: [
    { propertyId: "prop1", personId: "p1", ownershipPercentage: "50.00" },
    { propertyId: "prop1", personId: "p2", ownershipPercentage: "50.00" },
    { propertyId: "prop2", companyId: "c1", ownershipPercentage: "100.00" },
    { propertyId: "prop3", personId: "p3", ownershipPercentage: "100.00" },
  ],
  companies: [
    {
      id: "c1",
      legalName: "Holding",
      cashAndEquivalents: "100000.00",
      inventory: null,
      accountsReceivable: null,
      investments: null,
      fixedAssets: null,
      retainedEarnings: null,
      taxLiabilities: null,
      laborLiabilities: null,
      financing: null,
    },
  ],
  shares: [
    { companyId: "c1", personId: "p1", percentage: "60.00" },
    { companyId: "c1", personId: "p2", percentage: "40.00" },
  ],
  assets: [
    { ownerPersonId: "p1", declaredValue: "50000.00" },
    { ownerPersonId: "p3", declaredValue: "20000.00" },
  ],
};

describe("family-wealth-calculator — patriarcas", () => {
  it("reconhece titular, cônjuge e contato principal", () => {
    expect(isPatriarch({ id: "a", fullName: "A", vinculo: "TITULAR" })).toBe(true);
    expect(isPatriarch({ id: "b", fullName: "B", vinculo: "CONJUGE" })).toBe(true);
    expect(isPatriarch({ id: "c", fullName: "C", isPrimaryContact: true })).toBe(true);
  });

  it("exclui filhos, netos, bisnetos e pessoas sem vínculo", () => {
    expect(isPatriarch({ id: "d", fullName: "D", vinculo: "FILHO" })).toBe(false);
    expect(isPatriarch({ id: "e", fullName: "E", vinculo: "NETO" })).toBe(false);
    expect(isPatriarch({ id: "f", fullName: "F", vinculo: "BISNETO" })).toBe(false);
    expect(isPatriarch({ id: "g", fullName: "G", vinculo: null })).toBe(false);
  });

  it("soma o patrimônio dos patriarcas pela cota-parte", () => {
    expect(computePatriarchWealth(input)).toEqual({
      properties: 1_000_000,
      companies: 500_000,
      otherAssets: 50_000,
      total: 1_550_000,
    });
  });

  it("não soma nada quando a família não tem patriarca", () => {
    expect(
      computePatriarchWealth({
        ...input,
        people: [{ id: "p3", fullName: "Filho", vinculo: "FILHO" }],
      })
    ).toEqual({ properties: 0, companies: 0, otherAssets: 0, total: 0 });
  });

  it("trata casos de borda com shares sem sócio, empresas nulas e ativos sem valor", () => {
    const result = computePatriarchWealth({
      people: [{ id: "p1", fullName: "Titular", vinculo: "TITULAR" }],
      properties: [{ id: "prop1", marketValue: 100_000 }],
      owners: [
        { propertyId: "prop1", personId: "p1", ownershipPercentage: 50 },
        { propertyId: null, personId: "p1", ownershipPercentage: 50 },
        { propertyId: "prop1", personId: null, companyId: "c1", ownershipPercentage: 50 },
        { propertyId: "inexistente", personId: "p1", ownershipPercentage: 50 },
      ],
      companies: [],
      shares: [
        { companyId: "c_unknown", personId: "p1", percentage: 50 },
        { companyId: "c_unknown", personId: null, percentage: 50 },
      ],
      assets: [{ ownerPersonId: "p1", declaredValue: null }],
    });
    expect(result.properties).toBe(50_000);
    expect(result.companies).toBe(0);
    expect(result.otherAssets).toBe(0);
  });
});

describe("family-wealth-calculator — por membro", () => {
  it("lista todos os membros na ordem recebida", () => {
    const rows = computeMembersWealth(input);
    expect(rows.map(row => row.personName)).toEqual(["Titular", "Cônjuge", "Filho"]);
    expect(rows[0]).toEqual({
      personId: "p1",
      personName: "Titular",
      properties: 500_000,
      companies: 300_000,
      otherAssets: 50_000,
      total: 850_000,
    });
    expect(rows[1].total).toBe(700_000);
    expect(rows[2].total).toBe(320_000);
  });

  it("tolera ativos com valor nulo, sociedades desconhecidas e imóveis ausentes", () => {
    const rows = computeMembersWealth({
      people: [{ id: "p1", fullName: "Membro" }],
      properties: [],
      owners: [
        { propertyId: "inexistente", personId: "p1", ownershipPercentage: 100 },
        { propertyId: null, personId: "p1", ownershipPercentage: 100 },
      ],
      companies: [],
      shares: [{ companyId: "c_inexistente", personId: "p1", percentage: 50 }],
      assets: [{ ownerPersonId: "p1", declaredValue: null }],
    });
    expect(rows[0].total).toBe(0);

    const totals = computePropertyOwnerTotals({
      people: [{ id: "p1", fullName: "Membro" }],
      properties: [],
      owners: [
        { propertyId: "inexistente", personId: "p1", ownershipPercentage: 100 },
        { propertyId: null, personId: "p1", ownershipPercentage: 100 },
      ],
    });
    expect(totals[0].marketValue).toBe(0);
  });

  it("retorna 0 para valor de mercado de empresa vazia sem imóveis", () => {
    const values = computeCompanyMarketValues(
      [{ id: "c_vazia", legalName: "Vazia", propertyValue: 0 }],
      [],
      []
    );
    expect(values.get("c_vazia")).toBe(0);
  });
});

describe("family-wealth-calculator — sociedades com imóveis", () => {
  it("pondera o imóvel pela participação da sociedade", () => {
    expect([...computeCompanyPropertyValues(input.properties, input.owners)]).toEqual([
      ["c1", 400_000],
    ]);
    expect(
      computeCompanyPropertyValues(
        input.properties,
        [{ propertyId: "prop2", companyId: "c1", ownershipPercentage: "40.00" }]
      ).get("c1")
    ).toBe(160_000);
  });

  it("soma balanço apurado + imóveis da PJ no valor de mercado", () => {
    expect(computeCompanyMarketValues(input.companies, input.properties, input.owners).get("c1")).toBe(
      500_000
    );
  });

  it("ignora donos sem empresa ou com imóvel desconhecido", () => {
    const res = computeCompanyPropertyValues(
      [{ id: "prop1", marketValue: 100_000 }],
      [
        { propertyId: "prop1", personId: "p1", ownershipPercentage: 100 },
        { propertyId: "prop_inexistente", companyId: "c1", ownershipPercentage: 100 },
      ]
    );
    expect(res.size).toBe(0);
  });
});

describe("family-wealth-calculator — totais por proprietário", () => {
  it("pondera as 4 colunas pela cota de cada titular", () => {
    const rows = computePropertyOwnerTotals(input);
    expect(rows[0]).toEqual({
      personId: "p1",
      personName: "Titular",
      irpfValue: 250_000,
      marketValue: 500_000,
      monthlyRent: 2_500,
      integralizationCost: 15_000,
    });
    expect(rows[1]).toEqual({ ...rows[0], personId: "p2", personName: "Cônjuge" });
    expect(rows[2]).toEqual({
      personId: "p3",
      personName: "Filho",
      irpfValue: 0,
      marketValue: 300_000,
      monthlyRent: 0,
      integralizationCost: 0,
    });
  });

  it("arredonda a cota-parte em centavos", () => {
    expect(shareOfValue(100, 33.33)).toBe(33.33);
    expect(shareOfValue(null, 50)).toBe(0);
    expect(shareOfValue("1000.00", "12.50")).toBe(125);
  });
});
