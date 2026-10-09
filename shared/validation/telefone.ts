import { onlyDigits } from "./digitos";

/** Os 67 DDDs válidos do Brasil (Anatel) — nenhum começa com 0. */
export const DDDS_VALIDOS = [
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35,
  37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64,
  65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88,
  89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
] as const;

/** Normaliza telefone para somente dígitos (formato de gravação). */
export function normalizarTelefone(value: string): string {
  return onlyDigits(value);
}

/**
 * Valida telefone brasileiro: DDD válido + 8 dígitos (fixo) ou
 * 9 dígitos começando com 9 (celular). Aceita com máscara ou "+55".
 */
export function isTelefoneValido(value: string): boolean {
  let tel = onlyDigits(value);
  if (tel.length === 12 && tel.startsWith("55")) tel = tel.slice(2);
  if (tel.length === 13 && tel.startsWith("55")) tel = tel.slice(2);
  if (tel.length !== 10 && tel.length !== 11) return false;
  if (!(DDDS_VALIDOS as readonly number[]).includes(Number(tel.slice(0, 2)))) {
    return false;
  }
  if (tel.length === 11 && tel[2] !== "9") return false;
  return true;
}
