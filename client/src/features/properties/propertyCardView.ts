import {
  encumbranceSeverity,
  encumbranceTypeLabels,
  type EncumbranceSeverity,
  type EncumbranceType,
} from "./types";

type MoneyInput = string | number | null | undefined;

/** «R$ 1.234,56» a partir do decimal vindo do banco (string) ou número. */
export function formatBRL(value: MoneyInput): string | null {
  if (value === null || value === undefined || value === "") return null;
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  return `R$ ${amount.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export type PropertyValueLine = {
  key: "irpf" | "mercado" | "venal";
  label: string;
  value: string;
};

/**
 * Linhas de valores do cartão do imóvel, na ordem do plano (5.7):
 * IRPF/balanço, mercado, venal. Valor ausente não gera linha.
 */
export function buildPropertyValueLines(property: {
  irpfBalanceValue?: MoneyInput;
  marketValue?: MoneyInput;
  venalValue?: MoneyInput;
}): PropertyValueLine[] {
  const candidates: Array<[PropertyValueLine["key"], string, MoneyInput]> = [
    ["irpf", "Valor IRPF/balanço", property.irpfBalanceValue],
    ["mercado", "Valor de mercado", property.marketValue],
    ["venal", "Valor venal", property.venalValue],
  ];
  const lines: PropertyValueLine[] = [];
  for (const [key, label, raw] of candidates) {
    const value = formatBRL(raw);
    if (value) lines.push({ key, label, value });
  }
  return lines;
}

export type EncumbranceView = {
  severity: EncumbranceSeverity | null;
  statusLabel: string;
  note: string | null;
};

/** Status do gravame + observação em texto próprio (seção «Gravames»). */
export function buildEncumbranceView(
  type: string | null | undefined,
  note: string | null | undefined
): EncumbranceView {
  const severity = encumbranceSeverity(type);
  const statusLabel = severity
    ? (encumbranceTypeLabels[type as EncumbranceType] ?? String(type))
    : "Sem gravame informado";
  const trimmed = note?.trim();
  return { severity, statusLabel, note: trimmed ? trimmed : null };
}
