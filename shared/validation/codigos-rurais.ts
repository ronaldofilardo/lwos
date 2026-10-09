/**
 * Tamanhos dos códigos rurais — TAMANHOS PROVISÓRIOS, a confirmar com
 * Jurídico/oficial antes da Fase 5 (não inventar dígito verificador:
 * validação é por dígitos e tamanho, conforme planejado).
 */
export const TAMANHO_NIRF = 13;
export const TAMANHO_CCIR = 13;

/** Valida código rural (NIRF/CCIR): só dígitos (aceita separadores comuns) e tamanho exato configurável. */
export function isCodigoRuralValido(valor: string, tamanho: number): boolean {
  const limpo = valor.trim().replace(/[\s.\-/]/g, "");
  return /^\d+$/.test(limpo) && limpo.length === tamanho;
}
