import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
const repositoryMocks = vi.hoisted(() => ({ getDocumentRecord: vi.fn() }));
const coupleMocks = vi.hoisted(() => ({ releaseSpouseCoupleDocs: vi.fn() }));

vi.mock("../_shared/database", () => databaseMocks);
vi.mock("./document-repository", () => repositoryMocks);
vi.mock("./couple-docs", () => coupleMocks);

import { reviewDocumentRecord } from "./document-review";

describe("reviewDocumentRecord", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    databaseMocks.requireDatabase.mockResolvedValue({
      update: vi.fn().mockReturnValue({
        set: vi
          .fn()
          .mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
      }),
    });
    coupleMocks.releaseSpouseCoupleDocs.mockResolvedValue(0);
    repositoryMocks.getDocumentRecord.mockResolvedValue({
      familyId: "fam-1",
      entityType: "PESSOA",
      entityId: "pessoa-1",
      category: "Certidão de casamento/UE",
    });
  });

  it("exige motivo ao rejeitar um documento", async () => {
    await expect(
      reviewDocumentRecord({ documentId: "documento-1", status: "REJEITADO" })
    ).rejects.toThrow("Motivo da rejeição é obrigatório");
  });

  it("ao validar, tenta dispensar a cópia do cônjuge em documentos do casal", async () => {
    await reviewDocumentRecord({
      documentId: "documento-1",
      status: "VALIDADO",
    });
    expect(coupleMocks.releaseSpouseCoupleDocs).toHaveBeenCalledWith({
      familyId: "fam-1",
      entityType: "PESSOA",
      entityId: "pessoa-1",
      category: "Certidão de casamento/UE",
    });
  });

  it("ao rejeitar, não altera documentos do cônjuge", async () => {
    await reviewDocumentRecord({
      documentId: "documento-1",
      status: "REJEITADO",
      rejectionReason: "ilegível",
    });
    expect(coupleMocks.releaseSpouseCoupleDocs).not.toHaveBeenCalled();
  });
});
