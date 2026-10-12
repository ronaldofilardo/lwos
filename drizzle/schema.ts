import {
  boolean,
  check,
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
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { APP_ROLES } from "../shared/domain/roles";
import { UFS } from "../shared/validation/uf";

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
  "NAO_POSSUI",
] as const;

export const assetCategoryValues = [
  "ATIVOS_AGRO",
  "CONTA_CORRENTE",
  "CREDITO",
  "DINHEIRO_ESPECIE",
  "INVESTIMENTOS",
  "OUTROS",
  "SEMOVENTES",
  "VEICULO_EMBARCACAO_AERONAVE",
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

export const projectStatusValues = [
  "ATIVO",
  "SUSPENSO",
  "CONCLUIDO",
  "CANCELADO",
] as const;

/** Objetivos múltiplos do projeto (14 opções — grafia: "SAIDA", não "SAIDE"). */
export const projectObjectiveValues = [
  "PROTECAO_PATRIMONIAL",
  "PLANEJAMENTO_SUCESSORIO",
  "GOVERNANCA_FAMILIAR_OU_SOCIETARIA",
  "PREVENCAO_DE_CONFLITOS_ENTRE_HERDEIROS",
  "FORMALIZACAO_DE_RELACIONAMENTOS",
  "SEGURO_DE_VIDA",
  "SEGURO_SAUDE",
  "EFICIENCIA_FISCAL",
  "REESTRUTURACAO_SOCIETARIA",
  "DIVERSIFICACAO_DE_JURISDICAO_E_MOEDA",
  "FUNDOS_DE_INVESTIMENTOS",
  "SAIDA_DEFINITIVA_DO_BRASIL",
  "REPERFILAMENTO_DE_DIVIDA",
  "FILANTROPIA",
] as const;

export const propertyKindValues = ["URBANO", "RURAL"] as const;

export const propertyUtilityValues = [
  "ATIVIDADE_INDUSTRIAL_COMERCIAL",
  "ATIVIDADE_RURAL",
  "INVESTIMENTO",
  "LAZER",
  "LOCACAO_ARRENDAMENTO",
  "OUTRA",
  "PENDENTE",
  "RESIDENCIAL",
] as const;

export const societaryTypeValues = ["LTDA", "SA", "SCP"] as const;

export const taxRegimeValues = [
  "SIMPLES_NACIONAL",
  "LUCRO_PRESUMIDO",
  "LUCRO_REAL",
] as const;

/** Gravame do imóvel (coluna própria; a tabela encumbrances foi removida). */
export const encumbranceTypeValues = [
  "PENDENTE",
  "ALIENACAO_FIDUCIARIA",
  "ARROLAMENTO",
  "HIPOTECA",
  "INCOMUNICABILIDADE_INALIENABILIDADE_IMPENHORABILIDADE",
  "NA",
  "NAO_HA",
  "OUTROS",
  "PENHORA",
  "SERVIDAO_PASSAGEM",
  "USUFRUTO",
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
export const projectStatusEnum = pgEnum("projectStatus", projectStatusValues);
export const projectObjectiveEnum = pgEnum(
  "projectObjective",
  projectObjectiveValues
);
export const accessRoleEnum = pgEnum("accessRole", ["RESPONSAVEL", "CLIENTE"]);
export const entityTypeEnum = pgEnum("entityType", entityTypeValues);
export const rightTypeEnum = pgEnum("rightType", [
  "PROPRIEDADE",
  "USUFRUTO",
  "NUA_PROPRIEDADE",
]);
export const propertyKindEnum = pgEnum("propertyKind", propertyKindValues);
export const propertyUtilityEnum = pgEnum(
  "propertyUtility",
  propertyUtilityValues
);
export const encumbranceTypeEnum = pgEnum(
  "propertyEncumbranceType",
  encumbranceTypeValues
);
export const societaryTypeEnum = pgEnum("societaryType", societaryTypeValues);
export const taxRegimeEnum = pgEnum("taxRegime", taxRegimeValues);
export const ufEnum = pgEnum("uf", UFS);
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
  notes: text("notes"),
  createdBy: varchar("createdBy", { length: 36 }).notNull(),
  createdAt: auditTime,
  updatedAt: updatedAtCol(),
});

export const projects = pgTable("projects", {
  ...ids,
  familyId: varchar("familyId", { length: 36 }).notNull().unique(),
  title: varchar("title", { length: 160 }).notNull(),
  status: projectStatusEnum("status").default("ATIVO").notNull(),
  createdAt: auditTime,
  updatedAt: updatedAtCol(),
});

/**
 * Objetivos múltiplos do projeto: uma linha por opção marcada (das 14 do
 * enum). A restrição única impede repetir o mesmo objetivo no projeto.
 */
