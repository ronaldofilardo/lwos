var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/lib/logger.ts
function sanitize(context) {
  return Object.fromEntries(
    Object.entries(context).filter(([, value]) => value !== void 0)
  );
}
function logInfo(event, context = {}) {
  console.info(`[lucathi] ${event}`, sanitize(context));
}
function logError(event, context = {}) {
  console.error(`[lucathi] ${event}`, sanitize(context));
}
var init_logger = __esm({
  "server/lib/logger.ts"() {
    "use strict";
  }
});

// shared/domain/roles.ts
var APP_ROLES, TEAM_ROLES;
var init_roles = __esm({
  "shared/domain/roles.ts"() {
    "use strict";
    APP_ROLES = ["SOCIO", "ANALISTA", "ADMIN", "CLIENTE"];
    TEAM_ROLES = ["SOCIO", "ANALISTA"];
  }
});

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  accessRoleEnum: () => accessRoleEnum,
  assetCategoryEnum: () => assetCategoryEnum,
  assetCategoryValues: () => assetCategoryValues,
  auditLogs: () => auditLogs,
  certidaoScopeEnum: () => certidaoScopeEnum,
  certidaoScopeValues: () => certidaoScopeValues,
  certidaoStatusEnum: () => certidaoStatusEnum,
  certidaoStatusValues: () => certidaoStatusValues,
  certidaoTypeEnum: () => certidaoTypeEnum,
  certidaoTypeValues: () => certidaoTypeValues,
  certidoes: () => certidoes,
  civilStatusEnum: () => civilStatusEnum,
  civilStatusValues: () => civilStatusValues,
  companies: () => companies,
  companyDetailDocs: () => companyDetailDocs,
  companyDetails: () => companyDetails,
  companyDocStatusEnum: () => companyDocStatusEnum,
  companyDocStatusValues: () => companyDocStatusValues,
  companyDocTypeEnum: () => companyDocTypeEnum,
  companyDocTypeValues: () => companyDocTypeValues,
  companyJurisdictionEnum: () => companyJurisdictionEnum,
  companyJurisdictionValues: () => companyJurisdictionValues,
  companyStakeholders: () => companyStakeholders,
  companyTypeEnum: () => companyTypeEnum,
  companyTypeValues: () => companyTypeValues,
  contributionStatusEnum: () => contributionStatusEnum,
  documentStatusEnum: () => documentStatusEnum,
  documentStatusValues: () => documentStatusValues,
  documentVersions: () => documentVersions,
  documents: () => documents,
  encumbranceTypeEnum: () => encumbranceTypeEnum,
  encumbranceTypeValues: () => encumbranceTypeValues,
  encumbrances: () => encumbrances,
  entityTypeEnum: () => entityTypeEnum,
  entityTypeValues: () => entityTypeValues,
  families: () => families,
  familyAccess: () => familyAccess,
  fileBlobs: () => fileBlobs,
  financialProposals: () => financialProposals,
  firstAccessLinks: () => firstAccessLinks,
  leadStatusEnum: () => leadStatusEnum,
  leadStatusValues: () => leadStatusValues,
  leads: () => leads,
  lwrReports: () => lwrReports,
  maritalRegimeEnum: () => maritalRegimeEnum,
  maritalRegimeValues: () => maritalRegimeValues,
  otherAssets: () => otherAssets,
  people: () => people,
  portalLinks: () => portalLinks,
  projectStatusEnum: () => projectStatusEnum,
  projects: () => projects,
  properties: () => properties,
  propertyContributions: () => propertyContributions,
  propertyOwners: () => propertyOwners,
  proposalStatusEnum: () => proposalStatusEnum,
  proposalStatusValues: () => proposalStatusValues,
  rightTypeEnum: () => rightTypeEnum,
  roleEnum: () => roleEnum,
  users: () => users,
  vinculoEnum: () => vinculoEnum,
  vinculoValues: () => vinculoValues
});
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
  uuid,
  varchar
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
var ids, auditTime, updatedAtCol, civilStatusValues, maritalRegimeValues, documentStatusValues, assetCategoryValues, proposalStatusValues, leadStatusValues, vinculoValues, entityTypeValues, companyTypeValues, encumbranceTypeValues, certidaoScopeValues, certidaoTypeValues, certidaoStatusValues, companyJurisdictionValues, companyDocStatusValues, companyDocTypeValues, roleEnum, civilStatusEnum, maritalRegimeEnum, documentStatusEnum, assetCategoryEnum, leadStatusEnum, vinculoEnum, proposalStatusEnum, projectStatusEnum, accessRoleEnum, entityTypeEnum, rightTypeEnum, companyTypeEnum, encumbranceTypeEnum, certidaoScopeEnum, certidaoTypeEnum, certidaoStatusEnum, companyJurisdictionEnum, companyDocStatusEnum, companyDocTypeEnum, contributionStatusEnum, users, families, projects, familyAccess, leads, people, documents, documentVersions, properties, propertyOwners, encumbrances, companies, companyStakeholders, propertyContributions, otherAssets, certidoes, companyDetails, companyDetailDocs, financialProposals, portalLinks, firstAccessLinks, lwrReports, auditLogs, fileBlobs;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    init_roles();
    ids = { id: varchar("id", { length: 36 }).primaryKey() };
    auditTime = timestamp("createdAt").defaultNow().notNull();
    updatedAtCol = () => timestamp("updatedAt").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull();
    civilStatusValues = [
      "SOLTEIRO",
      "DIVORCIADO",
      "VIUVO",
      "CASADO",
      "UNIAO_ESTAVEL"
    ];
    maritalRegimeValues = ["CPB", "CUB", "STB", "STOB", "NA"];
    documentStatusValues = [
      "PENDENTE",
      "RECEBIDO_EM_ANALISE",
      "VALIDADO",
      "REJEITADO",
      "VENCIDO",
      "DISPENSADO",
      "NA"
    ];
    assetCategoryValues = [
      "INVESTIMENTO",
      "VEICULO",
      "PARTICIPACAO_OUTRA",
      "DIREITO",
      "OUTRO"
    ];
    proposalStatusValues = [
      "RASCUNHO",
      "ENVIADA",
      "ACEITA",
      "CONTRAPROPOSTA_RECEBIDA",
      "RECUSADA"
    ];
    leadStatusValues = ["PENDENTE", "ACEITO", "RECUSADO"];
    vinculoValues = [
      "TITULAR",
      "CONJUGE",
      "FILHO",
      "NETO",
      "BISNETO"
    ];
    entityTypeValues = [
      "FAMILIA",
      "PESSOA",
      "IMOVEL",
      "SOCIEDADE",
      "ATIVO",
      "CERTIDAO"
    ];
    companyTypeValues = [
      "HOLDING_NACIONAL",
      "HOLDING_INTERNACIONAL",
      "SOCIEDADE_NACIONAL"
    ];
    encumbranceTypeValues = [
      "HIPOTECA",
      "ALIENACAO_FIDUCIARIA",
      "PENHOR",
      "USUFRUTO",
      "SERVIDAO",
      "SEQUESTRO",
      "OUTRO"
    ];
    certidaoScopeValues = ["PESSOA", "SOCIEDADE"];
    certidaoTypeValues = [
      "CND_FEDERAL",
      "CND_ESTADUAL",
      "CND_MUNICIPAL",
      "CERTIDAO_TJ",
      "CERTIDAO_TRF",
      "CNAT",
      "CNDT",
      "CERTIDAO_PROTESTOS"
    ];
    certidaoStatusValues = [
      "PENDENTE",
      "NEGATIVA",
      "POSITIVA_COM_EFEITOS_DE_NEGATIVA",
      "SOMENTE_FISICA",
      "POSITIVA"
    ];
    companyJurisdictionValues = [
      "BVI",
      "BAHAMAS",
      "DELAWARE",
      "ILHAS_MARSHALL",
      "CAYMAN",
      "UK",
      "PANAMA"
    ];
    companyDocStatusValues = [
      "PENDENTE",
      "RECEBIDO",
      "NA",
      "NAO_POSSUI"
    ];
    companyDocTypeValues = [
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
      "SHARE_CERTIFICATE"
    ];
    roleEnum = pgEnum("role", APP_ROLES);
    civilStatusEnum = pgEnum("civilStatus", civilStatusValues);
    maritalRegimeEnum = pgEnum("maritalRegime", maritalRegimeValues);
    documentStatusEnum = pgEnum(
      "documentStatus",
      documentStatusValues
    );
    assetCategoryEnum = pgEnum("assetCategory", assetCategoryValues);
    leadStatusEnum = pgEnum("leadStatus", leadStatusValues);
    vinculoEnum = pgEnum("vinculo", vinculoValues);
    proposalStatusEnum = pgEnum(
      "proposalStatus",
      proposalStatusValues
    );
    projectStatusEnum = pgEnum("projectStatus", [
      "EM_ANDAMENTO",
      "AGUARDANDO_DOCUMENTOS",
      "EM_REVISAO",
      "CONCLUIDO"
    ]);
    accessRoleEnum = pgEnum("accessRole", ["RESPONSAVEL", "CLIENTE"]);
    entityTypeEnum = pgEnum("entityType", entityTypeValues);
    rightTypeEnum = pgEnum("rightType", [
      "PROPRIEDADE",
      "USUFRUTO",
      "NUA_PROPRIEDADE"
    ]);
    companyTypeEnum = pgEnum("companyType", companyTypeValues);
    encumbranceTypeEnum = pgEnum(
      "encumbranceType",
      encumbranceTypeValues
    );
    certidaoScopeEnum = pgEnum("certidaoScope", certidaoScopeValues);
    certidaoTypeEnum = pgEnum("certidaoType", certidaoTypeValues);
    certidaoStatusEnum = pgEnum(
      "certidaoStatus",
      certidaoStatusValues
    );
    companyJurisdictionEnum = pgEnum(
      "companyJurisdiction",
      companyJurisdictionValues
    );
    companyDocStatusEnum = pgEnum(
      "companyDocStatus",
      companyDocStatusValues
    );
    companyDocTypeEnum = pgEnum(
      "companyDocType",
      companyDocTypeValues
    );
    contributionStatusEnum = pgEnum("contributionStatus", [
      "RASCUNHO",
      "EM_ANALISE",
      "CONCLUIDA"
    ]);
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      name: text("name"),
      email: varchar("email", { length: 320 }).notNull().unique(),
      passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
      role: roleEnum("role").default("CLIENTE").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: updatedAtCol(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    families = pgTable("families", {
      ...ids,
      name: varchar("name", { length: 160 }).notNull(),
      civilStatus: civilStatusEnum("civilStatus").notNull(),
      maritalRegime: maritalRegimeEnum("maritalRegime").notNull(),
      notes: text("notes"),
      createdBy: varchar("createdBy", { length: 36 }).notNull(),
      createdAt: auditTime,
      updatedAt: updatedAtCol()
    });
    projects = pgTable("projects", {
      ...ids,
      familyId: varchar("familyId", { length: 36 }).notNull().unique(),
      title: varchar("title", { length: 160 }).notNull(),
      status: projectStatusEnum("status").default("EM_ANDAMENTO").notNull(),
      createdAt: auditTime,
      updatedAt: updatedAtCol()
    });
    familyAccess = pgTable(
      "familyAccess",
      {
        ...ids,
        familyId: varchar("familyId", { length: 36 }).notNull(),
        userId: integer("userId").notNull(),
        accessRole: accessRoleEnum("accessRole").default("CLIENTE").notNull(),
        createdAt: auditTime
      },
      (table) => [
        uniqueIndex("family_access_unique").on(table.familyId, table.userId),
        index("family_access_user_idx").on(table.userId)
      ]
    );
    leads = pgTable("leads", {
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
      updatedAt: updatedAtCol()
    });
    people = pgTable(
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
        updatedAt: updatedAtCol()
      },
      (table) => [
        index("people_family_idx").on(table.familyId),
        uniqueIndex("people_primary_unique").on(table.familyId).where(sql`${table.isPrimaryContact} = true`)
      ]
    );
    documents = pgTable(
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
        updatedAt: updatedAtCol()
      },
      (table) => [index("documents_family_idx").on(table.familyId)]
    );
    documentVersions = pgTable(
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
        createdAt: auditTime
      },
      (table) => [
        uniqueIndex("document_version_unique").on(
          table.documentId,
          table.versionNumber
        )
      ]
    );
    properties = pgTable(
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
        updatedAt: updatedAtCol()
      },
      (table) => [index("properties_family_idx").on(table.familyId)]
    );
    propertyOwners = pgTable("propertyOwners", {
      ...ids,
      propertyId: varchar("propertyId", { length: 36 }).notNull(),
      personId: varchar("personId", { length: 36 }).notNull(),
      ownershipPercentage: decimal("ownershipPercentage", {
        precision: 5,
        scale: 2
      }).notNull(),
      rightType: rightTypeEnum("rightType").default("PROPRIEDADE").notNull(),
      createdAt: auditTime
    });
    encumbrances = pgTable("encumbrances", {
      ...ids,
      propertyId: varchar("propertyId", { length: 36 }).notNull(),
      type: encumbranceTypeEnum("type").notNull(),
      description: text("description"),
      active: boolean("active").default(true).notNull(),
      createdAt: auditTime
    });
    companies = pgTable(
      "companies",
      {
        ...ids,
        familyId: varchar("familyId", { length: 36 }).notNull(),
        legalName: varchar("legalName", { length: 180 }).notNull(),
        taxNumber: varchar("taxNumber", { length: 20 }),
        type: companyTypeEnum("type").default("HOLDING_NACIONAL").notNull(),
        createdAt: auditTime,
        updatedAt: updatedAtCol()
      },
      (table) => [index("companies_family_idx").on(table.familyId)]
    );
    companyStakeholders = pgTable(
      "companyStakeholders",
      {
        ...ids,
        companyId: varchar("companyId", { length: 36 }).notNull(),
        // Sócio membro da família (people) OU não-membro informado em externalName.
        personId: varchar("personId", { length: 36 }),
        externalName: varchar("externalName", { length: 160 }),
        percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
        createdAt: auditTime
      },
      (table) => [
        uniqueIndex("stakeholder_person_unique").on(
          table.companyId,
          table.personId
        ),
        uniqueIndex("stakeholder_external_unique").on(
          table.companyId,
          table.externalName
        )
      ]
    );
    propertyContributions = pgTable("propertyContributions", {
      ...ids,
      propertyId: varchar("propertyId", { length: 36 }).notNull(),
      companyId: varchar("companyId", { length: 36 }).notNull(),
      percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
      status: contributionStatusEnum("status").default("RASCUNHO").notNull(),
      createdAt: auditTime
    });
    otherAssets = pgTable(
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
        updatedAt: updatedAtCol()
      },
      (table) => [index("other_assets_family_idx").on(table.familyId)]
    );
    certidoes = pgTable(
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
        updatedAt: updatedAtCol()
      },
      (table) => [
        uniqueIndex("certidao_unique").on(table.subjectId, table.type),
        index("certidoes_family_idx").on(table.familyId)
      ]
    );
    companyDetails = pgTable(
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
          scale: 2
        }),
        inventory: decimal("inventory", { precision: 15, scale: 2 }),
        accountsReceivable: decimal("accountsReceivable", {
          precision: 15,
          scale: 2
        }),
        investments: decimal("investments", { precision: 15, scale: 2 }),
        fixedAssets: decimal("fixedAssets", { precision: 15, scale: 2 }),
        retainedEarnings: decimal("retainedEarnings", { precision: 15, scale: 2 }),
        taxLiabilities: decimal("taxLiabilities", { precision: 15, scale: 2 }),
        laborLiabilities: decimal("laborLiabilities", { precision: 15, scale: 2 }),
        financing: decimal("financing", { precision: 15, scale: 2 }),
        estimatedMarketValue: decimal("estimatedMarketValue", {
          precision: 15,
          scale: 2
        }),
        companyNumber: varchar("companyNumber", { length: 60 }),
        jurisdiction: companyJurisdictionEnum("jurisdiction"),
        residentAgent: varchar("residentAgent", { length: 120 }),
        notes: text("notes"),
        createdAt: auditTime,
        updatedAt: updatedAtCol()
      },
      (table) => [
        uniqueIndex("company_details_unique").on(table.companyId)
      ]
    );
    companyDetailDocs = pgTable(
      "companyDetailDocs",
      {
        ...ids,
        companyId: varchar("companyId", { length: 36 }).notNull(),
        docType: companyDocTypeEnum("docType").notNull(),
        status: companyDocStatusEnum("status").default("PENDENTE").notNull(),
        createdAt: auditTime,
        updatedAt: updatedAtCol()
      },
      (table) => [
        uniqueIndex("company_detail_doc_unique").on(table.companyId, table.docType),
        index("company_detail_docs_idx").on(table.companyId)
      ]
    );
    financialProposals = pgTable(
      "financialProposals",
      {
        ...ids,
        familyId: varchar("familyId", { length: 36 }).notNull(),
        scopeDescription: text("scopeDescription").notNull(),
        proposedValue: decimal("proposedValue", {
          precision: 15,
          scale: 2
        }).notNull(),
        status: proposalStatusEnum("status").default("RASCUNHO").notNull(),
        counterProposalValue: decimal("counterProposalValue", {
          precision: 15,
          scale: 2
        }),
        counterProposalNotes: text("counterProposalNotes"),
        clientNotes: text("clientNotes"),
        acceptedAt: timestamp("acceptedAt"),
        approvedBySocioId: varchar("approvedBySocioId", { length: 36 }),
        createdAt: auditTime,
        updatedAt: updatedAtCol()
      },
      (table) => [index("financial_proposals_family_idx").on(table.familyId)]
    );
    portalLinks = pgTable("portalLinks", {
      ...ids,
      familyId: varchar("familyId", { length: 36 }).notNull(),
      tokenHash: varchar("tokenHash", { length: 64 }).notNull().unique(),
      expiresAt: timestamp("expiresAt").notNull(),
      revokedAt: timestamp("revokedAt"),
      createdBy: varchar("createdBy", { length: 36 }).notNull(),
      createdAt: auditTime
    });
    firstAccessLinks = pgTable("firstAccessLinks", {
      ...ids,
      familyId: varchar("familyId", { length: 36 }).notNull(),
      personId: varchar("personId", { length: 36 }).notNull(),
      tokenHash: varchar("tokenHash", { length: 64 }).notNull().unique(),
      expiresAt: timestamp("expiresAt").notNull(),
      consumedAt: timestamp("consumedAt"),
      createdBy: varchar("createdBy", { length: 36 }).notNull(),
      createdAt: auditTime
    });
    lwrReports = pgTable("lwrReports", {
      ...ids,
      familyId: varchar("familyId", { length: 36 }).notNull(),
      version: integer("version").notNull(),
      baseDate: date("baseDate").notNull(),
      responsibleUserId: varchar("responsibleUserId", { length: 36 }).notNull(),
      proposedStructure: text("proposedStructure").notNull(),
      financialProposal: text("financialProposal").notNull(),
      canvaUrl: text("canvaUrl"),
      presentationFileKey: varchar("presentationFileKey", { length: 500 }),
      createdAt: auditTime
    });
    auditLogs = pgTable(
      "auditLogs",
      {
        ...ids,
        familyId: varchar("familyId", { length: 36 }),
        actorUserId: varchar("actorUserId", { length: 36 }),
        action: varchar("action", { length: 120 }).notNull(),
        entityType: varchar("entityType", { length: 80 }).notNull(),
        entityId: varchar("entityId", { length: 36 }).notNull(),
        metadata: text("metadata"),
        createdAt: auditTime
      },
      (table) => [index("audit_family_idx").on(table.familyId)]
    );
    fileBlobs = pgTable(
      "fileBlobs",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        key: varchar("key", { length: 600 }).notNull().unique(),
        fileName: varchar("fileName", { length: 300 }).notNull(),
        mimeType: varchar("mimeType", { length: 150 }).notNull(),
        sizeBytes: integer("sizeBytes").notNull(),
        sha256: varchar("sha256", { length: 64 }).notNull(),
        content: text("content").notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull()
      },
      (table) => [uniqueIndex("fileBlobs_key_key").on(table.key)]
    );
  }
});

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
async function getDb() {
  if (!database && process.env.DATABASE_URL) {
    try {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      database = drizzle(pool);
    } catch {
      logError("database.connection_failed");
      database = null;
    }
  }
  return database;
}
async function createUser(user) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indispon\xEDvel.");
  try {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  } catch (error) {
    const message = String(error);
    if (message.includes("unique") || message.includes("duplicate")) {
      throw new Error("J\xE1 existe um usu\xE1rio com este e-mail.");
    }
    logError("database.user_create_failed");
    throw new Error("N\xE3o foi poss\xEDvel criar o usu\xE1rio.");
  }
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) return void 0;
  try {
    const result = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    return result[0];
  } catch {
    logError("database.user_lookup_by_email_failed");
    throw new Error("N\xE3o foi poss\xEDvel carregar o usu\xE1rio.");
  }
}
async function getUserById(id) {
  const db = await getDb();
  if (!db) return void 0;
  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  } catch {
    logError("database.user_lookup_by_id_failed");
    throw new Error("N\xE3o foi poss\xEDvel carregar o usu\xE1rio.");
  }
}
async function touchLastSignedIn(id) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.update(users).set({ lastSignedIn: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
  } catch {
    logInfo("database.touch_last_signed_in_failed");
  }
}
async function updateUserPassword(id, passwordHash) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.update(users).set({ passwordHash }).where(eq(users.id, id));
  } catch {
    logInfo("database.update_user_password_failed");
  }
}
var database;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_logger();
    init_schema();
    database = null;
  }
});

