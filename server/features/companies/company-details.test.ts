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
});
