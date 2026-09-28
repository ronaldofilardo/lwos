/**
 * @description Valida o caminho de produção do storage (PostgreSQL): criação da tabela
 * fileBlobs, upsert por chave única, leitura em base64, contagem de existência, migração
 * de prefixo em transação e degradação segura quando o banco está indisponível.
 * @see server/storage.ts
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  pool: {},
  Pool: vi.fn(),
  drizzle: vi.fn(),
  logError: vi.fn(),
}));

vi.mock("pg", () => ({ Pool: mocks.Pool }));
vi.mock("drizzle-orm/node-postgres", () => ({ drizzle: mocks.drizzle }));
vi.mock("./lib/logger", () => ({ logError: mocks.logError }));
vi.mock("./_core/env", () => ({ ENV: { storageRoot: "" } }));

import { moveFolder, readStoredFile, storagePut, storedFileExists } from "./storage";

function createDb() {
  const state = {
    rows: [] as Record<string, unknown>[],
    updates: [] as Record<string, unknown>[],
    inserted: null as Record<string, unknown> | null,
    executeCalls: 0,
  };
  const tx = {
    update: vi.fn(() => ({
      set: vi.fn((payload: Record<string, unknown>) => ({
        where: vi.fn(async () => {
          state.updates.push(payload);
        }),
      })),
    })),
  };
  const db = {
    state,
    tx,
    execute: vi.fn(async () => {
      state.executeCalls++;
    }),
    insert: vi.fn(() => ({
      values: vi.fn((values: Record<string, unknown>) => ({
        onConflictDoUpdate: vi.fn(async () => {
          state.inserted = values;
        }),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(async () => state.rows),
      })),
    })),
    $count: vi.fn(() => 0),
    transaction: vi.fn(async (operation: (value: typeof tx) => Promise<void>) => operation(tx)),
  };
  return db;
}

const db = createDb();
let originalNodeEnv: string | undefined;

describe("storage em produção (PostgreSQL)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.state.rows = [];
    db.state.updates = [];
    db.state.inserted = null;
    db.state.executeCalls = 0;
    mocks.Pool.mockReturnValue(mocks.pool);
    mocks.drizzle.mockReturnValue(db);
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("cria a tabela fileBlobs uma única vez e grava via upsert com hash e base64", async () => {
    const stored = await storagePut("familia-1/documento.pdf", "conteúdo", "application/pdf");

    expect(stored.key).toMatch(/^familia-1\/documento_[a-f0-9]{8}\.pdf$/);
    expect(stored.url).toBe(`/api/local-storage/${stored.key}`);
    expect(db.state.executeCalls).toBe(1);
    expect(db.state.inserted).toMatchObject({
      key: stored.key,
      fileName: "documento.pdf",
      mimeType: "application/pdf",
      sizeBytes: Buffer.byteLength("conteúdo"),
      sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      content: Buffer.from("conteúdo").toString("base64"),
    });

    await storagePut("familia-1/segundo.pdf", "x");
    expect(db.state.executeCalls).toBe(1);
  });

  it("lê o conteúdo base64 do banco e sinaliza ausência de registro", async () => {
    db.state.rows = [{ content: Buffer.from("pdf").toString("base64") }];
    await expect(readStoredFile("familia-1/doc.pdf")).resolves.toEqual(Buffer.from("pdf"));

    db.state.rows = [];
    await expect(readStoredFile("familia-1/doc.pdf")).rejects.toThrow("Arquivo não encontrado no storage.");
  });

  it("informa existência a partir da contagem de registros da chave", async () => {
    db.state.rows = [{ count: 2 }];
    await expect(storedFileExists("familia-1/doc.pdf")).resolves.toBe(true);

    db.state.rows = [{ count: 0 }];
    await expect(storedFileExists("familia-1/outro.pdf")).resolves.toBe(false);
  });

  it("atualiza as chaves em transação e reporta quando não há chaves sob o prefixo", async () => {
    db.state.rows = [];
    await expect(moveFolder("cpf-antigo", "cpf-novo")).resolves.toEqual({ moved: false });
    expect(db.transaction).not.toHaveBeenCalled();

    db.state.rows = [{ key: "cpf-antigo/doc.pdf" }, { key: "cpf-antigo/foto.png" }];
    await expect(moveFolder("cpf-antigo", "cpf-novo")).resolves.toEqual({ moved: true });
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(db.state.updates).toEqual([
      { key: "cpf-novo/doc.pdf" },
      { key: "cpf-novo/foto.png" },
    ]);
  });

  it("guarda o prefixo com barra ao montar as novas chaves", async () => {
    db.state.rows = [{ key: "cpf-antigo/sub/pasta.pdf" }];
    await moveFolder("cpf-antigo", "cpf-novo");
    expect(db.state.updates).toEqual([{ key: "cpf-novo/sub/pasta.pdf" }]);
  });
});

describe("storage sem banco disponível", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.Pool.mockReturnValue(mocks.pool);
    mocks.drizzle.mockImplementation(() => {
      throw new Error("conexão recusada");
    });
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    mocks.drizzle.mockReset();
  });

  it("registra a falha e degrada com as mensagens esperadas em cada operação", async () => {
    const storage = await import("./storage");

    await expect(storage.storagePut("familia-db/doc.pdf", "x")).rejects.toThrow(
      "Banco de dados indisponível para armazenamento."
    );
    await expect(storage.readStoredFile("familia-db/doc.pdf")).rejects.toThrow("Banco de dados indisponível.");
    await expect(storage.storedFileExists("familia-db/doc.pdf")).resolves.toBe(false);
    await expect(storage.moveFolder("cpf-a", "cpf-b")).resolves.toEqual({ moved: false });

    expect(mocks.logError).toHaveBeenCalledWith("database.connection_failed");
  });
});