// server/features/_shared/database.ts
async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indispon\xEDvel.");
  return db;
}
var init_database = __esm({
  "server/features/_shared/database.ts"() {
    "use strict";
    init_db();
  }
});

// server/lib/family-storage-path.ts
var family_storage_path_exports = {};
__export(family_storage_path_exports, {
  findFamilyIdByPrimaryContactCpf: () => findFamilyIdByPrimaryContactCpf,
  onlyDigits: () => onlyDigits,
  resolveFamilyStorageFolder: () => resolveFamilyStorageFolder
});
import { and as and6, eq as eq9 } from "drizzle-orm";
function onlyDigits(value) {
  return value.replace(/\D/g, "");
}
async function resolveFamilyStorageFolder(familyId) {
  const db = await requireDatabase();
  const [primary] = await db.select({ taxId: people.taxId }).from(people).where(and6(eq9(people.familyId, familyId), eq9(people.isPrimaryContact, true))).limit(1);
  const digits = primary?.taxId ? onlyDigits(primary.taxId) : "";
  if (digits) return digits;
  return `familia-${familyId}`;
}
async function findFamilyIdByPrimaryContactCpf(cpf, excludeFamilyId) {
  const digits = onlyDigits(cpf);
  if (!digits) return null;
  const db = await requireDatabase();
  const rows = await db.select({ familyId: people.familyId, taxId: people.taxId }).from(people).where(eq9(people.isPrimaryContact, true));
  for (const row of rows) {
    if (!row.taxId) continue;
    if (excludeFamilyId && row.familyId === excludeFamilyId) continue;
    if (onlyDigits(row.taxId) === digits) return row.familyId;
  }
  return null;
}
var init_family_storage_path = __esm({
  "server/lib/family-storage-path.ts"() {
    "use strict";
    init_schema();
    init_database();
  }
});

// server/api.ts
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/auth.ts
init_db();
import bcrypt from "bcryptjs";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";

// server/_core/cookies.ts
var LOCAL_HOSTS = /* @__PURE__ */ new Set(["localhost", "127.0.0.1", "::1"]);
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  const isLocal = LOCAL_HOSTS.has(req.hostname ?? "");
  return {
    httpOnly: true,
    path: "/",
    sameSite: isLocal ? "lax" : "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/env.ts
var ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  storageRoot: process.env.STORAGE_ROOT ?? "",
  forgeApiUrl: process.env.FORGE_API_URL ?? "",
  forgeApiKey: process.env.FORGE_API_KEY ?? ""
};

// server/_core/rateLimit.ts
var RateLimitError = class extends Error {
  constructor() {
    super("Muitas tentativas. Tente novamente mais tarde.");
    this.name = "RateLimitError";
  }
};
var RATE_LIMIT_MAX_KEYS = 1e4;
var CLEANUP_INTERVAL_MS = 5 * 60 * 1e3;
var entries = /* @__PURE__ */ new Map();
function cleanupExpired(now) {
  entries.forEach((entry, key) => {
    if (now > entry.resetAt) entries.delete(key);
  });
}
function evictIfNeeded(now) {
  if (entries.size < RATE_LIMIT_MAX_KEYS) return;
  cleanupExpired(now);
  while (entries.size >= RATE_LIMIT_MAX_KEYS) {
    const oldest = entries.keys().next();
    if (oldest.done) break;
    entries.delete(oldest.value);
  }
}
function checkRateLimit(key, maxAttempts = 10, windowMs = 6e4) {
  const now = Date.now();
  const entry = entries.get(key);
  if (!entry || now > entry.resetAt) {
    evictIfNeeded(now);
    entries.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  entry.count++;
  if (entry.count > maxAttempts) throw new RateLimitError();
}
function resetRateLimit(key) {
  entries.delete(key);
}
var cleanupTimer = setInterval(() => cleanupExpired(Date.now()), CLEANUP_INTERVAL_MS);
cleanupTimer.unref?.();

// server/_core/auth.ts
var BCRYPT_ROUNDS = 12;
function getSessionSecret() {
  if (!ENV.cookieSecret) {
    throw new Error("JWT_SECRET n\xE3o configurado. Defina em .env.local.");
  }
  return new TextEncoder().encode(ENV.cookieSecret);
}
async function signSession(userId, expiresInMs = ONE_YEAR_MS) {
  const expirationSeconds = Math.floor((Date.now() + expiresInMs) / 1e3);
  return new SignJWT({ userId }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(getSessionSecret());
}
async function verifySession(cookieValue) {
  if (!cookieValue) return null;
  try {
    const { payload } = await jwtVerify(cookieValue, getSessionSecret(), { algorithms: ["HS256"] });
    const { userId } = payload;
    if (typeof userId !== "number") return null;
    return { userId };
  } catch {
    return null;
  }
}
function parseCookies(cookieHeader) {
  if (!cookieHeader) return /* @__PURE__ */ new Map();
  return new Map(Object.entries(parseCookieHeader(cookieHeader)));
}
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}
var MIN_PASSWORD_LENGTH = 6;
function assertValidPassword(password) {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  }
}
function assertValidEmail(email) {
  const isValid = typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValid) throw new Error("E-mail inv\xE1lido.");
}
async function registerUser(input) {
  const email = normalizeEmail(input.email);
  assertValidEmail(email);
  assertValidPassword(input.password);
  const existing = await getUserByEmail(email);
  if (existing) throw new Error("J\xE1 existe um usu\xE1rio com este e-mail.");
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const created = await createUser({
    name: input.name?.trim() || null,
    email,
    passwordHash,
    role: "CLIENTE",
    lastSignedIn: /* @__PURE__ */ new Date()
  });
  return created;
}
async function loginWithPassword(email, password) {
  const normalizedEmail = normalizeEmail(email);
  let user = await getUserByEmail(normalizedEmail);
  if (!user && (normalizedEmail === "socio@adv.com" || normalizedEmail === "admin@adv.com")) {
    if (password === "123456") {
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      try {
        user = await createUser({
          name: normalizedEmail === "socio@adv.com" ? "S\xF3cio Respons\xE1vel" : "Administrador",
          email: normalizedEmail,
          passwordHash,
          role: normalizedEmail === "socio@adv.com" ? "SOCIO" : "ADMIN",
          lastSignedIn: /* @__PURE__ */ new Date()
        });
      } catch {
        user = await getUserByEmail(normalizedEmail);
      }
    }
  }
  if (!user) throw new Error("E-mail ou senha inv\xE1lidos.");
  let passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches && (normalizedEmail === "socio@adv.com" || normalizedEmail === "admin@adv.com") && password === "123456") {
    const newHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await updateUserPassword(user.id, newHash);
    passwordMatches = true;
  }
  if (!passwordMatches) throw new Error("E-mail ou senha inv\xE1lidos.");
  await touchLastSignedIn(user.id);
  return user;
}
function registerAuthRoutes(app2) {
  app2.post(["/api/auth/login", "/auth/login"], async (req, res) => {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ error: "E-mail e senha s\xE3o obrigat\xF3rios." });
      return;
    }
    const ip = req.ip ?? "unknown";
    const credKey = `login:cred:${ip}:${normalizeEmail(email)}`;
    const ipKey = `login:ip:${ip}`;
    try {
      checkRateLimit(credKey, 10);
      checkRateLimit(ipKey, 30);
      const user = await loginWithPassword(email, password);
      const sessionToken = await signSession(user.id);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      resetRateLimit(credKey);
      resetRateLimit(ipKey);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof RateLimitError) {
        res.status(429).json({ error: error.message });
        return;
      }
      res.status(401).json({ error: error instanceof Error ? error.message : "Falha no login." });
    }
  });
  app2.post(["/api/auth/register", "/auth/register"], async (req, res) => {
    const { name, email, password } = req.body ?? {};
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ error: "Nome, e-mail e senha s\xE3o obrigat\xF3rios." });
      return;
    }
    try {
      checkRateLimit(`register:ip:${req.ip ?? "unknown"}`, 10);
      const user = await registerUser({ name, email, password });
      const sessionToken = await signSession(user.id);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true });
    } catch (error) {
      if (error instanceof RateLimitError) {
        res.status(429).json({ error: error.message });
        return;
      }
      res.status(400).json({ error: error instanceof Error ? error.message : "Falha no cadastro." });
    }
  });
}
async function authenticateRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionToken = cookies.get(COOKIE_NAME);
  const session = await verifySession(sessionToken);
  if (!session) throw ForbiddenError("Sess\xE3o inv\xE1lida ou ausente");
  const user = await getUserById(session.userId);
  if (!user) throw ForbiddenError("Usu\xE1rio n\xE3o encontrado");
  return user;
}

// server/_core/storageProxy.ts
import path2 from "node:path";

// server/storage.ts
init_schema();
init_logger();
import { drizzle as drizzle2 } from "drizzle-orm/node-postgres";
import { eq as eq2, sql as sql2 } from "drizzle-orm";
import { Pool as Pool2 } from "pg";
import { randomUUID } from "node:crypto";
import { createHash } from "node:crypto";
import * as path from "node:path";
import * as fs from "node:fs";
function getStoragePath(relKey) {
  const root = ENV.storageRoot || path.resolve(process.cwd(), "storage");
  return path.resolve(root, relKey);
}
var cachedDb = null;
function getDb2() {
  if (!cachedDb) {
    try {
      const pool = new Pool2({ connectionString: process.env.DATABASE_URL });
      cachedDb = drizzle2(pool);
    } catch (error) {
      logError("database.connection_failed");
      cachedDb = null;
    }
  }
  return cachedDb;
}
function assertSafeRelativeKey(relKey) {
  const segments = relKey.split(/[/\\]/);
  if (segments.some((seg) => seg === ".." || seg === ".")) {
    throw new Error("Caminho de storage inv\xE1lido.");
  }
  const normalized = segments.filter((seg) => seg.length > 0).join("/");
  if (!normalized) {
    throw new Error("Caminho de storage inv\xE1lido.");
  }
  return normalized;
}
function appendHashSuffix(relKey) {
  const hash = randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
async function storagePut(relKey, data, _contentType = "application/octet-stream") {
  const key = appendHashSuffix(assertSafeRelativeKey(relKey));
  const buffer = typeof data === "string" ? Buffer.from(data, "utf-8") : Buffer.from(data);
  if (process.env.NODE_ENV === "production" && buffer.length > 5120) {
    throw new Error("Arquivo excede 5KB. Tamanho m\xE1ximo permitido em produ\xE7\xE3o.");
  }
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  if (process.env.NODE_ENV !== "production") {
    const fullPath = getStoragePath(key);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, buffer);
    const url2 = `/api/local-storage/${key.split(path.sep).join("/")}`;
    return { key, url: url2 };
  }
  const base64 = buffer.toString("base64");
  const db = getDb2();
  if (!db) {
    throw new Error("Banco de dados indispon\xEDvel para armazenamento.");
  }
  await db.insert(fileBlobs).values({
    key,
    fileName: relKey.split("/").pop() ?? "arquivo",
    mimeType: _contentType,
    sizeBytes: buffer.length,
    sha256,
    content: base64
  }).onConflictDoUpdate({
    target: fileBlobs.key,
    set: {
      fileName: relKey.split("/").pop() ?? "arquivo",
      mimeType: _contentType,
      sizeBytes: buffer.length,
      sha256,
      content: base64
    }
  });
  const url = `/api/local-storage/${key.split(path.sep).join("/")}`;
  return { key, url };
}
async function storageGetSignedUrl(relKey) {
  const key = assertSafeRelativeKey(relKey);
  return `/api/local-storage/${key.split(path.sep).join("/")}`;
}
async function readStoredFile(relKey) {
  const key = assertSafeRelativeKey(relKey);
  if (process.env.NODE_ENV !== "production") {
    const fullPath = getStoragePath(key);
    if (!fs.existsSync(fullPath)) throw new Error("Arquivo n\xE3o encontrado no storage local.");
    return fs.readFileSync(fullPath);
  }
  const db = getDb2();
  if (!db) throw new Error("Banco de dados indispon\xEDvel.");
  const row = await db.select({ content: fileBlobs.content }).from(fileBlobs).where(eq2(fileBlobs.key, key));
  if (!row[0] || !row[0].content) throw new Error("Arquivo n\xE3o encontrado no storage.");
  return Buffer.from(row[0].content, "base64");
}
async function storedFileExists(relKey) {
  const key = assertSafeRelativeKey(relKey);
  if (process.env.NODE_ENV !== "production") {
    const fullPath = getStoragePath(key);
    return fs.existsSync(fullPath);
  }
  const db = getDb2();
  if (!db) return false;
  const count3 = await db.select({ count: db.$count(fileBlobs) }).from(fileBlobs).where(eq2(fileBlobs.key, key));
  return count3[0]?.count > 0;
}
async function moveFolder(oldRelKey, newRelKey) {
  const oldPrefix = assertSafeRelativeKey(oldRelKey) + "/";
  const newPrefix = assertSafeRelativeKey(newRelKey) + "/";
  if (process.env.NODE_ENV !== "production") {
    const oldPath = getStoragePath(assertSafeRelativeKey(oldRelKey));
    const newPath = getStoragePath(assertSafeRelativeKey(newRelKey));
    if (fs.existsSync(oldPath)) {
      fs.mkdirSync(path.dirname(newPath), { recursive: true });
      fs.renameSync(oldPath, newPath);
      return { moved: true };
    }
    return { moved: false };
  }
  const db = getDb2();
  if (!db) return { moved: false };
  const keys = await db.select({ key: fileBlobs.key }).from(fileBlobs).where(
    sql2`${fileBlobs.key} LIKE ${oldPrefix}%`
  );
  if (keys.length === 0) return { moved: false };
  await db.transaction(async (tx) => {
    for (const { key } of keys) {
      const relativePart = key.replace(oldPrefix, "");
      const newKey = `${newPrefix}${relativePart}`;
      await tx.update(fileBlobs).set({ key: newKey }).where(eq2(fileBlobs.key, key));
    }
  });
  return { moved: true };
}

// server/features/documents/document-repository.ts
init_schema();
init_database();
import { and, desc, eq as eq3 } from "drizzle-orm";

// server/features/_shared/ids.ts
import { nanoid } from "nanoid";
function createId() {
  return nanoid();
}

// server/features/documents/document-repository.ts
async function findOrCreateDocumentRecord(input) {
  const db = await requireDatabase();
  const existing = await db.select({ id: documents.id }).from(documents).where(
    and(
      eq3(documents.familyId, input.familyId),
      eq3(documents.entityType, input.entityType),
      eq3(documents.entityId, input.entityId),
      eq3(documents.category, input.category)
    )
  ).limit(1);
  if (existing[0]) return existing[0].id;
  const id = createId();
  await db.insert(documents).values({
    id,
    familyId: input.familyId,
    entityType: input.entityType,
    entityId: input.entityId,
    category: input.category,
    status: "PENDENTE",
    currentVersion: 0,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  });
  return id;
}
async function getDocumentRecord(documentId) {
  const db = await requireDatabase();
  const result = await db.select().from(documents).where(eq3(documents.id, documentId)).limit(1);
  return result[0] ?? null;
}
async function listDocumentRecords(familyId) {
  const db = await requireDatabase();
  return db.select().from(documents).where(eq3(documents.familyId, familyId)).orderBy(desc(documents.updatedAt));
}
async function listVersions(documentId) {
  const db = await requireDatabase();
  return db.select().from(documentVersions).where(eq3(documentVersions.documentId, documentId)).orderBy(desc(documentVersions.versionNumber));
}
async function getDocumentVersionByStorageKey(storageKey) {
  const db = await requireDatabase();
  const [row] = await db.select({ familyId: documents.familyId, documentId: documents.id }).from(documentVersions).innerJoin(documents, eq3(documentVersions.documentId, documents.id)).where(eq3(documentVersions.storageKey, storageKey)).limit(1);
  return row ?? null;
}

// server/features/leads/lead-repository.ts
init_schema();
init_database();
import { and as and2, desc as desc2, eq as eq5 } from "drizzle-orm";

// server/features/documents/person-document-categories.ts
var PERSON_DOCUMENT_CATEGORIES = [
  "IRPF",
  "CPF/RG ou CNH",
  "Certid\xE3o de casamento/UE",
  "Comprovante de endere\xE7o",
  "Passaporte"
];
var COUPLE_SHARED_CATEGORIES = [
  "Certid\xE3o de casamento/UE",
  "Comprovante de endere\xE7o"
];
function isCoupleSharedCategory(category) {
  return COUPLE_SHARED_CATEGORIES.includes(category);
}
function documentCategoriesForVinculo(vinculo) {
  if (vinculo === "CONJUGE") {
    return PERSON_DOCUMENT_CATEGORIES.filter(
      (category) => !isCoupleSharedCategory(category)
    );
  }
  return [...PERSON_DOCUMENT_CATEGORIES];
}

