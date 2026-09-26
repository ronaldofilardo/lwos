/**
 * @description Valida regras condicionais de vínculo familiar (pai/mãe para
 * neto/bisneto, estado civil e regime/cônjuge quando casado ou união estável).
 * @see server/features/people/person-types.ts
 */
import { describe, expect, it } from "vitest";
import { personInputSchema } from "./person-types";

const base = {
  familyId: "familia-1",
  fullName: "Maria Silva",
  email: "maria@example.com",
  taxId: "11122233344",
  birthDate: "1990-01-01",
};

describe("personInputSchema", () => {
  it("aceita titular casado com regime e cônjuge", () => {
    const parsed = personInputSchema.parse({
      ...base,
      vinculo: "TITULAR",
      civilStatus: "CASADO",
      maritalRegime: "CPB",
      spouseName: "João Silva",
    });
    expect(parsed.vinculo).toBe("TITULAR");
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

  it("exige pai/mãe para neto", () => {
    expect(() =>
      personInputSchema.parse({
        ...base,
        vinculo: "NETO",
        civilStatus: "SOLTEIRO",
      })
    ).toThrow(/filho\(a\) como pai\/mãe/);
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

  it("exige pai/mãe para bisneto", () => {
    expect(() =>
      personInputSchema.parse({
        ...base,
        vinculo: "BISNETO",
        civilStatus: "SOLTEIRO",
      })
    ).toThrow(/neto\(a\) como pai\/mãe/);
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

  it("aceita cônjuge sem estado civil nem regime (preenchidos no servidor)", () => {
    const parsed = personInputSchema.parse({ ...base, vinculo: "CONJUGE" });
    expect(parsed.civilStatus).toBeUndefined();
    expect(parsed.maritalRegime).toBeUndefined();
  });

  it("exige estado civil para filhos", () => {
    expect(() =>
      personInputSchema.parse({ ...base, vinculo: "FILHO" })
    ).toThrow(/estado civil/);
  });
});
