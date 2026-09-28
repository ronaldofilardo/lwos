/**
 * @description Cobre o upload de versão de documento: validação de tipo e tamanho,
 * gravação no storage, transação que incrementa a versão e a liberação automática
 * dos documentos de casal do cônjuge.
 * @see server/features/documents/document-upload.ts
 */
import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
const idsMocks = vi.hoisted(() => ({ createId: vi.fn() }));
const storageMocks = vi.hoisted(() => ({ storagePut: vi.fn() }));
const folderMocks = vi.hoisted(() => ({ resolveFamilyStorageFolder: vi.fn() }));
const coupleMocks = vi.hoisted(() => ({ releaseSpouseCoupleDocs: vi.fn() }));
const repositoryMocks = vi.hoisted(() => ({ getDocumentRecord: vi.fn() }));

vi.mock("../_shared/database", () => databaseMocks);
vi.mock("../_shared/ids", () => idsMocks);
vi.mock("../../storage", () => storageMocks);
vi.mock("../../lib/family-storage-path", () => folderMocks);
vi.mock("./couple-docs", () => coupleMocks);
vi.mock("./document-repository", () => repositoryMocks);

import { documentVersions, documents } from "../../../drizzle/schema";
import { storeDocumentVersion } from "./document-upload";

const baseInput = {
  documentId: "doc-1",
  fileName: "rg.pdf",
  mimeType: "application/pdf",
  base64Data: Buffer.from("conteudo").toString("base64"),
  userId: 7,
};

const documentRecord = {
  id: "doc-1",
  familyId: "fam-1",
  entityType: "PESSOA",
  entityId: "p-1",
  category: "RG",
  currentVersion: 2,
};

function fakeTx() {
  const insertValues = vi.fn(async () => undefined);
  const set = vi.fn(() => ({ where: vi.fn(async () => undefined) }));
  const update = vi.fn(() => ({ set }));
  const insert = vi.fn(() => ({ values: insertValues }));
  const transaction = vi.fn(async (operation: (tx: unknown) => Promise<void>) => {
    await operation({ insert, update });
  });
  return { db: { transaction }, insertValues, set, update, transaction };
}

describe("storeDocumentVersion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    idsMocks.createId.mockReturnValue("ver-1");
    folderMocks.resolveFamilyStorageFolder.mockResolvedValue("11122233344");
    storageMocks.storagePut.mockResolvedValue({ key: "11122233344/doc-1/v3/rg.pdf" });
    coupleMocks.releaseSpouseCoupleDocs.mockResolvedValue(undefined);
    repositoryMocks.getDocumentRecord.mockResolvedValue(documentRecord);
  });

  it("rejeita tipo de arquivo fora da lista permitida", async () => {
    await expect(
      storeDocumentVersion({ ...baseInput, mimeType: "application/zip" })
    ).rejects.toThrow("Tipo de arquivo não permitido.");
    expect(repositoryMocks.getDocumentRecord).not.toHaveBeenCalled();
  });

  it("rejeita quando o documento não existe", async () => {
    repositoryMocks.getDocumentRecord.mockResolvedValue(null);
    await expect(storeDocumentVersion(baseInput)).rejects.toThrow("Documento não encontrado.");
    expect(storageMocks.storagePut).not.toHaveBeenCalled();
  });

  it("rejeita conteúdo vazio ou acima de 5 MB", async () => {
    await expect(
      storeDocumentVersion({ ...baseInput, base64Data: "" })
    ).rejects.toThrow("Arquivo inválido ou maior que 5 MB.");

    const oversized = Buffer.alloc(5 * 1024 * 1024 + 1).toString("base64");
    await expect(storeDocumentVersion({ ...baseInput, base64Data: oversized })).rejects.toThrow(
      "Arquivo inválido ou maior que 5 MB."
    );
    expect(storageMocks.storagePut).not.toHaveBeenCalled();
  });

  it("grava a versão no storage, incrementa o documento e libera os docs do casal", async () => {
    const { db, insertValues, set, transaction } = fakeTx();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const bytes = Buffer.from("conteudo");
    const result = await storeDocumentVersion(baseInput);

    expect(result).toEqual({
      versionNumber: 3,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      storageKey: "11122233344/doc-1/v3/rg.pdf",
    });
    expect(folderMocks.resolveFamilyStorageFolder).toHaveBeenCalledWith("fam-1");
    expect(storageMocks.storagePut).toHaveBeenCalledWith(
      "11122233344/doc-1/v3/rg.pdf",
      bytes,
      "application/pdf"
    );
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "ver-1",
        documentId: "doc-1",
        versionNumber: 3,
        originalName: "rg.pdf",
        uploadedBy: "7",
      })
    );
    expect(set.mock.calls[0][0]).toEqual({
      currentVersion: 3,
      status: "RECEBIDO_EM_ANALISE",
      rejectionReason: null,
    });
    expect(coupleMocks.releaseSpouseCoupleDocs).toHaveBeenCalledWith({
      familyId: "fam-1",
      entityType: "PESSOA",
      entityId: "p-1",
      category: "RG",
    });
  });
});
