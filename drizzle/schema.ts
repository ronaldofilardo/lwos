import {
  boolean,
  date,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { APP_ROLES } from "@shared/domain/roles";

const ids = { id: varchar("id", { length: 36 }).primaryKey() };
const auditTime = timestamp("createdAt").defaultNow().notNull();
const updatedAtCol = () =>
  timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull();

export const civilStatusValues = [
  "SOLTEIRO",
  "DIVORCIADO",
  "VIUVO",
  "CASADO",
  "UNIAO_ESTAVEL",
] as const;

export const maritalRegimeValues = ["CPB", "CUB", "STB", "STOB", "NA"] as const;
export const documentStatusValues = [
  "PENDENTE",
  "RECEBIDO_EM_ANALISE",
  "VALIDADO",
  "REJEITADO",
  "VENCIDO",
  "DISPENSADO",
  "NA",
] as const;

export const assetCategoryValues = [
  "INVESTIMENTO",
  "VEICULO",
  "PARTICIPACAO_OUTRA",
  "DIREITO",
  "OUTRO",
] as const;

export const proposalStatusValues = [
  "RASCUNHO",
  "ENVIADA",
  "ACEITA",
  "CONTRAPROPOSTA_RECEBIDA",
  "RECUSADA",
] as const;

export const leadStatusValues = ["PENDENTE", "ACEITO", "RECUSADO"] as const;

export const vinculoValues = [
  "TITULAR",
  "CONJUGE",
  "FILHO",
  "NETO",
  "BISNETO",
] as const;

export const entityTypeValues = [
  "FAMILIA",
  "PESSOA",
  "IMOVEL",
  "SOCIEDADE",
  "ATIVO",
  "CERTIDAO",
] as const;

export const companyTypeValues = [
  "HOLDING_NACIONAL",
  "HOLDING_INTERNACIONAL",
  "SOCIEDADE_NACIONAL",
] as const;

/** Tipos de gravame aceitos no droplist (o texto livre vira OUTRO). */
export const encumbranceTypeValues = [
  "HIPOTECA",
  "ALIENACAO_FIDUCIARIA",
  "PENHOR",
  "USUFRUTO",
  "SERVIDAO",
  "SEQUESTRO",
  "OUTRO",
] as const;

export const certidaoScopeValues = ["PESSOA", "SOCIEDADE"] as const;

export const certidaoTypeValues = [
  "CND_FEDERAL",
  "CND_ESTADUAL",
  "CND_MUNICIPAL",
  "CERTIDAO_TJ",
  "CERTIDAO_TRF",
  "CNAT",
  "CNDT",
  "CERTIDAO_PROTESTOS",
] as const;

// SOMENTE_FISICA = certidão que só emite de forma presencial (não on-line).
export const certidaoStatusValues = [
  "PENDENTE",
  "NEGATIVA",
  "POSITIVA_COM_EFEITOS_DE_NEGATIVA",
  "SOMENTE_FISICA",
  "POSITIVA",
] as const;

/** Jurisdições do droplist de holdings internacionais. */
export const companyJurisdictionValues = [
  "BVI",
  "BAHAMAS",
  "DELAWARE",
  "ILHAS_MARSHALL",
  "CAYMAN",
  "UK",
  "PANAMA",
] as const;

/** Status do bloco de documentos do modal de detalhes da holding. */
export const companyDocStatusValues = [
  "PENDENTE",
  "RECEBIDO",
  "NA",
  "NAO_POSSUI",
] as const;

/** 7 documentos por variante (nacional e internacional) do modal. */
export const companyDocTypeValues = [
  "CONTRATO_SOCIAL",
  "BALANCO_FECHADO",
  "BALANCETE_ATUALIZADO",
  "ACORDO_SOCIOS",
  "LIVRO_RAZAO_IMOBILIZADO",
  "LIVRO_REGISTRO_ACOES_NOMINATIVAS",
  "LIVRO_TRANSFERENCIA_ACOES",
  "MEMORANDUM_ARTICLES",
  "BALANCE_SHEET",
  "CERTIFICATE_INCORPORATION",
  "REGISTER_DIRECTORS",
  "REGISTER_MEMBERS",
  "CERTIFICATE_GOOD_STANDING",
  "SHARE_CERTIFICATE",
] as const;

export const roleEnum = pgEnum("role", APP_ROLES);
export const civilStatusEnum = pgEnum("civilStatus", civilStatusValues);
export const maritalRegimeEnum = pgEnum("maritalRegime", maritalRegimeValues);
export const documentStatusEnum = pgEnum(
  "documentStatus",
  documentStatusValues
);
export const assetCategoryEnum = pgEnum("assetCategory", assetCategoryValues);
export const leadStatusEnum = pgEnum("leadStatus", leadStatusValues);
export const vinculoEnum = pgEnum("vinculo", vinculoValues);
export const proposalStatusEnum = pgEnum(
  "proposalStatus",
  proposalStatusValues
);
export const projectStatusEnum = pgEnum("projectStatus", [
  "EM_ANDAMENTO",
  "AGUARDANDO_DOCUMENTOS",
  "EM_REVISAO",
  "CONCLUIDO",
]);
export const accessRoleEnum = pgEnum("accessRole", ["RESPONSAVEL", "CLIENTE"]);
export const entityTypeEnum = pgEnum("entityType", entityTypeValues);
export const rightTypeEnum = pgEnum("rightType", [
  "PROPRIEDADE",
  "USUFRUTO",
  "NUA_PROPRIEDADE",
]);
export const companyTypeEnum = pgEnum("companyType", companyTypeValues);
export const encumbranceTypeEnum = pgEnum(
  "encumbranceType",
  encumbranceTypeValues
);
export const certidaoScopeEnum = pgEnum("certidaoScope", certidaoScopeValues);
export const certidaoTypeEnum = pgEnum("certidaoType", certidaoTypeValues);
export const certidaoStatusEnum = pgEnum(
  "certidaoStatus",
  certidaoStatusValues
);
export const companyJurisdictionEnum = pgEnum(
  "companyJurisdiction",
  companyJurisdictionValues
);
export const companyDocStatusEnum = pgEnum(
  "companyDocStatus",
  companyDocStatusValues
);
export const companyDocTypeEnum = pgEnum(
  "companyDocType",
  companyDocTypeValues
);
export const contributionStatusEnum = pgEnum("contributionStatus", [
  "RASCUNHO",
  "EM_ANALISE",
  "CONCLUIDA",
]);

// Fase 2: autenticação local por e-mail/senha (sem OAuth).
// `email` é o identificador de login (único, obrigatório).
// `passwordHash` guarda o hash bcrypt — nunca a senha em texto puro.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  role: roleEnum("role").default("CLIENTE").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: updatedAtCol(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const families = pgTable("families", {
  ...ids,
  name: varchar("name", { length: 160 }).notNull(),
  civilStatus: civilStatusEnum("civilStatus").notNull(),
  maritalRegime: maritalRegimeEnum("maritalRegime").notNull(),
  notes: text("notes"),
  createdBy: varchar("createdBy", { length: 36 }).notNull(),
  createdAt: auditTime,
  updatedAt: updatedAtCol(),
});

