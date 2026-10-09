import { onlyDigits } from "./digitos";

/** Normaliza CPF para somente dígitos (formato de gravação). */
export function normalizarCpf(value: string): string {
  return onlyDigits(value);
}

/**
 * Valida CPF pelo algoritmo oficial: 11 dígitos, dígitos verificadores
 * corretos e sem sequência repetida (111.111.111-11 é inválido).
 * Aceita entrada com máscara; a comparação é sempre por dígitos.
 */
export function isCpfValido(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i += 1) soma += Number(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i += 1) soma += Number(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === Number(cpf[10]);
}

/** Exibe CPF com máscara 000.000.000-00 (entrada já normalizada ou com máscara). */
export function mascaraCpf(value: string): string {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return cpf;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}
