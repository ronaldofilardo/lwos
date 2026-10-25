import { and, eq, inArray } from "drizzle-orm";
import {
  companies,
  companyDetails,
  documents,
  otherAssets,
  people,
  properties,
} from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import {
  computePersonCategories,
} from "./person-document-categories";
import { createId } from "../_shared/ids";
import { COMPANY_BALANCE_CATEGORIES } from "../../../shared/domain/balance-documents";

/**
 * Matriz pura de requisitos documentais por escopo patrimonial (Fase 8).
 * Todas as funções `compute*` são puras — testáveis sem banco. A reconciliação
 * (`reconcileEntityDocuments`) é a única camada que persiste: cria o que falta
 * e remove apenas pendências obsoletas (status PENDENTE, sem arquivo).
 */

export function computePropertyCategories(property: {
  kind?: string | null;
  hasRegistration?: boolean | null;
}): string[] {
  const registrationDoc =
    property.hasRegistration === false
      ? "Escritura ou contrato de compra e venda"
      : "Matrícula atualizada";
  if (property.kind === "RURAL") {
    return ["ITR", registrationDoc, "CAR", "CCIR"];
  }
  if (property.kind === "URBANO") {
    return ["IPTU", registrationDoc];
  }
  // kind não informado (cadastro legado): mantém a lista histórica.
  return property.hasRegistration === false
    ? ["Escritura ou contrato de compra e venda", "IPTU ou ITR"]
    : ["Matrícula atualizada", "IPTU ou ITR"];
}

/** Categorias de balanço: fonte única em shared (a matriz exige a data-base no envio). */
export { COMPANY_BALANCE_CATEGORIES };

export const COMPANY_LTD_CATEGORIES = [
  "Comprovante de Inscrição no CNPJ",
  "Contrato Social Consolidado",
  ...COMPANY_BALANCE_CATEGORIES,
  "Acordo de Sócios",
  "Livro Razão do Imobilizado",
] as const;

export const COMPANY_SA_EXTRA_CATEGORIES = [
  "Livro de Registro de Ações Nominativas",
  "Livro de Transferência de Ações",
] as const;

export const COMPANY_OFFSHORE_CATEGORIES = [
  "Certificate of Incorporation",
  "Memorandum & Articles of Association",
  "Register of Members",
  "Register of Directors",
  "Share Certificate(s)",
  "Certificate of Good Standing",
  "Balance Sheet",
] as const;

export function computeCompanyCategories(company: {
  isOffshore?: boolean | null;
  societaryType?: string | null;
}): string[] {
  if (company.isOffshore) return [...COMPANY_OFFSHORE_CATEGORIES];
  if (company.societaryType === "SA") {
    return [...COMPANY_LTD_CATEGORIES, ...COMPANY_SA_EXTRA_CATEGORIES];
  }
  // LTDA, SCP e não informado (default): lista nacional padrão.
  return [...COMPANY_LTD_CATEGORIES];
}

/** Demais ativos não exigem documentos do cliente (decisão de 24/10/2026). */
export function computeAssetCategories(): string[] {
  return [];
}

type EntityType = "PESSOA" | "IMOVEL" | "SOCIEDADE" | "ATIVO";

type RequirementInput = {
  familyId: string;
  entityType: EntityType;
  entityId: string;
  categories: readonly string[];
};

type ReconcileResult = { created: number; removed: number };

/**
 * Reconcilia os documentos de uma entidade com a matriz pura: cria as
 * categorias que faltam (PENDENTE) e remove apenas as pendências obsoletas
 * (status PENDENTE, currentVersion 0 — nunca um arquivo enviado). Idempotente.
 */
