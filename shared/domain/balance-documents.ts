/**
 * Documentos de balanço da sociedade (Matriz Documental). Fonte única para
 * servidor e cliente: o envio desses documentos exige a data-base.
 */

/** Sociedade nacional: balanço fechado e balancete atualizado. */
export const COMPANY_BALANCE_CATEGORIES = [
  "Balanço Fechado",
  "Balancete Atualizado",
] as const;

/** Sociedade offshore: o balanço é o "Balance Sheet". */
export const OFFSHORE_BALANCE_CATEGORY = "Balance Sheet";

export const BALANCE_DOCUMENT_CATEGORIES: readonly string[] = [
  ...COMPANY_BALANCE_CATEGORIES,
  OFFSHORE_BALANCE_CATEGORY,
];

/** O documento é balanço/balancete de sociedade e, portanto, exige data-base no envio. */
export function requiresReferenceDate(document: {
  entityType?: string | null;
  category?: string | null;
}): boolean {
  return (
    document.entityType === "SOCIEDADE" &&
    BALANCE_DOCUMENT_CATEGORIES.includes(document.category ?? "")
  );
}
