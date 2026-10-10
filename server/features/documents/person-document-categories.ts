/**
 * Requisitos documentais por pessoa (matriz pura, Fase 8) e categorias
 * compartilhadas do casal. O casal (titular + cônjuge) NÃO precisa anexar
 * duas vezes os documentos domésticos — só o titular apresenta; o cônjuge
 * não recebe a solicitação.
 */

/** Documento de união exigido conforme o estado civil da pessoa. */
export const UNION_DOC_BY_STATUS: Record<string, string> = {
  CASADO: "Certidão de casamento",
  UNIAO_ESTAVEL: "Escritura ou declaração de união estável",
  DIVORCIADO: "Certidão de casamento com averbação",
  VIUVO: "Certidão de casamento com averbação",
};

/** Todos os documentos de união possíveis (casal compartilha todos). */
export const UNION_DOC_CATEGORIES = [
  "Certidão de casamento",
  "Escritura ou declaração de união estável",
  "Certidão de casamento com averbação",
] as const;

/** Categorias base sempre exigidas de qualquer pessoa. */
export const PERSON_BASE_CATEGORIES = [
  "IRPF",
  "CPF/RG ou CNH",
  "Comprovante de endereço",
  "Passaporte",
] as const satisfies readonly string[];

/** Documentos do casal: solicitados apenas uma vez (titular). */
export const COUPLE_SHARED_CATEGORIES = [
  ...UNION_DOC_CATEGORIES,
  "Comprovante de endereço",
] as const satisfies readonly string[];

export function isCoupleSharedCategory(category: string): boolean {
  return (COUPLE_SHARED_CATEGORIES as readonly string[]).includes(category);
}

export function unionDocForCivilStatus(
  civilStatus: string | null | undefined
): string | null {
  if (!civilStatus) return null;
  return UNION_DOC_BY_STATUS[civilStatus] ?? null;
}

/**
 * Matriz pura de categorias para uma pessoa. A ordem é a ordem de exibição:
 * IRPF, documento de identificação, documento de união (quando aplicável),
 * comprovante de endereço e passaporte. Cônjuge do titular não recebe os
 * documentos do casal (titular é quem apresenta).
 */
export function computePersonCategories(person: {
  vinculo: string | null | undefined;
  civilStatus?: string | null;
}): string[] {
  const unionDoc = unionDocForCivilStatus(person.civilStatus);
  const categories: string[] = ["IRPF", "CPF/RG ou CNH"];
  if (unionDoc) categories.push(unionDoc);
  categories.push("Comprovante de endereço", "Passaporte");

  if (person.vinculo === "CONJUGE") {
    return categories.filter(category => !isCoupleSharedCategory(category));
  }
  return categories;
}
