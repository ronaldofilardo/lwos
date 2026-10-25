/**
 * @description Definição única de requisito resolvido (validado, dispensado ou "Não possui").
 * @see shared/domain/document-status.ts
 */
import { describe, expect, it } from "vitest";
import { isResolvedDocumentStatus } from "./document-status";

describe("isResolvedDocumentStatus", () => {
  it.each(["VALIDADO", "DISPENSADO", "NAO_POSSUI"])("%s é resolvido", status => {
    expect(isResolvedDocumentStatus(status)).toBe(true);
  });

  it.each(["PENDENTE", "RECEBIDO_EM_ANALISE", "REJEITADO", "VENCIDO", "NA", ""])(
    "%s não é resolvido",
    status => {
      expect(isResolvedDocumentStatus(status)).toBe(false);
    }
  );
});
