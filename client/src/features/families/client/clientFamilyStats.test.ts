/**
 * @description Estatísticas do dashboard do titular: separa documentos que
 * exigem ação, resolvidos e em análise, e resume certidões vencidas/pendentes.
 * @see client/src/features/families/client/clientFamilyStats.ts
 */
import { describe, expect, it } from "vitest";
import {
  summarizeCertidoes,
  summarizeClientDocuments,
} from "./clientFamilyStats";

describe("summarizeClientDocuments", () => {
  it("separa ação do titular, resolvidos e em análise", () => {
    const summary = summarizeClientDocuments([
      { entityType: "PESSOA", status: "PENDENTE" },
      { entityType: "PESSOA", status: "REJEITADO" },
      { entityType: "IMOVEL", status: "VENCIDO" },
      { entityType: "IMOVEL", status: "VALIDADO" },
      { entityType: "SOCIEDADE", status: "DISPENSADO" },
      { entityType: "ATIVO", status: "NA" },
      { entityType: "FAMILIA", status: "RECEBIDO_EM_ANALISE" },
    ]);

    expect(summary).toEqual({
      total: 7,
      resolved: 3,
      actionRequired: 3,
      inAnalysis: 1,
    });
  });

  it("exclui certidões da matriz (contam no resumo próprio)", () => {
    const summary = summarizeClientDocuments([
      { entityType: "CERTIDAO", status: "PENDENTE" },
      { entityType: "PESSOA", status: "VALIDADO" },
    ]);

    expect(summary.total).toBe(1);
    expect(summary.actionRequired).toBe(0);
  });
});

describe("summarizeCertidoes", () => {
  const today = new Date("2026-09-27T12:00:00");

  it("conta vencidas por validade e pendentes por status", () => {
    const summary = summarizeCertidoes(
      [
        { status: "PENDENTE", validUntil: null },
        { status: "NEGATIVA", validUntil: "2026-01-10" },
        { status: "NEGATIVA", validUntil: "2027-03-01" },
        { status: "POSITIVA", validUntil: null },
      ],
      today
    );

    expect(summary).toEqual({ total: 4, expired: 1, pending: 1 });
  });

  it("sem validade não conta como vencida", () => {
    expect(
      summarizeCertidoes([{ status: "NEGATIVA", validUntil: null }], today)
    ).toEqual({ total: 1, expired: 0, pending: 0 });
  });
});
