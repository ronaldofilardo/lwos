import { and, eq } from "drizzle-orm";
import {
  companies,
  documents,
  otherAssets,
  people,
  properties,
} from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import { documentCategoriesForVinculo } from "./person-document-categories";
import { createId } from "../_shared/ids";

/**
 * Matriz de requisitos documentais por escopo patrimonial.
 * Imóveis e sociedades seguem o TBD-05 (docs/tbd-registry.md).
 */
export const PROPERTY_DOCUMENT_CATEGORIES = {
  withRegistration: ["Matrícula atualizada", "IPTU ou ITR"],
  withoutRegistration: [
    "Escritura ou contrato de compra e venda",
    "IPTU ou ITR",
  ],
} as const;

export const COMPANY_DOCUMENT_CATEGORIES = [
  "Contrato social e alterações consolidadas",
  "CNPJ (comprovante de situação)",
  "Estatuto social e atas (se S/A)",
] as const;

export const ASSET_DOCUMENT_CATEGORIES = [
  "Comprovação de titularidade",
  "Avaliação ou laudo de lastro",
] as const;

type RequirementInput = {
  familyId: string;
  entityType: "PESSOA" | "IMOVEL" | "SOCIEDADE" | "ATIVO";
  entityId: string;
  categories: readonly string[];
};

/**
 * Cria apenas as categorias que ainda não existem para a entidade.
 * Retorna os ids criados (vazio quando tudo já foi gerado).
 */
export async function ensureDocumentRequirements(input: RequirementInput) {
  if (!input.categories.length) return [];
  const db = await requireDatabase();
  const existing = await db
    .select({ category: documents.category })
    .from(documents)
    .where(
      and(
        eq(documents.entityType, input.entityType),
        eq(documents.entityId, input.entityId)
      )
    );
  const known = new Set(existing.map(row => row.category));
  const missing = Array.from(new Set(input.categories)).filter(
    category => !known.has(category)
  );
  if (!missing.length) return [];

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
  return ids;
}

/**
 * Backfill: gera os requisitos que faltam para todas as entidades já
 * cadastradas da família (pessoas, imóveis, sociedades e ativos).
 */
export async function ensureFamilyDocumentRequirements(familyId: string) {
  const db = await requireDatabase();
  const [peopleRows, propertyRows, companyRows, assetRows] = await Promise.all([
    db.select().from(people).where(eq(people.familyId, familyId)),
    db.select().from(properties).where(eq(properties.familyId, familyId)),
    db.select().from(companies).where(eq(companies.familyId, familyId)),
    db.select().from(otherAssets).where(eq(otherAssets.familyId, familyId)),
  ]);

  let created = 0;
  for (const person of peopleRows) {
    created += (
      await ensureDocumentRequirements({
        familyId,
        entityType: "PESSOA",
        entityId: person.id,
        categories: documentCategoriesForVinculo(person.vinculo),
      })
    ).length;
  }
  for (const property of propertyRows) {
    created += (
      await ensureDocumentRequirements({
        familyId,
        entityType: "IMOVEL",
        entityId: property.id,
        categories: property.hasRegistration
          ? PROPERTY_DOCUMENT_CATEGORIES.withRegistration
          : PROPERTY_DOCUMENT_CATEGORIES.withoutRegistration,
      })
    ).length;
  }
  for (const company of companyRows) {
    created += (
      await ensureDocumentRequirements({
        familyId,
        entityType: "SOCIEDADE",
        entityId: company.id,
        categories: COMPANY_DOCUMENT_CATEGORIES,
      })
    ).length;
  }
  for (const asset of assetRows) {
    created += (
      await ensureDocumentRequirements({
        familyId,
        entityType: "ATIVO",
        entityId: asset.id,
        categories: ASSET_DOCUMENT_CATEGORIES,
      })
    ).length;
  }
  return created;
}
