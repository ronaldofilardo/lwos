import { describe, expect, it } from "vitest";
import { reviewDocumentSchema } from "./document-types";

describe("reviewDocumentSchema", () => {
  it("permite somente os estados finais de revisão", () => {
    expect(
      reviewDocumentSchema.parse({ documentId: "doc-1", status: "VALIDADO" })
        .status
    ).toBe("VALIDADO");
  });

  it("recusa tentativa de envio de estado intermediário pela revisão", () => {
    expect(() =>
      reviewDocumentSchema.parse({
        documentId: "doc-1",
        status: "RECEBIDO_EM_ANALISE",
      })
    ).toThrow();
  });
});
