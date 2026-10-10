/**
 * @description Matriz pura de categorias por pessoa (Fase 8): estado civil
 * define o documento de união; cônjuge não recebe os documentos do casal.
 * @see server/features/documents/person-document-categories.ts
 */
import { describe, expect, it } from "vitest";
import {
  COUPLE_SHARED_CATEGORIES,
  computePersonCategories,
  isCoupleSharedCategory,
  unionDocForCivilStatus,
} from "./person-document-categories";

describe("person-document-categories", () => {
  it("gera os cinco requisitos do titular casado (com certidão de casamento)", () => {
    expect(
      computePersonCategories({ vinculo: "TITULAR", civilStatus: "CASADO" })
    ).toEqual([
      "IRPF",
      "CPF/RG ou CNH",
      "Certidão de casamento",
      "Comprovante de endereço",
      "Passaporte",
    ]);
  });

  it("exige escritura para união estável e averbação para divórcio/viuvez", () => {
    expect(
      computePersonCategories({
        vinculo: "FILHO",
        civilStatus: "UNIAO_ESTAVEL",
      })
    ).toContain("Escritura ou declaração de união estável");
    expect(
      computePersonCategories({ vinculo: "FILHO", civilStatus: "DIVORCIADO" })
    ).toContain("Certidão de casamento com averbação");
    expect(
      computePersonCategories({ vinculo: "FILHO", civilStatus: "VIUVO" })
    ).toContain("Certidão de casamento com averbação");
  });

  it("solteiro não tem documento de união", () => {
    const categories = computePersonCategories({
      vinculo: "FILHO",
      civilStatus: "SOLTEIRO",
    });
    expect(categories).toEqual([
      "IRPF",
      "CPF/RG ou CNH",
      "Comprovante de endereço",
      "Passaporte",
    ]);
  });

  it("não gera documentos do casal para o cônjuge", () => {
    const categories = computePersonCategories({
      vinculo: "CONJUGE",
      civilStatus: "CASADO",
    });
    expect(categories).toEqual(["IRPF", "CPF/RG ou CNH", "Passaporte"]);
    expect(categories).not.toContain("Certidão de casamento");
    expect(categories).not.toContain("Comprovante de endereço");
  });

  it("mantém documentos do casal para filhos e netos", () => {
    expect(
      computePersonCategories({ vinculo: "FILHO", civilStatus: "CASADO" })
    ).toContain("Certidão de casamento");
    expect(
      computePersonCategories({ vinculo: "NETO", civilStatus: "SOLTEIRO" })
    ).toContain("Comprovante de endereço");
  });

  it("identifica as categorias compartilhadas do casal", () => {
    expect(isCoupleSharedCategory("Certidão de casamento")).toBe(true);
    expect(
      isCoupleSharedCategory("Escritura ou declaração de união estável")
    ).toBe(true);
    expect(isCoupleSharedCategory("Certidão de casamento com averbação")).toBe(
      true
    );
    expect(isCoupleSharedCategory("Comprovante de endereço")).toBe(true);
    expect(isCoupleSharedCategory("IRPF")).toBe(false);
    expect(COUPLE_SHARED_CATEGORIES).toHaveLength(4);
  });

  it("resolve o documento de união pelo estado civil", () => {
    expect(unionDocForCivilStatus("CASADO")).toBe("Certidão de casamento");
    expect(unionDocForCivilStatus("SOLTEIRO")).toBeNull();
    expect(unionDocForCivilStatus(null)).toBeNull();
    expect(unionDocForCivilStatus(undefined)).toBeNull();
  });
});
