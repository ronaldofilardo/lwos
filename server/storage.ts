// Storage para o MVP com persistência em PostgreSQL (banco Neon).
// Arquivos ≤ 5KB são gravados como base64 na tabela `fileBlobs`.
// O prefixo de URL foi alterado de `/local-storage/` para `/api/local-storage/`
// p/ funcionar no Vercel serverless (disco efêmero).

import { drizzle } from "drizzle-orm/node-postgres";
import { eq, sql } from "drizzle-orm";
import { Pool } from "pg";
import { fileBlobs } from "../drizzle/schema";
import { logError } from "./lib/logger";
import { randomUUID } from "node:crypto";
import { createHash } from "node:crypto";
import * as path from "node:path";
import * as fs from "node:fs";
import { ENV } from "./_core/env";

function getStoragePath(relKey: string) {
  const root = ENV.storageRoot || path.resolve(process.cwd(), "storage");
  return path.resolve(root, relKey);
}

// Pool e drizzle compartilhados (igual server/db.ts)
let cachedDb: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!cachedDb) {
    try {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
      cachedDb = drizzle(pool);
    } catch (error) {
      logError("database.connection_failed");
      cachedDb = null;
    }
  }
  return cachedDb;
}

// ---------- UTILS ----------

function assertSafeRelativeKey(relKey: string): string {
  const segments = relKey.split(/[/\\]/);
  // Rejeita path traversal absoluto ou voltando diretórios
  if (segments.some(seg => seg === ".." || seg === ".")) {
    throw new Error("Caminho de storage inválido.");
  }
  const normalized = segments.filter(seg => seg.length > 0).join("/");
  if (!normalized) {
    throw new Error("Caminho de storage inválido.");
  }
  return normalized;
}

// Gera key com sufixo de hash (mantido do design original).
function appendHashSuffix(relKey: string): string {
  const hash = randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

// ---------- PUT ----------

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  _contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(assertSafeRelativeKey(relKey));

  // Converter para Buffer e validar limite 5KB (somente em produção)
  const buffer = typeof data === "string" ? Buffer.from(data, "utf-8") : Buffer.from(data);
  if (process.env.NODE_ENV === "production" && buffer.length > 5120) {
    throw new Error("Arquivo excede 5KB. Tamanho máximo permitido em produção.");
  }

  const sha256 = createHash("sha256").update(buffer).digest("hex");

  // Localmente, grava direto no disco na pasta ./storage ou ENV.storageRoot
  if (process.env.NODE_ENV !== "production") {
    const fullPath = getStoragePath(key);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, buffer);
    const url = `/api/local-storage/${key.split(path.sep).join("/")}`;
    return { key, url };
  }

  const base64 = buffer.toString("base64");
  const db = getDb();

  if (!db) {
    throw new Error("Banco de dados indisponível para armazenamento.");
  }

  // Insere/atualiza no banco (upsert por key único)
  await db.insert(fileBlobs).values({
    key,
    fileName: relKey.split("/").pop() ?? "arquivo",
    mimeType: _contentType,
    sizeBytes: buffer.length,
    sha256,
    content: base64,
  }).onConflictDoUpdate({
    target: fileBlobs.key,
    set: {
      fileName: relKey.split("/").pop() ?? "arquivo",
      mimeType: _contentType,
      sizeBytes: buffer.length,
      sha256,
      content: base64,
    },
  });

  // URL para download através do proxy /api/local-storage/
  const url = `/api/local-storage/${key.split(path.sep).join("/")}`;
  return { key, url };
}

// ---------- GET (metadata) ----------

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = assertSafeRelativeKey(relKey);
  const url = `/api/local-storage/${key.split(path.sep).join("/")}`;
  return { key, url };
}

// ---------- Signed URL ----------

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = assertSafeRelativeKey(relKey);
  return `/api/local-storage/${key.split(path.sep).join("/")}`;
}

// ---------- Ler arquivo do banco ----------

/** Lê o conteúdo base64 gravado (ou do disco em dev) e retorna um Buffer. */
export async function readStoredFile(relKey: string): Promise<Buffer> {
  const key = assertSafeRelativeKey(relKey);

  if (process.env.NODE_ENV !== "production") {
    const fullPath = getStoragePath(key);
    if (!fs.existsSync(fullPath)) throw new Error("Arquivo não encontrado no storage local.");
    return fs.readFileSync(fullPath);
  }

  const db = getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const row = await db.select({ content: fileBlobs.content }).from(fileBlobs).where(eq(fileBlobs.key, key));
  if (!row[0] || !row[0].content) throw new Error("Arquivo não encontrado no storage.");
  return Buffer.from(row[0].content, "base64");
}

// ---------- Existe? ----------

export async function storedFileExists(relKey: string): Promise<boolean> {
  const key = assertSafeRelativeKey(relKey);

  if (process.env.NODE_ENV !== "production") {
    const fullPath = getStoragePath(key);
    return fs.existsSync(fullPath);
  }

  const db = getDb();
  if (!db) return false;
  const count = await db.select({ count: db.$count(fileBlobs) }).from(fileBlobs).where(eq(fileBlobs.key, key));
  return count[0]?.count > 0;
}

// ---------- Hash ----------

export function hashBuffer(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

// ---------- Move folder (atualiza keys no DB) ----------

/** Move (fisicamente, no banco) todo o conteúdo de uma pasta pra outra —
 * usado quando o titular de uma família muda e a pasta precisa ir do CPF
 * antigo pro CPF novo.
 * Usa UPDATE em massa sobre o prefixo da key; nǜo toca no disco.
 */
export async function moveFolder(oldRelKey: string, newRelKey: string): Promise<{ moved: boolean }> {
  const oldPrefix = assertSafeRelativeKey(oldRelKey) + "/";
  const newPrefix = assertSafeRelativeKey(newRelKey) + "/";

  if (process.env.NODE_ENV !== "production") {
    const oldPath = getStoragePath(assertSafeRelativeKey(oldRelKey));
    const newPath = getStoragePath(assertSafeRelativeKey(newRelKey));
    if (fs.existsSync(oldPath)) {
      fs.mkdirSync(path.dirname(newPath), { recursive: true });
      fs.renameSync(oldPath, newPath);
      return { moved: true };
    }
    return { moved: false };
  }

  const db = getDb();
  if (!db) return { moved: false };

  // Busca todas as keys que começam com o prefixo antigo
  const keys = await db.select({ key: fileBlobs.key }).from(fileBlobs).where(
    sql`${fileBlobs.key} LIKE ${oldPrefix}%`
  );

  if (keys.length === 0) return { moved: false };

  // Atualiza cada key: remove o prefixo velho e adiciona o novo
  await db.transaction(async (tx) => {
    for (const { key } of keys) {
      const relativePart = key.replace(oldPrefix, "");
      const newKey = `${newPrefix}${relativePart}`;
      await tx.update(fileBlobs).set({ key: newKey }).where(eq(fileBlobs.key, key));
    }
  });

  return { moved: true };
}