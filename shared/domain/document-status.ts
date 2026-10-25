/**
 * Fonte única da definição de "requisito resolvido" da matriz documental.
 * Resolvido = validado, dispensado ou marcado como "Não possui" — todas as
 * telas (Documentos e Certidões, Visão Unificada, timeline) usam esta função
 * para que os contadores nunca divirjam.
 */
export const RESOLVED_DOCUMENT_STATUSES = [
  "VALIDADO",
  "DISPENSADO",
  "NAO_POSSUI",
] as const;

export function isResolvedDocumentStatus(status: string): boolean {
  return (RESOLVED_DOCUMENT_STATUSES as readonly string[]).includes(status);
}
