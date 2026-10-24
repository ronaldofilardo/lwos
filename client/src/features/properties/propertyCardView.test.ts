import { describe, expect, it } from "vitest";
import {
  buildEncumbranceView,
  buildPropertyValueLines,
  formatBRL,
} from "./propertyCardView";

describe("formatBRL", () => {
  it("formata decimal do banco no padrão pt-BR", () => {
    expect(formatBRL("1500000.00")).toBe("R$ 1.500.000,00");
    expect(formatBRL(1200.5)).toBe("R$ 1.200,50");
  });

  it("mostra zero (valor informado) e esconde ausente/inválido", () => {
    expect(formatBRL("0.00")).toBe("R$ 0,00");
    expect(formatBRL(null)).toBeNull();
    expect(formatBRL(undefined)).toBeNull();
    expect(formatBRL("")).toBeNull();
    expect(formatBRL("abc")).toBeNull();
  });
});

describe("buildPropertyValueLines (item 5.7)", () => {
  it("devolve IRPF/balanço, mercado e venal, nessa ordem", () => {
    const lines = buildPropertyValueLines({
      venalValue: "1200000.00",
      marketValue: "1500000.00",
      irpfBalanceValue: "1000000.00",
    });
    expect(lines.map(l => l.key)).toEqual(["irpf", "mercado", "venal"]);
    expect(lines.map(l => `${l.label}: ${l.value}`)).toEqual([
      "Valor IRPF/balanço: R$ 1.000.000,00",
      "Valor de mercado: R$ 1.500.000,00",
      "Valor venal: R$ 1.200.000,00",
    ]);
  });

  it("não gera linha para valor ausente", () => {
    const lines = buildPropertyValueLines({
      irpfBalanceValue: null,
      marketValue: "10.00",
    });
    expect(lines).toHaveLength(1);
    expect(lines[0].key).toBe("mercado");
    expect(buildPropertyValueLines({})).toEqual([]);
  });
});

describe("buildEncumbranceView (item 5.7)", () => {
  it("exibe o rótulo do status para Não há, N/A e Pendente", () => {
    expect(buildEncumbranceView("NAO_HA", null)).toMatchObject({
      severity: "verde",
      statusLabel: "Não há",
    });
    expect(buildEncumbranceView("NA", null)).toMatchObject({
      severity: "amarelo",
      statusLabel: "N/A",
    });
    expect(buildEncumbranceView("PENDENTE", null)).toMatchObject({
      severity: "amarelo",
      statusLabel: "Pendente de verificação",
    });
  });

  it("exibe o tipo de gravame e a observação em texto separado", () => {
    const view = buildEncumbranceView(
      "HIPOTECA",
      "  Hipoteca em favor do Banco X "
    );
    expect(view.severity).toBe("vermelho");
    expect(view.statusLabel).toBe("Hipoteca");
    expect(view.note).toBe("Hipoteca em favor do Banco X");
  });

  it("observação vazia ou só espaços vira null", () => {
    expect(buildEncumbranceView("HIPOTECA", "   ").note).toBeNull();
    expect(buildEncumbranceView("HIPOTECA", undefined).note).toBeNull();
  });

  it("sem tipo informado mostra texto neutro", () => {
    expect(buildEncumbranceView(null, null)).toEqual({
      severity: null,
      statusLabel: "Sem gravame informado",
      note: null,
    });
  });
});
