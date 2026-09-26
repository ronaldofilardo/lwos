import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma data "somente calendário" (YYYY-MM-DD, sem hora) pro padrão
 * brasileiro SEM passar por `new Date(...)`. `new Date("1985-02-08")` é
 * interpretado como meia-noite UTC, e `.toLocaleDateString()` depois
 * renderiza no fuso local — em horários UTC-3 (Brasil) isso sempre mostra
 * um dia a menos (ex: nascimento 08/02 aparecendo como 07/02). Usado pra
 * datas de nascimento e outros campos "date" (sem componente de hora).
 */
export function formatDateOnlyBR(value: string | null | undefined): string {
  if (!value) return "";
  const [yyyy, mm, dd] = value.slice(0, 10).split("-");
  if (!yyyy || !mm || !dd) return value;
  return `${dd}/${mm}/${yyyy}`;
}