// server/features/certidoes/certidao-repository.ts
init_schema();
init_database();
import { asc, eq as eq4, inArray } from "drizzle-orm";

// server/features/certidoes/certidao-types.ts
init_schema();
import { z } from "zod";
var certidaoTypeSchema = z.enum(certidaoTypeValues);
var certidaoStatusSchema = z.enum(certidaoStatusValues);
var certidaoScopeSchema = z.enum(certidaoScopeValues);
var certidaoUpdateSchema = z.object({
  certidaoId: z.string().min(1),
  status: certidaoStatusSchema.optional(),
  validUntil: z.string().optional()
});
var CERTIDAO_TYPE_LABELS = {
  CND_FEDERAL: "CND Federal",
  CND_ESTADUAL: "CND Estadual",
  CND_MUNICIPAL: "CND Municipal",
  CERTIDAO_TJ: "Certid\xE3o TJ",
  CERTIDAO_TRF: "Certid\xE3o TRF",
  CNAT: "CNAT",
  CNDT: "CNDT",
  CERTIDAO_PROTESTOS: "Certid\xE3o de Protestos"
};

// server/features/certidoes/certidao-repository.ts
async function ensureCertidoesForSubject(input) {
  const db = await requireDatabase();
  const existing = await db.select({ type: certidoes.type }).from(certidoes).where(eq4(certidoes.subjectId, input.subjectId));
  const known = new Set(existing.map((row) => row.type));
  const missing = certidaoTypeValues.filter((type) => !known.has(type));
  if (!missing.length) return 0;
  await db.transaction(async (tx) => {
    for (const type of missing) {
      const certidaoId = createId();
      const inserted = await tx.insert(certidoes).values({
        id: certidaoId,
        familyId: input.familyId,
        scope: input.scope,
        subjectId: input.subjectId,
        type,
        status: "PENDENTE",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).onConflictDoNothing().returning({ id: certidoes.id });
      if (!inserted[0]) continue;
      const documentId = createId();
      await tx.insert(documents).values({
        id: documentId,
        familyId: input.familyId,
        entityType: "CERTIDAO",
        entityId: certidaoId,
        category: CERTIDAO_TYPE_LABELS[type],
        status: "PENDENTE",
        currentVersion: 0,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      await tx.update(certidoes).set({ documentId }).where(eq4(certidoes.id, certidaoId));
    }
  });
  return missing.length;
}
async function ensureFamilyCertidoes(familyId) {
  const db = await requireDatabase();
  const [peopleRows, companyRows] = await Promise.all([
    db.select({ id: people.id }).from(people).where(eq4(people.familyId, familyId)),
    db.select({ id: companies.id }).from(companies).where(eq4(companies.familyId, familyId))
  ]);
  let created = 0;
  for (const person of peopleRows) {
    created += await ensureCertidoesForSubject({
      familyId,
      scope: "PESSOA",
      subjectId: person.id
    });
  }
  for (const company of companyRows) {
    created += await ensureCertidoesForSubject({
      familyId,
      scope: "SOCIEDADE",
      subjectId: company.id
    });
  }
  return created;
}
async function getCertidaoRecord(certidaoId) {
  const db = await requireDatabase();
  const result = await db.select().from(certidoes).where(eq4(certidoes.id, certidaoId)).limit(1);
  return result[0] ?? null;
}
async function listCertidaoRecords(familyId) {
  const db = await requireDatabase();
  const rows = await db.select().from(certidoes).where(eq4(certidoes.familyId, familyId)).orderBy(asc(certidoes.scope), asc(certidoes.type));
  if (!rows.length) return [];
  const [peopleRows, companyRows] = await Promise.all([
    db.select({ id: people.id, name: people.fullName }).from(people).where(eq4(people.familyId, familyId)),
    db.select({ id: companies.id, name: companies.legalName }).from(companies).where(eq4(companies.familyId, familyId))
  ]);
  const names = new Map(
    [...peopleRows, ...companyRows].map((row) => [row.id, row.name])
  );
  const documentIds = rows.map((row) => row.documentId).filter((id) => Boolean(id));
  const documentRows = documentIds.length ? await db.select({
    id: documents.id,
    currentVersion: documents.currentVersion,
    updatedAt: documents.updatedAt
  }).from(documents).where(inArray(documents.id, documentIds)) : [];
  const documentsById = new Map(documentRows.map((row) => [row.id, row]));
  return rows.map((row) => ({
    ...row,
    subjectName: names.get(row.subjectId) ?? null,
    documentCurrentVersion: row.documentId ? documentsById.get(row.documentId)?.currentVersion ?? 0 : 0,
    documentUpdatedAt: row.documentId ? documentsById.get(row.documentId)?.updatedAt ?? null : null
  }));
}
async function updateCertidaoRecord(input) {
  const db = await requireDatabase();
  const current = await getCertidaoRecord(input.certidaoId);
  if (!current) throw new Error("Certid\xE3o n\xE3o encontrada.");
  await db.update(certidoes).set({
    status: input.status ?? current.status,
    validUntil: input.validUntil !== void 0 ? input.validUntil || null : current.validUntil,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq4(certidoes.id, input.certidaoId));
  return current;
}

// server/features/leads/lead-types.ts
import { z as z3 } from "zod";

// server/features/families/family-types.ts
import { z as z2 } from "zod";
var civilStatusSchema = z2.enum([
  "SOLTEIRO",
  "DIVORCIADO",
  "VIUVO",
  "CASADO",
  "UNIAO_ESTAVEL"
]);
var maritalRegimeSchema = z2.enum(["CPB", "CUB", "STB", "STOB", "NA"]);
var familyInputSchema = z2.object({
  name: z2.string().min(3).max(160),
  civilStatus: civilStatusSchema,
  maritalRegime: maritalRegimeSchema,
  notes: z2.string().max(2e3).optional()
});

// server/features/leads/lead-types.ts
var ALLOWED_LEAD_MIME_TYPES = /* @__PURE__ */ new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp"
]);
var leadCreateSchema = z3.object({
  familyId: z3.string().optional(),
  fullName: z3.string().min(3).max(160),
  taxId: z3.string().min(11).max(20),
  email: z3.string().email(),
  birthDate: z3.string().min(1),
  // YYYY-MM-DD
  fileName: z3.string().min(1).max(255),
  mimeType: z3.string().min(1),
  base64Data: z3.string().min(1)
});
var leadAcceptSchema = z3.object({
  leadId: z3.string().min(1),
  familyName: z3.string().min(3).max(160),
  civilStatus: civilStatusSchema,
  maritalRegime: maritalRegimeSchema
});
var leadRejectSchema = z3.object({
  leadId: z3.string().min(1),
  reviewNote: z3.string().max(1e3).optional()
});

// server/features/leads/lead-repository.ts
async function createLeadRecord(input) {
  if (!ALLOWED_LEAD_MIME_TYPES.has(input.mimeType))
    throw new Error(
      "Tipo de arquivo n\xE3o permitido. Envie uma imagem (JPEG/PNG/WEBP) ou PDF."
    );
  const bytes = Buffer.from(input.base64Data, "base64");
  if (!bytes.length || bytes.length > 5 * 1024 * 1024)
    throw new Error("Arquivo inv\xE1lido ou maior que 5 MB.");
  const db = await requireDatabase();
  const id = createId();
  const taxId = input.taxId.replace(/\D/g, "");
  const relativeKey = `leads/${id}/${input.fileName}`;
  const stored = await storagePut(relativeKey, bytes, input.mimeType);
  const storageKey = stored.key.split("\\").join("/");
  await db.insert(leads).values({
    id,
    fullName: input.fullName,
    taxId,
    email: input.email.toLowerCase().trim(),
    birthDate: input.birthDate,
    fileName: input.fileName,
    mimeType: input.mimeType,
    storageKey,
    status: "PENDENTE"
  });
  return { id };
}
async function listLeadRecords() {
  const db = await requireDatabase();
  const rows = await db.select().from(leads).orderBy(desc2(leads.createdAt));
  return Promise.all(
    rows.map(async (lead) => ({
      ...lead,
      fileUrl: await storageGetSignedUrl(lead.storageKey)
    }))
  );
}
async function getLeadRecord(leadId) {
  const db = await requireDatabase();
  const [lead] = await db.select().from(leads).where(eq5(leads.id, leadId)).limit(1);
  return lead ?? null;
}
async function getLeadRecordByStorageKey(storageKey) {
  const db = await requireDatabase();
  const [lead] = await db.select().from(leads).where(eq5(leads.storageKey, storageKey)).limit(1);
  return lead ?? null;
}
async function acceptLeadRecord(input, reviewedBy) {
  const lead = await getLeadRecord(input.leadId);
  if (!lead) throw new Error("Interessado n\xE3o encontrado.");
  if (lead.status !== "PENDENTE")
    throw new Error("Este interessado j\xE1 foi analisado.");
  const db = await requireDatabase();
  const result = await db.transaction(async (tx) => {
    const familyId = createId();
    const projectId = createId();
    await tx.insert(families).values({
      id: familyId,
      name: input.familyName,
      civilStatus: input.civilStatus,
      maritalRegime: input.maritalRegime,
      createdBy: String(reviewedBy)
    });
    await tx.insert(projects).values({ id: projectId, familyId, title: input.familyName });
    const personId = createId();
    if (input.civilStatus) {
      await tx.update(people).set({ isPrimaryContact: false }).where(eq5(people.familyId, familyId));
    }
    await tx.insert(people).values({
      id: personId,
      familyId,
      fullName: lead.fullName,
      email: lead.email,
      taxId: lead.taxId,
      birthDate: lead.birthDate,
      civilStatus: input.civilStatus,
      maritalRegime: input.maritalRegime,
      vinculo: "TITULAR",
      isPrimaryContact: true
    });
    await tx.insert(documents).values(
      documentCategoriesForVinculo("TITULAR").map((category) => ({
        id: createId(),
        familyId,
        entityType: "PESSOA",
        entityId: personId,
        category,
        status: "PENDENTE",
        currentVersion: 0,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }))
    );
    const accepted = await tx.update(leads).set({ status: "ACEITO", familyId, reviewedBy }).where(and2(eq5(leads.id, input.leadId), eq5(leads.status, "PENDENTE"))).returning({ id: leads.id });
    if (accepted.length === 0)
      throw new Error("Este interessado j\xE1 foi analisado.");
    return { familyId, personId };
  });
  await ensureCertidoesForSubject({
    familyId: result.familyId,
    scope: "PESSOA",
    subjectId: result.personId
  });
  return result;
}
async function rejectLeadRecord(leadId, reviewedBy, reviewNote) {
  const lead = await getLeadRecord(leadId);
  if (!lead) throw new Error("Interessado n\xE3o encontrado.");
  if (lead.status !== "PENDENTE")
    throw new Error("Este interessado j\xE1 foi analisado.");
  const db = await requireDatabase();
  const rejected = await db.update(leads).set({ status: "RECUSADO", reviewedBy, reviewNote: reviewNote || null }).where(and2(eq5(leads.id, leadId), eq5(leads.status, "PENDENTE"))).returning({ id: leads.id });
  if (rejected.length === 0)
    throw new Error("Este interessado j\xE1 foi analisado.");
  return { success: true, leadId, fullName: lead.fullName };
}

// server/features/access/family-access.ts
init_schema();
init_database();
import { and as and3, eq as eq6 } from "drizzle-orm";
import { TRPCError as TRPCError2 } from "@trpc/server";

// server/features/access/authorization.ts
import { TRPCError } from "@trpc/server";
function requireUser(ctx) {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Autentica\xE7\xE3o necess\xE1ria." });
  }
  return ctx.user;
}
function requireRole(ctx, allowed) {
  const user = requireUser(ctx);
  if (!allowed.includes(user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Permiss\xE3o insuficiente." });
  }
  return user;
}

// server/features/access/family-access.ts
async function userHasFamilyAccess(user, familyId) {
  if (user.role !== "CLIENTE") return true;
  const db = await requireDatabase();
  const records = await db.select({ id: familyAccess.id }).from(familyAccess).where(and3(eq6(familyAccess.familyId, familyId), eq6(familyAccess.userId, user.id))).limit(1);
  return Boolean(records[0]);
}
async function assertFamilyAccess(ctx, familyId) {
  const user = requireUser(ctx);
  const allowed = await userHasFamilyAccess(user, familyId);
  if (!allowed) throw new TRPCError2({ code: "FORBIDDEN", message: "Acesso \xE0 fam\xEDlia n\xE3o autorizado." });
  return user;
}

// server/_core/storageProxy.ts
var MIME_BY_EXT = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
};
function registerStorageProxy(app2) {
  app2.get(["/api/local-storage/*", "/local-storage/*"], async (req, res) => {
    let user;
    try {
      user = await authenticateRequest(req);
    } catch {
      res.status(401).send("N\xE3o autenticado.");
      return;
    }
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Chave de storage ausente.");
      return;
    }
    const versionInfo = await getDocumentVersionByStorageKey(key);
    if (!versionInfo) {
      const lead = await getLeadRecordByStorageKey(key);
      if (!lead) {
        res.status(404).send("Arquivo n\xE3o encontrado.");
        return;
      }
      if (user.role !== "SOCIO" && user.role !== "ADMIN") {
        res.status(403).send("Acesso n\xE3o autorizado a este arquivo.");
        return;
      }
    } else {
      const allowed = await userHasFamilyAccess(user, versionInfo.familyId);
      if (!allowed) {
        res.status(403).send("Acesso n\xE3o autorizado a este documento.");
        return;
      }
    }
    try {
      const exists = await storedFileExists(key);
      if (!exists) {
        res.status(404).send("Arquivo n\xE3o encontrado.");
        return;
      }
      const buffer = await readStoredFile(key);
      const ext = path2.extname(key).toLowerCase();
      res.set("Content-Type", MIME_BY_EXT[ext] ?? "application/octet-stream");
      res.set("Cache-Control", "no-store");
      res.send(buffer);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(500).send("Erro ao ler arquivo.");
    }
  });
}

// server/_core/systemRouter.ts
import { z as z4 } from "zod";

