/**
 * @description Exercita I/O real isolado do storage local: bloqueio de path traversal,
 * persistência com chave única, hash SHA-256 e limite de 5KB.
 * @see server/storage.ts
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

let root = "";

vi.mock("./_core/env", () => ({ get ENV() { return { storageRoot: root }; } }));

import { hashBuffer, moveFolder, readStoredFile, storedFileExists, storageGet, storageGetSignedUrl, storagePut } from "./storage";

describe("storage local", () => {
  beforeEach(async () => { root = await mkdtemp(path.join(os.tmpdir(), "lwos-storage-")); });
  afterEach(async () => { await rm(root, { recursive: true, force: true }); vi.clearAllMocks(); });

  it("bloqueia chaves que tentam sair de STORAGE_ROOT", async () => {
    await expect(storageGet("../../segredo.pdf")).rejects.toThrow("Caminho de storage inválido.");
    await expect(storagePut("../segredo.pdf", "conteúdo")).rejects.toThrow("Caminho de storage inválido.");
  });

  it("persiste arquivo em raiz isolada com chave única e hash determinístico", async () => {
    const result = await storagePut("familia-1/documento.pdf", "conteúdo seguro");
    const stored = await readFile(path.join(root, result.key), "utf8");

    expect(result.key).toMatch(/^familia-1\/documento_[a-f0-9]{8}\.pdf$/);
    expect(result.url).toContain("/local-storage/");
    expect(stored).toBe("conteúdo seguro");
    expect(hashBuffer(Buffer.from("conteúdo seguro"))).toMatch(/^[a-f0-9]{64}$/);
  });

  it("recupera URL local, lê arquivo existente e informa ausência sem lançar erro", async () => {
    const stored = await storagePut("familia-2/foto.png", "imagem");
    await expect(storageGet(stored.key)).resolves.toEqual(expect.objectContaining({ key: stored.key }));
    await expect(storageGetSignedUrl(stored.key)).resolves.toContain("/local-storage/");
    await expect(readStoredFile(stored.key)).resolves.toEqual(Buffer.from("imagem"));
    await expect(storedFileExists(stored.key)).resolves.toBe(true);
    await expect(storedFileExists("familia-2/inexistente.pdf")).resolves.toBe(false);
  });

  it("limita arquivos a 5KB - maior que 5KB deve falhar em produção", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    try {
      // 6KB de dados -> deve lançar erro
      const bigData = "x".repeat(6000);
      await expect(storagePut("familia-3/grande.pdf", bigData)).rejects.toThrow(
        "Arquivo excede 5KB. Tamanho máximo permitido em produção."
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
    
    // Em dev/test, não deve falhar
    const bigResult = await storagePut("familia-3/grande_dev.pdf", "x".repeat(6000));
    expect(bigResult.key).toBeDefined();

    // Arquivo pequeno deve persistir normalmente
    const smallResult = await storagePut("familia-3/pequeno.pdf", "dados");
    expect(smallResult.key).toBeDefined();
  });

  it("migra pasta existente e informa quando a origem não existe", async () => {
    const stored = await storagePut("cpf-antigo/arquivo.txt", "arquivo");
    const moved = await moveFolder("cpf-antigo", "cpf-novo");
    const missing = await moveFolder("inexistente", "destino");
    const migratedKey = stored.key.replace("cpf-antigo/", "cpf-novo/");

    expect(moved).toEqual({ moved: true });
    expect(await readFile(path.join(root, migratedKey), "utf8")).toBe("arquivo");
    expect(missing).toEqual({ moved: false });
  });
});