export const projects = pgTable("projects", {
  ...ids,
  familyId: varchar("familyId", { length: 36 }).notNull().unique(),
  title: varchar("title", { length: 160 }).notNull(),
  status: projectStatusEnum("status").default("EM_ANDAMENTO").notNull(),
  createdAt: auditTime,
  updatedAt: updatedAtCol(),
});

export const familyAccess = pgTable(
  "familyAccess",
  {
    ...ids,
    familyId: varchar("familyId", { length: 36 }).notNull(),
    userId: integer("userId").notNull(),
    accessRole: accessRoleEnum("accessRole").default("CLIENTE").notNull(),
    createdAt: auditTime,
  },
  table => [
    uniqueIndex("family_access_unique").on(table.familyId, table.userId),
    index("family_access_user_idx").on(table.userId),
  ]
);

/**
 * Interessados que se cadastraram publicamente pela tela de login (nome, CPF,
 * e-mail, data de nascimento + 1 arquivo de identificação). O SOCIO analisa
 * fora do sistema e, se aceitar, aceita o lead aqui — o que gera a família
 * e já cadastra o interessado como titular (pra depois gerar o link de
 * primeiro acesso normalmente).
 */
export const leads = pgTable("leads", {
  ...ids,
  fullName: varchar("fullName", { length: 160 }).notNull(),
  taxId: varchar("taxId", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  birthDate: date("birthDate").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  storageKey: varchar("storageKey", { length: 500 }).notNull(),
  status: leadStatusEnum("status").default("PENDENTE").notNull(),
  reviewedBy: integer("reviewedBy"),
  reviewNote: text("reviewNote"),
  familyId: varchar("familyId", { length: 36 }),
  createdAt: auditTime,
  updatedAt: updatedAtCol(),
});

export const people = pgTable(
  "people",
  {
    ...ids,
    familyId: varchar("familyId", { length: 36 }).notNull(),
    fullName: varchar("fullName", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }),
    taxId: varchar("taxId", { length: 20 }),
    birthDate: date("birthDate"),
    civilStatus: civilStatusEnum("civilStatus").notNull(),
    maritalRegime: maritalRegimeEnum("maritalRegime").notNull(),
    exSpouseNote: text("exSpouseNote"),
    // Vínculo com a família: TITULAR/CONJUGE (do titular)/FILHO/NETO/BISNETO.
    // Nullable só para backfill de registros antigos; o form exige em novo cadastro.
    vinculo: vinculoEnum("vinculo"),
    // Pai/mãe na árvore: obrigatório para NETO (pessoa FILHO) e BISNETO (pessoa NETO).
    parentPersonId: varchar("parentPersonId", { length: 36 }),
    // Nome do cônjuge quando FILHO/NETO/BISNETO casado ou em união estável
    // (agregado representado na linha, sem pessoa própria).
    spouseName: varchar("spouseName", { length: 160 }),
    // Fase 3: marca a pessoa titular/responsável da família — usada para
    // nomear a pasta de storage local (CPF do titular). Só uma pessoa por
    // família pode ser true — garantido pelo unique index parcial
    // people_primary_unique (WHERE "isPrimaryContact" = true).
    isPrimaryContact: boolean("isPrimaryContact").default(false).notNull(),
    createdAt: auditTime,
    updatedAt: updatedAtCol(),
  },
  table => [
    index("people_family_idx").on(table.familyId),
    uniqueIndex("people_primary_unique")
      .on(table.familyId)
      .where(sql`${table.isPrimaryContact} = true`),
  ]
);

