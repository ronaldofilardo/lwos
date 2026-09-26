// Storage local para o MVP (dev). Estrutura: STORAGE_ROOT/{familia}/{...relKey}
// onde {familia} é o CPF do titular (sem máscara) ou "familia-{id}" como fallback.
// A interface (storagePut/storageGet/storageGetSignedUrl) fica igual de propósito,
// pra trocar por S3 em produção sem tocar quem chama (document-upload.ts etc).

import { createHash, randomUUID } from "node:crypto";
import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { ENV } from "./_core/env";

function getStorageRoot(): string {
  if (!ENV.storageRoot) {
    throw new Error("STORAGE_ROOT não configurado. Defina em .env.local (ex: C:\\apps\\lwos\\storage).");
  }
  return ENV.storageRoot;
}

/** Bloqueia ".." e barras absolutas — a key nunca deve escapar de STORAGE_ROOT. */
function assertSafeRelativeKey(relKey: string) {
  const normalized = path.normalize(relKey).replace(/^([/\\])+/, "");
  if (normalized.split(/[/\\]/).includes("..")) {
    throw new Error("Caminho de storage inválido.");
  }
  return normalized.split(/[/\\]/).join("/");
}

function resolveAbsolutePath(relKey: string): string {
  const safeKey = assertSafeRelativeKey(relKey);
  return path.join(getStorageRoot(), safeKey);
}

function appendHashSuffix(relKey: string): string {
  const hash = randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  _contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(assertSafeRelativeKey(relKey));
  const absolutePath = resolveAbsolutePath(key);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  const buffer = typeof data === "string" ? Buffer.from(data, "utf-8") : Buffer.from(data);
  await writeFile(absolutePath, buffer);

  return { key, url: `/local-storage/${key.split(path.sep).join("/")}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = assertSafeRelativeKey(relKey);
  return { key, url: `/local-storage/${key.split(path.sep).join("/")}` };
}

/**
 * Em produção (S3) isso geraria uma URL assinada temporária. No storage local
 * de dev não existe presign — retorna a mesma rota do proxy local. Mantido
 * como função async e com a mesma assinatura pra não quebrar quem já chama.
 */
export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = assertSafeRelativeKey(relKey);
  return `/local-storage/${key.split(path.sep).join("/")}`;
}

/** Usado pelo proxy de download (server/_core/storageProxy.ts). */
export async function readStoredFile(relKey: string): Promise<Buffer> {
  const absolutePath = resolveAbsolutePath(relKey);
  return readFile(absolutePath);
}

export async function storedFileExists(relKey: string): Promise<boolean> {
  try {
    await stat(resolveAbsolutePath(relKey));
    return true;
  } catch {
    return false;
  }
}

export function hashBuffer(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

/**
 * Move (fisicamente, no disco) todo o conteúdo de uma pasta pra outra —
 * usado quando o titular de uma família muda e a pasta precisa ir do CPF
 * antigo pro CPF novo. Usa copy+delete (em vez de rename puro) porque
 * funciona mesmo se origem/destino ficarem em volumes diferentes, e porque
 * lida melhor com o caso raro do destino já ter arquivos (mescla em vez de
 * falhar). Se a pasta de origem não existir (família ainda sem upload
 * nenhum), não faz nada e retorna moved:false.
 */
export async function moveFolder(oldRelKey: string, newRelKey: string): Promise<{ moved: boolean }> {
  const oldPath = resolveAbsolutePath(oldRelKey);
  const newPath = resolveAbsolutePath(newRelKey);

  try {
    await stat(oldPath);
  } catch {
    return { moved: false };
  }

  await mkdir(path.dirname(newPath), { recursive: true });
  await cp(oldPath, newPath, { recursive: true });
  await rm(oldPath, { recursive: true, force: true });

  return { moved: true };
}
