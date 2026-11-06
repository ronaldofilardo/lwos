/**
 * Dados brutos da aba «Cálculos» em uma única leitura por família.
 *
 * As queries existentes (`properties.list`, `companies.list`, `people.list`,
 * `assets.list`) não trazem titulares nem sócios — buscá-los imóvel a imóvel
 * geraria N+1 no cliente. Este repositório reaproveita as listagens já
 * existentes e faz só o cruzamento de titularidades em duas consultas.
 */
import { eq } from "drizzle-orm";
import { companies, companyStakeholders, properties, propertyOwners } from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import { listAssetRecords } from "../assets/assets-repository";
import { listCompanyRecords } from "../companies/company-repository";
import { listPeopleByFamily } from "../people/person-repository";
import { listPropertyRecords } from "../properties/property-repository";

export type FamilyCalculationsData = Awaited<ReturnType<typeof getFamilyCalculationsData>>;

/** Titulares (pessoa ou sociedade) de cada imóvel da família. */
async function listFamilyPropertyOwners(familyId: string) {
  const db = await requireDatabase();
  return db
    .select({
      propertyId: propertyOwners.propertyId,
      personId: propertyOwners.personId,
      companyId: propertyOwners.companyId,
      ownershipPercentage: propertyOwners.ownershipPercentage,
    })
    .from(propertyOwners)
    .innerJoin(properties, eq(properties.id, propertyOwners.propertyId))
    .where(eq(properties.familyId, familyId));
}

/** Quadro societário das sociedades da família (apenas sócios membros). */
async function listFamilyCompanyShares(familyId: string) {
  const db = await requireDatabase();
  return db
    .select({
      companyId: companyStakeholders.companyId,
      personId: companyStakeholders.personId,
      percentage: companyStakeholders.percentage,
    })
    .from(companyStakeholders)
    .innerJoin(companies, eq(companies.id, companyStakeholders.companyId))
    .where(eq(companies.familyId, familyId));
}

export async function getFamilyCalculationsData(familyId: string) {
  const [people, propertyRows, owners, companyRows, shares, assets] =
    await Promise.all([
      listPeopleByFamily(familyId),
      listPropertyRecords(familyId),
      listFamilyPropertyOwners(familyId),
      listCompanyRecords(familyId),
      listFamilyCompanyShares(familyId),
      listAssetRecords(familyId),
    ]);

  return {
    people: people.map(person => ({
      id: person.id,
      fullName: person.fullName,
      vinculo: person.vinculo,
      isPrimaryContact: person.isPrimaryContact,
      uf: person.uf,
    })),
    properties: propertyRows,
    owners,
    companies: companyRows,
    shares: shares.filter(share => share.personId !== null),
    assets,
  };
}