export const documents = pgTable(
  "documents",
  {
    ...ids,
    familyId: varchar("familyId", { length: 36 }).notNull(),
    entityType: entityTypeEnum("entityType").notNull(),
    entityId: varchar("entityId", { length: 36 }).notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    status: documentStatusEnum("status").default("PENDENTE").notNull(),
    rejectionReason: text("rejectionReason"),
    dispensationReason: text("dispensationReason"),
    dispensationRequestedBy: varchar("dispensationRequestedBy", { length: 36 }),
    dispensationApprovedBy: varchar("dispensationApprovedBy", { length: 36 }),
    dispensedAt: timestamp("dispensedAt"),
    currentVersion: integer("currentVersion").default(0).notNull(),
    validUntil: date("validUntil"),
    createdAt: auditTime,
    updatedAt: updatedAtCol(),
  },
  table => [index("documents_family_idx").on(table.familyId)]
);

export const documentVersions = pgTable(
  "documentVersions",
  {
    ...ids,
    documentId: varchar("documentId", { length: 36 }).notNull(),
    versionNumber: integer("versionNumber").notNull(),
    originalName: varchar("originalName", { length: 255 }).notNull(),
    mimeType: varchar("mimeType", { length: 120 }).notNull(),
    storageKey: varchar("storageKey", { length: 500 }).notNull(),
    sha256: varchar("sha256", { length: 64 }).notNull(),
    uploadedBy: varchar("uploadedBy", { length: 36 }).notNull(),
    createdAt: auditTime,
  },
  table => [
    uniqueIndex("document_version_unique").on(
      table.documentId,
      table.versionNumber
    ),
  ]
);