// server/_core/notification.ts
async function notifyOwner({ title, content }) {
  console.log("[notifyOwner]", title, content);
  return true;
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError3 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser2 = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError3({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser2);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "ADMIN") {
      throw new TRPCError3({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z4.object({
      timestamp: z4.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z4.object({
      title: z4.string().min(1, "title is required"),
      content: z4.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/features/companies/company-router.ts
import { z as z9 } from "zod";
init_roles();

// server/features/audit/audit-repository.ts
init_schema();
init_database();
async function recordAudit(input) {
  const db = await requireDatabase();
  await db.insert(auditLogs).values({
    id: createId(),
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    actorUserId: input.actorUserId?.toString(),
    familyId: input.familyId,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null
  });
}

// server/features/documents/document-requirements.ts
init_schema();
init_database();
import { and as and4, eq as eq7 } from "drizzle-orm";
var PROPERTY_DOCUMENT_CATEGORIES = {
  withRegistration: ["Matr\xEDcula atualizada", "IPTU ou ITR"],
  withoutRegistration: [
    "Escritura ou contrato de compra e venda",
    "IPTU ou ITR"
  ]
};
var COMPANY_DOCUMENT_CATEGORIES = [
  "Contrato social e altera\xE7\xF5es consolidadas",
  "CNPJ (comprovante de situa\xE7\xE3o)",
  "Estatuto social e atas (se S/A)"
];
var ASSET_DOCUMENT_CATEGORIES = [
  "Comprova\xE7\xE3o de titularidade",
  "Avalia\xE7\xE3o ou laudo de lastro"
];
async function ensureDocumentRequirements(input) {
  if (!input.categories.length) return [];
  const db = await requireDatabase();
  const existing = await db.select({ category: documents.category }).from(documents).where(
    and4(
      eq7(documents.entityType, input.entityType),
      eq7(documents.entityId, input.entityId)
    )
  );
  const known = new Set(existing.map((row) => row.category));
  const missing = Array.from(new Set(input.categories)).filter(
    (category) => !known.has(category)
  );
  if (!missing.length) return [];
  const ids2 = missing.map(() => createId());
  await db.insert(documents).values(
    missing.map((category, index2) => ({
      id: ids2[index2],
      familyId: input.familyId,
      entityType: input.entityType,
      entityId: input.entityId,
      category,
      status: "PENDENTE",
      currentVersion: 0,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }))
  );
  return ids2;
}
async function ensureFamilyDocumentRequirements(familyId) {
  const db = await requireDatabase();
  const [peopleRows, propertyRows, companyRows, assetRows] = await Promise.all([
    db.select().from(people).where(eq7(people.familyId, familyId)),
    db.select().from(properties).where(eq7(properties.familyId, familyId)),
    db.select().from(companies).where(eq7(companies.familyId, familyId)),
    db.select().from(otherAssets).where(eq7(otherAssets.familyId, familyId))
  ]);
  let created = 0;
  for (const person of peopleRows) {
    created += (await ensureDocumentRequirements({
      familyId,
      entityType: "PESSOA",
      entityId: person.id,
      categories: documentCategoriesForVinculo(person.vinculo)
    })).length;
  }
  for (const property of propertyRows) {
    created += (await ensureDocumentRequirements({
      familyId,
      entityType: "IMOVEL",
      entityId: property.id,
      categories: property.hasRegistration ? PROPERTY_DOCUMENT_CATEGORIES.withRegistration : PROPERTY_DOCUMENT_CATEGORIES.withoutRegistration
    })).length;
  }
  for (const company of companyRows) {
    created += (await ensureDocumentRequirements({
      familyId,
      entityType: "SOCIEDADE",
      entityId: company.id,
      categories: COMPANY_DOCUMENT_CATEGORIES
    })).length;
  }
  for (const asset of assetRows) {
    created += (await ensureDocumentRequirements({
      familyId,
      entityType: "ATIVO",
      entityId: asset.id,
      categories: ASSET_DOCUMENT_CATEGORIES
    })).length;
  }
  return created;
}

// server/features/properties/property-repository.ts
init_schema();
init_database();
import { desc as desc3, eq as eq8, and as and5 } from "drizzle-orm";
var PCT_EPSILON = 1e-3;
function totalOwnership(rows) {
  return rows.reduce((sum, row) => sum + Number(row.ownershipPercentage ?? 0), 0);
}
async function createPropertyRecord(input) {
  const db = await requireDatabase();
  const id = createId();
  const existingProperty = await db.select().from(properties).where(
    and5(
      eq8(properties.familyId, input.familyId),
      eq8(properties.description, input.description),
      eq8(properties.propertyCity, input.propertyCity)
    )
  ).limit(1);
  if (existingProperty.length > 0) {
    return existingProperty[0].id;
  }
  await db.insert(properties).values({
    ...input,
    id,
    hasRegistration: input.hasRegistration,
    registrationNumber: input.hasRegistration ? input.registrationNumber || null : null,
    alternativeDocType: input.hasRegistration ? null : input.alternativeDocType || null,
    noRegistrationReason: input.hasRegistration ? null : input.noRegistrationReason || null,
    registryOffice: input.registryOffice || null,
    registryCity: input.registryCity || null,
    acquisitionDate: input.acquisitionDate || null,
    declaredValue: input.declaredValue?.toFixed(2) ?? null,
    marketValue: input.marketValue?.toFixed(2) ?? null
  });
  return id;
}
async function listPropertyRecords(familyId) {
  const db = await requireDatabase();
  return db.select().from(properties).where(eq8(properties.familyId, familyId)).orderBy(desc3(properties.updatedAt));
}
async function getPropertyRecord(propertyId) {
  const db = await requireDatabase();
  const result = await db.select().from(properties).where(eq8(properties.id, propertyId)).limit(1);
  return result[0] ?? null;
}
async function addEncumbranceRecord(input) {
  const db = await requireDatabase();
  const id = createId();
  await db.insert(encumbrances).values({ ...input, id });
  return id;
}
async function listEncumbrances(propertyId) {
  const db = await requireDatabase();
  return db.select().from(encumbrances).where(eq8(encumbrances.propertyId, propertyId));
}
async function addPropertyOwnerRecord(input) {
  const db = await requireDatabase();
  const id = createId();
  await db.transaction(async (tx) => {
    const existing = await tx.select().from(propertyOwners).where(eq8(propertyOwners.propertyId, input.propertyId));
    if (existing.some((row) => row.personId === input.personId)) {
      throw new Error("Este membro j\xE1 est\xE1 vinculado a este im\xF3vel.");
    }
    const total = totalOwnership(existing) + input.ownershipPercentage;
    if (total > 100 + PCT_EPSILON) {
      throw new Error(
        `A soma das titularidades n\xE3o pode passar de 100% (atual ${totalOwnership(existing)}%).`
      );
    }
    await tx.insert(propertyOwners).values({ ...input, id, ownershipPercentage: input.ownershipPercentage.toFixed(2) });
  });
  return id;
}
async function updatePropertyOwnerRecord(input) {
  const db = await requireDatabase();
  await db.transaction(async (tx) => {
    const current = await tx.select().from(propertyOwners).where(eq8(propertyOwners.id, input.ownerId)).limit(1);
    const owner = current[0];
    if (!owner || owner.propertyId !== input.propertyId) {
      throw new Error("Titularidade n\xE3o encontrada.");
    }
    const others = await tx.select().from(propertyOwners).where(eq8(propertyOwners.propertyId, input.propertyId));
    const remaining = others.filter((row) => row.id !== input.ownerId);
    const personId = input.personId ?? owner.personId;
    if (remaining.some((row) => row.personId === personId)) {
      throw new Error("Este membro j\xE1 est\xE1 vinculado a este im\xF3vel.");
    }
    const percentage = input.ownershipPercentage ?? Number(owner.ownershipPercentage);
    const total = totalOwnership(remaining) + percentage;
    if (total > 100 + PCT_EPSILON) {
      throw new Error(
        `A soma das titularidades n\xE3o pode passar de 100% (atual ${totalOwnership(remaining)}%).`
      );
    }
    await tx.update(propertyOwners).set({
      personId,
      ownershipPercentage: percentage.toFixed(2),
      rightType: input.rightType ?? owner.rightType
    }).where(eq8(propertyOwners.id, input.ownerId));
  });
}
async function removePropertyOwnerRecord(input) {
  const db = await requireDatabase();
  const removed = await db.delete(propertyOwners).where(eq8(propertyOwners.id, input.ownerId)).returning({ id: propertyOwners.id, propertyId: propertyOwners.propertyId });
  const row = removed[0];
  if (!row || row.propertyId !== input.propertyId) {
    throw new Error("Titularidade n\xE3o encontrada.");
  }
  return row.id;
}
async function listPropertyOwners(propertyId) {
  const db = await requireDatabase();
  return db.select().from(propertyOwners).where(eq8(propertyOwners.propertyId, propertyId));
}

// server/features/people/person-repository.ts
init_schema();
import { and as and8, eq as eq12 } from "drizzle-orm";

// server/features/families/family-repository.ts
init_schema();
import { desc as desc4, eq as eq10, count, inArray as inArray2, and as and7 } from "drizzle-orm";
init_database();
async function createFamilyRecord(input, createdBy) {
  const db = await requireDatabase();
  const familyId = createId();
  const projectId = createId();
  await db.transaction(async (tx) => {
    await tx.insert(families).values({ ...input, id: familyId, createdBy: String(createdBy) });
    await tx.insert(projects).values({ id: projectId, familyId, title: input.name });
  });
  return { familyId, projectId };
}
async function listFamilyRecords() {
  const db = await requireDatabase();
  const records = await db.select().from(families).orderBy(desc4(families.updatedAt));
  if (!records.length) return [];
  const accessRows = await db.select({ familyId: familyAccess.familyId }).from(familyAccess).where(and7(inArray2(familyAccess.familyId, records.map((r) => r.id)), eq10(familyAccess.accessRole, "CLIENTE")));
  const familyIdsWithAccess = new Set(accessRows.map((r) => r.familyId));
  return records.map((record) => ({ ...record, hasClientAccess: familyIdsWithAccess.has(record.id) }));
}
async function getFamilyRecord(familyId) {
  const db = await requireDatabase();
  const result = await db.select().from(families).where(eq10(families.id, familyId)).limit(1);
  return result[0] ?? null;
}
async function getClientFamilyIds(userId) {
  const db = await requireDatabase();
  const access = await db.select({ familyId: familyAccess.familyId }).from(familyAccess).where(eq10(familyAccess.userId, userId));
  return access.map((a) => a.familyId);
}
async function getDashboardData(allowedFamilyIds) {
  const db = await requireDatabase();
  const scoped = allowedFamilyIds !== void 0;
  if (scoped && allowedFamilyIds.length === 0) {
    return { totalFamilies: 0, totalPeople: 0, totalDocuments: 0, families: [] };
  }
  const allFamilies = scoped ? await db.select().from(families).where(inArray2(families.id, allowedFamilyIds)).orderBy(desc4(families.updatedAt)) : await db.select().from(families).orderBy(desc4(families.updatedAt));
  const families2 = [];
  let totalPeople = 0;
  let totalDocuments = 0;
  for (const f of allFamilies) {
    const [{ count: peopleCount }] = await db.select({ count: count() }).from(people).where(eq10(people.familyId, f.id));
    const [{ count: documentsCount }] = await db.select({ count: count() }).from(documents).where(eq10(documents.familyId, f.id));
    families2.push({ id: f.id, name: f.name, civilStatus: f.civilStatus, maritalRegime: f.maritalRegime, updatedAt: f.updatedAt, peopleCount: Number(peopleCount), documentsCount: Number(documentsCount) });
    totalPeople += Number(peopleCount);
    totalDocuments += Number(documentsCount);
  }
  if (scoped) {
    return { totalFamilies: families2.length, totalPeople, totalDocuments, families: families2 };
  }
  const [{ count: totalFamilies }] = await db.select({ count: count() }).from(families);
  const [{ count: totalPeopleAll }] = await db.select({ count: count() }).from(people);
  const [{ count: totalDocumentsAll }] = await db.select({ count: count() }).from(documents);
  return { totalFamilies, totalPeople: totalPeopleAll, totalDocuments: totalDocumentsAll, families: families2 };
}
async function getClientDashboardData(userId) {
  const allowedFamilyIds = await getClientFamilyIds(userId);
  return getDashboardData(allowedFamilyIds);
}
async function listStorageFiles(allowedFolders) {
  const db = await requireDatabase();
  const allKeys = await db.select({ key: fileBlobs.key, sizeBytes: fileBlobs.sizeBytes }).from(fileBlobs);
  const folderMap = /* @__PURE__ */ new Map();
  for (const { key, sizeBytes } of allKeys) {
    const parts = key.split("/");
    if (parts.length === 0) continue;
    const folderName = parts[0];
    const fileName = parts.slice(1).join("/") || "";
    if (!folderMap.has(folderName)) {
      folderMap.set(folderName, { size: 0, fileCount: 0 });
    }
    folderMap.get(folderName).size += sizeBytes ?? 0;
    folderMap.get(folderName).fileCount += 1;
  }
  const result = [];
  if (allowedFolders !== void 0) {
    for (const folder of allowedFolders) {
      const info = folderMap.get(folder);
      if (info) {
        result.push({
          path: folder,
          size: info.size,
          isDirectory: true
        });
      }
    }
  } else {
    for (const [folderName, info] of folderMap) {
      result.push({
        path: folderName,
        size: info.size,
        isDirectory: true
      });
    }
  }
  return result;
}
async function listClientStorageFiles(userId) {
  const allowedFamilyIds = await getClientFamilyIds(userId);
  if (allowedFamilyIds.length === 0) return [];
  const { resolveFamilyStorageFolder: resolveFamilyStorageFolder2 } = await Promise.resolve().then(() => (init_family_storage_path(), family_storage_path_exports));
  const folders = await Promise.all(allowedFamilyIds.map((id) => resolveFamilyStorageFolder2(id)));
  return listStorageFiles(folders);
}

// server/lib/family-storage-migration.ts
init_schema();
init_database();
import { eq as eq11, inArray as inArray3 } from "drizzle-orm";
async function migrateFamilyStorageFolder(familyId, oldFolder, newFolder) {
  if (oldFolder === newFolder) return { migratedFiles: 0 };
  const db = await requireDatabase();
  const familyDocs = await db.select({ id: documents.id }).from(documents).where(eq11(documents.familyId, familyId));
  const docIds = familyDocs.map((d) => d.id);
  if (docIds.length === 0) return { migratedFiles: 0 };
  const versions = await db.select({ id: documentVersions.id, storageKey: documentVersions.storageKey }).from(documentVersions).where(inArray3(documentVersions.documentId, docIds));
  const prefix = `${oldFolder}/`;
  const toMigrate = versions.filter((v) => v.storageKey.startsWith(prefix));
  if (toMigrate.length === 0) return { migratedFiles: 0 };
  await moveFolder(oldFolder, newFolder);
  let migratedCount = 0;
  try {
    for (const version of toMigrate) {
      const newKey = `${newFolder}/${version.storageKey.slice(prefix.length)}`;
      await db.update(documentVersions).set({ storageKey: newKey }).where(eq11(documentVersions.id, version.id));
      migratedCount++;
    }
  } catch {
    try {
      await moveFolder(newFolder, oldFolder);
    } catch {
    }
    throw new Error(`Migra\xE7\xE3o de storage falhou ap\xF3s mover arquivos. ${migratedCount}/${toMigrate.length} registros atualizados. Pasta revertida.`);
  }
  return { migratedFiles: migratedCount };
}

// server/features/people/person-repository.ts
init_family_storage_path();
init_database();

// server/features/people/person-types.ts
import { z as z5 } from "zod";
var vinculoSchema = z5.enum([
  "TITULAR",
  "CONJUGE",
  "FILHO",
  "NETO",
  "BISNETO"
]);
var marriedStatuses = /* @__PURE__ */ new Set(["CASADO", "UNIAO_ESTAVEL"]);
var personInputSchema = z5.object({
  familyId: z5.string().min(1),
  fullName: z5.string().min(3).max(160),
  email: z5.string().email().optional().or(z5.literal("")),
  taxId: z5.string().max(20).optional(),
  birthDate: z5.string().optional(),
  vinculo: vinculoSchema,
  parentPersonId: z5.string().min(1).optional(),
  spouseName: z5.string().max(160).optional(),
  civilStatus: civilStatusSchema.optional(),
  maritalRegime: maritalRegimeSchema.optional(),
  exSpouseNote: z5.string().max(1e3).optional(),
  // Fase 3: marca esta pessoa como titular/responsável da família — usado
  // pra nomear a pasta de storage local (CPF do titular). Opcional; se
  // omitido, a pessoa não vira titular automaticamente.
  isPrimaryContact: z5.boolean().optional()
}).superRefine((data, ctx) => {
  if ((data.vinculo === "NETO" || data.vinculo === "BISNETO") && !data.parentPersonId) {
    ctx.addIssue({
      code: "custom",
      path: ["parentPersonId"],
      message: data.vinculo === "NETO" ? "Neto(a) precisa de um filho(a) como pai/m\xE3e." : "Bisneto(a) precisa de um neto(a) como pai/m\xE3e."
    });
  }
  if (data.vinculo === "CONJUGE") return;
  if (!data.civilStatus) {
    ctx.addIssue({
      code: "custom",
      path: ["civilStatus"],
      message: "Informe o estado civil."
    });
    return;
  }
  if (marriedStatuses.has(data.civilStatus)) {
    if (!data.maritalRegime) {
      ctx.addIssue({
        code: "custom",
        path: ["maritalRegime"],
        message: "Informe o regime de bens."
      });
    }
    if (!data.spouseName?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["spouseName"],
        message: "Informe o nome do c\xF4njuge."
      });
    }
  }
});
var setPrimaryContactSchema = z5.object({
  familyId: z5.string().min(1),
  personId: z5.string().min(1)
});
var personAttachmentSchema = z5.object({
  category: z5.string().min(2).max(80),
  fileName: z5.string().min(1).max(255),
  mimeType: z5.string().min(1).max(120),
  base64Data: z5.string().min(8).max(8e6)
});
var attachDocumentsSchema = z5.object({
  familyId: z5.string().min(1),
  personId: z5.string().min(1),
  attachments: z5.array(personAttachmentSchema).min(1).max(8)
});
function isMarriedStatus(status) {
  return Boolean(status && marriedStatuses.has(status));
}

// server/features/people/person-repository.ts
async function assertCpfNotUsedByAnotherFamily(taxId, familyId) {
  const conflictingFamilyId = await findFamilyIdByPrimaryContactCpf(
    taxId,
    familyId
  );
  if (!conflictingFamilyId) return;
  const conflictingFamily = await getFamilyRecord(conflictingFamilyId);
  const familyLabel = conflictingFamily?.name ?? `fam\xEDlia ${conflictingFamilyId}`;
  throw new Error(
    `Este CPF j\xE1 \xE9 o titular de outra fam\xEDlia (${familyLabel}). Corrija o CPF ou defina outra pessoa como titular.`
  );
}
async function assertParentMatches(familyId, parentPersonId, expectedVinculo) {
  const db = await requireDatabase();
  const [parent] = await db.select({
    id: people.id,
    vinculo: people.vinculo,
    fullName: people.fullName
  }).from(people).where(and8(eq12(people.id, parentPersonId), eq12(people.familyId, familyId))).limit(1);
  if (!parent) throw new Error("Pai/m\xE3e n\xE3o encontrado nesta fam\xEDlia.");
  if (parent.vinculo !== expectedVinculo) {
    throw new Error(
      expectedVinculo === "FILHO" ? "O pai/m\xE3e de um neto(a) deve ter v\xEDnculo Filho(a)." : "O pai/m\xE3e de um bisneto(a) deve ter v\xEDnculo Neto(a)."
    );
  }
  return parent;
}
async function addPersonRecord(input) {
  const db = await requireDatabase();
  const id = createId();
  if (input.vinculo === "NETO" && input.parentPersonId) {
    await assertParentMatches(input.familyId, input.parentPersonId, "FILHO");
  }
  if (input.vinculo === "BISNETO" && input.parentPersonId) {
    await assertParentMatches(input.familyId, input.parentPersonId, "NETO");
  }
  let civilStatus = input.civilStatus;
  let maritalRegime = input.maritalRegime;
  if (input.vinculo === "CONJUGE") {
    const family = await getFamilyRecord(input.familyId);
    if (!family) throw new Error("Fam\xEDlia n\xE3o encontrada.");
    civilStatus = family.civilStatus;
    maritalRegime = family.maritalRegime;
  } else if (civilStatus && !isMarriedStatus(civilStatus)) {
    maritalRegime = "NA";
  }
  await db.transaction(async (tx) => {
    if (input.isPrimaryContact && input.taxId) {
      await assertCpfNotUsedByAnotherFamily(input.taxId, input.familyId);
      await tx.update(people).set({ isPrimaryContact: false }).where(eq12(people.familyId, input.familyId));
    }
    await tx.insert(people).values({
      id,
      familyId: input.familyId,
      fullName: input.fullName,
      email: input.email || null,
      taxId: input.taxId || null,
      birthDate: input.birthDate || null,
      civilStatus,
      maritalRegime,
      exSpouseNote: input.exSpouseNote || null,
      vinculo: input.vinculo,
      parentPersonId: input.parentPersonId || null,
      spouseName: input.spouseName?.trim() || null,
      isPrimaryContact: input.isPrimaryContact ?? false
    });
    await tx.insert(documents).values(
      documentCategoriesForVinculo(input.vinculo).map((category) => ({
        id: createId(),
        familyId: input.familyId,
        entityType: "PESSOA",
        entityId: id,
        category,
        status: "PENDENTE",
        currentVersion: 0,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }))
    );
  });
  return id;
}
async function getPersonRecord(personId) {
  const db = await requireDatabase();
  const result = await db.select().from(people).where(eq12(people.id, personId)).limit(1);
  return result[0] ?? null;
}
async function listPeopleByFamily(familyId) {
  const db = await requireDatabase();
  return db.select().from(people).where(eq12(people.familyId, familyId));
}
async function getPrimaryContact(familyId) {
  const db = await requireDatabase();
  const result = await db.select().from(people).where(
    and8(eq12(people.familyId, familyId), eq12(people.isPrimaryContact, true))
  ).limit(1);
  return result[0] ?? null;
}
async function setPrimaryContact(input) {
  const db = await requireDatabase();
  let oldFolder = "";
  await db.transaction(async (tx) => {
    const [candidate] = await tx.select({ id: people.id, taxId: people.taxId, familyId: people.familyId }).from(people).where(
      and8(eq12(people.id, input.personId), eq12(people.familyId, input.familyId))
    ).limit(1);
    if (!candidate) throw new Error("Pessoa n\xE3o encontrada nesta fam\xEDlia.");
    if (candidate.taxId) {
      await assertCpfNotUsedByAnotherFamily(candidate.taxId, input.familyId);
    }
    oldFolder = await resolveFamilyStorageFolder(input.familyId);
    await tx.update(people).set({ isPrimaryContact: false }).where(eq12(people.familyId, input.familyId));
    await tx.update(people).set({ isPrimaryContact: true }).where(
      and8(eq12(people.familyId, input.familyId), eq12(people.id, input.personId))
    );
  });
  const newFolder = await resolveFamilyStorageFolder(input.familyId);
  return migrateFamilyStorageFolder(input.familyId, oldFolder, newFolder);
}

// server/features/companies/company-repository.ts
init_schema();
init_database();
import { eq as eq13 } from "drizzle-orm";
var PCT_EPSILON2 = 1e-3;
function totalPercentage(rows) {
  return rows.reduce((sum, row) => sum + Number(row.percentage ?? 0), 0);
}
function normalizeName(name) {
  return (name ?? "").trim().toLocaleLowerCase("pt-BR");
}
async function createCompanyRecord(input) {
  const db = await requireDatabase();
  const id = createId();
  await db.insert(companies).values({ ...input, id, taxNumber: input.taxNumber || null });
  return id;
}
async function getCompanyRecord(companyId) {
  const db = await requireDatabase();
  const result = await db.select().from(companies).where(eq13(companies.id, companyId)).limit(1);
  return result[0] ?? null;
}
async function listCompanyRecords(familyId) {
  const db = await requireDatabase();
  return db.select().from(companies).where(eq13(companies.familyId, familyId));
}
async function listStakeholderRecords(companyId) {
  const db = await requireDatabase();
  return db.select().from(companyStakeholders).where(eq13(companyStakeholders.companyId, companyId));
}
async function createContributionRecord(input) {
  const db = await requireDatabase();
  const id = createId();
  await db.insert(propertyContributions).values({ ...input, id, percentage: input.percentage.toFixed(2) });
  return id;
}
async function createStakeholderRecord(input) {
  const db = await requireDatabase();
  const id = createId();
  const externalName = input.externalName?.trim() || null;
  await db.transaction(async (tx) => {
    const existing = await tx.select().from(companyStakeholders).where(eq13(companyStakeholders.companyId, input.companyId));
    if (input.personId && existing.some((row) => row.personId === input.personId)) {
      throw new Error("Este membro j\xE1 participa da sociedade.");
    }
    if (externalName && existing.some((row) => normalizeName(row.externalName) === normalizeName(externalName))) {
      throw new Error("Este n\xE3o-membro j\xE1 participa da sociedade.");
    }
    const total = totalPercentage(existing) + input.percentage;
    if (total > 100 + PCT_EPSILON2) {
      throw new Error(
        `A soma das participa\xE7\xF5es n\xE3o pode passar de 100% (atual ${totalPercentage(existing)}%).`
      );
    }
    await tx.insert(companyStakeholders).values({
      id,
      companyId: input.companyId,
      personId: input.personId ?? null,
      externalName,
      percentage: input.percentage.toFixed(2)
    });
  });
  return id;
}
async function updateStakeholderRecord(input) {
  const db = await requireDatabase();
  await db.transaction(async (tx) => {
    const current = await tx.select().from(companyStakeholders).where(eq13(companyStakeholders.id, input.stakeholderId)).limit(1);
    const stakeholder = current[0];
    if (!stakeholder || stakeholder.companyId !== input.companyId) {
      throw new Error("Participa\xE7\xE3o n\xE3o encontrada.");
    }
    const others = await tx.select().from(companyStakeholders).where(eq13(companyStakeholders.companyId, input.companyId));
    const remaining = others.filter((row) => row.id !== input.stakeholderId);
    const personId = input.personId !== void 0 ? input.personId : stakeholder.personId;
    const externalName = input.externalName !== void 0 ? input.externalName.trim() || null : stakeholder.externalName;
    if (!personId && !externalName) {
      throw new Error("Informe um membro da fam\xEDlia ou o nome do n\xE3o-membro.");
    }
    if (personId && remaining.some((row) => row.personId === personId)) {
      throw new Error("Este membro j\xE1 participa da sociedade.");
    }
    if (externalName && remaining.some((row) => normalizeName(row.externalName) === normalizeName(externalName))) {
      throw new Error("Este n\xE3o-membro j\xE1 participa da sociedade.");
    }
    const percentage = input.percentage ?? Number(stakeholder.percentage);
    const total = totalPercentage(remaining) + percentage;
    if (total > 100 + PCT_EPSILON2) {
      throw new Error(
        `A soma das participa\xE7\xF5es n\xE3o pode passar de 100% (atual ${totalPercentage(remaining)}%).`
      );
    }
    await tx.update(companyStakeholders).set({ personId, externalName, percentage: percentage.toFixed(2) }).where(eq13(companyStakeholders.id, input.stakeholderId));
  });
}
async function removeStakeholderRecord(input) {
  const db = await requireDatabase();
  const removed = await db.delete(companyStakeholders).where(eq13(companyStakeholders.id, input.stakeholderId)).returning({
    id: companyStakeholders.id,
    companyId: companyStakeholders.companyId
  });
  const row = removed[0];
  if (!row || row.companyId !== input.companyId) {
    throw new Error("Participa\xE7\xE3o n\xE3o encontrada.");
  }
  return row.id;
}

// server/features/companies/company-types.ts
init_schema();
import { z as z6 } from "zod";
var companyInputSchema = z6.object({
  familyId: z6.string().min(1),
  legalName: z6.string().min(3).max(180),
  taxNumber: z6.string().max(20).optional(),
  type: z6.enum(companyTypeValues)
});
var contributionInputSchema = z6.object({
  propertyId: z6.string().min(1),
  companyId: z6.string().min(1),
  percentage: z6.number().positive().max(100)
});

// server/features/companies/company-details.ts
init_schema();
import { z as z7 } from "zod";
var NATIONAL_COMPANY_DOC_TYPES = [
  "CONTRATO_SOCIAL",
  "BALANCO_FECHADO",
  "BALANCETE_ATUALIZADO",
  "ACORDO_SOCIOS",
  "LIVRO_RAZAO_IMOBILIZADO",
  "LIVRO_REGISTRO_ACOES_NOMINATIVAS",
  "LIVRO_TRANSFERENCIA_ACOES"
];
var INTERNATIONAL_COMPANY_DOC_TYPES = [
  "MEMORANDUM_ARTICLES",
  "BALANCE_SHEET",
  "CERTIFICATE_INCORPORATION",
  "REGISTER_DIRECTORS",
  "REGISTER_MEMBERS",
  "CERTIFICATE_GOOD_STANDING",
  "SHARE_CERTIFICATE"
];
function isInternationalCompany(type) {
  return type === "HOLDING_INTERNACIONAL";
}
function docTypesForCompanyType(type) {
  return isInternationalCompany(type) ? INTERNATIONAL_COMPANY_DOC_TYPES : NATIONAL_COMPANY_DOC_TYPES;
}
var text2 = (max) => z7.string().max(max, `M\xE1ximo de ${max} caracteres.`).transform((value) => value.trim() || null).nullish();
var money = z7.number().finite().nullish();
var companyDetailsFieldsSchema = z7.object({
  nire: text2(20),
  uf: text2(2),
  sede: text2(160),
  societaryType: text2(60),
  taxRegime: text2(60),
  corporatePurpose: text2(4e3),
  capitalSocial: money,
  shareQuantity: money,
  administrator1: text2(120),
  administrator2: text2(120),
  equity: money,
  cashAndEquivalents: money,
  inventory: money,
  accountsReceivable: money,
  investments: money,
  fixedAssets: money,
  retainedEarnings: money,
  taxLiabilities: money,
  laborLiabilities: money,
  financing: money,
  estimatedMarketValue: money,
  companyNumber: text2(60),
  jurisdiction: z7.enum(companyJurisdictionValues).nullish(),
  residentAgent: text2(120),
  notes: text2(8e3)
});
var companyDetailsIdSchema = z7.object({
  companyId: z7.string().min(1, "Informe a sociedade.")
});
var companyDetailDocSchema = z7.object({
  docType: z7.enum(companyDocTypeValues),
  status: z7.enum(companyDocStatusValues)
});
var companyDetailsUpsertSchema = companyDetailsIdSchema.extend({
  fields: companyDetailsFieldsSchema,
  docs: z7.array(companyDetailDocSchema).optional()
});
var companyDetailDocUpdateSchema = companyDetailsIdSchema.extend({
  docType: z7.enum(companyDocTypeValues),
  status: z7.enum(companyDocStatusValues)
});

// server/features/companies/company-details-repository.ts
init_schema();
init_database();
import { and as and9, eq as eq14 } from "drizzle-orm";
function detailValues(fields) {
  const text3 = (value) => value ?? null;
  const amount = (value) => value === void 0 || value === null ? null : value.toFixed(2);
  return {
    nire: text3(fields.nire),
    uf: text3(fields.uf),
    sede: text3(fields.sede),
    societaryType: text3(fields.societaryType),
    taxRegime: text3(fields.taxRegime),
    corporatePurpose: text3(fields.corporatePurpose),
    capitalSocial: amount(fields.capitalSocial),
    shareQuantity: amount(fields.shareQuantity),
    administrator1: text3(fields.administrator1),
    administrator2: text3(fields.administrator2),
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
    companyNumber: text3(fields.companyNumber),
    jurisdiction: fields.jurisdiction ?? null,
    residentAgent: text3(fields.residentAgent),
    notes: text3(fields.notes)
  };
}
async function getCompanyDetailsRecord(companyId) {
  const db = await requireDatabase();
  const result = await db.select().from(companyDetails).where(eq14(companyDetails.companyId, companyId)).limit(1);
  return result[0] ?? null;
}
async function upsertCompanyDetailsRecord(input) {
  const db = await requireDatabase();
  const values = detailValues(input.fields);
  const now = /* @__PURE__ */ new Date();
  await db.insert(companyDetails).values({
    id: createId(),
    companyId: input.companyId,
    ...values,
    createdAt: now,
    updatedAt: now
  }).onConflictDoUpdate({
    target: companyDetails.companyId,
    set: { ...values, updatedAt: now }
  });
}
async function listCompanyDetailDocs(input) {
  const db = await requireDatabase();
  const expected = docTypesForCompanyType(input.companyType);
  const existing = await db.select().from(companyDetailDocs).where(eq14(companyDetailDocs.companyId, input.companyId));
  const known = new Set(existing.map((row) => row.docType));
  const missing = expected.filter((docType) => !known.has(docType));
  let rows = existing;
  if (missing.length) {
    await db.insert(companyDetailDocs).values(
      missing.map((docType) => ({
        id: createId(),
        companyId: input.companyId,
        docType,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }))
    );
    rows = await db.select().from(companyDetailDocs).where(eq14(companyDetailDocs.companyId, input.companyId));
  }
  const order = new Map(expected.map((docType, index2) => [docType, index2]));
  return rows.filter((row) => order.has(row.docType)).sort((a, b) => (order.get(a.docType) ?? 0) - (order.get(b.docType) ?? 0));
}
async function updateCompanyDetailDocRecord(input) {
  const db = await requireDatabase();
  const current = await db.select({ id: companyDetailDocs.id }).from(companyDetailDocs).where(
    and9(
      eq14(companyDetailDocs.companyId, input.companyId),
      eq14(companyDetailDocs.docType, input.docType)
    )
  ).limit(1);
  if (!current[0])
    throw new Error("Documento n\xE3o encontrado para esta sociedade.");
  await db.update(companyDetailDocs).set({ status: input.status, updatedAt: /* @__PURE__ */ new Date() }).where(eq14(companyDetailDocs.id, current[0].id));
}
function computePerShare(input) {
  const quantity = Number(input.shareQuantity ?? 0);
  const perShare = (amount) => {
    if (!Number.isFinite(quantity) || quantity <= 0) return null;
    return Number(amount ?? 0) / quantity;
  };
  return {
    contabil: perShare(input.capitalSocial),
    patrimonial: perShare(input.equity),
    mercado: perShare(input.estimatedMarketValue)
  };
}

// server/features/companies/company-stakeholder.ts
import { z as z8 } from "zod";
var stakeholderInputSchema = z8.object({
  companyId: z8.string().min(1),
  // Sócio membro da família (people) OU não-membro informado em externalName.
  personId: z8.string().min(1).optional(),
  externalName: z8.string().min(2).max(160).optional(),
  percentage: z8.number().positive().max(100)
}).refine((data) => Boolean(data.personId || data.externalName?.trim()), {
  message: "Informe um membro da fam\xEDlia ou o nome do n\xE3o-membro.",
  path: ["personId"]
});
var stakeholderUpdateSchema = z8.object({
  companyId: z8.string().min(1),
  stakeholderId: z8.string().min(1),
  personId: z8.string().min(1).optional(),
  externalName: z8.string().min(2).max(160).optional(),
  percentage: z8.number().positive().max(100).optional()
}).refine(
  (data) => data.percentage !== void 0 || data.personId !== void 0 || data.externalName !== void 0,
  { message: "Nada para atualizar.", path: ["percentage"] }
);
var stakeholderDeleteSchema = z8.object({
  companyId: z8.string().min(1),
  stakeholderId: z8.string().min(1)
});

// server/features/companies/company-router.ts
async function requireCompanyFamily(companyId) {
  const company = await getCompanyRecord(companyId);
  if (!company) throw new Error("Sociedade n\xE3o encontrada.");
  return company;
}
var companyRouter = router({
  list: protectedProcedure.input(z9.object({ familyId: z9.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listCompanyRecords(input.familyId);
  }),
  stakeholders: protectedProcedure.input(z9.object({ companyId: z9.string() })).query(async ({ ctx, input }) => {
    const company = await requireCompanyFamily(input.companyId);
    await assertFamilyAccess(ctx, company.familyId);
    return listStakeholderRecords(input.companyId);
  }),
  create: protectedProcedure.input(companyInputSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    await assertFamilyAccess(ctx, input.familyId);
    const companyId = await createCompanyRecord(input);
    await ensureCertidoesForSubject({
      familyId: input.familyId,
      scope: "SOCIEDADE",
      subjectId: companyId
    });
    const requirements = await ensureDocumentRequirements({
      familyId: input.familyId,
      entityType: "SOCIEDADE",
      entityId: companyId,
      categories: COMPANY_DOCUMENT_CATEGORIES
    });
    await recordAudit({
      action: "SOCIEDADE_CRIADA",
      entityType: "SOCIEDADE",
      entityId: companyId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { type: input.type, requirements: requirements.length }
    });
    return { companyId };
  }),
  createContribution: protectedProcedure.input(contributionInputSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const property = await getPropertyRecord(input.propertyId);
    if (!property) throw new Error("Im\xF3vel n\xE3o encontrado.");
    await assertFamilyAccess(ctx, property.familyId);
    const contributionId = await createContributionRecord(input);
    await recordAudit({ action: "INTEGRALIZACAO_REGISTRADA", entityType: "IMOVEL", entityId: input.propertyId, actorUserId: user.id, familyId: property.familyId, metadata: { contributionId } });
    return { contributionId };
  }),
  addStakeholder: protectedProcedure.input(stakeholderInputSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const company = await requireCompanyFamily(input.companyId);
    await assertFamilyAccess(ctx, company.familyId);
    const stakeholderId = await createStakeholderRecord(input);
    await recordAudit({
      action: "PARTICIPACAO_SOCIETARIA_REGISTRADA",
      entityType: "SOCIEDADE",
      entityId: input.companyId,
      actorUserId: user.id,
      familyId: company.familyId,
      metadata: { stakeholderId, percentage: input.percentage, personId: input.personId ?? "", externalName: input.externalName ?? "" }
    });
    return { stakeholderId };
  }),
  updateStakeholder: protectedProcedure.input(stakeholderUpdateSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const company = await requireCompanyFamily(input.companyId);
    await assertFamilyAccess(ctx, company.familyId);
    await updateStakeholderRecord(input);
    await recordAudit({
      action: "PARTICIPACAO_SOCIETARIA_ATUALIZADA",
      entityType: "SOCIEDADE",
      entityId: input.companyId,
      actorUserId: user.id,
      familyId: company.familyId,
      metadata: { stakeholderId: input.stakeholderId }
    });
    return { success: true };
  }),
  removeStakeholder: protectedProcedure.input(stakeholderDeleteSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const company = await requireCompanyFamily(input.companyId);
    await assertFamilyAccess(ctx, company.familyId);
    await removeStakeholderRecord(input);
    await recordAudit({
      action: "PARTICIPACAO_SOCIETARIA_REMOVIDA",
      entityType: "SOCIEDADE",
      entityId: input.companyId,
      actorUserId: user.id,
      familyId: company.familyId,
      metadata: { stakeholderId: input.stakeholderId }
    });
    return { success: true };
  }),
  getDetails: protectedProcedure.input(companyDetailsIdSchema).query(async ({ ctx, input }) => {
    const company = await requireCompanyFamily(input.companyId);
    await assertFamilyAccess(ctx, company.familyId);
    const [details, docs, stakeholders, certidoes2, people2] = await Promise.all([
      getCompanyDetailsRecord(company.id),
      listCompanyDetailDocs({ companyId: company.id, companyType: company.type }),
      listStakeholderRecords(company.id),
      listCertidaoRecords(company.familyId),
      listPeopleByFamily(company.familyId)
    ]);
    const names = new Map(people2.map((person) => [person.id, person.fullName]));
    return {
      company: {
        id: company.id,
        legalName: company.legalName,
        taxNumber: company.taxNumber,
        type: company.type
      },
      details,
      docs,
      stakeholders: stakeholders.map((stakeholder) => ({
        ...stakeholder,
        displayName: stakeholder.externalName ?? (stakeholder.personId ? names.get(stakeholder.personId) ?? null : null)
      })),
      certidoes: certidoes2.filter(
        (row) => row.scope === "SOCIEDADE" && row.subjectId === company.id
      ),
      perShare: computePerShare(details ?? {})
    };
  }),
  upsertDetails: protectedProcedure.input(companyDetailsUpsertSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const company = await requireCompanyFamily(input.companyId);
    await assertFamilyAccess(ctx, company.familyId);
    const allowed = new Set(docTypesForCompanyType(company.type));
    for (const doc of input.docs ?? []) {
      if (!allowed.has(doc.docType)) {
        throw new Error("Documento inv\xE1lido para o tipo desta sociedade.");
      }
    }
    await upsertCompanyDetailsRecord({ companyId: company.id, fields: input.fields });
    for (const doc of input.docs ?? []) {
      await updateCompanyDetailDocRecord({ ...doc, companyId: company.id });
    }
    await recordAudit({
      action: "DETALHES_HOLDING_SALVOS",
      entityType: "SOCIEDADE",
      entityId: company.id,
      actorUserId: user.id,
      familyId: company.familyId,
      metadata: {
        type: company.type,
        documents: (input.docs ?? []).length,
        capitalSocial: input.fields.capitalSocial ?? 0
      }
    });
    return { success: true };
  }),
  updateDetailDoc: protectedProcedure.input(companyDetailDocUpdateSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const company = await requireCompanyFamily(input.companyId);
    await assertFamilyAccess(ctx, company.familyId);
    const allowed = new Set(docTypesForCompanyType(company.type));
    if (!allowed.has(input.docType)) {
      throw new Error("Documento inv\xE1lido para o tipo desta sociedade.");
    }
    await updateCompanyDetailDocRecord(input);
    await recordAudit({
      action: "DETALHES_HOLDING_DOC_STATUS",
      entityType: "SOCIEDADE",
      entityId: company.id,
      actorUserId: user.id,
      familyId: company.familyId,
      metadata: { docType: input.docType, status: input.status }
    });
    return { success: true };
  })
});

