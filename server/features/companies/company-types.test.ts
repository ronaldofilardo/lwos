/**
 * @description Validação zod da criação de sociedade: CNPJ com DV obrigatório
 * para nacional, proibido para offshore e denominação mínima.
 * @see server/features/companies/company-types.ts
 */
import { describe, expect, it } from "vitest";
import { companyInputSchema } from "./company-types";

const VALID_CNPJ = "11222333000181";

describe("companyInputSchema", () => {
  it("aceita nacional com CNPJ válido", () => {
    const parsed = companyInputSchema.safeParse({
      familyId: "fam-1",
      legalName: "Holding Alpha",
      taxNumber: VALID_CNPJ,
      isOffshore: false,
    });
    expect(parsed.success).toBe(true);
  });

  it("recusa nacional sem CNPJ", () => {
    const parsed = companyInputSchema.safeParse({
      familyId: "fam-1",
      legalName: "Holding Alpha",
      isOffshore: false,
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.issues[0].message).toContain("Informe o CNPJ");
  });

  it("recusa nacional com CNPJ inválido (DV)", () => {
    const parsed = companyInputSchema.safeParse({
      familyId: "fam-1",
      legalName: "Holding Alpha",
      taxNumber: "11222333000182",
      isOffshore: false,
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.issues[0].message).toBe("CNPJ inválido.");
  });

  it("aceita offshore sem CNPJ", () => {
    const parsed = companyInputSchema.safeParse({
      familyId: "fam-1",
      legalName: "Offshore Ltd",
      isOffshore: true,
    });
    expect(parsed.success).toBe(true);
  });

  it("recusa offshore com CNPJ", () => {
    const parsed = companyInputSchema.safeParse({
      familyId: "fam-1",
      legalName: "Offshore Ltd",
      taxNumber: VALID_CNPJ,
      isOffshore: true,
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.issues[0].message).toContain("offshore não possui CNPJ");
  });

  it("recusa denominação curta", () => {
    expect(
      companyInputSchema.safeParse({
        familyId: "fam-1",
        legalName: "AB",
        taxNumber: VALID_CNPJ,
        isOffshore: false,
      }).success
    ).toBe(false);
  });
});
