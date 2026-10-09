import { onlyDigits } from "./digitos";

/** Normaliza CNPJ para somente dígitos (formato de gravação). */
export function normalizarCnpj(value: string): string {
  return onlyDigits(value);
}

const PESOS_DV1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
const PESOS_DV2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;

function digitoVerificador(base: string, pesos: readonly number[]): number {
  const soma = base
    .split("")
    .reduce((acc, digito, i) => acc + Number(digito) * (pesos[i] ?? 0), 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

/**
 * Valida CNPJ pelo algoritmo oficial: 14 dígitos, dois dígitos verificadores
 * (pesos 5432-9876-5432 e 6543-2987-6543) e sem sequência repetida.
 * Aceita entrada com máscara; a comparação é sempre por dígitos.
 */
export function isCnpjValido(value: string): boolean {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const base = cnpj.slice(0, 12);
  const dv1 = digitoVerificador(base, PESOS_DV1);
  if (dv1 !== Number(cnpj[12])) return false;

  const dv2 = digitoVerificador(`${base}${dv1}`, PESOS_DV2);
  return dv2 === Number(cnpj[13]);
}

/** Exibe CNPJ com máscara 00.000.000/0000-00 (entrada já normalizada ou com máscara). */
export function mascaraCnpj(value: string): string {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14) return cnpj;
  return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
}