export const projectObjectives = pgTable(
  "projectObjectives",
  {
    ...ids,
    projectId: varchar("projectId", { length: 36 }).notNull(),
    objective: projectObjectiveEnum("objective").notNull(),
    createdAt: auditTime,
  },
  table => [
    uniqueIndex("project_objective_unique").on(
      table.projectId,
      table.objective
    ),
  ]
);

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
    phone: varchar("phone", { length: 20 }),
    cep: varchar("cep", { length: 8 }),
    street: varchar("street", { length: 160 }),
    number: varchar("number", { length: 20 }),
    complement: varchar("complement", { length: 80 }),
    district: varchar("district", { length: 80 }),
    city: varchar("city", { length: 120 }),
    uf: varchar("uf", { length: 2 }),
    addressSameAsPrimary: boolean("addressSameAsPrimary")
      .default(false)
      .notNull(),
    isDependent: boolean("isDependent").default(false).notNull(),
    createdAt: auditTime,
    updatedAt: updatedAtCol(),
  },
  table => [
    index("people_family_idx").on(table.familyId),
    uniqueIndex("people_primary_unique")
      .on(table.familyId)
      .where(sql`${table.isPrimaryContact} = true`),
    // CPF normalizado por família: um mesmo CPF não pode ser duplicado na família.
    uniqueIndex("people_family_taxid_unique").on(table.familyId, table.taxId),
    // Um único cônjuge por família.
    uniqueIndex("people_conjuge_unique")
      .on(table.familyId)
      .where(sql`${table.vinculo} = 'CONJUGE'`),
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
    issuedAt: date("issuedAt"),
    validUntil: date("validUntil"),
    referenceDate: date("referenceDate"),
    apostilled: boolean("apostilled").default(false).notNull(),
    translated: boolean("translated").default(false).notNull(),
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
    kind: propertyKindEnum("kind"),
    hasRegistration: boolean("hasRegistration").default(true).notNull(),
    registrationNumber: varchar("registrationNumber", { length: 120 }),
    alternativeDocType: varchar("alternativeDocType", { length: 80 }),
    noRegistrationReason: text("noRegistrationReason"),
    // Cartório: número de registro 1–55 (provimento) + UF e cidade do cartório.
    registryOfficeNumber: integer("registryOfficeNumber"),
    registryUf: varchar("registryUf", { length: 2 }),
    registryCity: varchar("registryCity", { length: 120 }),
    propertyCity: varchar("propertyCity", { length: 120 }).notNull(),
    uf: varchar("uf", { length: 2 }),
    notes: text("notes"),
    acquisitionDate: date("acquisitionDate"),
    irpfBalanceValue: decimal("irpfBalanceValue", { precision: 15, scale: 2 }),
    marketValue: decimal("marketValue", { precision: 15, scale: 2 }),
    venalValue: decimal("venalValue", { precision: 15, scale: 2 }),
    irGcapValue: decimal("irGcapValue", { precision: 15, scale: 2 }),
    emolumentsValue: decimal("emolumentsValue", { precision: 15, scale: 2 }),
    itbiRate: decimal("itbiRate", { precision: 5, scale: 2 }),
    hasLaudemio: boolean("hasLaudemio").default(false).notNull(),
    laudemioRate: decimal("laudemioRate", { precision: 5, scale: 2 }),
    utility: propertyUtilityEnum("utility").default("PENDENTE").notNull(),
    rentValue: decimal("rentValue", { precision: 15, scale: 2 }),
    inscricaoImobiliaria: varchar("inscricaoImobiliaria", { length: 120 }),
    ccir: varchar("ccir", { length: 40 }),
    nirf: varchar("nirf", { length: 40 }),
    encumbranceType: encumbranceTypeEnum("encumbranceType")
      .default("PENDENTE")
      .notNull(),
    encumbranceNote: text("encumbranceNote"),
    createdAt: auditTime,
    updatedAt: updatedAtCol(),
  },
  table => [
    index("properties_family_idx").on(table.familyId),
    check(
      "properties_registry_office_number_ck",
      sql`${table.registryOfficeNumber} BETWEEN 1 AND 55`
    ),
    check(
      "properties_values_non_negative_ck",
      sql`${table.irpfBalanceValue} >= 0 AND ${table.marketValue} >= 0 AND ${table.venalValue} >= 0 AND ${table.irGcapValue} >= 0 AND ${table.emolumentsValue} >= 0`
    ),
    check(
      "properties_itbi_rate_ck",
      sql`${table.itbiRate} >= 0 AND ${table.itbiRate} <= 100`
    ),
    check(
      "properties_laudemio_ck",
      sql`NOT ${table.hasLaudemio} OR (${table.laudemioRate} IS NOT NULL AND ${table.laudemioRate} > 0)`
    ),
    check(
      "properties_rent_value_ck",
      sql`${table.utility} <> 'LOCACAO_ARRENDAMENTO' OR (${table.rentValue} IS NOT NULL AND ${table.rentValue} > 0)`
    ),
    check(
      "properties_rural_docs_ck",
      sql`${table.kind} IS DISTINCT FROM 'RURAL' OR (${table.ccir} IS NOT NULL AND ${table.nirf} IS NOT NULL)`
    ),
  ]
);

