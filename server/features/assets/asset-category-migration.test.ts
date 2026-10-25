/**
 * @description Guarda de migração: todo valor do enum assetCategory do schema
 * precisa existir em alguma migração SQL do journal (ADD VALUE esquecido só
 * apareceria em produção, ao gravar a categoria nova).
 * @see drizzle/0016_asset_offshore_categories.sql
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assetCategoryValues } from "../../../drizzle/schema";

const drizzleDir = join(import.meta.dirname, "../../../drizzle");

const journal = JSON.parse(readFileSync(join(drizzleDir, "meta/_journal.json"), "utf-8")) as {
  entries: { idx: number; when: number; tag: string }[];
};

const allSql = readdirSync(drizzleDir)
  .filter(file => file.endsWith(".sql"))
  .map(file => readFileSync(join(drizzleDir, file), "utf-8"))
  .join("\n");

describe("migração das categorias de ativo", () => {
  it("todo valor do enum aparece em alguma migração", () => {
    for (const value of assetCategoryValues) {
      expect(allSql, `categoria ${value} sem migração`).toContain(`'${value}'`);
    }
  });

  it("as categorias offshore entram por ALTER TYPE ... ADD VALUE", () => {
    const sql = readFileSync(join(drizzleDir, "0016_asset_offshore_categories.sql"), "utf-8");
    expect(sql).toContain(`ALTER TYPE "assetCategory" ADD VALUE IF NOT EXISTS 'CONTA_CORRENTE_OFFSHORE'`);
    expect(sql).toContain(`ALTER TYPE "assetCategory" ADD VALUE IF NOT EXISTS 'INVESTIMENTOS_OFFSHORE'`);
  });

  it("o journal lista a 0016 depois da 0015, com data crescente e idx sequencial", () => {
    const tags = journal.entries.map(entry => entry.tag);
    const idx0015 = tags.indexOf("0015_address_and_cep_fields");
    const idx0016 = tags.indexOf("0016_asset_offshore_categories");
    expect(idx0016).toBe(idx0015 + 1);
    journal.entries.forEach((entry, position) => {
      expect(entry.idx).toBe(position);
      if (position > 0) expect(entry.when).toBeGreaterThan(journal.entries[position - 1].when);
    });
  });

  it("todo arquivo do journal tem o SQL correspondente", () => {
    const files = new Set(readdirSync(drizzleDir));
    for (const entry of journal.entries) {
      expect(files.has(`${entry.tag}.sql`), `${entry.tag}.sql ausente`).toBe(true);
    }
  });
});
