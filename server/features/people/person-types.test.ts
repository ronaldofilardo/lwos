/**
 * @description Valida as regras de Fase 4 do personInputSchema: CPF/nascimento
 * obrigatórios e válidos, obrigatoriedades por vínculo (titular), menor de 18
 * anos sempre solteiro, endereço e regras condicionais de casamento.
 * @see server/features/people/person-types.ts
 */
import { describe, expect, it } from "vitest";
import { personInputSchema } from "./person-types";

const base = {
  familyId: "familia-1",
  fullName: "Maria Silva",
  email: "maria@example.com",
  taxId: "52998224725",
  birthDate: "1990-01-01",
  phone: "11999998888",
  city: "São Paulo",
  uf: "SP" as const,
};

describe("personInputSchema", () => {
  it("aceita titular casado com regime, cônjuge, telefone e endereço", () => {
    const parsed = personInputSchema.parse({
      ...base,
      vinculo: "TITULAR",
      civilStatus: "CASADO",
      maritalRegime: "CPB",
      spouseName: "João Silva",
    });
    expect(parsed.taxId).toBe("52998224725");
    expect(parsed.phone).toBe("11999998888");
    expect(parsed.vinculo).toBe("TITULAR");
  });

  it("normaliza CPF com máscara para dígitos", () => {
    const parsed = personInputSchema.parse({
      ...base,
      taxId: "529.982.247-25",
      vinculo: "FILHO",
      civilStatus: "SOLTEIRO",
    });
    expect(parsed.taxId).toBe("52998224725");
  });

  it("recusa CPF inválido", () => {
    expect(() =>
      personInputSchema.parse({
        ...base,
        taxId: "11122233344",
        vinculo: "FILHO",
        civilStatus: "SOLTEIRO",
      })
    ).toThrow(/CPF/);
  });

  it("recusa telefone fora do formato DDD + número", () => {
    expect(() =>
      personInputSchema.parse({
        ...base,
        phone: "123",
        vinculo: "FILHO",
        civilStatus: "SOLTEIRO",
      })
    ).toThrow(/Telefone/);
  });

  it("recusa data de nascimento futura ou inválida", () => {
    expect(() =>
      personInputSchema.parse({ ...base, birthDate: "2999-01-01", vinculo: "FILHO", civilStatus: "SOLTEIRO" })
    ).toThrow(/nascimento/);
    expect(() =>
      personInputSchema.parse({ ...base, birthDate: "1990-02-30", vinculo: "FILHO", civilStatus: "SOLTEIRO" })
    ).toThrow(/nascimento/);
  });

  it("exige e-mail e telefone para o titular", () => {
    expect(() =>
      personInputSchema.parse({
        ...base,
        email: "",
        phone: "",
        vinculo: "TITULAR",
        civilStatus: "SOLTEIRO",
      })
    ).toThrow();
  });

  it("aceita filho solteiro sem regime nem cônjuge", () => {
    const parsed = personInputSchema.parse({
      ...base,
      vinculo: "FILHO",
      civilStatus: "SOLTEIRO",
    });
    expect(parsed.maritalRegime).toBeUndefined();
    expect(parsed.spouseName).toBeUndefined();
  });

  it("exige cidade e UF quando o endereço não é o do titular", () => {
    expect(() =>
      personInputSchema.parse({
        ...base,
        city: "",
        uf: undefined,
        vinculo: "FILHO",
        civilStatus: "SOLTEIRO",
      })
    ).toThrow(/cidade e a UF/);
  });

  it("aceita endereço do titular referenciado sem cidade/UF próprias", () => {
    const parsed = personInputSchema.parse({
      ...base,
      city: "",
      uf: undefined,
      addressSameAsPrimary: true,
      vinculo: "FILHO",
      civilStatus: "SOLTEIRO",
    });
    expect(parsed.addressSameAsPrimary).toBe(true);
  });

  it("força solteiro para menor de 18 anos e recusa estado civil casado", () => {
    const hoje = new Date();
    const menorAno = hoje.getFullYear() - 10;
    const minorBirth = `${menorAno}-06-15`;
    expect(() =>
      personInputSchema.parse({
        ...base,
        birthDate: minorBirth,
        vinculo: "FILHO",
        civilStatus: "CASADO",
        maritalRegime: "CPB",
        spouseName: "Alguém",
      })
    ).toThrow(/solteiros/);
    const parsed = personInputSchema.parse({
      ...base,
      birthDate: minorBirth,
      vinculo: "FILHO",
      civilStatus: "SOLTEIRO",
    });
    expect(parsed.civilStatus).toBe("SOLTEIRO");
  });

  it("exige pai/mãe para neto e bisneto", () => {
    expect(() =>
      personInputSchema.parse({ ...base, vinculo: "NETO", civilStatus: "SOLTEIRO" })
    ).toThrow(/filho\(a\) como pai\/mãe/);
    expect(() =>
      personInputSchema.parse({ ...base, vinculo: "BISNETO", civilStatus: "SOLTEIRO" })
    ).toThrow(/neto\(a\) como pai\/mãe/);
  });

  it("aceita neto com pai FILHO e casado com regime e cônjuge", () => {
    const parsed = personInputSchema.parse({
      ...base,
      vinculo: "NETO",
      parentPersonId: "pessoa-filho",
      civilStatus: "UNIAO_ESTAVEL",
      maritalRegime: "STB",
      spouseName: "Ana Souza",
    });
    expect(parsed.parentPersonId).toBe("pessoa-filho");
  });

  it("exige regime e nome do cônjuge quando casado", () => {
    expect(() =>
      personInputSchema.parse({
        ...base,
        vinculo: "FILHO",
        civilStatus: "CASADO",
      })
    ).toThrow();
  });

  it("aceita cônjuge sem estado civil nem regime (preenchidos no servidor), com CPF e nascimento", () => {
    const parsed = personInputSchema.parse({
      ...base,
      taxId: "11144477735",
      vinculo: "CONJUGE",
    });
    expect(parsed.civilStatus).toBeUndefined();
    expect(parsed.maritalRegime).toBeUndefined();
  });

  it("exige estado civil para filhos", () => {
    expect(() =>
      personInputSchema.parse({ ...base, vinculo: "FILHO" })
    ).toThrow(/estado civil/);
  });

  it("impede o titular de ser marcado como dependente", () => {
    expect(() =>
      personInputSchema.parse({
        ...base,
        vinculo: "TITULAR",
        civilStatus: "CASADO",
        maritalRegime: "CPB",
        spouseName: "João Silva",
        isDependent: true,
      })
    ).toThrow(/titular não pode ser marcado como dependente/);
  });

  it("aceita filho marcado como dependente", () => {
    const parsed = personInputSchema.parse({
      ...base,
      vinculo: "FILHO",
      civilStatus: "SOLTEIRO",
      isDependent: true,
    });
    expect(parsed.isDependent).toBe(true);
  });
});