export const propertyOwners = pgTable(
  "propertyOwners",
  {
    ...ids,
    propertyId: varchar("propertyId", { length: 36 }).notNull(),
    personId: varchar("personId", { length: 36 }),
    companyId: varchar("companyId", { length: 36 }),
    ownershipPercentage: decimal("ownershipPercentage", {
      precision: 5,
      scale: 2,
    }).notNull(),
    rightType: rightTypeEnum("rightType").default("PROPRIEDADE").notNull(),
    createdAt: auditTime,
  },
  table => [
    uniqueIndex("property_owner_person_unique").on(
      table.propertyId,
      table.personId
    ),
    uniqueIndex("property_owner_company_unique").on(
      table.propertyId,
      table.companyId
    ),
    // Exatamente um titulável preenchido: pessoa física OU sociedade.
    check(
      "property_owner_exactly_one_ck",
      sql`(CASE WHEN ${table.personId} IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN ${table.companyId} IS NOT NULL THEN 1 ELSE 0 END) = 1`
    ),
  ]
);

export const companies = pgTable(
  "companies",
  {
    ...ids,
    familyId: varchar("familyId", { length: 36 }).notNull(),
    legalName: varchar("legalName", { length: 180 }).notNull(),
    taxNumber: varchar("taxNumber", { length: 20 }),
    isOffshore: boolean("isOffshore").default(false).notNull(),
    createdAt: auditTime,
    updatedAt: updatedAtCol(),
  },
  table => [
    index("companies_family_idx").on(table.familyId),
    uniqueIndex("companies_family_tax_number_unique").on(
      table.familyId,
      table.taxNumber
    ),
    // CNPJ obrigatório quando a sociedade NÃO é offshore.
    check(
      "companies_tax_number_ck",
      sql`${table.isOffshore} = true OR ${table.taxNumber} IS NOT NULL`
    ),
  ]
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

export const otherAssets = pgTable(
  "otherAssets",
  {
    ...ids,
    familyId: varchar("familyId", { length: 36 }).notNull(),
    category: assetCategoryEnum("category").notNull(),
    description: varchar("description", { length: 240 }).notNull(),
    declaredValue: decimal("declaredValue", { precision: 15, scale: 2 }).notNull(),
    ownerPersonId: varchar("ownerPersonId", { length: 36 }).notNull(),
    notes: text("notes"),
    createdAt: auditTime,
    updatedAt: updatedAtCol(),
  },
  table => [
    index("other_assets_family_idx").on(table.familyId),
    check(
      "other_assets_declared_value_ck",
      sql`${table.declaredValue} > 0`
    ),
  ]
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
    uf: ufEnum("uf"),
    sede: varchar("sede", { length: 160 }),
    societaryType: societaryTypeEnum("societaryType"),
    taxRegime: taxRegimeEnum("taxRegime"),
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

export const fileBlobs = pgTable(
  "fileBlobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 600 }).notNull().unique(),
    fileName: varchar("fileName", { length: 300 }).notNull(),
    mimeType: varchar("mimeType", { length: 150 }).notNull(),
    sizeBytes: integer("sizeBytes").notNull(),
    sha256: varchar("sha256", { length: 64 }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("fileBlobs_key_key").on(table.key),
    check("fileBlobs_size_bytes_check", sql`${table.sizeBytes} > 0 AND ${table.sizeBytes} <= 5242880`),
  ]
);

/**
 * Sessões revogadas (logout em outros dispositivos, suspeita de uso indevido).
 * O `jti` do JWT é consultado aqui em `verifySession`; se existir, a sessão
 * é rejeitada mesmo que o token não tenha expirado.
 */
export const sessionRevocations = pgTable(
  "sessionRevocations",
  {
    ...ids,
    userId: varchar("userId", { length: 36 }).notNull(),
    jti: varchar("jti", { length: 64 }).notNull(),
    revokedAt: timestamp("revokedAt").defaultNow().notNull(),
    reason: varchar("reason", { length: 120 }),
  },
  table => [uniqueIndex("session_revocations_jti_key").on(table.jti)]
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
