/** Mantém só dígitos — CPF/CNPJ/telefone normalizados para gravação e comparação. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}
