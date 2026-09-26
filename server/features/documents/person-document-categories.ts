/**
 * Requisitos documentais por pessoa e categorias compartilhadas do casal.
 * O casal (titular + cônjuge) NÃO precisa anexar duas vezes os documentos
 * domésticos — só o titular apresenta; o cônjuge não recebe a solicitação.
 */
export const PERSON_DOCUMENT_CATEGORIES = [
  "IRPF",
  "CPF/RG ou CNH",
  "Certidão de casamento/UE",
  "Comprovante de endereço",
  "Passaporte",
] as const;

/** Documentos do casal: solicitados apenas uma vez (titular). */
export const COUPLE_SHARED_CATEGORIES = [
  "Certidão de casamento/UE",
  "Comprovante de endereço",
] as const satisfies readonly string[];

export type PersonDocumentCategory =
  (typeof PERSON_DOCUMENT_CATEGORIES)[number];

export function isCoupleSharedCategory(category: string): boolean {
  return (COUPLE_SHARED_CATEGORIES as readonly string[]).includes(category);
}

/**
 * Categorias a criar para uma pessoa. Cônjuge do titular não recebe os
 * documentos do casal (titular é quem apresenta).
 */
export function documentCategoriesForVinculo(
  vinculo: string | null | undefined
): PersonDocumentCategory[] {
  if (vinculo === "CONJUGE") {
    return PERSON_DOCUMENT_CATEGORIES.filter(
      category => !isCoupleSharedCategory(category)
    );
  }
  return [...PERSON_DOCUMENT_CATEGORIES];
}
