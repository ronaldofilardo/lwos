import { and, count, desc, eq, gt, isNull } from "drizzle-orm";
import {
  documents,
  families,
  familyAccess,
  financialProposals,
  leads,
  lwrReports,
  otherAssets,
  people,
  portalLinks,
  companies,
  properties,
} from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import { buildProcessTimeline, type ProcessTimeline } from "./family-timeline";

function isResolved(status: string): boolean {
  return status === "VALIDADO" || status === "DISPENSADO";
}

/**
 * Agrega o estado do processo (interesse → portal) para montar a timeline
 * da Visão Unificada. Uma única query por entidade — evita N+1.
 */
export async function getFamilyTimelineRecord(
  familyId: string
): Promise<ProcessTimeline | null> {
  const db = await requireDatabase();

  const [family] = await db
    .select({
      id: families.id,
      createdAt: families.createdAt,
    })
    .from(families)
    .where(eq(families.id, familyId))
    .limit(1);
  if (!family) return null;

  const [lead] = await db
    .select({
      id: leads.id,
      status: leads.status,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
    })
    .from(leads)
    .where(eq(leads.familyId, familyId))
    .orderBy(desc(leads.createdAt))
    .limit(1);

  const [{ total: peopleTotal }] = await db
    .select({ total: count() })
    .from(people)
    .where(eq(people.familyId, familyId));

  const [{ total: titularCount }] = await db
    .select({ total: count() })
    .from(people)
    .where(
      and(eq(people.familyId, familyId), eq(people.isPrimaryContact, true))
    );

  const [{ total: propertiesTotal }] = await db
    .select({ total: count() })
    .from(properties)
    .where(eq(properties.familyId, familyId));

  const [{ total: companiesTotal }] = await db
    .select({ total: count() })
    .from(companies)
    .where(eq(companies.familyId, familyId));

  const [{ total: assetsTotal }] = await db
    .select({ total: count() })
    .from(otherAssets)
    .where(eq(otherAssets.familyId, familyId));

  const documentRows = await db
    .select({ status: documents.status })
    .from(documents)
    .where(eq(documents.familyId, familyId));

  const [{ total: lwrVersions }] = await db
    .select({ total: count() })
    .from(lwrReports)
    .where(eq(lwrReports.familyId, familyId));

  const [proposal] = await db
    .select({
      id: financialProposals.id,
      status: financialProposals.status,
      createdAt: financialProposals.createdAt,
      acceptedAt: financialProposals.acceptedAt,
    })
    .from(financialProposals)
    .where(eq(financialProposals.familyId, familyId))
    .orderBy(desc(financialProposals.createdAt))
    .limit(1);

  const [{ total: clientAccessCount }] = await db
    .select({ total: count() })
    .from(familyAccess)
    .where(
      and(
        eq(familyAccess.familyId, familyId),
        eq(familyAccess.accessRole, "CLIENTE")
      )
    );

  const [{ total: activePortalLinks }] = await db
    .select({ total: count() })
    .from(portalLinks)
    .where(
      and(
        eq(portalLinks.familyId, familyId),
        isNull(portalLinks.revokedAt),
        gt(portalLinks.expiresAt, new Date())
      )
    );

  const resolved = documentRows.filter(row => isResolved(row.status)).length;

  return buildProcessTimeline({
    family: { id: family.id, createdAt: family.createdAt },
    lead: lead
      ? {
          id: lead.id,
          status: lead.status,
          createdAt: lead.createdAt,
          // leads não têm coluna reviewedAt; updatedAt aproxima o momento da análise.
          reviewedAt: lead.updatedAt,
        }
      : null,
    people: {
      total: Number(peopleTotal),
      hasTitular: Number(titularCount) > 0,
    },
    patrimony: {
      properties: Number(propertiesTotal),
      companies: Number(companiesTotal),
      assets: Number(assetsTotal),
    },
    documents: {
      total: documentRows.length,
      resolved,
    },
    lwr: { versions: Number(lwrVersions) },
    proposal: proposal ?? null,
    access: {
      hasClientAccess: Number(clientAccessCount) > 0,
      activePortalLinks: Number(activePortalLinks),
    },
  });
}
