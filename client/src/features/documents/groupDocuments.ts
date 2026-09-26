import type { Vinculo } from "@/features/families/types";
import { vinculoLabels } from "@/features/families/types";

export type DocumentEntityType =
  | "FAMILIA"
  | "PESSOA"
  | "IMOVEL"
  | "SOCIEDADE"
  | "ATIVO"
  | "CERTIDAO";

export type DocumentRow = {
  id: string;
  familyId: string;
  entityType: DocumentEntityType;
  entityId: string;
  category: string;
  status: string;
  currentVersion: number;
  rejectionReason: string | null;
  dispensationReason: string | null;
  dispensedAt: Date | string | null;
  validUntil: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type PersonLite = {
  id: string;
  fullName: string;
  vinculo: Vinculo | null;
  parentPersonId?: string | null;
};

export type PropertyLite = { id: string; description: string };
export type CompanyLite = { id: string; legalName: string };
export type AssetLite = { id: string; description: string };

export type DocumentGroup = {
  key: string;
  entityType: DocumentEntityType;
  entityId: string;
  title: string;
  subtitle: string | null;
  documents: DocumentRow[];
  sort: number;
};

/** As 4 seções pedidas da matriz documental (aba Documentos). */
export type DocumentSectionKey = "FAMILIARES" | "IMOVEL" | "SOCIEDADE" | "ATIVO";

export type DocumentSection = {
  key: DocumentSectionKey;
  title: string;
  description: string;
  groups: DocumentGroup[];
};

const vinculoRank: Record<string, number> = {
  TITULAR: 0,
  CONJUGE: 1,
  FILHO: 2,
  NETO: 3,
  BISNETO: 4,
};

const entityRank: Record<DocumentEntityType, number> = {
  FAMILIA: 0,
  PESSOA: 1,
  IMOVEL: 2,
  SOCIEDADE: 3,
  ATIVO: 4,
  CERTIDAO: 5,
};

export function isResolvedStatus(status: string): boolean {
  return status === "VALIDADO" || status === "DISPENSADO";
}

export function groupDocumentsByMember(
  documents: DocumentRow[],
  ctx: {
    familyName?: string | null;
    people: PersonLite[];
    properties: PropertyLite[];
    companies: CompanyLite[];
    assets?: AssetLite[];
  }
): DocumentGroup[] {
  const personById = new Map(ctx.people.map(p => [p.id, p]));
  const propertyById = new Map(ctx.properties.map(p => [p.id, p]));
  const companyById = new Map(ctx.companies.map(c => [c.id, c]));
  const assetById = new Map((ctx.assets ?? []).map(a => [a.id, a]));
  const personName = (id: string) => personById.get(id)?.fullName ?? null;

  const buckets = new Map<string, DocumentGroup>();

  for (const doc of documents) {
    const key = `${doc.entityType}:${doc.entityId}`;
    let title = "Outros documentos";
    let subtitle: string | null = null;
    let sort = 99;

    if (doc.entityType === "FAMILIA") {
      title = ctx.familyName || "Documentos da família";
      subtitle = "Requisitos gerais do caso";
      sort = entityRank.FAMILIA * 1000;
    } else if (doc.entityType === "PESSOA") {
      const person = personById.get(doc.entityId);
      title = person?.fullName ?? "Pessoa não encontrada";
      const rank = person ? (vinculoRank[person.vinculo ?? ""] ?? 9) : 9;
      const parent = person?.parentPersonId
        ? personName(person.parentPersonId)
        : null;
      const parts: string[] = [];
      if (person?.vinculo) parts.push(vinculoLabels[person.vinculo]);
      if (parent) parts.push(`filho(a) de ${parent}`);
      subtitle = parts.length ? parts.join(" · ") : null;
      sort =
        entityRank.PESSOA * 1000 +
        rank * 10 +
        (person ? ctx.people.findIndex(p => p.id === person.id) : 99);
    } else if (doc.entityType === "IMOVEL") {
      title = propertyById.get(doc.entityId)?.description ?? "Imóvel";
      subtitle = "Imóvel · Requisitos documentais";
      sort =
        entityRank.IMOVEL * 1000 +
        (propertyById.has(doc.entityId)
          ? ctx.properties.findIndex(p => p.id === doc.entityId)
          : 99);
    } else if (doc.entityType === "SOCIEDADE") {
      title = companyById.get(doc.entityId)?.legalName ?? "Sociedade";
      subtitle = "Sociedade / Holding · Requisitos documentais";
      sort =
        entityRank.SOCIEDADE * 1000 +
        (companyById.has(doc.entityId)
          ? ctx.companies.findIndex(c => c.id === doc.entityId)
          : 99);
    } else if (doc.entityType === "ATIVO") {
      title = assetById.get(doc.entityId)?.description ?? "Ativo";
      subtitle = "Demais ativos · Requisitos documentais";
      sort =
        entityRank.ATIVO * 1000 +
        (assetById.has(doc.entityId)
          ? (ctx.assets ?? []).findIndex(a => a.id === doc.entityId)
          : 99);
    }

    const existing = buckets.get(key);
    if (existing) {
      existing.documents.push(doc);
    } else {
      buckets.set(key, {
        key,
        entityType: doc.entityType,
        entityId: doc.entityId,
        title,
        subtitle,
        documents: [doc],
        sort,
      });
    }
  }

  return Array.from(buckets.values()).sort(
    (a, b) => a.sort - b.sort || a.title.localeCompare(b.title, "pt-BR")
  );
}

const SECTION_META: Record<
  DocumentSectionKey,
  { title: string; description: string; entityTypes: DocumentEntityType[] }
> = {
  FAMILIARES: {
    title: "Familiares",
    description: "Requisitos da família e de cada membro.",
    entityTypes: ["FAMILIA", "PESSOA"],
  },
  IMOVEL: {
    title: "Imóveis",
    description: "Matrícula, IPTU/ITR e demais documentos por imóvel.",
    entityTypes: ["IMOVEL"],
  },
  SOCIEDADE: {
    title: "Sociedades & Holdings",
    description: "Contrato social, CNPJ e demais documentos societários.",
    entityTypes: ["SOCIEDADE"],
  },
  ATIVO: {
    title: "Ativos",
    description: "Comprovação de titularidade e lastro dos demais ativos.",
    entityTypes: ["ATIVO"],
  },
};

/** Organiza os grupos nas 4 seções da matriz documental. */
export function buildDocumentSections(
  groups: DocumentGroup[]
): DocumentSection[] {
  return (Object.keys(SECTION_META) as DocumentSectionKey[])
    .map(key => {
      const meta = SECTION_META[key];
      return {
        key,
        title: meta.title,
        description: meta.description,
        groups: groups.filter(group => meta.entityTypes.includes(group.entityType)),
      };
    })
    .filter(section => section.groups.length > 0);
}