export async function reconcileEntityDocuments(
  input: RequirementInput
): Promise<ReconcileResult> {
  // Lista vazia é válida (ex.: ativos): nada a criar e as pendências antigas
  // sem arquivo são removidas pela reconciliação abaixo.
  const db = await requireDatabase();
  const existing = await db
    .select({
      id: documents.id,
      category: documents.category,
      status: documents.status,
      currentVersion: documents.currentVersion,
    })
    .from(documents)
    .where(
      and(
        eq(documents.familyId, input.familyId),
        eq(documents.entityType, input.entityType),
        eq(documents.entityId, input.entityId)
      )
    );

  const required = Array.from(new Set(input.categories));
  const known = new Set(existing.map(row => row.category));
  const missing = required.filter(category => !known.has(category));

  let created = 0;
  if (missing.length) {
    const ids = missing.map(() => createId());
    await db.insert(documents).values(
      missing.map((category, index) => ({
        id: ids[index],
        familyId: input.familyId,
        entityType: input.entityType,
        entityId: input.entityId,
        category,
        status: "PENDENTE" as const,
        currentVersion: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
    created = missing.length;
  }

  const requiredSet = new Set(required);
  const staleIds = existing
    .filter(
      row =>
        !requiredSet.has(row.category) &&
        row.status === "PENDENTE" &&
        row.currentVersion === 0
    )
    .map(row => row.id);
  let removed = 0;
  if (staleIds.length) {
    await db.delete(documents).where(inArray(documents.id, staleIds));
    removed = staleIds.length;
  }

  return { created, removed };
}

/**
 * Backfill/reconcile da família inteira: pessoas, imóveis, sociedades
 * (com tipo societário) e ativos. Retorna o total criado e removido.
 */
export async function reconcileFamilyDocumentRequirements(
  familyId: string
): Promise<ReconcileResult> {
  const db = await requireDatabase();
  const [peopleRows, propertyRows, companyRows, assetRows] =
    await Promise.all([
      db
        .select({
          id: people.id,
          vinculo: people.vinculo,
          civilStatus: people.civilStatus,
        })
        .from(people)
        .where(eq(people.familyId, familyId)),
      db
        .select({
          id: properties.id,
          kind: properties.kind,
          hasRegistration: properties.hasRegistration,
        })
        .from(properties)
        .where(eq(properties.familyId, familyId)),
      db
        .select({ id: companies.id, isOffshore: companies.isOffshore })
        .from(companies)
        .where(eq(companies.familyId, familyId)),
      db
        .select({ id: otherAssets.id })
        .from(otherAssets)
        .where(eq(otherAssets.familyId, familyId)),
    ]);
  const detailRows = companyRows.length
    ? await db
        .select({
          companyId: companyDetails.companyId,
          societaryType: companyDetails.societaryType,
        })
        .from(companyDetails)
        .where(inArray(companyDetails.companyId, companyRows.map(row => row.id)))
    : [];
  const societaryByCompany = new Map(
    detailRows.map(row => [row.companyId, row.societaryType])
  );

  let created = 0;
  let removed = 0;
  const reconcile = async (input: Omit<RequirementInput, "familyId">) => {
    const result = await reconcileEntityDocuments({ familyId, ...input });
    created += result.created;
    removed += result.removed;
  };

  for (const person of peopleRows) {
    await reconcile({
      entityType: "PESSOA",
      entityId: person.id,
      categories: computePersonCategories({
        vinculo: person.vinculo,
        civilStatus: person.civilStatus,
      }),
    });
  }
  for (const property of propertyRows) {
    await reconcile({
      entityType: "IMOVEL",
      entityId: property.id,
      categories: computePropertyCategories(property),
    });
  }
  for (const company of companyRows) {
    await reconcile({
      entityType: "SOCIEDADE",
      entityId: company.id,
      categories: computeCompanyCategories({
        isOffshore: company.isOffshore,
        societaryType: societaryByCompany.get(company.id) ?? null,
      }),
    });
  }
  for (const asset of assetRows) {
    await reconcile({
      entityType: "ATIVO",
      entityId: asset.id,
      categories: computeAssetCategories(),
    });
  }

  return { created, removed };
}
