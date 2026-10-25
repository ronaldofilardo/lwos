/**
 * @description Quais documentos da sociedade exigem data-base no envio:
 * balanço fechado, balancete e Balance Sheet (offshore) — só de SOCIEDADE.
 * @see shared/domain/balance-documents.ts
 */
import { describe, expect, it } from "vitest";
import { requiresReferenceDate } from "./balance-documents";

describe("requiresReferenceDate", () => {
  it("exige data-base em balanço, balancete e Balance Sheet de sociedade", () => {
    for (const category of ["Balanço Fechado", "Balancete Atualizado", "Balance Sheet"]) {
      expect(requiresReferenceDate({ entityType: "SOCIEDADE", category })).toBe(true);
    }
  });

  it("não exige para outras categorias da sociedade", () => {
    expect(
      requiresReferenceDate({ entityType: "SOCIEDADE", category: "Contrato Social Consolidado" })
    ).toBe(false);
  });

  it("não exige para a mesma categoria em outra entidade ou sem dados", () => {
    expect(requiresReferenceDate({ entityType: "PESSOA", category: "Balanço Fechado" })).toBe(false);
    expect(requiresReferenceDate({})).toBe(false);
    expect(requiresReferenceDate({ entityType: "SOCIEDADE", category: null })).toBe(false);
  });
});
