/**
 * @description Validação zod da ficha de detalhes da holding: campos opcionais,
 * conversão de texto vazio em null e enums de UF/tipo societário/regime.
 * @see server/features/companies/company-details.ts
 */
import { describe, expect, it } from "vitest";
import {
  companyDetailsUpsertSchema,
} from "./company-details";

const validPayload = {
  companyId: "hold-1",
  fields: {
    nire: "123",
    uf: "SP",
    sede: "São Paulo",
    societaryType: "LTDA",
    taxRegime: "LUCRO_PRESUMIDO",
    capitalSocial: 100000,
    shareQuantity: 1000,
    estimatedMarketValue: 250000,
    jurisdiction: null,
    companyNumber: null,
    notes: null,
  },
};

describe("companyDetailsUpsertSchema", () => {
  it("aceita a ficha completa com números e nulls", () => {
    const parsed = companyDetailsUpsertSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.fields.capitalSocial).toBe(100000);
  });

  it("recusa valores negativos e acima do teto de numeric(15,2)", () => {
    const withField = (fields: Record<string, unknown>) =>
      companyDetailsUpsertSchema.safeParse({ companyId: "hold-1", fields });

    expect(withField({ capitalSocial: -1 }).success).toBe(false);
    expect(withField({ equity: 10_000_000_000_000 }).success).toBe(false);
    expect(withField({ capitalSocial: 9_999_999_999_999.99 }).success).toBe(true);
    expect(withField({ capitalSocial: 0 }).success).toBe(true);
  });

  it("quantidade de quotas/ações: inteiro maior que zero", () => {
    const withShares = (shareQuantity: unknown) =>
      companyDetailsUpsertSchema.safeParse({ companyId: "hold-1", fields: { shareQuantity } });

    expect(withShares(1000).success).toBe(true);
    expect(withShares(null).success).toBe(true);
    expect(withShares(0).success).toBe(false);
    expect(withShares(-5).success).toBe(false);
    expect(withShares(10.5).success).toBe(false);
  });

  it("aceita campos omitidos (upsert parcial)", () => {
    const parsed = companyDetailsUpsertSchema.safeParse({
      companyId: "hold-1",
      fields: {},
    });
    expect(parsed.success).toBe(true);
  });

  it("transforma texto vazio em null e remove espaços", () => {
    const parsed = companyDetailsUpsertSchema.safeParse({
      companyId: "hold-1",
      fields: { sede: "  São Paulo  ", nire: "" },
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.fields.sede).toBe("São Paulo");
    expect(parsed.data.fields.nire).toBeNull();
  });

  it("rejeita texto acima do limite da coluna", () => {
    const parsed = companyDetailsUpsertSchema.safeParse({
      companyId: "hold-1",
      fields: { uf: "SÃO PAULO" },
    });
    expect(parsed.success).toBe(false);
  });

  it("rejeita jurisdição fora do droplist", () => {
    const parsed = companyDetailsUpsertSchema.safeParse({
      companyId: "hold-1",
      fields: { jurisdiction: "COSTA_RICA" },
    });
    expect(parsed.success).toBe(false);
  });

  it("rejeita valor não numérico em campo monetário", () => {
    const parsed = companyDetailsUpsertSchema.safeParse({
      companyId: "hold-1",
      fields: { capitalSocial: "muitos" },
    });
    expect(parsed.success).toBe(false);
  });

  it("exige companyId", () => {
    expect(companyDetailsUpsertSchema.safeParse({ fields: {} }).success).toBe(
      false
    );
  });

  it("rejeita tipo societário fora do enum", () => {
    const parsed = companyDetailsUpsertSchema.safeParse({
      companyId: "hold-1",
      fields: { societaryType: "EIRELI" },
    });
    expect(parsed.success).toBe(false);
  });

  it("rejeita regime tributário fora do enum", () => {
    const parsed = companyDetailsUpsertSchema.safeParse({
      companyId: "hold-1",
      fields: { taxRegime: "MEI" },
    });
    expect(parsed.success).toBe(false);
  });

  it("rejeita S/A com Simples Nacional (LC 123/2006, art. 3º, §4º)", () => {
    const parsed = companyDetailsUpsertSchema.safeParse({
      companyId: "hold-1",
      fields: { societaryType: "SA", taxRegime: "SIMPLES_NACIONAL" },
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.issues[0].message).toContain("Simples Nacional");
  });

  it("aceita S/A com Lucro Presumido e LTDA com Simples", () => {
    expect(
      companyDetailsUpsertSchema.safeParse({
        companyId: "hold-1",
        fields: { societaryType: "SA", taxRegime: "LUCRO_PRESUMIDO" },
      }).success
    ).toBe(true);
    expect(
      companyDetailsUpsertSchema.safeParse({
        companyId: "hold-1",
        fields: { societaryType: "LTDA", taxRegime: "SIMPLES_NACIONAL" },
      }).success
    ).toBe(true);
  });

  it("aceita administradores como membro da família (ID) ou terceiro (nome)", () => {
    const parsed = companyDetailsUpsertSchema.safeParse({
      companyId: "hold-1",
      fields: {
        administrator1PersonId: "person-123",
        administrator1: null,
        administrator2PersonId: null,
        administrator2: "Carlos Terceiro",
      },
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.fields.administrator1PersonId).toBe("person-123");
    expect(parsed.data.fields.administrator2).toBe("Carlos Terceiro");
  });
});

