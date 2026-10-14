import { eq } from "drizzle-orm";
import { companyDetails } from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import type { z } from "zod";
import type {
  companyDetailsFieldsSchema,
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
    uf: fields.uf ?? null,
    sede: text(fields.sede),
    cep: text(fields.cep),
    street: text(fields.street),
    number: text(fields.number),
    complement: text(fields.complement),
    district: text(fields.district),
    city: text(fields.city),
    societaryType: fields.societaryType ?? null,
    taxRegime: fields.taxRegime ?? null,
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
