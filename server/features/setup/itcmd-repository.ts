import { eq, sql } from "drizzle-orm";
import { itcmdBrackets } from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import { getBaselineBracketsForUf } from "../../../shared/domain/itcmd-seed-data";
import { ItcmdBracketRule } from "../../../shared/domain/itcmd-types";

export async function ensureItcmdTable(): Promise<void> {
  try {
    const db = await requireDatabase();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "itcmdBrackets" (
        "id" varchar(36) PRIMARY KEY NOT NULL,
        "uf" varchar(2) NOT NULL,
        "bracketOrder" integer NOT NULL,
        "limitValue" numeric(15, 2) NOT NULL,
        "rate" numeric(6, 4) NOT NULL,
        "accumulatedTax" numeric(15, 2) DEFAULT 0.00 NOT NULL,
        "deductionValue" numeric(15, 2) DEFAULT 0.00 NOT NULL,
        "indexedUnitName" varchar(30),
        "indexedUnitValue" numeric(10, 4),
        "updatedAt" timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "itcmd_brackets_uf_idx" ON "itcmdBrackets" ("uf");
    `);
  } catch {
    // Tolerante a restrições de DDL
  }
}

export async function getBracketsByUf(uf: string): Promise<ItcmdBracketRule[]> {
  const normUf = uf.trim().toUpperCase();
  try {
    const db = await requireDatabase();
    const rows = await db
      .select()
      .from(itcmdBrackets)
      .where(eq(itcmdBrackets.uf, normUf));

    if (!rows || rows.length === 0) {
      return getBaselineBracketsForUf(normUf);
    }

    return rows.map(r => ({
      id: r.id,
      uf: r.uf,
      bracketOrder: r.bracketOrder,
      limitValue: Number(r.limitValue),
      rate: Number(r.rate),
      accumulatedTax: Number(r.accumulatedTax || 0),
      deductionValue: Number(r.deductionValue || 0),
      indexedUnitName: r.indexedUnitName,
      indexedUnitValue: r.indexedUnitValue ? Number(r.indexedUnitValue) : null,
    }));
  } catch {
    // Auto-cura e fallback gracioso se a migração ainda não rodou no Postgres local
    await ensureItcmdTable();
    return getBaselineBracketsForUf(normUf);
  }
}

export async function saveUfPolicy(
  uf: string,
  brackets: Omit<ItcmdBracketRule, "uf">[]
): Promise<ItcmdBracketRule[]> {
  const normUf = uf.trim().toUpperCase();
  await ensureItcmdTable();
  const db = await requireDatabase();

  await db.transaction(async tx => {
    await tx.delete(itcmdBrackets).where(eq(itcmdBrackets.uf, normUf));

    if (brackets.length > 0) {
      await tx.insert(itcmdBrackets).values(
        brackets.map((b, idx) => ({
          id: createId(),
          uf: normUf,
          bracketOrder: idx + 1,
          limitValue: String(b.limitValue),
          rate: String(b.rate),
          accumulatedTax: String(b.accumulatedTax || 0),
          deductionValue: String(b.deductionValue || 0),
          indexedUnitName: b.indexedUnitName ?? null,
          indexedUnitValue: b.indexedUnitValue ? String(b.indexedUnitValue) : null,
          updatedAt: new Date(),
        }))
      );
    }
  });

  return getBracketsByUf(normUf);
}