// server/features/documents/document-router.ts
import { z as z11 } from "zod";
init_roles();

// server/features/documents/document-review.ts
init_schema();
init_database();
import { eq as eq16 } from "drizzle-orm";

// server/features/documents/couple-docs.ts
init_schema();
init_database();
import { and as and10, eq as eq15, inArray as inArray4, ne } from "drizzle-orm";
async function releaseSpouseCoupleDocs(sourceDocument) {
  if (sourceDocument.entityType !== "PESSOA") return 0;
  if (!isCoupleSharedCategory(sourceDocument.category)) return 0;
  const db = await requireDatabase();
  const [spouse] = await db.select({ id: people.id }).from(people).where(
    and10(
      eq15(people.familyId, sourceDocument.familyId),
      eq15(people.vinculo, "CONJUGE"),
      ne(people.id, sourceDocument.entityId)
    )
  ).limit(1);
  if (!spouse) return 0;
  const updated = await db.update(documents).set({
    status: "DISPENSADO",
    dispensationReason: "Documento do casal \u2014 apresentado pelo titular (n\xE3o exigido do c\xF4njuge).",
    dispensationRequestedBy: "SISTEMA",
    dispensationApprovedBy: "SISTEMA",
    dispensedAt: /* @__PURE__ */ new Date(),
    rejectionReason: null
  }).where(
    and10(
      eq15(documents.familyId, sourceDocument.familyId),
      eq15(documents.entityType, "PESSOA"),
      eq15(documents.entityId, spouse.id),
      eq15(documents.category, sourceDocument.category),
      eq15(documents.status, "PENDENTE"),
      inArray4(documents.category, [...COUPLE_SHARED_CATEGORIES])
    )
  ).returning({ id: documents.id });
  return updated.length;
}

