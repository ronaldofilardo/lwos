import { and, eq } from "drizzle-orm";
import { companyDetailDocs, companyDetails } from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import { docTypesForCompanyType } from "./company-details";
import type { z } from "zod";
import type {
  companyDetailsFieldsSchema,
  CompanyDetailDoc,
} from "./company-details";

type CompanyDetailsFields = z.infer<typeof companyDetailsFieldsSchema>;

/**
 * Linha completa do upsert: `undefined` e `null` viram coluna nula, números
 * viram string decimal (mesmo padrão das demais colunas `numeric`).
 */
function detailValues(fields: CompanyDetailsFields) {
  const text = (value: string | null | undefined) => value ?? null;
  const amount = (value: number | null | undefined) =>
    value === undefined || value === null ? null : value.toFixed(2);

  return {
    nire: text(fields.nire),
    uf: text(fields.uf),
    sede: text(fields.sede),
    societaryType: text(fields.societaryType),
    taxRegime: text(fields.taxRegime),
    corporatePurpose: text(fields.corporatePurpose),
    capitalSocial: amount(fields.capitalSocial),
    shareQuantity: amount(fields.shareQuantity),
    administrator1: text(fields.administrator1),
    administrator2: text(fields.administrator2),
    equity: amount(fields.equity),
    cashAndEquivalents: amount(fields.cashAndEquivalents),
    inventory: amount(fields.inventory),
    accountsReceivable: amount(fields.accountsReceivable),
    investments: amount(fields.investments),
    fixedAssets: amount(fields.fixedAssets),
    retainedEarnings: amount(fields.retainedEarnings),
    taxLiabilities: amount(fields.taxLiabilities),
    laborLiabilities: amount(fields.laborLiabilities),
    financing: amount(fields.financing),
    estimatedMarketValue: amount(fields.estimatedMarketValue),
    companyNumber: text(fields.companyNumber),
    jurisdiction: fields.jurisdiction ?? null,
    residentAgent: text(fields.residentAgent),
    notes: text(fields.notes),
  };
}

export async function getCompanyDetailsRecord(companyId: string) {
  const db = await requireDatabase();
  const result = await db
    .select()
    .from(companyDetails)
    .where(eq(companyDetails.companyId, companyId))
    .limit(1);
  return result[0] ?? null;
}

export async function upsertCompanyDetailsRecord(input: {
  companyId: string;
  fields: CompanyDetailsFields;
}) {
  const db = await requireDatabase();
  const values = detailValues(input.fields);
  const now = new Date();
  await db
    .insert(companyDetails)
    .values({
      id: createId(),
      companyId: input.companyId,
      ...values,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: companyDetails.companyId,
      set: { ...values, updatedAt: now },
    });
}

/**
 * Cria os documentos da variante que faltam (find-or-create) e devolve as
 * linhas na ordem do bloco do modal, descartando documentos de outra variante.
 */
export async function listCompanyDetailDocs(input: {
  companyId: string;
  companyType: string;
}) {
  const db = await requireDatabase();
  const expected = docTypesForCompanyType(input.companyType);
  const existing = await db
    .select()
    .from(companyDetailDocs)
    .where(eq(companyDetailDocs.companyId, input.companyId));
  const known = new Set(existing.map(row => row.docType));
  const missing = expected.filter(docType => !known.has(docType));

  let rows = existing;
  if (missing.length) {
    await db.insert(companyDetailDocs).values(
      missing.map(docType => ({
        id: createId(),
        companyId: input.companyId,
        docType,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
    rows = await db
      .select()
      .from(companyDetailDocs)
      .where(eq(companyDetailDocs.companyId, input.companyId));
  }

  const order = new Map(expected.map((docType, index) => [docType, index]));
  return rows
    .filter(row => order.has(row.docType))
    .sort((a, b) => (order.get(a.docType) ?? 0) - (order.get(b.docType) ?? 0));
}

export async function updateCompanyDetailDocRecord(
  input: CompanyDetailDoc & { companyId: string }
) {
  const db = await requireDatabase();
  const current = await db
    .select({ id: companyDetailDocs.id })
    .from(companyDetailDocs)
    .where(
      and(
        eq(companyDetailDocs.companyId, input.companyId),
        eq(companyDetailDocs.docType, input.docType)
      )
    )
    .limit(1);
  if (!current[0])
    throw new Error("Documento não encontrado para esta sociedade.");

  await db
    .update(companyDetailDocs)
    .set({ status: input.status, updatedAt: new Date() })
    .where(eq(companyDetailDocs.id, current[0].id));
}

/**
 * Valores por quota do modal: capital social, patrimônio líquido e valor de
 * mercado divididos pela quantidade de quotas/ações (null quando não há
 * quantidade informada).
 */
export function computePerShare(input: {
  capitalSocial?: string | number | null;
  equity?: string | number | null;
  estimatedMarketValue?: string | number | null;
  shareQuantity?: string | number | null;
}) {
  const quantity = Number(input.shareQuantity ?? 0);
  const perShare = (amount: string | number | null | undefined) => {
    if (!Number.isFinite(quantity) || quantity <= 0) return null;
    return Number(amount ?? 0) / quantity;
  };

  return {
    contabil: perShare(input.capitalSocial),
    patrimonial: perShare(input.equity),
    mercado: perShare(input.estimatedMarketValue),
  };
}
