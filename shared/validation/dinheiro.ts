/**
 * Teto de numeric(15,2): 13 dígitos inteiros + 2 decimais (precisão 15 menos
 * escala 2). O valor anterior tinha 15 inteiros e deixava passar números que
 * o banco recusava.
 */
export const MAX_DINHEIRO = 9_999_999_999_999.99;

/**
 * Parse de valor monetário/percentual no padrão pt-BR: "1.500" → 1500,
 * "1.500,50" → 1500.5, "0,5" → 0.5. Ponto só é milhar quando o grupo
 * seguinte tem exatamente 3 dígitos ("1.5" é decimal). Aceita prefixo
 * "R$"; rejeita vazio, letras, negativo e múltiplas vírgulas.
 */
export function parseNumeroPtBR(valor: string): number | null {
  const limpo = valor.trim().replace(/^R\$\s*/i, "");
  if (!limpo) return null;

  let normalizado: string;
  if (limpo.includes(",")) {
    if ((limpo.match(/,/g) ?? []).length > 1) return null;
    normalizado = limpo.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(limpo)) {
    normalizado = limpo.replace(/\./g, "");
  } else {
    normalizado = limpo;
  }

  if (!/^\d+(\.\d+)?$/.test(normalizado)) return null;
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : null;
}

/** Formata valor no padrão pt-BR com 2 casas: 1500.5 → "1.500,50". */
export function formatarNumeroPtBR(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Formata dinheiro com 2 casas decimais (armazenado em numeric(15,2)). */
export function formatarDinheiro(valor: number): string {
  return formatarNumeroPtBR(valor);
}

/** Faixa de numeric(15,2): não negativo e até 13 dígitos inteiros. */
export function isDinheiroValido(valor: number): boolean {
  return Number.isFinite(valor) && valor >= 0 && valor <= MAX_DINHEIRO;
}

/** Parse de percentual pt-BR com faixa 0–100; rejeita fora da faixa. */
export function parsePercentual(valor: string): number | null {
  const numero = parseNumeroPtBR(valor);
  if (numero === null || numero < 0 || numero > 100) return null;
  return numero;
}

/** Formata percentual com 2 casas decimais: 50.5 → "50,50". */
export function formatarPercentual(valor: number): string {
  return formatarNumeroPtBR(valor);
}

/** Faixa de percentual: 0 a 100, com 2 casas. */
export function isPercentualValido(valor: number): boolean {
  return Number.isFinite(valor) && valor >= 0 && valor <= 100;
}
