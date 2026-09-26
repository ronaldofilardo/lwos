/**
 * @description Categorias de documentos por vínculo: cônjuge não recebe os
 * documentos do casal (certidão de casamento e comprovante de endereço).
 * @see server/features/documents/person-document-categories.ts
 */
import { describe, expect, it } from "vitest";
import {
  COUPLE_SHARED_CATEGORIES,
  documentCategoriesForVinculo,
  isCoupleSharedCategory,
} from "./person-document-categories";

describe("person-document-categories", () => {
  it("gera os cinco requisitos para o titular", () => {
    expect(documentCategoriesForVinculo("TITULAR")).toEqual([
      "IRPF",
      "CPF/RG ou CNH",
      "Certidão de casamento/UE",
      "Comprovante de endereço",
      "Passaporte",
    ]);
  });

  it("não gera documentos do casal para o cônjuge", () => {
    const categories = documentCategoriesForVinculo("CONJUGE");
    expect(categories).toEqual(["IRPF", "CPF/RG ou CNH", "Passaporte"]);
    expect(categories).not.toContain("Certidão de casamento/UE");
    expect(categories).not.toContain("Comprovante de endereço");
  });

  it("mantém documentos do casal para filhos e netos", () => {
    expect(documentCategoriesForVinculo("FILHO")).toContain(
      "Certidão de casamento/UE"
    );
    expect(documentCategoriesForVinculo("NETO")).toContain(
      "Comprovante de endereço"
    );
  });

  it("identifica as categorias compartilhadas do casal", () => {
    expect(isCoupleSharedCategory("Certidão de casamento/UE")).toBe(true);
    expect(isCoupleSharedCategory("Comprovante de endereço")).toBe(true);
    expect(isCoupleSharedCategory("IRPF")).toBe(false);
    expect(COUPLE_SHARED_CATEGORIES).toHaveLength(2);
  });
});
