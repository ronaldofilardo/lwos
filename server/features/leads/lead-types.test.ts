/**
 * @description Valida o schema público de criação de lead: o CPF é normalizado
 * e checado pelo núcleo (shared/validation) antes de chegar ao banco.
 * @see server/features/leads/lead-types.ts
 */
import { describe, expect, it } from "vitest";
import { leadCreateSchema } from "./lead-types";

const validLead = {
  fullName: "Interessado Teste",
  taxId: "529.982.247-25",
  email: "interessado@exemplo.com",
  birthDate: "1990-01-01",
  fileName: "identificacao.pdf",
  mimeType: "application/pdf",
  base64Data: "dGVzdA==",
};

describe("leadCreateSchema", () => {
  it("aceita CPF com máscara e grava somente dígitos", () => {
    const parsed = leadCreateSchema.parse(validLead);
    expect(parsed.taxId).toBe("52998224725");
  });

  it("rejeita CPF com dígito verificador errado", () => {
    const result = leadCreateSchema.safeParse({
      ...validLead,
      taxId: "52998224724",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita CPF de dígitos repetidos", () => {
    const result = leadCreateSchema.safeParse({
      ...validLead,
      taxId: "11111111111",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita CPF com letras (zero dígitos após normalizar)", () => {
    const result = leadCreateSchema.safeParse({
      ...validLead,
      taxId: "abcdefghijk",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita CPF curto", () => {
    const result = leadCreateSchema.safeParse({
      ...validLead,
      taxId: "1234567890",
    });
    expect(result.success).toBe(false);
  });
});