// server/features/documents/document-review.ts
async function reviewDocumentRecord(input) {
  if (input.status === "REJEITADO" && !input.rejectionReason) {
    throw new Error("Motivo da rejei\xE7\xE3o \xE9 obrigat\xF3rio.");
  }
  const db = await requireDatabase();
  const document = await getDocumentRecord(input.documentId);
  await db.update(documents).set({
    status: input.status,
    rejectionReason: input.status === "REJEITADO" ? input.rejectionReason : null
  }).where(eq16(documents.id, input.documentId));
  if (document && input.status === "VALIDADO") {
    await releaseSpouseCoupleDocs({
      familyId: document.familyId,
      entityType: document.entityType,
      entityId: document.entityId,
      category: document.category
    });
  }
}
async function dispenseDocumentRecord(input) {
  if (!input.reason || input.reason.trim().length < 3) {
    throw new Error("Justificativa da dispensa \xE9 obrigat\xF3ria.");
  }
  const db = await requireDatabase();
  await db.update(documents).set({
    status: "DISPENSADO",
    dispensationReason: input.reason.trim(),
    dispensationRequestedBy: input.requestedBy,
    dispensationApprovedBy: input.approvedBy,
    dispensedAt: /* @__PURE__ */ new Date()
  }).where(eq16(documents.id, input.documentId));
}

// server/features/documents/document-types.ts
init_schema();
import { z as z10 } from "zod";
var documentEntitySchema = z10.enum(entityTypeValues);
var documentStatusSchema = z10.enum([
  "PENDENTE",
  "RECEBIDO_EM_ANALISE",
  "VALIDADO",
  "REJEITADO",
  "VENCIDO",
  "DISPENSADO",
  "NA"
]);
var createDocumentSchema = z10.object({
  familyId: z10.string().min(1),
  entityType: documentEntitySchema,
  entityId: z10.string().min(1),
  category: z10.string().min(2).max(80),
  validUntil: z10.string().optional()
});
var uploadVersionSchema = z10.object({
  documentId: z10.string().min(1),
  fileName: z10.string().min(1).max(255),
  mimeType: z10.string().min(1).max(120),
  base64Data: z10.string().min(8).max(8e6)
});
var reviewDocumentSchema = z10.object({
  documentId: z10.string().min(1),
  status: z10.enum(["VALIDADO", "REJEITADO"]),
  rejectionReason: z10.string().min(3).max(1e3).optional()
});
var dispenseDocumentSchema = z10.object({
  documentId: z10.string().min(1),
  reason: z10.string().min(3).max(1e3),
  requestedBy: z10.string().optional()
});

// server/features/documents/document-upload.ts
init_schema();
init_family_storage_path();
import { createHash as createHash2 } from "node:crypto";
import { eq as eq17 } from "drizzle-orm";
init_database();
var ALLOWED_MIME_TYPES = /* @__PURE__ */ new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
async function storeDocumentVersion(input) {
  if (!ALLOWED_MIME_TYPES.has(input.mimeType))
    throw new Error("Tipo de arquivo n\xE3o permitido.");
  const document = await getDocumentRecord(input.documentId);
  if (!document) throw new Error("Documento n\xE3o encontrado.");
  const bytes = Buffer.from(input.base64Data, "base64");
  if (!bytes.length || bytes.length > 5 * 1024 * 1024)
    throw new Error("Arquivo inv\xE1lido ou maior que 5 MB.");
  const sha256 = createHash2("sha256").update(bytes).digest("hex");
  const nextVersion = document.currentVersion + 1;
  const familyFolder = await resolveFamilyStorageFolder(document.familyId);
  const relativeKey = `${familyFolder}/${document.id}/v${nextVersion}/${input.fileName}`;
  const stored = await storagePut(relativeKey, bytes, input.mimeType);
  const db = await requireDatabase();
  await db.transaction(async (tx) => {
    await tx.insert(documentVersions).values({
      id: createId(),
      documentId: document.id,
      versionNumber: nextVersion,
      originalName: input.fileName,
      mimeType: input.mimeType,
      storageKey: stored.key,
      sha256,
      uploadedBy: String(input.userId)
    });
    await tx.update(documents).set({
      currentVersion: nextVersion,
      status: "RECEBIDO_EM_ANALISE",
      rejectionReason: null
    }).where(eq17(documents.id, document.id));
  });
  await releaseSpouseCoupleDocs({
    familyId: document.familyId,
    entityType: document.entityType,
    entityId: document.entityId,
    category: document.category
  });
  return { versionNumber: nextVersion, sha256, storageKey: stored.key };
}

// server/features/documents/document-router.ts
var documentRouter = router({
  list: protectedProcedure.input(z11.object({ familyId: z11.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listDocumentRecords(input.familyId);
  }),
  versions: protectedProcedure.input(z11.object({ documentId: z11.string() })).query(async ({ ctx, input }) => {
    const document = await getDocumentRecord(input.documentId);
    if (!document) return [];
    await assertFamilyAccess(ctx, document.familyId);
    return listVersions(input.documentId);
  }),
  create: protectedProcedure.input(createDocumentSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    await assertFamilyAccess(ctx, input.familyId);
    const documentId = await findOrCreateDocumentRecord(input);
    await recordAudit({
      action: "DOCUMENTO_CRIADO",
      entityType: "DOCUMENTO",
      entityId: documentId,
      actorUserId: user.id,
      familyId: input.familyId
    });
    return { documentId };
  }),
  generateRequirements: protectedProcedure.input(z11.object({ familyId: z11.string() })).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    await assertFamilyAccess(ctx, input.familyId);
    const created = await ensureFamilyDocumentRequirements(input.familyId);
    await recordAudit({
      action: "REQUISITOS_DOCUMENTAIS_GERADOS",
      entityType: "FAMILIA",
      entityId: input.familyId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { created }
    });
    return { created };
  }),
  uploadVersion: protectedProcedure.input(uploadVersionSchema).mutation(async ({ ctx, input }) => {
    const document = await getDocumentRecord(input.documentId);
    if (!document) throw new Error("Documento n\xE3o encontrado.");
    const user = await assertFamilyAccess(ctx, document.familyId);
    const result = await storeDocumentVersion({ ...input, userId: user.id });
    await recordAudit({
      action: "VERSAO_DOCUMENTO_ENVIADA",
      entityType: "DOCUMENTO",
      entityId: input.documentId,
      actorUserId: user.id,
      familyId: document.familyId,
      metadata: { version: result.versionNumber }
    });
    return result;
  }),
  review: protectedProcedure.input(reviewDocumentSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, ["SOCIO"]);
    const document = await getDocumentRecord(input.documentId);
    if (!document) throw new Error("Documento n\xE3o encontrado.");
    await reviewDocumentRecord(input);
    await recordAudit({
      action: `DOCUMENTO_${input.status}`,
      entityType: "DOCUMENTO",
      entityId: input.documentId,
      actorUserId: user.id,
      familyId: document.familyId
    });
    return { success: true };
  }),
  dispense: protectedProcedure.input(dispenseDocumentSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, ["SOCIO"]);
    const document = await getDocumentRecord(input.documentId);
    if (!document) throw new Error("Documento n\xE3o encontrado.");
    await dispenseDocumentRecord({
      documentId: input.documentId,
      reason: input.reason,
      requestedBy: input.requestedBy || String(user.id),
      approvedBy: String(user.id)
    });
    await recordAudit({
      action: "DOCUMENTO_DISPENSADO",
      entityType: "DOCUMENTO",
      entityId: input.documentId,
      actorUserId: user.id,
      familyId: document.familyId,
      metadata: {
        reason: input.reason,
        requestedBy: input.requestedBy || "SOLICITANTE_NAO_INFORMADO"
      }
    });
    return { success: true };
  })
});

// server/features/families/family-router.ts
init_schema();
import { createHash as createHash3, randomBytes } from "node:crypto";
import { and as and12, eq as eq19 } from "drizzle-orm";
import { z as z12 } from "zod";
init_database();
init_roles();

// server/features/families/family-timeline-repository.ts
init_schema();
init_database();
import { and as and11, count as count2, desc as desc5, eq as eq18, gt, isNull } from "drizzle-orm";

// server/features/families/family-timeline.ts
var iso = (value) => value ? new Date(value).toISOString() : null;
function stage(partial) {
  return {
    ...partial,
    detail: partial.detail ?? null,
    progress: partial.progress ?? null,
    at: iso(partial.at)
  };
}
function docDetail(documents2) {
  if (!documents2.total) return "Nenhum requisito documental aberto.";
  return `${documents2.resolved}/${documents2.total} requisitos resolvidos (validados ou dispensados).`;
}
function patrimonyDetail(patrimony) {
  const parts = [];
  if (patrimony.properties) parts.push(`${patrimony.properties} im\xF3vel(is)`);
  if (patrimony.companies) parts.push(`${patrimony.companies} sociedade(s)`);
  if (patrimony.assets) parts.push(`${patrimony.assets} ativo(s)`);
  if (!parts.length) return "Nenhum bem mapeado ainda.";
  return parts.join(" \xB7 ");
}
function proposalStatusLabel(status) {
  const labels = {
    RASCUNHO: "Rascunho",
    ENVIADA: "Enviada",
    ACEITA: "Aceita",
    CONTRAPROPOSTA_RECEBIDA: "Contraproposta recebida",
    RECUSADA: "Recusada"
  };
  return labels[status] ?? status;
}
function buildProcessTimeline(input) {
  const stages = [];
  if (input.lead) {
    const accepted = input.lead.status === "ACEITO";
    const rejected = input.lead.status === "RECUSADO";
    stages.push(
      stage({
        id: "interesse",
        title: "Interesse & triagem",
        description: "Cadastro p\xFAblico do interessado e an\xE1lise do s\xF3cio.",
        status: accepted ? "CONCLUIDO" : rejected ? "BLOQUEADO" : "EM_ANDAMENTO",
        detail: accepted ? "Lead aceito \u2014 caso familiar gerado." : rejected ? "Lead recusado." : "Aguardando an\xE1lise do s\xF3cio.",
        at: accepted ? input.lead.reviewedAt ?? input.lead.createdAt : input.lead.createdAt
      })
    );
  } else {
    stages.push(
      stage({
        id: "interesse",
        title: "Interesse & triagem",
        description: "Cadastro p\xFAblico do interessado e an\xE1lise do s\xF3cio.",
        status: "CONCLUIDO",
        detail: "Caso aberto sem lead p\xFAblico (cria\xE7\xE3o direta pela equipe).",
        at: input.family.createdAt
      })
    );
  }
  stages.push(
    stage({
      id: "abertura",
      title: "Abertura do caso",
      description: "Fam\xEDlia e projeto criados; situa\xE7\xE3o conjugal e regime registrados.",
      status: "CONCLUIDO",
      detail: `Caso familiar ativo.`,
      at: input.family.createdAt
    })
  );
  const peopleDone = input.people.hasTitular && input.people.total >= 1;
  stages.push(
    stage({
      id: "familia",
      title: "N\xFAcleo familiar",
      description: "Titular definido e membros (c\xF4njuge, filhos, netos) cadastrados.",
      status: peopleDone ? "CONCLUIDO" : input.people.total > 0 ? "EM_ANDAMENTO" : "PENDENTE",
      detail: !input.people.total ? "Nenhuma pessoa vinculada." : input.people.hasTitular ? `${input.people.total} pessoa(s) \xB7 titular definido.` : `${input.people.total} pessoa(s) \xB7 defina o titular.`,
      progress: {
        current: input.people.hasTitular ? 1 : 0,
        total: 1
      }
    })
  );
  const assetsMapped = input.patrimony.properties + input.patrimony.companies + input.patrimony.assets;
  stages.push(
    stage({
      id: "patrimonio",
      title: "Due diligence patrimonial",
      description: "Im\xF3veis, holdings/sociedades e demais ativos sob mapeamento.",
      status: assetsMapped > 0 ? "EM_ANDAMENTO" : "PENDENTE",
      detail: assetsMapped > 0 ? `${patrimonyDetail(input.patrimony)} \u2014 continue o mapeamento na aba Due Diligence.` : "Nenhum bem mapeado ainda."
    })
  );
  const docsDone = input.documents.total > 0 && input.documents.resolved >= input.documents.total;
  stages.push(
    stage({
      id: "documentos",
      title: "Matriz documental",
      description: "Coleta, an\xE1lise e dispensas dos requisitos por membro, im\xF3vel e sociedade.",
      status: input.documents.total === 0 ? "PENDENTE" : docsDone ? "CONCLUIDO" : input.documents.resolved > 0 ? "EM_ANDAMENTO" : "PENDENTE",
      detail: docDetail(input.documents),
      progress: {
        current: input.documents.resolved,
        total: input.documents.total
      }
    })
  );
  stages.push(
    stage({
      id: "lwr",
      title: "Lucathi Wealth Report",
      description: "Apresenta\xE7\xE3o executiva (diagn\xF3stico, fragilidades, estrutura proposta).",
      status: input.lwr.versions > 0 ? "CONCLUIDO" : "PENDENTE",
      detail: input.lwr.versions > 0 ? `${input.lwr.versions} vers\xE3o(\xF5es) registrada(s).` : "Nenhuma vers\xE3o do LWR registrada."
    })
  );
  if (input.proposal) {
    const status = input.proposal.status;
    const stageStatus = status === "ACEITA" ? "CONCLUIDO" : status === "RECUSADA" ? "BLOQUEADO" : status === "RASCUNHO" ? "PENDENTE" : "EM_ANDAMENTO";
    stages.push(
      stage({
        id: "proposta",
        title: "Proposta financeira",
        description: "Escopo, valor e eventual contraproposta da consultoria.",
        status: stageStatus,
        detail: status === "ACEITA" ? "Proposta aceita pelo cliente." : status === "RECUSADA" ? "Proposta recusada." : status === "CONTRAPROPOSTA_RECEBIDA" ? "Contraproposta aguardando decis\xE3o do s\xF3cio." : `Status: ${proposalStatusLabel(status)}.`,
        at: status === "ACEITA" ? input.proposal.acceptedAt ?? input.proposal.createdAt : input.proposal.createdAt
      })
    );
  } else {
    stages.push(
      stage({
        id: "proposta",
        title: "Proposta financeira",
        description: "Escopo, valor e eventual contraproposta da consultoria.",
        status: "PENDENTE",
        detail: "Nenhuma proposta registrada."
      })
    );
  }
  const accessDone = input.access.hasClientAccess;
  stages.push(
    stage({
      id: "portal",
      title: "Portal do cliente",
      description: "Acesso do titular ao portal seguro e trilha de governan\xE7a.",
      status: accessDone ? "CONCLUIDO" : input.access.activePortalLinks > 0 ? "EM_ANDAMENTO" : "PENDENTE",
      detail: accessDone ? "Conta de cliente ativa." : input.access.activePortalLinks > 0 ? `${input.access.activePortalLinks} link(s) de portal ativo(s) \u2014 aguardando 1\xBA acesso.` : "Nenhum acesso de cliente liberado."
    })
  );
  const currentStage = stages.find((s) => s.status !== "CONCLUIDO") ?? stages[stages.length - 1];
  const weight = (s) => {
    if (s.status === "CONCLUIDO") return 1;
    if (s.status === "EM_ANDAMENTO") return 0.5;
    if (s.status === "BLOQUEADO") return 0;
    if (s.progress && s.progress.total > 0) {
      return Math.min(1, s.progress.current / s.progress.total) * 0.75;
    }
    return 0;
  };
  const overallPercent = stages.length === 0 ? 0 : Math.round(
    stages.reduce((sum, s) => sum + weight(s), 0) / stages.length * 100
  );
  return {
    stages,
    currentStageId: currentStage.id,
    overallPercent
  };
}

