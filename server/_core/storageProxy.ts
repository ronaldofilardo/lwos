// @ts-nocheck
import type { Express } from "express";
import path from "node:path";
import { authenticateRequest } from "./auth";
import { readStoredFile, storedFileExists } from "../storage";
import { getDocumentVersionByStorageKey } from "../features/documents/document-repository";
import { getLeadRecordByStorageKey } from "../features/leads/lead-repository";
import { userHasFamilyAccess } from "../features/access/family-access";

const MIME_BY_EXT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

/**
 * Serve arquivos do storage local em /local-storage/*.
 * Exige sessão autenticada E acesso à família dona do documento: a storageKey
 * é resolvida de volta pra (documentId, familyId) via documentVersions, e a
 * mesma regra de acesso do tRPC (userHasFamilyAccess) é aplicada aqui.
 */
export function registerStorageProxy(app: Express) {
  app.get(["/api/local-storage/*", "/local-storage/*"], async (req, res) => {
    let user;
    try {
      user = await authenticateRequest(req);
    } catch {
      res.status(401).send("Não autenticado.");
      return;
    }

    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Chave de storage ausente.");
      return;
    }

    const versionInfo = await getDocumentVersionByStorageKey(key);
    if (!versionInfo) {
      // Não é uma versão de documento — pode ser o arquivo de identificação
      // anexado por um interessado (leads/*), visível só pro time.
      const lead = await getLeadRecordByStorageKey(key);
      if (!lead) {
        res.status(404).send("Arquivo não encontrado.");
        return;
      }
      if (user.role !== "SOCIO" && user.role !== "ADMIN") {
        res.status(403).send("Acesso não autorizado a este arquivo.");
        return;
      }
    } else {
      const allowed = await userHasFamilyAccess(user, versionInfo.familyId);
      if (!allowed) {
        res.status(403).send("Acesso não autorizado a este documento.");
        return;
      }
    }

    try {
      const exists = await storedFileExists(key);
      if (!exists) {
        res.status(404).send("Arquivo não encontrado.");
        return;
      }

      const buffer = await readStoredFile(key);
      const ext = path.extname(key).toLowerCase();
      res.set("Content-Type", MIME_BY_EXT[ext] ?? "application/octet-stream");
      res.set("Cache-Control", "no-store");
      res.send(buffer);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(500).send("Erro ao ler arquivo.");
    }
  });
}

