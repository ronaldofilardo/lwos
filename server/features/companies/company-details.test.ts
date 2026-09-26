/**
 * @description Validação zod da ficha de detalhes da holding: campos opcionais,
 * conversão de texto vazio em null, jurisdição e documentos por variante.
 * @see server/features/companies/company-details.ts
 */
import { describe, expect, it } from "vitest";
import {
  companyDetailDocUpdateSchema,
  companyDetailsUpsertSchema,
  docTypesForCompanyType,
} from "./company-details";

const validPayload = {
  companyId: "hold-1",
  fields: {
    nire: "123",
    uf: "SP",
    sede: "São Paulo",
    capitalSocial: 100000,
    shareQuantity: 1000,
    estimatedMarketValue: 250000,
    jurisdiction: null,
    companyNumber: null,
    notes: null,
  },
  docs: [{ docType: "CONTRATO_SOCIAL", status: "RECEBIDO" }],
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

  it("rejeita status de documento fora do enum", () => {
    const parsed = companyDetailsUpsertSchema.safeParse({
      ...validPayload,
      docs: [{ docType: "CONTRATO_SOCIAL", status: "VALIDADO" }],
    });
    expect(parsed.success).toBe(false);
  });
});

describe("companyDetailDocUpdateSchema", () => {
  it("aceita docType e status válidos", () => {
    expect(
      companyDetailDocUpdateSchema.safeParse({
        companyId: "hold-1",
        docType: "BALANCE_SHEET",
        status: "NA",
      }).success
    ).toBe(true);
  });
});

describe("docTypesForCompanyType", () => {
  it("devolve os documentos internacionais apenas para a holding offshore", () => {
    expect(docTypesForCompanyType("HOLDING_INTERNACIONAL")).toContain(
      "SHARE_CERTIFICATE"
    );
    expect(docTypesForCompanyType("HOLDING_NACIONAL")).toContain(
      "CONTRATO_SOCIAL"
    );
    expect(docTypesForCompanyType("SOCIEDADE_NACIONAL")).toContain(
      "LIVRO_RAZAO_IMOBILIZADO"
    );
    expect(docTypesForCompanyType("HOLDING_NACIONAL")).not.toContain(
      "SHARE_CERTIFICATE"
    );
  });
});