export const properties = pgTable(
  "properties",
  {
    ...ids,
    familyId: varchar("familyId", { length: 36 }).notNull(),
    description: varchar("description", { length: 240 }).notNull(),
    hasRegistration: boolean("hasRegistration").default(true).notNull(),
    registrationNumber: varchar("registrationNumber", { length: 120 }),
    alternativeDocType: varchar("alternativeDocType", { length: 80 }),
    noRegistrationReason: text("noRegistrationReason"),
    registryOffice: varchar("registryOffice", { length: 160 }),
    propertyCity: varchar("propertyCity", { length: 120 }).notNull(),
    registryCity: varchar("registryCity", { length: 120 }),
    acquisitionDate: date("acquisitionDate"),
    declaredValue: decimal("declaredValue", { precision: 15, scale: 2 }),
    marketValue: decimal("marketValue", { precision: 15, scale: 2 }),
    createdAt: auditTime,
    updatedAt: updatedAtCol(),
  },
  table => [index("properties_family_idx").on(table.familyId)]
);

export const propertyOwners = pgTable("propertyOwners", {
  ...ids,
  propertyId: varchar("propertyId", { length: 36 }).notNull(),
  personId: varchar("personId", { length: 36 }).notNull(),
  ownershipPercentage: decimal("ownershipPercentage", {
    precision: 5,
    scale: 2,
  }).notNull(),
  rightType: rightTypeEnum("rightType").default("PROPRIEDADE").notNull(),
  createdAt: auditTime,
});

export const encumbrances = pgTable("encumbrances", {
  ...ids,
  propertyId: varchar("propertyId", { length: 36 }).notNull(),
  type: encumbranceTypeEnum("type").notNull(),
  description: text("description"),
  active: boolean("active").default(true).notNull(),
  createdAt: auditTime,
});

export const companies = pgTable(
  "companies",
  {
    ...ids,
    familyId: varchar("familyId", { length: 36 }).notNull(),
    legalName: varchar("legalName", { length: 180 }).notNull(),
    taxNumber: varchar("taxNumber", { length: 20 }),
    type: companyTypeEnum("type").default("HOLDING_NACIONAL").notNull(),
    createdAt: auditTime,
    updatedAt: updatedAtCol(),
  },
  table => [index("companies_family_idx").on(table.familyId)]
);

export const companyStakeholders = pgTable(
  "companyStakeholders",
  {
    ...ids,
    companyId: varchar("companyId", { length: 36 }).notNull(),
    // Sócio membro da família (people) OU não-membro informado em externalName.
    personId: varchar("personId", { length: 36 }),
    externalName: varchar("externalName", { length: 160 }),
    percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
    createdAt: auditTime,
  },
  table => [
    uniqueIndex("stakeholder_person_unique").on(
      table.companyId,
      table.personId
    ),
    uniqueIndex("stakeholder_external_unique").on(
      table.companyId,
      table.externalName
    ),
  ]
);