// server/features/families/family-timeline-repository.ts
function isResolved(status) {
  return status === "VALIDADO" || status === "DISPENSADO";
}
async function getFamilyTimelineRecord(familyId) {
  const db = await requireDatabase();
  const [family] = await db.select({
    id: families.id,
    createdAt: families.createdAt
  }).from(families).where(eq18(families.id, familyId)).limit(1);
  if (!family) return null;
  const [lead] = await db.select({
    id: leads.id,
    status: leads.status,
    createdAt: leads.createdAt,
    updatedAt: leads.updatedAt
  }).from(leads).where(eq18(leads.familyId, familyId)).orderBy(desc5(leads.createdAt)).limit(1);
  const [{ total: peopleTotal }] = await db.select({ total: count2() }).from(people).where(eq18(people.familyId, familyId));
  const [{ total: titularCount }] = await db.select({ total: count2() }).from(people).where(
    and11(eq18(people.familyId, familyId), eq18(people.isPrimaryContact, true))
  );
  const [{ total: propertiesTotal }] = await db.select({ total: count2() }).from(properties).where(eq18(properties.familyId, familyId));
  const [{ total: companiesTotal }] = await db.select({ total: count2() }).from(companies).where(eq18(companies.familyId, familyId));
  const [{ total: assetsTotal }] = await db.select({ total: count2() }).from(otherAssets).where(eq18(otherAssets.familyId, familyId));
  const documentRows = await db.select({ status: documents.status }).from(documents).where(eq18(documents.familyId, familyId));
  const [{ total: lwrVersions }] = await db.select({ total: count2() }).from(lwrReports).where(eq18(lwrReports.familyId, familyId));
  const [proposal] = await db.select({
    id: financialProposals.id,
    status: financialProposals.status,
    createdAt: financialProposals.createdAt,
    acceptedAt: financialProposals.acceptedAt
  }).from(financialProposals).where(eq18(financialProposals.familyId, familyId)).orderBy(desc5(financialProposals.createdAt)).limit(1);
  const [{ total: clientAccessCount }] = await db.select({ total: count2() }).from(familyAccess).where(
    and11(
      eq18(familyAccess.familyId, familyId),
      eq18(familyAccess.accessRole, "CLIENTE")
    )
  );
  const [{ total: activePortalLinks }] = await db.select({ total: count2() }).from(portalLinks).where(
    and11(
      eq18(portalLinks.familyId, familyId),
      isNull(portalLinks.revokedAt),
      gt(portalLinks.expiresAt, /* @__PURE__ */ new Date())
    )
  );
  const resolved = documentRows.filter((row) => isResolved(row.status)).length;
  return buildProcessTimeline({
    family: { id: family.id, createdAt: family.createdAt },
    lead: lead ? {
      id: lead.id,
      status: lead.status,
      createdAt: lead.createdAt,
      // leads não têm coluna reviewedAt; updatedAt aproxima o momento da análise.
      reviewedAt: lead.updatedAt
    } : null,
    people: {
      total: Number(peopleTotal),
      hasTitular: Number(titularCount) > 0
    },
    patrimony: {
      properties: Number(propertiesTotal),
      companies: Number(companiesTotal),
      assets: Number(assetsTotal)
    },
    documents: {
      total: documentRows.length,
      resolved
    },
    lwr: { versions: Number(lwrVersions) },
    proposal: proposal ?? null,
    access: {
      hasClientAccess: Number(clientAccessCount) > 0,
      activePortalLinks: Number(activePortalLinks)
    }
  });
}

// server/features/families/family-router.ts
function hashToken(token) {
  return createHash3("sha256").update(token).digest("hex");
}
var familyRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    if (user.role !== "CLIENTE") return listFamilyRecords();
    const db = await requireDatabase();
    const access = await db.select().from(familyAccess).where(eq19(familyAccess.userId, user.id));
    const records = await Promise.all(
      access.map((item) => getFamilyRecord(item.familyId))
    );
    return records.filter(Boolean);
  }),
  get: protectedProcedure.input(z12.object({ familyId: z12.string().min(1) })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return getFamilyRecord(input.familyId);
  }),
  timeline: protectedProcedure.input(z12.object({ familyId: z12.string().min(1) })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return getFamilyTimelineRecord(input.familyId);
  }),
  create: protectedProcedure.input(familyInputSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const result = await createFamilyRecord(input, user.id);
    try {
      await recordAudit({
        action: "FAMILIA_CRIADA",
        entityType: "FAMILIA",
        entityId: result.familyId,
        actorUserId: user.id,
        familyId: result.familyId
      });
    } catch {
    }
    return result;
  }),
  grantClientAccess: protectedProcedure.input(z12.object({ familyId: z12.string(), userId: z12.number().int() })).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, ["SOCIO"]);
    const db = await requireDatabase();
    await db.insert(familyAccess).values({
      id: createId(),
      familyId: input.familyId,
      userId: input.userId,
      accessRole: "CLIENTE"
    }).onConflictDoNothing();
    try {
      await recordAudit({
        action: "ACESSO_CLIENTE_CONCEDIDO",
        entityType: "FAMILIA",
        entityId: input.familyId,
        actorUserId: user.id,
        familyId: input.familyId
      });
    } catch {
    }
    return { success: true };
  }),
  generateFirstAccessLink: protectedProcedure.input(z12.object({ familyId: z12.string().min(1) })).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, ["SOCIO"]);
    const db = await requireDatabase();
    const existingAccess = await db.select({ id: familyAccess.id }).from(familyAccess).where(
      and12(
        eq19(familyAccess.familyId, input.familyId),
        eq19(familyAccess.accessRole, "CLIENTE")
      )
    ).limit(1);
    if (existingAccess[0])
      throw new Error(
        "Esta fam\xEDlia j\xE1 possui acesso de cliente ativo. N\xE3o \xE9 necess\xE1rio gerar um novo link."
      );
    const contact = await getPrimaryContact(input.familyId);
    if (!contact)
      throw new Error(
        "Fam\xEDlia sem titular. Defina um titular na se\xE7\xE3o Pessoas antes de gerar o link."
      );
    if (!contact.taxId) throw new Error("Titular sem CPF cadastrado.");
    const token = randomBytes(24).toString("base64url");
    const linkId = createId();
    await db.insert(firstAccessLinks).values({
      id: linkId,
      familyId: input.familyId,
      personId: contact.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
      createdBy: String(user.id)
    });
    try {
      await recordAudit({
        action: "LINK_PRIMEIRO_ACESSO_GERADO",
        entityType: "FAMILIA",
        entityId: input.familyId,
        actorUserId: user.id,
        familyId: input.familyId
      });
    } catch {
    }
    return { token, fullName: contact.fullName };
  }),
  generatePasswordResetLink: protectedProcedure.input(z12.object({ familyId: z12.string().min(1) })).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, ["SOCIO"]);
    const db = await requireDatabase();
    const existingAccess = await db.select({ id: familyAccess.id }).from(familyAccess).where(
      and12(
        eq19(familyAccess.familyId, input.familyId),
        eq19(familyAccess.accessRole, "CLIENTE")
      )
    ).limit(1);
    if (!existingAccess[0])
      throw new Error(
        "Esta fam\xEDlia n\xE3o possui acesso de cliente ativo. Gere um link de primeiro acesso."
      );
    const contact = await getPrimaryContact(input.familyId);
    if (!contact)
      throw new Error(
        "Fam\xEDlia sem titular."
      );
    if (!contact.taxId) throw new Error("Titular sem CPF cadastrado.");
    const token = randomBytes(24).toString("base64url");
    const linkId = createId();
    await db.insert(firstAccessLinks).values({
      id: linkId,
      familyId: input.familyId,
      personId: contact.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
      createdBy: String(user.id)
    });
    try {
      await recordAudit({
        action: "LINK_REDEFINICAO_SENHA_GERADO",
        entityType: "FAMILIA",
        entityId: input.familyId,
        actorUserId: user.id,
        familyId: input.familyId
      });
    } catch {
    }
    return { token, fullName: contact.fullName };
  }),
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    if (user.role === "CLIENTE") return getClientDashboardData(user.id);
    requireRole(ctx, ["SOCIO", "ADMIN"]);
    return getDashboardData();
  }),
  listStorage: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    if (user.role === "CLIENTE") return listClientStorageFiles(user.id);
    requireRole(ctx, ["SOCIO", "ADMIN"]);
    return listStorageFiles();
  })
});

// server/features/reports/lwr-router.ts
init_schema();
import { desc as desc6, eq as eq20 } from "drizzle-orm";
import { z as z14 } from "zod";
init_roles();
init_database();

// server/features/reports/lwr-types.ts
import { z as z13 } from "zod";
var lwrInputSchema = z13.object({
  familyId: z13.string().min(1),
  baseDate: z13.string().min(10),
  proposedStructure: z13.string().min(10).max(12e3),
  financialProposal: z13.string().max(12e3).optional().default("Proposta financeira gerenciada no m\xF3dulo aut\xF4nomo."),
  canvaUrl: z13.string().max(1e3).optional(),
  presentationFileKey: z13.string().max(500).optional()
});

// server/features/reports/lwr-router.ts
var lwrRouter = router({
  list: protectedProcedure.input(z14.object({ familyId: z14.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    const db = await requireDatabase();
    return db.select().from(lwrReports).where(eq20(lwrReports.familyId, input.familyId)).orderBy(desc6(lwrReports.version));
  }),
  create: protectedProcedure.input(lwrInputSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const db = await requireDatabase();
    const previous = await db.select({ version: lwrReports.version }).from(lwrReports).where(eq20(lwrReports.familyId, input.familyId)).orderBy(desc6(lwrReports.version)).limit(1);
    const version = (previous[0]?.version ?? 0) + 1;
    const reportId = createId();
    await db.insert(lwrReports).values({
      id: reportId,
      familyId: input.familyId,
      version,
      responsibleUserId: String(user.id),
      baseDate: input.baseDate,
      proposedStructure: input.proposedStructure,
      financialProposal: input.financialProposal || "Proposta financeira gerenciada no m\xF3dulo aut\xF4nomo.",
      canvaUrl: input.canvaUrl || null,
      presentationFileKey: input.presentationFileKey || null
    });
    await recordAudit({ action: "LWR_CRIADO", entityType: "LWR", entityId: reportId, actorUserId: user.id, familyId: input.familyId, metadata: { version } });
    return { reportId, version };
  })
});

// server/features/people/person-router.ts
import { z as z15 } from "zod";
init_roles();
var personRouter = router({
  list: protectedProcedure.input(z15.object({ familyId: z15.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listPeopleByFamily(input.familyId);
  }),
  create: protectedProcedure.input(personInputSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const personId = await addPersonRecord(input);
    await ensureCertidoesForSubject({
      familyId: input.familyId,
      scope: "PESSOA",
      subjectId: personId
    });
    await recordAudit({
      action: "PESSOA_CRIADA",
      entityType: "PESSOA",
      entityId: personId,
      actorUserId: user.id,
      familyId: input.familyId
    });
    return { personId };
  }),
  attachDocuments: protectedProcedure.input(attachDocumentsSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    await assertFamilyAccess(ctx, input.familyId);
    const person = await getPersonRecord(input.personId);
    if (!person || person.familyId !== input.familyId) {
      throw new Error("Pessoa n\xE3o encontrada nesta fam\xEDlia.");
    }
    const stored = [];
    for (const attachment of input.attachments) {
      const documentId = await findOrCreateDocumentRecord({
        familyId: input.familyId,
        entityType: "PESSOA",
        entityId: input.personId,
        category: attachment.category
      });
      const result = await storeDocumentVersion({
        documentId,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        base64Data: attachment.base64Data,
        userId: user.id
      });
      stored.push({
        documentId,
        versionNumber: result.versionNumber,
        category: attachment.category
      });
    }
    await recordAudit({
      action: "ANEXOS_PESSOA_ENVIADOS",
      entityType: "PESSOA",
      entityId: input.personId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { count: stored.length, categories: stored.map((item) => item.category).join(", ") }
    });
    return { stored };
  }),
  setPrimaryContact: protectedProcedure.input(setPrimaryContactSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const { migratedFiles } = await setPrimaryContact(input);
    await recordAudit({
      action: "TITULAR_FAMILIA_DEFINIDO",
      entityType: "PESSOA",
      entityId: input.personId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { migratedFiles }
    });
    return { success: true, migratedFiles };
  })
});

// server/features/portal/portal-router.ts
init_schema();
import { createHash as createHash4, randomBytes as randomBytes2 } from "node:crypto";
import { and as and13, desc as desc7, eq as eq21, gt as gt3, isNull as isNull3 } from "drizzle-orm";
import { z as z16 } from "zod";
init_database();
function hashToken2(token) {
  return createHash4("sha256").update(token).digest("hex");
}
async function getActivePortalLink(token) {
  const db = await requireDatabase();
  const result = await db.select().from(portalLinks).where(and13(
    eq21(portalLinks.tokenHash, hashToken2(token)),
    isNull3(portalLinks.revokedAt),
    gt3(portalLinks.expiresAt, /* @__PURE__ */ new Date())
  )).limit(1);
  return result[0] ?? null;
}
var portalRouter = router({
  createLink: protectedProcedure.input(z16.object({ familyId: z16.string(), origin: z16.string().url() })).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, ["SOCIO"]);
    const token = randomBytes2(24).toString("base64url");
    const db = await requireDatabase();
    const linkId = createId();
    await db.insert(portalLinks).values({
      id: linkId,
      familyId: input.familyId,
      tokenHash: hashToken2(token),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
      createdBy: String(user.id)
    });
    await recordAudit({ action: "LINK_PORTAL_GERADO", entityType: "FAMILIA", entityId: input.familyId, actorUserId: user.id, familyId: input.familyId });
    return { id: linkId, url: `${input.origin}/portal/${token}`, expiresInDays: 7 };
  }),
  listLinks: protectedProcedure.input(z16.object({ familyId: z16.string() })).query(async ({ ctx, input }) => {
    requireRole(ctx, ["SOCIO"]);
    const db = await requireDatabase();
    return db.select({ id: portalLinks.id, expiresAt: portalLinks.expiresAt, revokedAt: portalLinks.revokedAt, createdAt: portalLinks.createdAt }).from(portalLinks).where(eq21(portalLinks.familyId, input.familyId)).orderBy(desc7(portalLinks.createdAt));
  }),
  revokeLink: protectedProcedure.input(z16.object({ linkId: z16.string() })).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, ["SOCIO"]);
    const db = await requireDatabase();
    const [link] = await db.select().from(portalLinks).where(eq21(portalLinks.id, input.linkId)).limit(1);
    if (!link) throw new Error("Link n\xE3o encontrado.");
    await db.update(portalLinks).set({ revokedAt: /* @__PURE__ */ new Date() }).where(eq21(portalLinks.id, input.linkId));
    await recordAudit({ action: "LINK_PORTAL_REVOGADO", entityType: "FAMILIA", entityId: link.familyId, actorUserId: user.id, familyId: link.familyId });
    return { success: true };
  }),
  status: publicProcedure.input(z16.object({ token: z16.string().min(16) })).query(async ({ input }) => {
    const link = await getActivePortalLink(input.token);
    if (!link) throw new Error("Link inv\xE1lido, revogado ou expirado.");
    const db = await requireDatabase();
    const [family] = await db.select().from(families).where(eq21(families.id, link.familyId)).limit(1);
    const [project] = await db.select().from(projects).where(eq21(projects.familyId, link.familyId)).limit(1);
    const documentList = await db.select().from(documents).where(eq21(documents.familyId, link.familyId));
    const reports = await db.select().from(lwrReports).where(eq21(lwrReports.familyId, link.familyId));
    return { family, project, documents: documentList, reports };
  }),
  uploadDocument: publicProcedure.input(z16.object({ token: z16.string().min(16), documentId: z16.string(), fileName: z16.string(), mimeType: z16.string(), base64Data: z16.string() })).mutation(async ({ input }) => {
    const link = await getActivePortalLink(input.token);
    if (!link) throw new Error("Link inv\xE1lido, revogado ou expirado.");
    const document = await getDocumentRecord(input.documentId);
    if (!document || document.familyId !== link.familyId) throw new Error("Documento n\xE3o autorizado.");
    const result = await storeDocumentVersion({ ...input, userId: 0 });
    await recordAudit({ action: "VERSAO_DOCUMENTO_ENVIADA_PORTAL", entityType: "DOCUMENTO", entityId: input.documentId, familyId: link.familyId, metadata: { version: result.versionNumber } });
    return result;
  })
});

// server/features/properties/property-router.ts
import { z as z18 } from "zod";
init_roles();

// server/features/properties/property-types.ts
init_schema();
import { z as z17 } from "zod";
var propertyInputSchema = z17.object({
  familyId: z17.string().min(1),
  description: z17.string().min(3).max(240),
  hasRegistration: z17.boolean().default(true),
  registrationNumber: z17.string().max(120).optional(),
  alternativeDocType: z17.enum(["ESCRITURA_PUBLICA", "CONTRATO_COMPRA_VENDA"]).optional(),
  noRegistrationReason: z17.string().max(1e3).optional(),
  registryOffice: z17.string().max(160).optional(),
  propertyCity: z17.string().min(2).max(120),
  registryCity: z17.string().max(120).optional(),
  acquisitionDate: z17.string().optional(),
  declaredValue: z17.number().nonnegative().optional(),
  marketValue: z17.number().nonnegative().optional()
}).refine((data) => {
  if (!data.hasRegistration) {
    return Boolean(data.alternativeDocType && data.noRegistrationReason && data.noRegistrationReason.trim().length >= 3);
  }
  return true;
}, {
  message: "Im\xF3veis sem matr\xEDcula exigem documento alternativo (Escritura P\xFAblica ou Contrato de Compra e Venda) e justificativa.",
  path: ["alternativeDocType"]
});
var encumbranceInputSchema = z17.object({
  propertyId: z17.string().min(1),
  type: z17.enum(encumbranceTypeValues),
  description: z17.string().max(1e3).optional()
});
var propertyOwnerInputSchema = z17.object({
  propertyId: z17.string().min(1),
  personId: z17.string().min(1),
  ownershipPercentage: z17.number().positive().max(100),
  rightType: z17.enum(["PROPRIEDADE", "USUFRUTO", "NUA_PROPRIEDADE"])
});
var propertyOwnerUpdateSchema = z17.object({
  propertyId: z17.string().min(1),
  ownerId: z17.string().min(1),
  personId: z17.string().min(1).optional(),
  ownershipPercentage: z17.number().positive().max(100).optional(),
  rightType: z17.enum(["PROPRIEDADE", "USUFRUTO", "NUA_PROPRIEDADE"]).optional()
});
var propertyOwnerDeleteSchema = z17.object({
  propertyId: z17.string().min(1),
  ownerId: z17.string().min(1)
});

