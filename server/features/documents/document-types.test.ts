import { describe, expect, it } from "vitest";
import { reviewDocumentSchema, uploadVersionSchema } from "./document-types";

describe("reviewDocumentSchema", () => {
  it("permite somente os estados finais de revisão", () => {
    expect(
      reviewDocumentSchema.parse({ documentId: "doc-1", status: "VALIDADO" })
        .status
    ).toBe("VALIDADO");
  });

  it("aceita NAO_POSSUI como estado final de revisão", () => {
    expect(
      reviewDocumentSchema.parse({ documentId: "doc-1", status: "NAO_POSSUI" })
        .status
    ).toBe("NAO_POSSUI");
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

describe("uploadVersionSchema — data-base", () => {
  const base = {
    documentId: "doc-1",
    fileName: "balanco.pdf",
    mimeType: "application/pdf",
    base64Data: "aGVsbG8td29ybGQ=",
  };

  it("data-base é opcional e, quando enviada, precisa ser uma data ISO válida", () => {
    expect(uploadVersionSchema.safeParse(base).success).toBe(true);
    expect(uploadVersionSchema.safeParse({ ...base, referenceDate: "2025-12-31" }).success).toBe(true);
    expect(uploadVersionSchema.safeParse({ ...base, referenceDate: "31/12/2025" }).success).toBe(false);
    expect(uploadVersionSchema.safeParse({ ...base, referenceDate: "2025-02-30" }).success).toBe(false);
  });
});