export const propertyContributions = pgTable("propertyContributions", {
  ...ids,
  propertyId: varchar("propertyId", { length: 36 }).notNull(),
  companyId: varchar("companyId", { length: 36 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  status: contributionStatusEnum("status").default("RASCUNHO").notNull(),
  createdAt: auditTime,
});

export const otherAssets = pgTable(
  "otherAssets",
  {
    ...ids,
    familyId: varchar("familyId", { length: 36 }).notNull(),
    category: assetCategoryEnum("category").default("OUTRO").notNull(),
    description: varchar("description", { length: 240 }).notNull(),
    declaredValue: decimal("declaredValue", { precision: 15, scale: 2 }),
    marketValue: decimal("marketValue", { precision: 15, scale: 2 }),
    ownerPersonId: varchar("ownerPersonId", { length: 36 }),
    notes: text("notes"),
    createdAt: auditTime,
    updatedAt: updatedAtCol(),
  },
  table => [index("other_assets_family_idx").on(table.familyId)]
);

/**
 * Certidões (negativas/positivas) exigidas da família: uma linha por
 * combinado escopo × tipo. O arquivo vai em `documents` (entityType
 * CERTIDAO, entityId = id da certidão) pra reaproveitar versionamento,
 * SHA-256 e o proxy de download com autorização por família.
 */
export const certidoes = pgTable(
  "certidoes",
  {
    ...ids,
    familyId: varchar("familyId", { length: 36 }).notNull(),
    scope: certidaoScopeEnum("scope").notNull(),
    subjectId: varchar("subjectId", { length: 36 }).notNull(),
    type: certidaoTypeEnum("type").notNull(),
    status: certidaoStatusEnum("status").default("PENDENTE").notNull(),
    validUntil: date("validUntil"),
    documentId: varchar("documentId", { length: 36 }),
    createdAt: auditTime,
    updatedAt: updatedAtCol(),
  },
  table => [
    uniqueIndex("certidao_unique").on(table.subjectId, table.type),
    index("certidoes_family_idx").on(table.familyId),
  ]
);

/**
 * Ficha de detalhes da holding/sociedade (modal "Detalhes"): 1:1 com
 * `companies`. Denominação/CNPJ ficam em `companies`, os sócios vêm de
 * `companyStakeholders`, as certidões nacionais de `certidoes` e os valores
 * por quota são calculados na leitura (não gravados). Colunas exclusivas da
 * variante internacional ficam nullable.
 */
export const companyDetails = pgTable(
  "companyDetails",
  {
    ...ids,
    companyId: varchar("companyId", { length: 36 }).notNull(),
    nire: varchar("nire", { length: 20 }),
    uf: varchar("uf", { length: 2 }),
    sede: varchar("sede", { length: 160 }),
    societaryType: varchar("societaryType", { length: 60 }),
    taxRegime: varchar("taxRegime", { length: 60 }),
    corporatePurpose: text("corporatePurpose"),
    capitalSocial: decimal("capitalSocial", { precision: 15, scale: 2 }),
    shareQuantity: decimal("shareQuantity", { precision: 15, scale: 2 }),
    administrator1: varchar("administrator1", { length: 120 }),
    administrator2: varchar("administrator2", { length: 120 }),
    equity: decimal("equity", { precision: 15, scale: 2 }),
    cashAndEquivalents: decimal("cashAndEquivalents", {
      precision: 15,
      scale: 2,
    }),
    inventory: decimal("inventory", { precision: 15, scale: 2 }),
    accountsReceivable: decimal("accountsReceivable", {
      precision: 15,
      scale: 2,
    }),
    investments: decimal("investments", { precision: 15, scale: 2 }),
    fixedAssets: decimal("fixedAssets", { precision: 15, scale: 2 }),
    retainedEarnings: decimal("retainedEarnings", { precision: 15, scale: 2 }),
    taxLiabilities: decimal("taxLiabilities", { precision: 15, scale: 2 }),
    laborLiabilities: decimal("laborLiabilities", { precision: 15, scale: 2 }),
    financing: decimal("financing", { precision: 15, scale: 2 }),
    estimatedMarketValue: decimal("estimatedMarketValue", {
      precision: 15,
      scale: 2,
    }),
    companyNumber: varchar("companyNumber", { length: 60 }),
    jurisdiction: companyJurisdictionEnum("jurisdiction"),
    residentAgent: varchar("residentAgent", { length: 120 }),
    notes: text("notes"),
    createdAt: auditTime,
    updatedAt: updatedAtCol(),
  },
  table => [
    uniqueIndex("company_details_unique").on(table.companyId),
  ]
);

/**
 * Documentos do modal de detalhes da holding: uma linha por documento da
 * variante (nacional ou internacional), com status próprio
 * PENDENTE/RECEBIDO/NA/NAO_POSSUI.
 */
export const companyDetailDocs = pgTable(
  "companyDetailDocs",
  {
    ...ids,
    companyId: varchar("companyId", { length: 36 }).notNull(),
    docType: companyDocTypeEnum("docType").notNull(),
    status: companyDocStatusEnum("status").default("PENDENTE").notNull(),
    createdAt: auditTime,
    updatedAt: updatedAtCol(),
  },
  table => [
    uniqueIndex("company_detail_doc_unique").on(table.companyId, table.docType),
    index("company_detail_docs_idx").on(table.companyId),
  ]
);

export const financialProposals = pgTable(
  "financialProposals",
  {
    ...ids,
    familyId: varchar("familyId", { length: 36 }).notNull(),
    scopeDescription: text("scopeDescription").notNull(),
    proposedValue: decimal("proposedValue", {
      precision: 15,
      scale: 2,
    }).notNull(),
    status: proposalStatusEnum("status").default("RASCUNHO").notNull(),
    counterProposalValue: decimal("counterProposalValue", {
      precision: 15,
      scale: 2,
    }),
    counterProposalNotes: text("counterProposalNotes"),
    clientNotes: text("clientNotes"),
    acceptedAt: timestamp("acceptedAt"),
    approvedBySocioId: varchar("approvedBySocioId", { length: 36 }),
    createdAt: auditTime,
    updatedAt: updatedAtCol(),
  },
  table => [index("financial_proposals_family_idx").on(table.familyId)]
);

export const portalLinks = pgTable("portalLinks", {
  ...ids,
  familyId: varchar("familyId", { length: 36 }).notNull(),
  tokenHash: varchar("tokenHash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  revokedAt: timestamp("revokedAt"),
  createdBy: varchar("createdBy", { length: 36 }).notNull(),
  createdAt: auditTime,
});

export const firstAccessLinks = pgTable("firstAccessLinks", {
  ...ids,
  familyId: varchar("familyId", { length: 36 }).notNull(),
  personId: varchar("personId", { length: 36 }).notNull(),
  tokenHash: varchar("tokenHash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  consumedAt: timestamp("consumedAt"),
  createdBy: varchar("createdBy", { length: 36 }).notNull(),
  createdAt: auditTime,
});

export const lwrReports = pgTable("lwrReports", {
  ...ids,
  familyId: varchar("familyId", { length: 36 }).notNull(),
  version: integer("version").notNull(),
  baseDate: date("baseDate").notNull(),
  responsibleUserId: varchar("responsibleUserId", { length: 36 }).notNull(),
  proposedStructure: text("proposedStructure").notNull(),
  financialProposal: text("financialProposal").notNull(),
  canvaUrl: text("canvaUrl"),
  presentationFileKey: varchar("presentationFileKey", { length: 500 }),
  createdAt: auditTime,
});

export const auditLogs = pgTable(
  "auditLogs",
  {
    ...ids,
    familyId: varchar("familyId", { length: 36 }),
    actorUserId: varchar("actorUserId", { length: 36 }),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entityType", { length: 80 }).notNull(),
    entityId: varchar("entityId", { length: 36 }).notNull(),
    metadata: text("metadata"),
    createdAt: auditTime,
  },
  table => [index("audit_family_idx").on(table.familyId)]
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