// server/features/properties/property-router.ts
var propertyRouter = router({
  list: protectedProcedure.input(z18.object({ familyId: z18.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listPropertyRecords(input.familyId);
  }),
  encumbrances: protectedProcedure.input(z18.object({ propertyId: z18.string() })).query(async ({ ctx, input }) => {
    const property = await getPropertyRecord(input.propertyId);
    if (!property) return [];
    await assertFamilyAccess(ctx, property.familyId);
    return listEncumbrances(input.propertyId);
  }),
  owners: protectedProcedure.input(z18.object({ propertyId: z18.string() })).query(async ({ ctx, input }) => {
    const property = await getPropertyRecord(input.propertyId);
    if (!property) return [];
    await assertFamilyAccess(ctx, property.familyId);
    return listPropertyOwners(input.propertyId);
  }),
  create: protectedProcedure.input(propertyInputSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const propertyId = await createPropertyRecord(input);
    const requirements = await ensureDocumentRequirements({
      familyId: input.familyId,
      entityType: "IMOVEL",
      entityId: propertyId,
      categories: input.hasRegistration ? PROPERTY_DOCUMENT_CATEGORIES.withRegistration : PROPERTY_DOCUMENT_CATEGORIES.withoutRegistration
    });
    await recordAudit({
      action: "IMOVEL_CRIADO",
      entityType: "IMOVEL",
      entityId: propertyId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { requirements: requirements.length }
    });
    return { propertyId };
  }),
  addEncumbrance: protectedProcedure.input(encumbranceInputSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const property = await getPropertyRecord(input.propertyId);
    if (!property) throw new Error("Im\xF3vel n\xE3o encontrado.");
    await assertFamilyAccess(ctx, property.familyId);
    const encumbranceId = await addEncumbranceRecord(input);
    await recordAudit({ action: "GRAVAME_CADASTRADO", entityType: "IMOVEL", entityId: input.propertyId, actorUserId: user.id, familyId: property.familyId, metadata: { encumbranceId, type: input.type } });
    return { encumbranceId };
  }),
  addOwner: protectedProcedure.input(propertyOwnerInputSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const property = await getPropertyRecord(input.propertyId);
    if (!property) throw new Error("Im\xF3vel n\xE3o encontrado.");
    await assertFamilyAccess(ctx, property.familyId);
    const ownerId = await addPropertyOwnerRecord(input);
    await recordAudit({ action: "TITULARIDADE_REGISTRADA", entityType: "IMOVEL", entityId: input.propertyId, actorUserId: user.id, familyId: property.familyId, metadata: { ownerId, personId: input.personId, ownershipPercentage: input.ownershipPercentage } });
    return { ownerId };
  }),
  updateOwner: protectedProcedure.input(propertyOwnerUpdateSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const property = await getPropertyRecord(input.propertyId);
    if (!property) throw new Error("Im\xF3vel n\xE3o encontrado.");
    await assertFamilyAccess(ctx, property.familyId);
    await updatePropertyOwnerRecord(input);
    await recordAudit({ action: "TITULARIDADE_ATUALIZADA", entityType: "IMOVEL", entityId: input.propertyId, actorUserId: user.id, familyId: property.familyId, metadata: { ownerId: input.ownerId } });
    return { success: true };
  }),
  removeOwner: protectedProcedure.input(propertyOwnerDeleteSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const property = await getPropertyRecord(input.propertyId);
    if (!property) throw new Error("Im\xF3vel n\xE3o encontrado.");
    await assertFamilyAccess(ctx, property.familyId);
    await removePropertyOwnerRecord(input);
    await recordAudit({ action: "TITULARIDADE_REMOVIDA", entityType: "IMOVEL", entityId: input.propertyId, actorUserId: user.id, familyId: property.familyId, metadata: { ownerId: input.ownerId } });
    return { success: true };
  })
});

// server/features/users/user-router.ts
init_schema();
init_roles();
import { desc as desc8, eq as eq22 } from "drizzle-orm";
import { z as z19 } from "zod";
init_database();
var userRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    requireRole(ctx, ["SOCIO"]);
    const db = await requireDatabase();
    return db.select({ id: users.id, name: users.name, email: users.email, role: users.role }).from(users).orderBy(desc8(users.lastSignedIn));
  }),
  changeRole: protectedProcedure.input(z19.object({ userId: z19.number().int(), role: z19.enum(APP_ROLES) })).mutation(async ({ ctx, input }) => {
    const actor = requireRole(ctx, ["SOCIO"]);
    if (input.userId === actor.id && input.role !== "SOCIO") throw new Error("O SOCIO respons\xE1vel n\xE3o pode remover o pr\xF3prio papel.");
    const db = await requireDatabase();
    await db.update(users).set({ role: input.role }).where(eq22(users.id, input.userId));
    await recordAudit({ action: "PAPEL_ALTERADO", entityType: "USUARIO", entityId: String(input.userId), actorUserId: actor.id, metadata: { role: input.role } });
    return { success: true };
  })
});

// server/features/audit/audit-router.ts
init_schema();
import { desc as desc9, eq as eq23 } from "drizzle-orm";
import { z as z20 } from "zod";
init_database();
var auditRouter = router({
  listByFamily: protectedProcedure.input(z20.object({ familyId: z20.string() })).query(async ({ ctx, input }) => {
    requireRole(ctx, ["SOCIO", "ADMIN"]);
    await assertFamilyAccess(ctx, input.familyId);
    const db = await requireDatabase();
    return db.select().from(auditLogs).where(eq23(auditLogs.familyId, input.familyId)).orderBy(desc9(auditLogs.createdAt));
  })
});

// server/features/people/first-access-router.ts
import { createHash as createHash5 } from "node:crypto";
import { and as and14, eq as eq24, isNull as isNull4, gt as gt4 } from "drizzle-orm";
import { z as z21 } from "zod";
import bcrypt2 from "bcryptjs";
init_db();
init_database();
init_schema();
var BCRYPT_ROUNDS2 = 12;
function hashToken3(token) {
  return createHash5("sha256").update(token).digest("hex");
}
var firstAccessRouter = router({
  verifyToken: publicProcedure.input(z21.object({ token: z21.string().min(16) })).query(async ({ input }) => {
    checkRateLimit(`verify:${input.token}`);
    const db = await requireDatabase();
    const [link] = await db.select().from(firstAccessLinks).where(
      and14(
        eq24(firstAccessLinks.tokenHash, hashToken3(input.token)),
        isNull4(firstAccessLinks.consumedAt),
        gt4(firstAccessLinks.expiresAt, /* @__PURE__ */ new Date())
      )
    ).limit(1);
    if (!link) throw new Error("Link inv\xE1lido, expirado ou j\xE1 utilizado.");
    const person = await getPersonRecord(link.personId);
    if (!person) throw new Error("Pessoa n\xE3o encontrada.");
    return {
      personId: person.id,
      fullName: person.fullName,
      email: person.email ?? null
    };
  }),
  setPassword: publicProcedure.input(z21.object({ token: z21.string().min(16), password: z21.string().min(6) })).mutation(async ({ input }) => {
    checkRateLimit(`setpwd:${input.token}`);
    const db = await requireDatabase();
    const [link] = await db.select().from(firstAccessLinks).where(
      and14(
        eq24(firstAccessLinks.tokenHash, hashToken3(input.token)),
        isNull4(firstAccessLinks.consumedAt),
        gt4(firstAccessLinks.expiresAt, /* @__PURE__ */ new Date())
      )
    ).limit(1);
    if (!link) throw new Error("Link inv\xE1lido, expirado ou j\xE1 utilizado.");
    const person = await getPersonRecord(link.personId);
    if (!person) throw new Error("Pessoa n\xE3o encontrada.");
    if (!person.email)
      throw new Error("Pessoa sem e-mail cadastrado. Contate o s\xF3cio.");
    let userId;
    const existing = await getUserByEmail(person.email);
    if (existing) {
      userId = existing.id;
      const passwordHash = await bcrypt2.hash(input.password, BCRYPT_ROUNDS2);
      const { users: users2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      await db.update(users2).set({ passwordHash }).where(eq24(users2.id, userId));
    } else {
      const passwordHash = await bcrypt2.hash(input.password, BCRYPT_ROUNDS2);
      try {
        const created = await createUser({
          name: person.fullName ?? void 0,
          email: person.email,
          passwordHash,
          role: "CLIENTE",
          lastSignedIn: /* @__PURE__ */ new Date()
        });
        userId = created.id;
      } catch (error) {
        const message = String(error);
        if (!message.includes("J\xE1 existe")) throw error;
        const raced = await getUserByEmail(person.email);
        if (!raced) throw error;
        userId = raced.id;
      }
    }
    await db.insert(familyAccess).values({
      id: createId(),
      familyId: person.familyId,
      userId,
      accessRole: "CLIENTE"
    }).onConflictDoNothing();
    await db.update(firstAccessLinks).set({ consumedAt: /* @__PURE__ */ new Date() }).where(eq24(firstAccessLinks.id, link.id));
    return { success: true };
  })
});

// server/features/assets/assets-router.ts
init_roles();
import { z as z23 } from "zod";

// server/features/assets/assets-repository.ts
init_schema();
init_database();
import { desc as desc10, eq as eq25 } from "drizzle-orm";
async function createAssetRecord(input) {
  const db = await requireDatabase();
  const id = createId();
  await db.insert(otherAssets).values({
    ...input,
    id,
    declaredValue: input.declaredValue?.toFixed(2) ?? null,
    marketValue: input.marketValue?.toFixed(2) ?? null,
    ownerPersonId: input.ownerPersonId || null,
    notes: input.notes || null
  });
  return id;
}
async function listAssetRecords(familyId) {
  const db = await requireDatabase();
  return db.select().from(otherAssets).where(eq25(otherAssets.familyId, familyId)).orderBy(desc10(otherAssets.updatedAt));
}

// server/features/assets/assets-types.ts
import { z as z22 } from "zod";
var assetCategorySchema = z22.enum([
  "INVESTIMENTO",
  "VEICULO",
  "PARTICIPACAO_OUTRA",
  "DIREITO",
  "OUTRO"
]);
var createAssetSchema = z22.object({
  familyId: z22.string().min(1),
  category: assetCategorySchema.default("OUTRO"),
  description: z22.string().min(2).max(240),
  declaredValue: z22.number().nonnegative().optional(),
  marketValue: z22.number().nonnegative().optional(),
  ownerPersonId: z22.string().optional(),
  notes: z22.string().max(1e3).optional()
});

// server/features/assets/assets-router.ts
var assetRouter = router({
  list: protectedProcedure.input(z23.object({ familyId: z23.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listAssetRecords(input.familyId);
  }),
  create: protectedProcedure.input(createAssetSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    await assertFamilyAccess(ctx, input.familyId);
    const assetId = await createAssetRecord(input);
    const requirements = await ensureDocumentRequirements({
      familyId: input.familyId,
      entityType: "ATIVO",
      entityId: assetId,
      categories: ASSET_DOCUMENT_CATEGORIES
    });
    await recordAudit({
      action: "ATIVO_CRIADO",
      entityType: "ATIVO",
      entityId: assetId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { category: input.category, description: input.description, requirements: requirements.length }
    });
    return { assetId };
  })
});

// server/features/proposals/proposal-router.ts
init_roles();
import { z as z25 } from "zod";

// server/features/proposals/proposal-repository.ts
init_schema();
init_database();
import { desc as desc11, eq as eq26 } from "drizzle-orm";
async function createProposalRecord(input) {
  const db = await requireDatabase();
  const id = createId();
  await db.insert(financialProposals).values({
    id,
    familyId: input.familyId,
    scopeDescription: input.scopeDescription,
    proposedValue: input.proposedValue.toFixed(2),
    status: "ENVIADA"
  });
  return id;
}
async function listProposalRecords(familyId) {
  const db = await requireDatabase();
  return db.select().from(financialProposals).where(eq26(financialProposals.familyId, familyId)).orderBy(desc11(financialProposals.createdAt));
}
async function getProposalRecord(proposalId) {
  const db = await requireDatabase();
  const [result] = await db.select().from(financialProposals).where(eq26(financialProposals.id, proposalId)).limit(1);
  return result ?? null;
}
async function acceptProposalRecord(proposalId, clientNotes) {
  const db = await requireDatabase();
  await db.update(financialProposals).set({
    status: "ACEITA",
    clientNotes: clientNotes || null,
    acceptedAt: /* @__PURE__ */ new Date()
  }).where(eq26(financialProposals.id, proposalId));
}
async function submitCounterProposalRecord(input) {
  const db = await requireDatabase();
  await db.update(financialProposals).set({
    status: "CONTRAPROPOSTA_RECEBIDA",
    counterProposalValue: input.counterProposalValue.toFixed(2),
    counterProposalNotes: input.counterProposalNotes
  }).where(eq26(financialProposals.id, input.proposalId));
}
async function reviewCounterProposalRecord(input) {
  const db = await requireDatabase();
  const status = input.decision === "ACEITAR" ? "ACEITA" : "RECUSADA";
  await db.update(financialProposals).set({
    status,
    approvedBySocioId: String(input.socioUserId),
    acceptedAt: input.decision === "ACEITAR" ? /* @__PURE__ */ new Date() : null,
    clientNotes: input.notes || null
  }).where(eq26(financialProposals.id, input.proposalId));
}

// server/features/proposals/proposal-types.ts
import { z as z24 } from "zod";
var proposalStatusSchema = z24.enum([
  "RASCUNHO",
  "ENVIADA",
  "ACEITA",
  "CONTRAPROPOSTA_RECEBIDA",
  "RECUSADA"
]);
var createProposalSchema = z24.object({
  familyId: z24.string().min(1),
  scopeDescription: z24.string().min(10, "Descri\xE7\xE3o do escopo de trabalho deve ter ao menos 10 caracteres."),
  proposedValue: z24.number().positive("Valor da proposta deve ser maior que zero.")
});
var acceptProposalSchema = z24.object({
  proposalId: z24.string().min(1),
  clientNotes: z24.string().max(1e3).optional()
});
var counterProposalSchema = z24.object({
  proposalId: z24.string().min(1),
  counterProposalValue: z24.number().positive("Valor da contraproposta deve ser maior que zero."),
  counterProposalNotes: z24.string().min(3, "Justificativa da contraproposta \xE9 obrigat\xF3ria.").max(1e3)
});
var reviewCounterProposalSchema = z24.object({
  proposalId: z24.string().min(1),
  decision: z24.enum(["ACEITAR", "RECUSAR"]),
  notes: z24.string().max(1e3).optional()
});

// server/features/proposals/proposal-router.ts
var proposalRouter = router({
  list: protectedProcedure.input(z25.object({ familyId: z25.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listProposalRecords(input.familyId);
  }),
  create: protectedProcedure.input(createProposalSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    await assertFamilyAccess(ctx, input.familyId);
    const proposalId = await createProposalRecord(input);
    await recordAudit({
      action: "PROPOSTA_FINANCEIRA_CRIADA",
      entityType: "PROPOSTA_FINANCEIRA",
      entityId: proposalId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { proposedValue: input.proposedValue }
    });
    return { proposalId };
  }),
  accept: protectedProcedure.input(acceptProposalSchema).mutation(async ({ ctx, input }) => {
    const proposal = await getProposalRecord(input.proposalId);
    if (!proposal) throw new Error("Proposta financeira n\xE3o encontrada.");
    const user = await assertFamilyAccess(ctx, proposal.familyId);
    await acceptProposalRecord(input.proposalId, input.clientNotes);
    await recordAudit({
      action: "PROPOSTA_FINANCEIRA_ACEITA",
      entityType: "PROPOSTA_FINANCEIRA",
      entityId: input.proposalId,
      actorUserId: user.id,
      familyId: proposal.familyId
    });
    return { success: true };
  }),
  counterProposal: protectedProcedure.input(counterProposalSchema).mutation(async ({ ctx, input }) => {
    const proposal = await getProposalRecord(input.proposalId);
    if (!proposal) throw new Error("Proposta financeira n\xE3o encontrada.");
    const user = await assertFamilyAccess(ctx, proposal.familyId);
    await submitCounterProposalRecord(input);
    await recordAudit({
      action: "CONTRAPROPOSTA_ENVIADA",
      entityType: "PROPOSTA_FINANCEIRA",
      entityId: input.proposalId,
      actorUserId: user.id,
      familyId: proposal.familyId,
      metadata: {
        counterProposalValue: input.counterProposalValue,
        notes: input.counterProposalNotes
      }
    });
    return { success: true };
  }),
  reviewCounterProposal: protectedProcedure.input(reviewCounterProposalSchema).mutation(async ({ ctx, input }) => {
    const socio = requireRole(ctx, ["SOCIO"]);
    const proposal = await getProposalRecord(input.proposalId);
    if (!proposal) throw new Error("Proposta financeira n\xE3o encontrada.");
    await reviewCounterProposalRecord({
      proposalId: input.proposalId,
      decision: input.decision,
      socioUserId: socio.id,
      notes: input.notes
    });
    await recordAudit({
      action: input.decision === "ACEITAR" ? "CONTRAPROPOSTA_ACEITA_PELO_SOCIO" : "CONTRAPROPOSTA_RECUSADA_PELO_SOCIO",
      entityType: "PROPOSTA_FINANCEIRA",
      entityId: input.proposalId,
      actorUserId: socio.id,
      familyId: proposal.familyId,
      metadata: { decision: input.decision, notes: input.notes || "" }
    });
    return { success: true };
  })
});

// server/features/leads/lead-router.ts
var leadRouter = router({
  // Pública — usada pela tela de "Tenho interesse" no login, sem autenticação.
  create: publicProcedure.input(leadCreateSchema).mutation(async ({ ctx, input }) => {
    checkRateLimit(`lead:create:${ctx.req.ip ?? "unknown"}`, 10);
    return createLeadRecord(input);
  }),
  list: protectedProcedure.query(async ({ ctx }) => {
    requireRole(ctx, ["SOCIO", "ADMIN"]);
    return listLeadRecords();
  }),
  accept: protectedProcedure.input(leadAcceptSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, ["SOCIO"]);
    const result = await acceptLeadRecord(input, user.id);
    try {
      await recordAudit({ action: "INTERESSADO_ACEITO", entityType: "FAMILIA", entityId: result.familyId, actorUserId: user.id, familyId: result.familyId });
    } catch {
    }
    return result;
  }),
  reject: protectedProcedure.input(leadRejectSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, ["SOCIO"]);
    const result = await rejectLeadRecord(input.leadId, user.id, input.reviewNote);
    try {
      await recordAudit({ action: "INTERESSADO_RECUSADO", entityType: "INTERESSADO", entityId: input.leadId, actorUserId: user.id });
    } catch {
    }
    return result;
  })
});

// server/features/certidoes/certidao-router.ts
import { z as z26 } from "zod";
init_roles();
var certidaoRouter = router({
  list: protectedProcedure.input(z26.object({ familyId: z26.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listCertidaoRecords(input.familyId);
  }),
  generate: protectedProcedure.input(z26.object({ familyId: z26.string() })).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    await assertFamilyAccess(ctx, input.familyId);
    const created = await ensureFamilyCertidoes(input.familyId);
    await recordAudit({
      action: "CERTIDOES_GERADAS",
      entityType: "FAMILIA",
      entityId: input.familyId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { created }
    });
    return { created };
  }),
  updateStatus: protectedProcedure.input(certidaoUpdateSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, ["SOCIO"]);
    const certidao = await getCertidaoRecord(input.certidaoId);
    if (!certidao) throw new Error("Certid\xE3o n\xE3o encontrada.");
    await assertFamilyAccess(ctx, certidao.familyId);
    await updateCertidaoRecord(input);
    await recordAudit({
      action: "CERTIDAO_STATUS_ATUALIZADO",
      entityType: "CERTIDAO",
      entityId: input.certidaoId,
      actorUserId: user.id,
      familyId: certidao.familyId,
      metadata: {
        type: certidao.type,
        status: input.status ?? certidao.status,
        validUntil: input.validUntil ?? certidao.validUntil ?? ""
      }
    });
    return { success: true };
  })
});

// server/routers.ts
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  families: familyRouter,
  people: personRouter,
  firstAccess: firstAccessRouter,
  documents: documentRouter,
  certidoes: certidaoRouter,
  properties: propertyRouter,
  companies: companyRouter,
  assets: assetRouter,
  proposals: proposalRouter,
  leads: leadRouter,
  portal: portalRouter,
  lwr: lwrRouter,
  users: userRouter,
  audit: auditRouter
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await authenticateRequest(opts.req);
  } catch {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/api.ts
var app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.get(["/health", "/api/health"], (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
registerStorageProxy(app);
registerAuthRoutes(app);
var trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext
});
app.use("/trpc", trpcMiddleware);
app.use("/api/trpc", trpcMiddleware);
var api_default = app;
export {
  api_default as default
};
