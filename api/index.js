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
var APP_ROLES;
var init_roles = __esm({
  "shared/domain/roles.ts"() {
    "use strict";
    APP_ROLES = ["SOCIO", "ANALISTA", "ADMIN", "CLIENTE"];
  }
});

// shared/validation/uf.ts
import { z } from "zod";
var UFS, ufSchema;
var init_uf = __esm({
  "shared/validation/uf.ts"() {
    "use strict";
    UFS = [
      "AC",
      "AL",
      "AP",
      "AM",
      "BA",
      "CE",
      "DF",
      "ES",
      "GO",
      "MA",
      "MT",
      "MS",
      "MG",
      "PA",
      "PB",
      "PR",
      "PE",
      "PI",
      "RJ",
      "RN",
      "RS",
      "RO",
      "RR",
      "SC",
      "SP",
      "SE",
      "TO"
    ];
    ufSchema = z.enum(UFS);
  }
});

// drizzle/schema.ts
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
  varchar
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
var ids, auditTime, updatedAtCol, civilStatusValues, maritalRegimeValues, documentStatusValues, assetCategoryValues, proposalStatusValues, leadStatusValues, vinculoValues, entityTypeValues, projectStatusValues, projectObjectiveValues, propertyKindValues, propertyUtilityValues, societaryTypeValues, taxRegimeValues, encumbranceTypeValues, certidaoScopeValues, certidaoTypeValues, certidaoStatusValues, companyJurisdictionValues, roleEnum, civilStatusEnum, maritalRegimeEnum, documentStatusEnum, assetCategoryEnum, leadStatusEnum, vinculoEnum, proposalStatusEnum, projectStatusEnum, projectObjectiveEnum, accessRoleEnum, entityTypeEnum, rightTypeEnum, propertyKindEnum, propertyUtilityEnum, encumbranceTypeEnum, societaryTypeEnum, taxRegimeEnum, ufEnum, certidaoScopeEnum, certidaoTypeEnum, certidaoStatusEnum, companyJurisdictionEnum, users, families, projects, projectObjectives, familyAccess, leads, people, documents, documentVersions, properties, propertyOwners, companies, companyStakeholders, otherAssets, certidoes, companyDetails, financialProposals, portalLinks, firstAccessLinks, lwrReports, auditLogs, fileBlobs, sessionRevocations;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    init_roles();
    init_uf();
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
      "NA",
      "NAO_POSSUI"
    ];
    assetCategoryValues = [
      "ATIVOS_AGRO",
      "CONTA_CORRENTE",
      "CREDITO",
      "DINHEIRO_ESPECIE",
      "INVESTIMENTOS",
      "OUTROS",
      "SEMOVENTES",
      "VEICULO_EMBARCACAO_AERONAVE"
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
    projectStatusValues = [
      "ATIVO",
      "SUSPENSO",
      "CONCLUIDO",
      "CANCELADO"
    ];
    projectObjectiveValues = [
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
      "FILANTROPIA"
    ];
    propertyKindValues = ["URBANO", "RURAL"];
    propertyUtilityValues = [
      "ATIVIDADE_INDUSTRIAL_COMERCIAL",
      "ATIVIDADE_RURAL",
      "INVESTIMENTO",
      "LAZER",
      "LOCACAO_ARRENDAMENTO",
      "OUTRA",
      "PENDENTE",
      "RESIDENCIAL"
    ];
    societaryTypeValues = ["LTDA", "SA", "SCP"];
    taxRegimeValues = [
      "SIMPLES_NACIONAL",
      "LUCRO_PRESUMIDO",
      "LUCRO_REAL"
    ];
    encumbranceTypeValues = [
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
      "USUFRUTO"
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
    projectStatusEnum = pgEnum("projectStatus", projectStatusValues);
    projectObjectiveEnum = pgEnum(
      "projectObjective",
      projectObjectiveValues
    );
    accessRoleEnum = pgEnum("accessRole", ["RESPONSAVEL", "CLIENTE"]);
    entityTypeEnum = pgEnum("entityType", entityTypeValues);
    rightTypeEnum = pgEnum("rightType", [
      "PROPRIEDADE",
      "USUFRUTO",
      "NUA_PROPRIEDADE"
    ]);
    propertyKindEnum = pgEnum("propertyKind", propertyKindValues);
    propertyUtilityEnum = pgEnum(
      "propertyUtility",
      propertyUtilityValues
    );
    encumbranceTypeEnum = pgEnum(
      "propertyEncumbranceType",
      encumbranceTypeValues
    );
    societaryTypeEnum = pgEnum("societaryType", societaryTypeValues);
    taxRegimeEnum = pgEnum("taxRegime", taxRegimeValues);
    ufEnum = pgEnum("uf", UFS);
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
      notes: text("notes"),
      createdBy: varchar("createdBy", { length: 36 }).notNull(),
      createdAt: auditTime,
      updatedAt: updatedAtCol()
    });
    projects = pgTable("projects", {
      ...ids,
      familyId: varchar("familyId", { length: 36 }).notNull().unique(),
      title: varchar("title", { length: 160 }).notNull(),
      status: projectStatusEnum("status").default("ATIVO").notNull(),
      createdAt: auditTime,
      updatedAt: updatedAtCol()
    });
    projectObjectives = pgTable(
      "projectObjectives",
      {
        ...ids,
        projectId: varchar("projectId", { length: 36 }).notNull(),
        objective: projectObjectiveEnum("objective").notNull(),
        createdAt: auditTime
      },
      (table) => [
        uniqueIndex("project_objective_unique").on(
          table.projectId,
          table.objective
        )
      ]
    );
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
        phone: varchar("phone", { length: 20 }),
        cep: varchar("cep", { length: 8 }),
        street: varchar("street", { length: 160 }),
        number: varchar("number", { length: 20 }),
        complement: varchar("complement", { length: 80 }),
        district: varchar("district", { length: 80 }),
        city: varchar("city", { length: 120 }),
        uf: varchar("uf", { length: 2 }),
        addressSameAsPrimary: boolean("addressSameAsPrimary").default(false).notNull(),
        isDependent: boolean("isDependent").default(false).notNull(),
        createdAt: auditTime,
        updatedAt: updatedAtCol()
      },
      (table) => [
        index("people_family_idx").on(table.familyId),
        uniqueIndex("people_primary_unique").on(table.familyId).where(sql`${table.isPrimaryContact} = true`),
        // CPF normalizado por família: um mesmo CPF não pode ser duplicado na família.
        uniqueIndex("people_family_taxid_unique").on(table.familyId, table.taxId),
        // Um único cônjuge por família.
        uniqueIndex("people_conjuge_unique").on(table.familyId).where(sql`${table.vinculo} = 'CONJUGE'`)
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
        issuedAt: date("issuedAt"),
        validUntil: date("validUntil"),
        referenceDate: date("referenceDate"),
        apostilled: boolean("apostilled").default(false).notNull(),
        translated: boolean("translated").default(false).notNull(),
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
        cep: varchar("cep", { length: 8 }),
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
        encumbranceType: encumbranceTypeEnum("encumbranceType").default("PENDENTE").notNull(),
        encumbranceNote: text("encumbranceNote"),
        createdAt: auditTime,
        updatedAt: updatedAtCol()
      },
      (table) => [
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
        )
      ]
    );
    propertyOwners = pgTable(
      "propertyOwners",
      {
        ...ids,
        propertyId: varchar("propertyId", { length: 36 }).notNull(),
        personId: varchar("personId", { length: 36 }),
        companyId: varchar("companyId", { length: 36 }),
        ownershipPercentage: decimal("ownershipPercentage", {
          precision: 5,
          scale: 2
        }).notNull(),
        rightType: rightTypeEnum("rightType").default("PROPRIEDADE").notNull(),
        createdAt: auditTime
      },
      (table) => [
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
        )
      ]
    );
    companies = pgTable(
      "companies",
      {
        ...ids,
        familyId: varchar("familyId", { length: 36 }).notNull(),
        legalName: varchar("legalName", { length: 180 }).notNull(),
        taxNumber: varchar("taxNumber", { length: 20 }),
        isOffshore: boolean("isOffshore").default(false).notNull(),
        createdAt: auditTime,
        updatedAt: updatedAtCol()
      },
      (table) => [
        index("companies_family_idx").on(table.familyId),
        uniqueIndex("companies_family_tax_number_unique").on(
          table.familyId,
          table.taxNumber
        ),
        // CNPJ obrigatório quando a sociedade NÃO é offshore.
        check(
          "companies_tax_number_ck",
          sql`${table.isOffshore} = true OR ${table.taxNumber} IS NOT NULL`
        )
      ]
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
    otherAssets = pgTable(
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
        updatedAt: updatedAtCol()
      },
      (table) => [
        index("other_assets_family_idx").on(table.familyId),
        check(
          "other_assets_declared_value_ck",
          sql`${table.declaredValue} > 0`
        )
      ]
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
        uf: ufEnum("uf"),
        sede: varchar("sede", { length: 160 }),
        cep: varchar("cep", { length: 8 }),
        street: varchar("street", { length: 160 }),
        number: varchar("number", { length: 20 }),
        complement: varchar("complement", { length: 80 }),
        district: varchar("district", { length: 80 }),
        city: varchar("city", { length: 120 }),
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
      (table) => [
        uniqueIndex("fileBlobs_key_key").on(table.key),
        check("fileBlobs_size_bytes_check", sql`${table.sizeBytes} > 0 AND ${table.sizeBytes} <= 5242880`)
      ]
    );
    sessionRevocations = pgTable(
      "sessionRevocations",
      {
        ...ids,
        userId: varchar("userId", { length: 36 }).notNull(),
        jti: varchar("jti", { length: 64 }).notNull(),
        revokedAt: timestamp("revokedAt").defaultNow().notNull(),
        reason: varchar("reason", { length: 120 })
      },
      (table) => [uniqueIndex("session_revocations_jti_key").on(table.jti)]
    );
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  createUser: () => createUser,
  getDb: () => getDb,
  getUserByEmail: () => getUserByEmail,
  getUserById: () => getUserById,
  revokeSession: () => revokeSession,
  revokeSessionByJti: () => revokeSessionByJti,
  revokeUserSessions: () => revokeUserSessions,
  touchLastSignedIn: () => touchLastSignedIn,
  updateUserPassword: () => updateUserPassword
});
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
async function revokeSession(jti, userId, reason = "LOGOUT") {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(sessionRevocations).values({
      id: crypto.randomUUID(),
      userId: String(userId),
      jti,
      reason
    }).onConflictDoNothing();
  } catch {
    logInfo("database.session_revoke_failed");
  }
}
async function revokeSessionByJti(jti) {
  const db = await getDb();
  if (!db) return false;
  try {
    const [row] = await db.select({ id: sessionRevocations.id }).from(sessionRevocations).where(eq(sessionRevocations.jti, jti)).limit(1);
    return Boolean(row);
  } catch {
    return false;
  }
}
async function revokeUserSessions(userId, _keepJti) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.delete(sessionRevocations).where(eq(sessionRevocations.userId, String(userId)));
  } catch {
    logInfo("database.revoke_user_sessions_failed");
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
  onlyDigits: () => onlyDigits2,
  resolveFamilyStorageFolder: () => resolveFamilyStorageFolder
});
import { and as and6, eq as eq8 } from "drizzle-orm";
function onlyDigits2(value) {
  return value.replace(/\D/g, "");
}
async function resolveFamilyStorageFolder(familyId) {
  const db = await requireDatabase();
  const [primary] = await db.select({ taxId: people.taxId }).from(people).where(and6(eq8(people.familyId, familyId), eq8(people.isPrimaryContact, true))).limit(1);
  const digits = primary?.taxId ? onlyDigits2(primary.taxId) : "";
  if (digits) return digits;
  return `familia-${familyId}`;
}
async function findFamilyIdByPrimaryContactCpf(cpf, excludeFamilyId) {
  const digits = onlyDigits2(cpf);
  if (!digits) return null;
  const db = await requireDatabase();
  const rows = await db.select({ familyId: people.familyId, taxId: people.taxId }).from(people).where(eq8(people.isPrimaryContact, true));
  for (const row of rows) {
    if (!row.taxId) continue;
    if (excludeFamilyId && row.familyId === excludeFamilyId) continue;
    if (onlyDigits2(row.taxId) === digits) return row.familyId;
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
var SESSION_TTL_MS = 1e3 * 60 * 60 * 8;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/auth.ts
init_db();
import bcrypt from "bcryptjs";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
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
async function signSession(userId, expiresInMs = SESSION_TTL_MS) {
  const expirationSeconds = Math.floor((Date.now() + expiresInMs) / 1e3);
  const jti = crypto.randomUUID();
  const token = await new SignJWT({ userId, jti }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setJti(jti).setExpirationTime(expirationSeconds).sign(getSessionSecret());
  return { token, jti };
}
async function verifySession(cookieValue) {
  if (!cookieValue) return null;
  try {
    const { payload } = await jwtVerify(cookieValue, getSessionSecret(), { algorithms: ["HS256"] });
    const { userId, jti } = payload;
    if (typeof userId !== "number" || typeof jti !== "string") return null;
    const revoked = await revokeSessionByJti(jti);
    if (revoked) return null;
    return { userId, jti };
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
  const user = await getUserByEmail(normalizeEmail(email));
  if (!user) throw new Error("E-mail ou senha inv\xE1lidos.");
  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) throw new Error("E-mail ou senha inv\xE1lidos.");
  await touchLastSignedIn(user.id);
  return user;
}
function registerAuthRoutes(app2) {
  const loginHandler = async (req, res) => {
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
      const { token, jti } = await signSession(user.id);
      await revokeOtherSessions(user.id, jti);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: SESSION_TTL_MS });
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
  };
  app2.post("/api/auth/login", loginHandler);
  app2.post("/auth/login", loginHandler);
  const registerHandler = async (req, res) => {
    const { name, email, password } = req.body ?? {};
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ error: "Nome, e-mail e senha s\xE3o obrigat\xF3rios." });
      return;
    }
    try {
      checkRateLimit(`register:ip:${req.ip ?? "unknown"}`, 10);
      const user = await registerUser({ name, email, password });
      const { token, jti } = await signSession(user.id);
      await revokeOtherSessions(user.id, jti);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: SESSION_TTL_MS });
      res.json({ success: true });
    } catch (error) {
      if (error instanceof RateLimitError) {
        res.status(429).json({ error: error.message });
        return;
      }
      res.status(400).json({ error: error instanceof Error ? error.message : "Falha no cadastro." });
    }
  };
  app2.post("/api/auth/register", registerHandler);
  app2.post("/auth/register", registerHandler);
}
async function authenticateRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionToken = cookies.get(COOKIE_NAME);
  const session = await verifySession(sessionToken);
  if (!session) throw ForbiddenError("Sess\xE3o inv\xE1lida ou ausente");
  const user = await getUserById(session.userId);
  if (!user) throw ForbiddenError("Usu\xE1rio n\xE3o encontrado");
  return { user, jti: session.jti };
}
async function revokeOtherSessions(userId, currentJti) {
  const { revokeUserSessions: revokeUserSessions2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  await revokeUserSessions2(userId, currentJti);
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

// shared/validation/storage-limits.ts
var MAX_STORAGE_BYTES = 5 * 1024 * 1024;
function assertStorageSize(bytes) {
  if (!bytes.length || bytes.length > MAX_STORAGE_BYTES) {
    throw new Error("Arquivo inv\xE1lido ou maior que 5 MB.");
  }
}

// server/storage.ts
function getStoragePath(relKey) {
  const root = ENV.storageRoot || path.resolve(process.cwd(), "storage");
  return path.resolve(root, relKey);
}
var cachedDb = null;
var fileBlobsTableEnsured = false;
async function ensureFileBlobsTable(db) {
  if (fileBlobsTableEnsured) return;
  try {
    await db.execute(sql2`
      CREATE TABLE IF NOT EXISTS "fileBlobs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "key" varchar(600) NOT NULL UNIQUE,
        "fileName" varchar(300) NOT NULL,
        "mimeType" varchar(150) NOT NULL,
        "sizeBytes" integer NOT NULL,
        "sha256" varchar(64) NOT NULL,
        "content" text NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "fileBlobs_key_key" ON "fileBlobs" USING btree ("key");
    `);
    fileBlobsTableEnsured = true;
  } catch (err) {
    console.warn("[storage] ensureFileBlobsTable error:", err);
  }
}
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
  assertStorageSize(buffer);
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
  await ensureFileBlobsTable(db);
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
import { and as and2, desc, eq as eq3 } from "drizzle-orm";

// server/features/_shared/ids.ts
import { nanoid } from "nanoid";
function createId() {
  return nanoid();
}

// server/features/documents/document-repository.ts
async function findOrCreateDocumentRecord(input) {
  const db = await requireDatabase();
  const existing = await db.select({ id: documents.id }).from(documents).where(
    and2(
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
    referenceDate: input.referenceDate || null,
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
import { and as and3, desc as desc2, eq as eq5, sql as sql3 } from "drizzle-orm";

// server/features/documents/person-document-categories.ts
var UNION_DOC_BY_STATUS = {
  CASADO: "Certid\xE3o de casamento",
  UNIAO_ESTAVEL: "Escritura ou declara\xE7\xE3o de uni\xE3o est\xE1vel",
  DIVORCIADO: "Certid\xE3o de casamento com averba\xE7\xE3o",
  VIUVO: "Certid\xE3o de casamento com averba\xE7\xE3o"
};
var UNION_DOC_CATEGORIES = [
  "Certid\xE3o de casamento",
  "Escritura ou declara\xE7\xE3o de uni\xE3o est\xE1vel",
  "Certid\xE3o de casamento com averba\xE7\xE3o"
];
var COUPLE_SHARED_CATEGORIES = [
  ...UNION_DOC_CATEGORIES,
  "Comprovante de endere\xE7o"
];
function isCoupleSharedCategory(category) {
  return COUPLE_SHARED_CATEGORIES.includes(category);
}
function unionDocForCivilStatus(civilStatus) {
  if (!civilStatus) return null;
  return UNION_DOC_BY_STATUS[civilStatus] ?? null;
}
function computePersonCategories(person) {
  const unionDoc = unionDocForCivilStatus(person.civilStatus);
  const categories = ["IRPF", "CPF/RG ou CNH"];
  if (unionDoc) categories.push(unionDoc);
  categories.push("Comprovante de endere\xE7o", "Passaporte");
  if (person.vinculo === "CONJUGE") {
    return categories.filter((category) => !isCoupleSharedCategory(category));
  }
  return categories;
}

// server/features/certidoes/certidao-repository.ts
init_schema();
init_database();
import { asc, eq as eq4, inArray } from "drizzle-orm";

// server/features/certidoes/certidao-types.ts
init_schema();
import { z as z3 } from "zod";

// shared/validation/digitos.ts
function onlyDigits(value) {
  return value.replace(/\D/g, "");
}

// shared/validation/cpf.ts
function normalizarCpf(value) {
  return onlyDigits(value);
}
function isCpfValido(value) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i += 1) soma += Number(cpf[i]) * (10 - i);
  let resto = soma * 10 % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(cpf[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i += 1) soma += Number(cpf[i]) * (11 - i);
  resto = soma * 10 % 11;
  if (resto === 10) resto = 0;
  return resto === Number(cpf[10]);
}

// shared/validation/cnpj.ts
var PESOS_DV1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
var PESOS_DV2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
function digitoVerificador(base, pesos) {
  const soma = base.split("").reduce((acc, digito, i) => acc + Number(digito) * (pesos[i] ?? 0), 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}
function isCnpjValido(value) {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  const base = cnpj.slice(0, 12);
  const dv1 = digitoVerificador(base, PESOS_DV1);
  if (dv1 !== Number(cnpj[12])) return false;
  const dv2 = digitoVerificador(`${base}${dv1}`, PESOS_DV2);
  return dv2 === Number(cnpj[13]);
}

// shared/validation/index.ts
init_uf();

// shared/validation/telefone.ts
var DDDS_VALIDOS = [
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  21,
  22,
  24,
  27,
  28,
  31,
  32,
  33,
  34,
  35,
  37,
  38,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  51,
  53,
  54,
  55,
  61,
  62,
  63,
  64,
  65,
  66,
  67,
  68,
  69,
  71,
  73,
  74,
  75,
  77,
  79,
  81,
  82,
  83,
  84,
  85,
  86,
  87,
  88,
  89,
  91,
  92,
  93,
  94,
  95,
  96,
  97,
  98,
  99
];
function normalizarTelefone(value) {
  return onlyDigits(value);
}
function isTelefoneValido(value) {
  let tel = onlyDigits(value);
  if (tel.length === 12 && tel.startsWith("55")) tel = tel.slice(2);
  if (tel.length === 13 && tel.startsWith("55")) tel = tel.slice(2);
  if (tel.length !== 10 && tel.length !== 11) return false;
  if (!DDDS_VALIDOS.includes(Number(tel.slice(0, 2)))) {
    return false;
  }
  if (tel.length === 11 && tel[2] !== "9") return false;
  return true;
}

// shared/validation/datas.ts
var FUSO_PADRAO = "America/Sao_Paulo";
var IDADE_MAXIMA_ANOS = 120;
var RE_DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;
function isDataIsoValida(value) {
  if (!RE_DATA_ISO.test(value)) return false;
  const [ano, mes, dia] = value.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia;
}
function hoje() {
  return (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: FUSO_PADRAO });
}
function idadeEmAnosCompletos(nascimento, ref = hoje()) {
  if (!isDataIsoValida(nascimento) || !isDataIsoValida(ref)) return NaN;
  const [anoNasc, mesNasc, diaNasc] = nascimento.split("-").map(Number);
  const [anoRef, mesRef, diaRef] = ref.split("-").map(Number);
  let anos = anoRef - anoNasc;
  if (mesRef < mesNasc || mesRef === mesNasc && diaRef < diaNasc) anos -= 1;
  return anos;
}
function isNascimentoValido(value, ref = hoje()) {
  if (!isDataIsoValida(value)) return false;
  if (value > ref) return false;
  const anos = idadeEmAnosCompletos(value, ref);
  return anos >= 0 && anos <= IDADE_MAXIMA_ANOS;
}

// shared/validation/datas-schema.ts
import { z as z2 } from "zod";
function isoDateSchema(message = "Data inv\xE1lida (use AAAA-MM-DD).") {
  return z2.string().refine((value) => isDataIsoValida(value), { message });
}

// server/features/certidoes/certidao-types.ts
var certidaoTypeSchema = z3.enum(certidaoTypeValues);
var certidaoStatusSchema = z3.enum(certidaoStatusValues);
var certidaoScopeSchema = z3.enum(certidaoScopeValues);
var certidaoUpdateSchema = z3.object({
  certidaoId: z3.string().min(1),
  status: certidaoStatusSchema.optional(),
  validUntil: isoDateSchema("Data de validade inv\xE1lida (use AAAA-MM-DD).").optional()
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
    db.select({ id: companies.id, isOffshore: companies.isOffshore }).from(companies).where(eq4(companies.familyId, familyId))
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
    if (company.isOffshore) continue;
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
import { z as z5 } from "zod";

// server/features/families/family-types.ts
init_schema();
import { z as z4 } from "zod";
var civilStatusSchema = z4.enum([
  "SOLTEIRO",
  "DIVORCIADO",
  "VIUVO",
  "CASADO",
  "UNIAO_ESTAVEL"
]);
var maritalRegimeSchema = z4.enum(["CPB", "CUB", "STB", "STOB", "NA"]);
var projectObjectiveSchema = z4.enum(projectObjectiveValues);
var familyInputSchema = z4.object({
  name: z4.string().trim().min(3, "O nome do projeto precisa de ao menos 3 caracteres.").max(160),
  notes: z4.string().max(2e3).optional(),
  objectives: z4.array(projectObjectiveSchema).min(1, "Selecione ao menos um objetivo para o projeto.")
});

// server/features/leads/lead-types.ts
var ALLOWED_LEAD_MIME_TYPES = /* @__PURE__ */ new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp"
]);
var leadCreateSchema = z5.object({
  familyId: z5.string().optional(),
  fullName: z5.string().min(3, "Informe o nome completo (m\xEDnimo 3 caracteres).").max(160),
  taxId: z5.string().transform((value) => normalizarCpf(value)).refine((value) => isCpfValido(value), "CPF inv\xE1lido."),
  email: z5.string().email("E-mail inv\xE1lido."),
  birthDate: isoDateSchema("Data de nascimento inv\xE1lida (use AAAA-MM-DD)."),
  fileName: z5.string().min(1, "Informe o nome do arquivo.").max(255),
  mimeType: z5.string().min(1, "Informe o tipo do arquivo."),
  base64Data: z5.string().min(1, "Conte\xFAdo do arquivo ausente.")
});
var leadAcceptSchema = z5.object({
  leadId: z5.string().min(1),
  familyName: z5.string().min(3).max(160),
  civilStatus: civilStatusSchema,
  maritalRegime: maritalRegimeSchema
});
var leadRejectSchema = z5.object({
  leadId: z5.string().min(1),
  reviewNote: z5.string().max(1e3).optional()
});

// server/features/leads/lead-repository.ts
var leadsTableEnsured = false;
async function ensureLeadsTable(db) {
  if (leadsTableEnsured) return;
  try {
    await db.execute(sql3`
      DO $$ BEGIN
        CREATE TYPE "leadStatus" AS ENUM('PENDENTE', 'ACEITO', 'RECUSADO');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      CREATE TABLE IF NOT EXISTS "leads" (
        "id" varchar(36) PRIMARY KEY NOT NULL,
        "fullName" varchar(160) NOT NULL,
        "taxId" varchar(20) NOT NULL,
        "email" varchar(320) NOT NULL,
        "birthDate" date NOT NULL,
        "fileName" varchar(255) NOT NULL,
        "mimeType" varchar(100) NOT NULL,
        "storageKey" varchar(500) NOT NULL,
        "status" "leadStatus" DEFAULT 'PENDENTE' NOT NULL,
        "reviewedBy" integer,
        "reviewNote" text,
        "familyId" varchar(36),
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      );
    `);
    leadsTableEnsured = true;
  } catch (err) {
    console.warn("[leads] ensureLeadsTable error:", err);
  }
}
async function createLeadRecord(input) {
  if (!ALLOWED_LEAD_MIME_TYPES.has(input.mimeType))
    throw new Error(
      "Tipo de arquivo n\xE3o permitido. Envie uma imagem (JPEG/PNG/WEBP) ou PDF."
    );
  const bytes = Buffer.from(input.base64Data, "base64");
  assertStorageSize(bytes);
  const db = await requireDatabase();
  await ensureLeadsTable(db);
  const id = createId();
  const relativeKey = `leads/${id}/${input.fileName}`;
  const stored = await storagePut(relativeKey, bytes, input.mimeType);
  const storageKey = stored.key.split("\\").join("/");
  await db.insert(leads).values({
    id,
    fullName: input.fullName,
    taxId: input.taxId,
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
  if (!isCpfValido(lead.taxId))
    throw new Error(
      "CPF do interessado \xE9 inv\xE1lido. Recuse este lead e solicite um novo envio."
    );
  const db = await requireDatabase();
  const result = await db.transaction(async (tx) => {
    const familyId = createId();
    const projectId = createId();
    await tx.insert(families).values({
      id: familyId,
      name: input.familyName,
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
      computePersonCategories({
        vinculo: "TITULAR",
        civilStatus: input.civilStatus
      }).map((category) => ({
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
    const accepted = await tx.update(leads).set({ status: "ACEITO", familyId, reviewedBy }).where(and3(eq5(leads.id, input.leadId), eq5(leads.status, "PENDENTE"))).returning({ id: leads.id });
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
  const rejected = await db.update(leads).set({ status: "RECUSADO", reviewedBy, reviewNote: reviewNote || null }).where(and3(eq5(leads.id, leadId), eq5(leads.status, "PENDENTE"))).returning({ id: leads.id });
  if (rejected.length === 0)
    throw new Error("Este interessado j\xE1 foi analisado.");
  return { success: true, leadId, fullName: lead.fullName };
}

// server/features/access/family-access.ts
init_schema();
init_database();
import { and as and4, eq as eq6 } from "drizzle-orm";
import { TRPCError as TRPCError2 } from "@trpc/server";

// server/features/access/authorization.ts
import { TRPCError } from "@trpc/server";

// shared/domain/permissions.ts
var Permission = {
  // Pessoas
  PEOPLE_CREATE: "people.create",
  PEOPLE_UPDATE: "people.update",
  PEOPLE_REMOVE: "people.remove",
  PEOPLE_ATTACH_DOCUMENTS: "people.attachDocuments",
  PEOPLE_SET_PRIMARY_CONTACT: "people.setPrimaryContact",
  // Propriedades
  PROPERTY_CREATE: "property.create",
  PROPERTY_UPDATE: "property.update",
  PROPERTY_REMOVE: "property.remove",
  PROPERTY_ADD_OWNER: "property.addOwner",
  PROPERTY_UPDATE_OWNER: "property.updateOwner",
  PROPERTY_REMOVE_OWNER: "property.removeOwner",
  // Documentos
  DOCUMENT_CREATE: "document.create",
  DOCUMENT_GENERATE_REQUIREMENTS: "document.generateRequirements",
  DOCUMENT_UPLOAD_VERSION: "document.uploadVersion",
  DOCUMENT_UPLOAD_BALANCE: "document.uploadBalance",
  DOCUMENT_REVIEW: "document.review",
  DOCUMENT_DISPENSE: "document.dispense",
  // Sociedades
  COMPANY_CREATE: "company.create",
  COMPANY_REMOVE: "company.remove",
  COMPANY_ADD_STAKEHOLDER: "company.addStakeholder",
  COMPANY_UPDATE_STAKEHOLDER: "company.updateStakeholder",
  COMPANY_REMOVE_STAKEHOLDER: "company.removeStakeholder",
  COMPANY_UPSERT_DETAILS: "company.upsertDetails",
  // Ativos
  ASSET_CREATE: "asset.create",
  ASSET_UPDATE: "asset.update",
  ASSET_REMOVE: "asset.remove",
  // Certidões
  CERTIDAO_GENERATE: "certidao.generate",
  CERTIDAO_UPDATE_STATUS: "certidao.updateStatus",
  // Propostas
  PROPOSAL_CREATE: "proposal.create",
  PROPOSAL_REVIEW_COUNTER: "proposal.reviewCounter",
  // Portal
  PORTAL_CREATE_LINK: "portal.createLink",
  PORTAL_LIST_LINKS: "portal.listLinks",
  PORTAL_REVOKE_LINK: "portal.revokeLink",
  // Famílias
  FAMILY_CREATE: "family.create",
  FAMILY_UPDATE_STATUS: "family.updateStatus",
  FAMILY_GRANT_CLIENT_ACCESS: "family.grantClientAccess",
  FAMILY_GENERATE_FIRST_ACCESS_LINK: "family.generateFirstAccessLink",
  FAMILY_GENERATE_PASSWORD_RESET_LINK: "family.generatePasswordResetLink",
  FAMILY_GET_DASHBOARD: "family.getDashboard",
  FAMILY_LIST_STORAGE: "family.listStorage",
  // Auditoria
  AUDIT_LIST_BY_FAMILY: "audit.listByFamily",
  // Interessados
  LEAD_LIST: "lead.list",
  LEAD_ACCEPT: "lead.accept",
  LEAD_REJECT: "lead.reject",
  // Usuários
  USER_LIST: "user.list",
  USER_CHANGE_ROLE: "user.changeRole",
  // LWR
  LWR_CREATE: "lwr.create"
};
var PERMISSION_MATRIX = {
  SOCIO: [
    // Todas as permissões
    ...Object.values(Permission)
  ],
  ANALISTA: [
    // Pessoas
    Permission.PEOPLE_CREATE,
    Permission.PEOPLE_UPDATE,
    Permission.PEOPLE_REMOVE,
    Permission.PEOPLE_ATTACH_DOCUMENTS,
    Permission.PEOPLE_SET_PRIMARY_CONTACT,
    // Propriedades
    Permission.PROPERTY_CREATE,
    Permission.PROPERTY_UPDATE,
    Permission.PROPERTY_REMOVE,
    Permission.PROPERTY_ADD_OWNER,
    Permission.PROPERTY_UPDATE_OWNER,
    Permission.PROPERTY_REMOVE_OWNER,
    // Documentos
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_GENERATE_REQUIREMENTS,
    Permission.DOCUMENT_UPLOAD_VERSION,
    Permission.DOCUMENT_UPLOAD_BALANCE,
    // Sociedades
    Permission.COMPANY_CREATE,
    Permission.COMPANY_REMOVE,
    Permission.COMPANY_ADD_STAKEHOLDER,
    Permission.COMPANY_UPDATE_STAKEHOLDER,
    Permission.COMPANY_REMOVE_STAKEHOLDER,
    Permission.COMPANY_UPSERT_DETAILS,
    // Ativos
    Permission.ASSET_CREATE,
    Permission.ASSET_UPDATE,
    Permission.ASSET_REMOVE,
    // Certidões
    Permission.CERTIDAO_GENERATE,
    // Propostas
    Permission.PROPOSAL_CREATE,
    // LWR
    Permission.LWR_CREATE
  ],
  ADMIN: [
    // Famílias
    Permission.FAMILY_GET_DASHBOARD,
    Permission.FAMILY_LIST_STORAGE,
    // Auditoria
    Permission.AUDIT_LIST_BY_FAMILY,
    // Interessados
    Permission.LEAD_LIST,
    // Pessoas
    Permission.PEOPLE_CREATE,
    Permission.PEOPLE_UPDATE,
    Permission.PEOPLE_REMOVE,
    Permission.PEOPLE_ATTACH_DOCUMENTS,
    Permission.PEOPLE_SET_PRIMARY_CONTACT,
    // Propriedades
    Permission.PROPERTY_CREATE,
    Permission.PROPERTY_UPDATE,
    Permission.PROPERTY_REMOVE,
    Permission.PROPERTY_ADD_OWNER,
    Permission.PROPERTY_UPDATE_OWNER,
    Permission.PROPERTY_REMOVE_OWNER,
    // Documentos
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_GENERATE_REQUIREMENTS,
    Permission.DOCUMENT_UPLOAD_VERSION,
    Permission.DOCUMENT_UPLOAD_BALANCE,
    // Sociedades
    Permission.COMPANY_CREATE,
    Permission.COMPANY_REMOVE,
    Permission.COMPANY_ADD_STAKEHOLDER,
    Permission.COMPANY_UPDATE_STAKEHOLDER,
    Permission.COMPANY_REMOVE_STAKEHOLDER,
    Permission.COMPANY_UPSERT_DETAILS,
    // Ativos
    Permission.ASSET_CREATE,
    Permission.ASSET_UPDATE,
    Permission.ASSET_REMOVE,
    // Certidões
    Permission.CERTIDAO_GENERATE,
    // Propostas
    Permission.PROPOSAL_CREATE,
    // LWR
    Permission.LWR_CREATE
  ],
  CLIENTE: []
};
function hasPermission(role, permission) {
  return PERMISSION_MATRIX[role].includes(permission);
}

// server/features/access/authorization.ts
function requireUser(ctx) {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Autentica\xE7\xE3o necess\xE1ria." });
  }
  return ctx.user;
}
function requirePermission(ctx, permission) {
  const user = requireUser(ctx);
  if (!hasPermission(user.role, permission)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Permiss\xE3o insuficiente." });
  }
  return user;
}

// server/features/access/family-access.ts
async function userHasFamilyAccess(user, familyId) {
  if (user.role !== "CLIENTE") return true;
  const db = await requireDatabase();
  const records = await db.select({ id: familyAccess.id }).from(familyAccess).where(and4(eq6(familyAccess.familyId, familyId), eq6(familyAccess.userId, user.id))).limit(1);
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
    let user = null;
    try {
      const session = await authenticateRequest(req);
      user = session.user;
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
import { z as z6 } from "zod";

// server/_core/notification.ts
async function notifyOwner({ title, content }) {
  console.log("[notifyOwner]", title, content);
  return true;
}

// server/_core/trpc.ts
init_logger();
import { initTRPC, TRPCError as TRPCError3 } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
function formatTrpcError(opts) {
  const { shape, error } = opts;
  if (error.cause instanceof ZodError) {
    const issues = error.cause.issues;
    return {
      ...shape,
      message: issues[0]?.message ?? "Dados inv\xE1lidos.",
      data: {
        ...shape.data,
        fields: Object.fromEntries(
          issues.map((issue) => [issue.path.join("."), issue.message])
        )
      }
    };
  }
  if (error.code === "INTERNAL_SERVER_ERROR") {
    logError("trpc.internal_error", {
      path: shape.data?.path,
      message: error.message
    });
    return { ...shape, message: "Erro interno. Tente novamente em instantes." };
  }
  return shape;
}
var t = initTRPC.context().create({
  transformer: superjson,
  errorFormatter: formatTrpcError
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
    z6.object({
      timestamp: z6.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z6.object({
      title: z6.string().min(1, "title is required"),
      content: z6.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
init_db();

// server/features/companies/company-router.ts
import { z as z11 } from "zod";

// server/features/audit/audit-repository.ts
init_schema();
init_database();
init_logger();
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
async function recordAuditSafe(input) {
  try {
    await recordAudit(input);
  } catch (error) {
    logError("audit.record_failed", {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// server/features/documents/document-requirements.ts
init_schema();
init_database();
import { and as and5, eq as eq7, inArray as inArray2 } from "drizzle-orm";
function computePropertyCategories(property) {
  const registrationDoc = property.hasRegistration === false ? "Escritura ou contrato de compra e venda" : "Matr\xEDcula atualizada";
  if (property.kind === "RURAL") {
    return ["ITR", registrationDoc, "CAR", "CCIR"];
  }
  if (property.kind === "URBANO") {
    return ["IPTU", registrationDoc];
  }
  return property.hasRegistration === false ? ["Escritura ou contrato de compra e venda", "IPTU ou ITR"] : ["Matr\xEDcula atualizada", "IPTU ou ITR"];
}
var COMPANY_BALANCE_CATEGORIES = [
  "Balan\xE7o Fechado",
  "Balancete Atualizado"
];
var COMPANY_LTD_CATEGORIES = [
  "Comprovante de Inscri\xE7\xE3o no CNPJ",
  "Contrato Social Consolidado",
  ...COMPANY_BALANCE_CATEGORIES,
  "Acordo de S\xF3cios",
  "Livro Raz\xE3o do Imobilizado"
];
var COMPANY_SA_EXTRA_CATEGORIES = [
  "Livro de Registro de A\xE7\xF5es Nominativas",
  "Livro de Transfer\xEAncia de A\xE7\xF5es"
];
var COMPANY_OFFSHORE_CATEGORIES = [
  "Certificate of Incorporation",
  "Memorandum & Articles of Association",
  "Register of Members",
  "Register of Directors",
  "Share Certificate(s)",
  "Certificate of Good Standing",
  "Balance Sheet",
  "Confer\xEAncia de IRPF/Declara\xE7\xE3o ao Banco Central",
  "Cl\xE1usulas sucess\xF3rias",
  "Testamento local da jurisdi\xE7\xE3o"
];
function computeCompanyCategories(company) {
  if (company.isOffshore) return [...COMPANY_OFFSHORE_CATEGORIES];
  if (company.societaryType === "SA") {
    return [...COMPANY_LTD_CATEGORIES, ...COMPANY_SA_EXTRA_CATEGORIES];
  }
  return [...COMPANY_LTD_CATEGORIES];
}
function computeAssetCategories() {
  return ["Comprova\xE7\xE3o de titularidade"];
}
async function reconcileEntityDocuments(input) {
  if (!input.categories.length) return { created: 0, removed: 0 };
  const db = await requireDatabase();
  const existing = await db.select({
    id: documents.id,
    category: documents.category,
    status: documents.status,
    currentVersion: documents.currentVersion
  }).from(documents).where(
    and5(
      eq7(documents.familyId, input.familyId),
      eq7(documents.entityType, input.entityType),
      eq7(documents.entityId, input.entityId)
    )
  );
  const required = Array.from(new Set(input.categories));
  const known = new Set(existing.map((row) => row.category));
  const missing = required.filter((category) => !known.has(category));
  let created = 0;
  if (missing.length) {
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
    created = missing.length;
  }
  const requiredSet = new Set(required);
  const staleIds = existing.filter(
    (row) => !requiredSet.has(row.category) && row.status === "PENDENTE" && row.currentVersion === 0
  ).map((row) => row.id);
  let removed = 0;
  if (staleIds.length) {
    await db.delete(documents).where(inArray2(documents.id, staleIds));
    removed = staleIds.length;
  }
  return { created, removed };
}
async function reconcileFamilyDocumentRequirements(familyId) {
  const db = await requireDatabase();
  const [peopleRows, propertyRows, companyRows, assetRows] = await Promise.all([
    db.select({
      id: people.id,
      vinculo: people.vinculo,
      civilStatus: people.civilStatus
    }).from(people).where(eq7(people.familyId, familyId)),
    db.select({
      id: properties.id,
      kind: properties.kind,
      hasRegistration: properties.hasRegistration
    }).from(properties).where(eq7(properties.familyId, familyId)),
    db.select({ id: companies.id, isOffshore: companies.isOffshore }).from(companies).where(eq7(companies.familyId, familyId)),
    db.select({ id: otherAssets.id }).from(otherAssets).where(eq7(otherAssets.familyId, familyId))
  ]);
  const detailRows = companyRows.length ? await db.select({
    companyId: companyDetails.companyId,
    societaryType: companyDetails.societaryType
  }).from(companyDetails).where(inArray2(companyDetails.companyId, companyRows.map((row) => row.id))) : [];
  const societaryByCompany = new Map(
    detailRows.map((row) => [row.companyId, row.societaryType])
  );
  let created = 0;
  let removed = 0;
  const reconcile = async (input) => {
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
        civilStatus: person.civilStatus
      })
    });
  }
  for (const property of propertyRows) {
    await reconcile({
      entityType: "IMOVEL",
      entityId: property.id,
      categories: computePropertyCategories(property)
    });
  }
  for (const company of companyRows) {
    await reconcile({
      entityType: "SOCIEDADE",
      entityId: company.id,
      categories: computeCompanyCategories({
        isOffshore: company.isOffshore,
        societaryType: societaryByCompany.get(company.id) ?? null
      })
    });
  }
  for (const asset of assetRows) {
    await reconcile({
      entityType: "ATIVO",
      entityId: asset.id,
      categories: computeAssetCategories()
    });
  }
  return { created, removed };
}

// server/features/people/person-repository.ts
init_schema();
import { and as and9, eq as eq12, ne as ne2 } from "drizzle-orm";

// server/features/families/family-repository.ts
init_schema();
import { desc as desc3, eq as eq9, count, inArray as inArray3, and as and7 } from "drizzle-orm";
init_database();
async function createFamilyRecord(input, createdBy) {
  const db = await requireDatabase();
  const familyId = createId();
  const projectId = createId();
  await db.transaction(async (tx) => {
    await tx.insert(families).values({
      id: familyId,
      name: input.name,
      notes: input.notes,
      createdBy: String(createdBy)
    });
    await tx.insert(projects).values({ id: projectId, familyId, title: input.name });
    await tx.insert(projectObjectives).values(
      input.objectives.map((objective) => ({ id: createId(), projectId, objective }))
    );
  });
  return { familyId, projectId };
}
async function listFamilyRecords() {
  const db = await requireDatabase();
  const records = await db.select().from(families).orderBy(desc3(families.updatedAt));
  if (!records.length) return [];
  const familyIds = records.map((r) => r.id);
  const accessRows = await db.select({ familyId: familyAccess.familyId }).from(familyAccess).where(and7(inArray3(familyAccess.familyId, familyIds), eq9(familyAccess.accessRole, "CLIENTE")));
  const familyIdsWithAccess = new Set(accessRows.map((r) => r.familyId));
  const projectRows = await db.select({ familyId: projects.familyId, status: projects.status }).from(projects).where(inArray3(projects.familyId, familyIds));
  const statusByFamily = new Map(projectRows.map((r) => [r.familyId, r.status]));
  const titularRows = await db.select({
    familyId: people.familyId,
    fullName: people.fullName,
    email: people.email,
    phone: people.phone
  }).from(people).where(and7(inArray3(people.familyId, familyIds), eq9(people.isPrimaryContact, true)));
  const titularByFamily = new Map(titularRows.map((r) => [r.familyId, r]));
  return records.map((record) => {
    const titular = titularByFamily.get(record.id);
    return {
      ...record,
      hasClientAccess: familyIdsWithAccess.has(record.id),
      status: statusByFamily.get(record.id) ?? "ATIVO",
      titularName: titular?.fullName ?? null,
      titularEmail: titular?.email ?? null,
      titularPhone: titular?.phone ?? null
    };
  });
}
async function getFamilyRecord(familyId) {
  const db = await requireDatabase();
  const result = await db.select().from(families).where(eq9(families.id, familyId)).limit(1);
  const family = result[0] ?? null;
  if (!family) return null;
  const projectRows = await db.select().from(projects).where(eq9(projects.familyId, familyId)).limit(1);
  const project = projectRows[0] ?? null;
  const objectiveRows = project ? await db.select().from(projectObjectives).where(eq9(projectObjectives.projectId, project.id)) : [];
  return {
    ...family,
    status: project?.status ?? "ATIVO",
    objectives: objectiveRows.map((row) => row.objective)
  };
}
async function setProjectStatusRecord(familyId, status) {
  const db = await requireDatabase();
  const updated = await db.update(projects).set({ status }).where(eq9(projects.familyId, familyId)).returning({ id: projects.id });
  if (!updated.length) throw new Error("Projeto n\xE3o encontrado.");
  return { familyId, status };
}
async function getClientFamilyIds(userId) {
  const db = await requireDatabase();
  const access = await db.select({ familyId: familyAccess.familyId }).from(familyAccess).where(eq9(familyAccess.userId, userId));
  return access.map((a) => a.familyId);
}
async function getDashboardData(allowedFamilyIds) {
  const db = await requireDatabase();
  const scoped = allowedFamilyIds !== void 0;
  if (scoped && allowedFamilyIds.length === 0) {
    return { totalFamilies: 0, totalPeople: 0, totalDocuments: 0, families: [] };
  }
  const allFamilies = scoped ? await db.select().from(families).where(inArray3(families.id, allowedFamilyIds)).orderBy(desc3(families.updatedAt)) : await db.select().from(families).orderBy(desc3(families.updatedAt));
  const families2 = [];
  let totalPeople = 0;
  let totalDocuments = 0;
  for (const f of allFamilies) {
    const [{ count: peopleCount }] = await db.select({ count: count() }).from(people).where(eq9(people.familyId, f.id));
    const [{ count: documentsCount }] = await db.select({ count: count() }).from(documents).where(eq9(documents.familyId, f.id));
    families2.push({ id: f.id, name: f.name, updatedAt: f.updatedAt, peopleCount: Number(peopleCount), documentsCount: Number(documentsCount) });
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
import { eq as eq10, inArray as inArray4 } from "drizzle-orm";
async function migrateFamilyStorageFolder(familyId, oldFolder, newFolder) {
  if (oldFolder === newFolder) return { migratedFiles: 0 };
  const db = await requireDatabase();
  const familyDocs = await db.select({ id: documents.id }).from(documents).where(eq10(documents.familyId, familyId));
  const docIds = familyDocs.map((d) => d.id);
  if (docIds.length === 0) return { migratedFiles: 0 };
  const versions = await db.select({ id: documentVersions.id, storageKey: documentVersions.storageKey }).from(documentVersions).where(inArray4(documentVersions.documentId, docIds));
  const prefix = `${oldFolder}/`;
  const toMigrate = versions.filter((v) => v.storageKey.startsWith(prefix));
  if (toMigrate.length === 0) return { migratedFiles: 0 };
  await moveFolder(oldFolder, newFolder);
  let migratedCount = 0;
  try {
    for (const version of toMigrate) {
      const newKey = `${newFolder}/${version.storageKey.slice(prefix.length)}`;
      await db.update(documentVersions).set({ storageKey: newKey }).where(eq10(documentVersions.id, version.id));
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

// server/features/documents/dependent-irpf.ts
init_schema();
init_database();
import { and as and8, eq as eq11, inArray as inArray5, ne } from "drizzle-orm";
async function findPrimaryContactId(familyId) {
  const db = await requireDatabase();
  const [titular] = await db.select({ id: people.id }).from(people).where(
    and8(eq11(people.familyId, familyId), eq11(people.isPrimaryContact, true))
  ).limit(1);
  return titular?.id ?? null;
}
async function getIrpfStatus(familyId, personId) {
  const db = await requireDatabase();
  const [irpf] = await db.select({ status: documents.status }).from(documents).where(
    and8(
      eq11(documents.familyId, familyId),
      eq11(documents.entityType, "PESSOA"),
      eq11(documents.entityId, personId),
      eq11(documents.category, "IRPF")
    )
  ).limit(1);
  return irpf?.status ?? null;
}
async function syncDependentIrpfStatus(familyId) {
  const titularId = await findPrimaryContactId(familyId);
  if (!titularId) return 0;
  const titularStatus = await getIrpfStatus(familyId, titularId);
  if (!titularStatus) return 0;
  const db = await requireDatabase();
  const dependents = await db.select({ id: people.id }).from(people).where(
    and8(
      eq11(people.familyId, familyId),
      eq11(people.isDependent, true),
      ne(people.id, titularId)
    )
  );
  if (!dependents.length) return 0;
  const updated = await db.update(documents).set({ status: titularStatus }).where(
    and8(
      eq11(documents.familyId, familyId),
      eq11(documents.entityType, "PESSOA"),
      inArray5(documents.entityId, dependents.map((row) => row.id)),
      eq11(documents.category, "IRPF")
    )
  ).returning({ id: documents.id });
  return updated.length;
}
async function assertIrpfUploadAllowed(document) {
  if (document.entityType !== "PESSOA" || document.category !== "IRPF") return;
  const db = await requireDatabase();
  const [person] = await db.select({ isDependent: people.isDependent, vinculo: people.vinculo }).from(people).where(eq11(people.id, document.entityId)).limit(1);
  if (person?.isDependent && person.vinculo !== "TITULAR") {
    throw new Error(
      "O IRPF do dependente herda o IRPF do titular \u2014 upload bloqueado."
    );
  }
}

// server/features/people/person-types.ts
import { z as z7 } from "zod";
var vinculoSchema = z7.enum([
  "TITULAR",
  "CONJUGE",
  "FILHO",
  "NETO",
  "BISNETO"
]);
var marriedStatuses = /* @__PURE__ */ new Set(["CASADO", "UNIAO_ESTAVEL"]);
function collectPersonIssues(data) {
  const issues = [];
  if ((data.vinculo === "NETO" || data.vinculo === "BISNETO") && !data.parentPersonId) {
    issues.push({
      path: ["parentPersonId"],
      message: data.vinculo === "NETO" ? "Neto(a) precisa de um filho(a) como pai/m\xE3e." : "Bisneto(a) precisa de um neto(a) como pai/m\xE3e."
    });
  }
  if (!data.taxId || !isCpfValido(data.taxId)) {
    issues.push({ path: ["taxId"], message: "CPF inv\xE1lido." });
  }
  if (!data.birthDate || !isNascimentoValido(data.birthDate)) {
    issues.push({
      path: ["birthDate"],
      message: "Data de nascimento inv\xE1lida."
    });
  }
  if (data.phone && !isTelefoneValido(data.phone)) {
    issues.push({
      path: ["phone"],
      message: "Telefone inv\xE1lido. Use DDD + n\xFAmero."
    });
  }
  if (data.vinculo === "TITULAR") {
    if (!data.email?.trim()) {
      issues.push({
        path: ["email"],
        message: "E-mail obrigat\xF3rio para o titular."
      });
    }
    if (!data.phone || !isTelefoneValido(data.phone)) {
      issues.push({
        path: ["phone"],
        message: "Telefone obrigat\xF3rio para o titular (DDD + n\xFAmero)."
      });
    }
    if (data.isDependent) {
      issues.push({
        path: ["isDependent"],
        message: "O titular n\xE3o pode ser marcado como dependente."
      });
    }
  }
  if (!data.addressSameAsPrimary && (!data.city?.trim() || !data.uf)) {
    issues.push({
      path: ["city"],
      message: "Informe a cidade e a UF do endere\xE7o."
    });
  }
  const menor = Boolean(data.birthDate) && isNascimentoValido(data.birthDate) && idadeEmAnosCompletos(data.birthDate) < 18;
  if (menor) {
    if (data.civilStatus && data.civilStatus !== "SOLTEIRO") {
      issues.push({
        path: ["civilStatus"],
        message: "Menores de 18 anos s\xE3o sempre solteiros."
      });
    }
    if (data.maritalRegime && data.maritalRegime !== "NA") {
      issues.push({
        path: ["maritalRegime"],
        message: "Menores de 18 anos n\xE3o t\xEAm regime de bens."
      });
    }
    if (data.spouseName?.trim()) {
      issues.push({
        path: ["spouseName"],
        message: "Menores de 18 anos n\xE3o t\xEAm c\xF4njuge."
      });
    }
  } else if (data.vinculo !== "CONJUGE") {
    if (!data.civilStatus) {
      issues.push({ path: ["civilStatus"], message: "Informe o estado civil." });
      return issues;
    }
    if (marriedStatuses.has(data.civilStatus)) {
      if (!data.maritalRegime) {
        issues.push({
          path: ["maritalRegime"],
          message: "Informe o regime de bens."
        });
      }
      if (!data.spouseName?.trim()) {
        issues.push({
          path: ["spouseName"],
          message: "Informe o nome do c\xF4njuge."
        });
      }
    }
  }
  return issues;
}
var personBaseSchema = z7.object({
  familyId: z7.string().min(1),
  fullName: z7.string().trim().min(3).max(160),
  email: z7.string().email("E-mail inv\xE1lido.").optional().or(z7.literal("")),
  taxId: z7.string().transform((value) => normalizarCpf(value)).refine((value) => isCpfValido(value), "CPF inv\xE1lido."),
  birthDate: z7.string().min(1, "Informe a data de nascimento."),
  phone: z7.string().optional().or(z7.literal("")).transform((value) => value ? normalizarTelefone(value) : ""),
  vinculo: vinculoSchema,
  parentPersonId: z7.string().min(1).optional(),
  spouseName: z7.string().max(160).optional(),
  civilStatus: civilStatusSchema.optional(),
  maritalRegime: maritalRegimeSchema.optional(),
  exSpouseNote: z7.string().max(1e3).optional(),
  isPrimaryContact: z7.boolean().optional(),
  isDependent: z7.boolean().optional(),
  addressSameAsPrimary: z7.boolean().optional(),
  cep: z7.string().max(8).optional().or(z7.literal("")),
  street: z7.string().max(160).optional().or(z7.literal("")),
  number: z7.string().max(20).optional().or(z7.literal("")),
  complement: z7.string().max(80).optional().or(z7.literal("")),
  district: z7.string().max(80).optional().or(z7.literal("")),
  city: z7.string().max(120).optional().or(z7.literal("")),
  uf: ufSchema.optional()
});
var personInputSchema = personBaseSchema.superRefine((data, ctx) => {
  for (const issue of collectPersonIssues(data)) {
    ctx.addIssue({
      code: "custom",
      path: issue.path,
      message: issue.message
    });
  }
});
var personUpdateSchema = personBaseSchema.omit({ vinculo: true, parentPersonId: true, isPrimaryContact: true }).extend({ personId: z7.string().min(1) });
var setPrimaryContactSchema = z7.object({
  familyId: z7.string().min(1),
  personId: z7.string().min(1)
});
var removePersonSchema = z7.object({
  familyId: z7.string().min(1),
  personId: z7.string().min(1)
});
var personAttachmentSchema = z7.object({
  category: z7.string().min(2).max(80),
  fileName: z7.string().min(1).max(255),
  mimeType: z7.string().min(1).max(120),
  base64Data: z7.string().min(8).max(8e6)
});
var attachDocumentsSchema = z7.object({
  familyId: z7.string().min(1),
  personId: z7.string().min(1),
  attachments: z7.array(personAttachmentSchema).min(1).max(8)
});
function isMarriedStatus(status) {
  return Boolean(status && marriedStatuses.has(status));
}

// server/features/people/normalize-name.ts
function normalizePersonName(value) {
  if (!value) return "";
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
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
    `Este CPF j\xE1 consta como titular de outro projeto (\xAB${familyLabel}\xBB). Um CPF s\xF3 pode ser titular de um projeto. Corrija o CPF ou ajuste o cadastro no outro projeto.`
  );
}
async function assertParentMatches(familyId, parentPersonId, expectedVinculo) {
  const db = await requireDatabase();
  const [parent] = await db.select({
    id: people.id,
    vinculo: people.vinculo,
    fullName: people.fullName
  }).from(people).where(and9(eq12(people.id, parentPersonId), eq12(people.familyId, familyId))).limit(1);
  if (!parent) throw new Error("Pai/m\xE3e n\xE3o encontrado nesta fam\xEDlia.");
  if (parent.vinculo !== expectedVinculo) {
    throw new Error(
      expectedVinculo === "FILHO" ? "O pai/m\xE3e de um neto(a) deve ter v\xEDnculo Filho(a)." : "O pai/m\xE3e de um bisneto(a) deve ter v\xEDnculo Neto(a)."
    );
  }
  return parent;
}
function isMinor(birthDate) {
  return Boolean(
    birthDate && isNascimentoValido(birthDate) && idadeEmAnosCompletos(birthDate) < 18
  );
}
function resolveCivilFields(input) {
  let civilStatus = input.civilStatus ?? void 0;
  let maritalRegime = input.maritalRegime ?? void 0;
  if (isMinor(input.birthDate)) {
    civilStatus = "SOLTEIRO";
    maritalRegime = "NA";
  } else if (input.vinculo === "CONJUGE") {
    civilStatus = civilStatus ?? "CASADO";
    maritalRegime = maritalRegime ?? "CPB";
  } else if (civilStatus && !isMarriedStatus(civilStatus)) {
    maritalRegime = "NA";
  }
  return {
    civilStatus,
    maritalRegime
  };
}
async function assertCpfNotDuplicatedInFamily(familyId, taxId, excludePersonId) {
  const db = await requireDatabase();
  const query = excludePersonId ? and9(
    eq12(people.familyId, familyId),
    eq12(people.taxId, taxId),
    ne2(people.id, excludePersonId)
  ) : and9(eq12(people.familyId, familyId), eq12(people.taxId, taxId));
  const [duplicate] = await db.select({ id: people.id, fullName: people.fullName }).from(people).where(query).limit(1);
  if (duplicate) {
    throw new Error(
      `Este CPF j\xE1 est\xE1 cadastrado neste projeto (${duplicate.fullName}).`
    );
  }
}
async function assertConjugeNotDuplicated(familyId) {
  const db = await requireDatabase();
  const [existing] = await db.select({ id: people.id }).from(people).where(and9(eq12(people.familyId, familyId), eq12(people.vinculo, "CONJUGE"))).limit(1);
  if (existing) {
    throw new Error(
      "Este projeto j\xE1 possui um c\xF4njuge. Edite o registro existente."
    );
  }
}
async function assertTitularExistsForDependent(familyId) {
  const db = await requireDatabase();
  const [titular] = await db.select({ id: people.id }).from(people).where(
    and9(eq12(people.familyId, familyId), eq12(people.isPrimaryContact, true))
  ).limit(1);
  if (!titular) {
    throw new Error(
      "Esta fam\xEDlia ainda n\xE3o tem titular marcado. Defina o titular antes de marcar um dependente."
    );
  }
}
async function assertBirthAfterParent(familyId, parentPersonId, birthDate) {
  const db = await requireDatabase();
  const [parent] = await db.select({ birthDate: people.birthDate, fullName: people.fullName }).from(people).where(
    and9(eq12(people.id, parentPersonId), eq12(people.familyId, familyId))
  ).limit(1);
  if (parent?.birthDate && birthDate < parent.birthDate) {
    throw new Error(
      `Data de nascimento anterior \xE0 do pai/m\xE3e (${parent.fullName}). Confira as datas.`
    );
  }
}
async function addPersonRecord(input) {
  const db = await requireDatabase();
  const id = createId();
  const issues = collectPersonIssues(input);
  if (issues.length) throw new Error(issues[0].message);
  if (input.vinculo === "NETO" && input.parentPersonId) {
    await assertParentMatches(input.familyId, input.parentPersonId, "FILHO");
  }
  if (input.vinculo === "BISNETO" && input.parentPersonId) {
    await assertParentMatches(input.familyId, input.parentPersonId, "NETO");
  }
  if (input.parentPersonId && input.birthDate) {
    await assertBirthAfterParent(
      input.familyId,
      input.parentPersonId,
      input.birthDate
    );
  }
  await assertCpfNotDuplicatedInFamily(input.familyId, input.taxId);
  let inheritedCivilStatus = input.civilStatus;
  let inheritedMaritalRegime = input.maritalRegime;
  if (input.vinculo === "CONJUGE") {
    await assertConjugeNotDuplicated(input.familyId);
    const titular = await getPrimaryContact(input.familyId);
    if (titular?.spouseName) {
      if (normalizePersonName(input.fullName) !== normalizePersonName(titular.spouseName)) {
        throw new Error(
          `O c\xF4njuge cadastrado deve ter o mesmo nome informado no cadastro do titular (\xAB${titular.spouseName}\xBB).`
        );
      }
    }
    if (titular) {
      inheritedCivilStatus = inheritedCivilStatus ?? titular.civilStatus;
      inheritedMaritalRegime = inheritedMaritalRegime ?? titular.maritalRegime;
      if (!titular.spouseName && input.fullName) {
        await db.update(people).set({ spouseName: input.fullName.trim() }).where(eq12(people.id, titular.id));
      }
    }
  }
  const { civilStatus, maritalRegime } = resolveCivilFields({
    ...input,
    civilStatus: inheritedCivilStatus,
    maritalRegime: inheritedMaritalRegime
  });
  if (input.isDependent && input.vinculo !== "TITULAR") {
    await assertTitularExistsForDependent(input.familyId);
  }
  await db.transaction(async (tx) => {
    const [existingPrimary] = await tx.select({ id: people.id }).from(people).where(
      and9(eq12(people.familyId, input.familyId), eq12(people.isPrimaryContact, true))
    ).limit(1);
    const autoPrimary = input.vinculo === "TITULAR" && !existingPrimary;
    const isPrimary = Boolean(input.isPrimaryContact) || autoPrimary;
    if (isPrimary && input.taxId) {
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
      isPrimaryContact: isPrimary,
      isDependent: input.isDependent ?? false,
      phone: input.phone || null,
      addressSameAsPrimary: input.addressSameAsPrimary ?? false,
      cep: input.addressSameAsPrimary ? null : input.cep || null,
      street: input.addressSameAsPrimary ? null : input.street || null,
      number: input.addressSameAsPrimary ? null : input.number || null,
      complement: input.addressSameAsPrimary ? null : input.complement || null,
      district: input.addressSameAsPrimary ? null : input.district || null,
      city: input.addressSameAsPrimary ? null : input.city || null,
      uf: input.addressSameAsPrimary ? null : input.uf || null
    });
    await tx.insert(documents).values(
      computePersonCategories({
        vinculo: input.vinculo,
        civilStatus
      }).map((category) => ({
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
  if (input.isDependent && input.vinculo !== "TITULAR") {
    await syncDependentIrpfStatus(input.familyId);
  }
  return id;
}
async function updatePersonRecord(input) {
  const db = await requireDatabase();
  const [person] = await db.select().from(people).where(
    and9(eq12(people.id, input.personId), eq12(people.familyId, input.familyId))
  ).limit(1);
  if (!person) throw new Error("Pessoa n\xE3o encontrada nesta fam\xEDlia.");
  const issues = collectPersonIssues({ ...input, vinculo: person.vinculo ?? "" });
  if (issues.length) throw new Error(issues[0].message);
  if (person.parentPersonId && input.birthDate) {
    await assertBirthAfterParent(
      input.familyId,
      person.parentPersonId,
      input.birthDate
    );
  }
  if (input.taxId && input.taxId !== person.taxId) {
    await assertCpfNotDuplicatedInFamily(
      input.familyId,
      input.taxId,
      input.personId
    );
  }
  const { civilStatus, maritalRegime } = resolveCivilFields({
    vinculo: person.vinculo ?? "",
    civilStatus: input.civilStatus ?? person.civilStatus,
    maritalRegime: input.maritalRegime ?? person.maritalRegime,
    birthDate: input.birthDate
  });
  if (person.vinculo === "CONJUGE" && input.fullName) {
    const titular = await getPrimaryContact(input.familyId);
    if (titular?.spouseName) {
      if (normalizePersonName(input.fullName) !== normalizePersonName(titular.spouseName)) {
        throw new Error(
          `O c\xF4njuge cadastrado deve ter o mesmo nome informado no cadastro do titular (\xAB${titular.spouseName}\xBB).`
        );
      }
    }
  }
  const isDependent = input.isDependent ?? person.isDependent ?? false;
  if (isDependent && person.vinculo !== "TITULAR") {
    await assertTitularExistsForDependent(input.familyId);
  }
  const taxChanged = Boolean(input.taxId) && input.taxId !== person.taxId;
  const needsMigration = taxChanged && person.isPrimaryContact && Boolean(input.taxId);
  let oldFolder = "";
  let migratedFiles = 0;
  await db.transaction(async (tx) => {
    if (needsMigration && input.taxId) {
      await assertCpfNotUsedByAnotherFamily(input.taxId, input.familyId);
      oldFolder = await resolveFamilyStorageFolder(input.familyId);
    }
    await tx.update(people).set({
      fullName: input.fullName,
      email: input.email || null,
      taxId: input.taxId || null,
      birthDate: input.birthDate || null,
      civilStatus,
      maritalRegime,
      exSpouseNote: input.exSpouseNote || null,
      spouseName: input.spouseName?.trim() || null,
      isDependent,
      phone: input.phone || null,
      addressSameAsPrimary: input.addressSameAsPrimary ?? false,
      cep: input.addressSameAsPrimary ? null : input.cep || null,
      street: input.addressSameAsPrimary ? null : input.street || null,
      number: input.addressSameAsPrimary ? null : input.number || null,
      complement: input.addressSameAsPrimary ? null : input.complement || null,
      district: input.addressSameAsPrimary ? null : input.district || null,
      city: input.addressSameAsPrimary ? null : input.city || null,
      uf: input.addressSameAsPrimary ? null : input.uf || null
    }).where(eq12(people.id, input.personId));
  });
  if (needsMigration) {
    const newFolder = await resolveFamilyStorageFolder(input.familyId);
    migratedFiles = (await migrateFamilyStorageFolder(
      input.familyId,
      oldFolder,
      newFolder
    )).migratedFiles;
  }
  if (isDependent && person.vinculo !== "TITULAR") {
    await syncDependentIrpfStatus(input.familyId);
  }
  return { personId: input.personId, migratedFiles };
}
async function removePersonRecord(familyId, personId) {
  const db = await requireDatabase();
  const [person] = await db.select().from(people).where(and9(eq12(people.id, personId), eq12(people.familyId, familyId))).limit(1);
  if (!person) throw new Error("Pessoa n\xE3o encontrada nesta fam\xEDlia.");
  if (person.isPrimaryContact) {
    throw new Error(
      "N\xE3o \xE9 poss\xEDvel excluir o titular do projeto. Defina outro titular antes."
    );
  }
  const [child] = await db.select({ id: people.id }).from(people).where(eq12(people.parentPersonId, personId)).limit(1);
  if (child) {
    throw new Error(
      "N\xE3o \xE9 poss\xEDvel excluir: existem filhos/netos dependentes desta pessoa na \xE1rvore."
    );
  }
  const [owner] = await db.select({ id: propertyOwners.id }).from(propertyOwners).where(eq12(propertyOwners.personId, personId)).limit(1);
  if (owner) {
    throw new Error(
      "N\xE3o \xE9 poss\xEDvel excluir: a pessoa \xE9 titular de im\xF3vel."
    );
  }
  const [stakeholder] = await db.select({ id: companyStakeholders.id }).from(companyStakeholders).where(eq12(companyStakeholders.personId, personId)).limit(1);
  if (stakeholder) {
    throw new Error(
      "N\xE3o \xE9 poss\xEDvel excluir: a pessoa tem participa\xE7\xE3o em sociedade."
    );
  }
  const [asset] = await db.select({ id: otherAssets.id }).from(otherAssets).where(eq12(otherAssets.ownerPersonId, personId)).limit(1);
  if (asset) {
    throw new Error(
      "N\xE3o \xE9 poss\xEDvel excluir: a pessoa \xE9 respons\xE1vel por ativos."
    );
  }
  const documentsToArchive = await db.select({ id: documents.id }).from(documents).where(
    and9(eq12(documents.familyId, familyId), eq12(documents.entityId, personId))
  );
  if (documentsToArchive.length) {
    await db.update(documents).set({ status: "DISPENSADO" }).where(
      and9(eq12(documents.familyId, familyId), eq12(documents.entityId, personId))
    );
  }
  await db.delete(people).where(eq12(people.id, personId));
  return { archivedDocuments: documentsToArchive.length };
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
    and9(eq12(people.familyId, familyId), eq12(people.isPrimaryContact, true))
  ).limit(1);
  return result[0] ?? null;
}
async function setPrimaryContact(input) {
  const db = await requireDatabase();
  let oldFolder = "";
  await db.transaction(async (tx) => {
    const [candidate] = await tx.select({ id: people.id, taxId: people.taxId, familyId: people.familyId }).from(people).where(
      and9(eq12(people.id, input.personId), eq12(people.familyId, input.familyId))
    ).limit(1);
    if (!candidate) throw new Error("Pessoa n\xE3o encontrada nesta fam\xEDlia.");
    if (candidate.taxId) {
      await assertCpfNotUsedByAnotherFamily(candidate.taxId, input.familyId);
    }
    oldFolder = await resolveFamilyStorageFolder(input.familyId);
    await tx.update(people).set({ isPrimaryContact: false }).where(eq12(people.familyId, input.familyId));
    await tx.update(people).set({ isPrimaryContact: true }).where(
      and9(eq12(people.familyId, input.familyId), eq12(people.id, input.personId))
    );
  });
  const newFolder = await resolveFamilyStorageFolder(input.familyId);
  return migrateFamilyStorageFolder(input.familyId, oldFolder, newFolder);
}

// server/features/companies/company-repository.ts
init_schema();
init_database();
import { and as and10, eq as eq13 } from "drizzle-orm";

// server/_shared/advisory-lock.ts
import { sql as sql4 } from "drizzle-orm";
var AdvisoryLockKey = {
  FIRST_ACCESS: 1e3,
  // first-access-router: setPassword
  DOCUMENT_UPLOAD: 2e3,
  // document-upload: storeDocumentVersion
  LWR_CREATE: 3e3,
  // lwr-router: create
  STAKEHOLDER_PERCENT: 4e3
  // company-repository: stakeholder soma ≤100%
};
async function withAdvisoryLock(dbOrPromise, lockName, discriminator, fn) {
  const db = dbOrPromise instanceof Promise ? await dbOrPromise : dbOrPromise;
  const key = AdvisoryLockKey[lockName];
  const disc = typeof discriminator === "string" ? hashString(discriminator) : discriminator;
  if (typeof db.transaction !== "function") {
    return fn(db);
  }
  return db.transaction(async (tx) => {
    const lockResult = await tx.execute(sql4`
      SELECT pg_try_advisory_xact_lock(${key}, ${disc}) as acquired
    `);
    const acquired = lockResult?.[0]?.acquired ?? false;
    if (!acquired) {
      throw new Error("Opera\xE7\xE3o concorrente em andamento. Tente novamente.");
    }
    return fn(tx);
  });
}
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// server/features/companies/company-repository.ts
var PCT_EPSILON = 1e-3;
function totalPercentage(rows) {
  return rows.reduce((sum, row) => sum + Number(row.percentage ?? 0), 0);
}
function normalizeName(name) {
  const withoutAccents = (name ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "");
  return withoutAccents.trim().toLocaleLowerCase("pt-BR").replace(/\s+/g, " ");
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
  return db.select({
    id: companies.id,
    familyId: companies.familyId,
    legalName: companies.legalName,
    taxNumber: companies.taxNumber,
    isOffshore: companies.isOffshore,
    createdAt: companies.createdAt,
    updatedAt: companies.updatedAt,
    taxRegime: companyDetails.taxRegime,
    capitalSocial: companyDetails.capitalSocial
  }).from(companies).leftJoin(companyDetails, eq13(companyDetails.companyId, companies.id)).where(eq13(companies.familyId, familyId));
}
async function listStakeholderRecords(companyId) {
  const db = await requireDatabase();
  return db.select().from(companyStakeholders).where(eq13(companyStakeholders.companyId, companyId));
}
async function createStakeholderRecord(input) {
  return withAdvisoryLock(
    requireDatabase(),
    "STAKEHOLDER_PERCENT",
    input.companyId,
    async (tx) => {
      const id = createId();
      const externalName = input.externalName?.trim() || null;
      const existing = await tx.select().from(companyStakeholders).where(eq13(companyStakeholders.companyId, input.companyId));
      if (input.personId && existing.some((row) => row.personId === input.personId)) {
        throw new Error("Este membro j\xE1 participa da sociedade.");
      }
      if (externalName && existing.some((row) => normalizeName(row.externalName) === normalizeName(externalName))) {
        throw new Error("Este n\xE3o-membro j\xE1 participa da sociedade.");
      }
      const total = totalPercentage(existing) + input.percentage;
      if (total > 100 + PCT_EPSILON) {
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
      return id;
    }
  );
}
async function updateStakeholderRecord(input) {
  return withAdvisoryLock(
    requireDatabase(),
    "STAKEHOLDER_PERCENT",
    input.companyId,
    async (tx) => {
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
      if (total > 100 + PCT_EPSILON) {
        throw new Error(
          `A soma das participa\xE7\xF5es n\xE3o pode passar de 100% (atual ${totalPercentage(remaining)}%).`
        );
      }
      await tx.update(companyStakeholders).set({ personId, externalName, percentage: percentage.toFixed(2) }).where(eq13(companyStakeholders.id, input.stakeholderId));
    }
  );
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
async function removeCompanyRecord(familyId, companyId) {
  const db = await requireDatabase();
  const [company] = await db.select().from(companies).where(and10(eq13(companies.id, companyId), eq13(companies.familyId, familyId))).limit(1);
  if (!company) throw new Error("Sociedade n\xE3o encontrada nesta fam\xEDlia.");
  const [owner] = await db.select({ id: propertyOwners.id }).from(propertyOwners).where(eq13(propertyOwners.companyId, companyId)).limit(1);
  if (owner) {
    throw new Error(
      "N\xE3o \xE9 poss\xEDvel excluir: a sociedade \xE9 titular de im\xF3vel. Remova a titularidade antes."
    );
  }
  const documentsToArchive = await db.select({ id: documents.id }).from(documents).where(
    and10(
      eq13(documents.familyId, familyId),
      eq13(documents.entityType, "SOCIEDADE"),
      eq13(documents.entityId, companyId)
    )
  );
  if (documentsToArchive.length) {
    await db.update(documents).set({ status: "DISPENSADO" }).where(
      and10(
        eq13(documents.familyId, familyId),
        eq13(documents.entityType, "SOCIEDADE"),
        eq13(documents.entityId, companyId)
      )
    );
  }
  await db.delete(certidoes).where(
    and10(
      eq13(certidoes.familyId, familyId),
      eq13(certidoes.scope, "SOCIEDADE"),
      eq13(certidoes.subjectId, companyId)
    )
  );
  await db.delete(companyStakeholders).where(eq13(companyStakeholders.companyId, companyId));
  await db.delete(companyDetails).where(eq13(companyDetails.companyId, companyId));
  await db.delete(companies).where(eq13(companies.id, companyId));
  return { archivedDocuments: documentsToArchive.length };
}

// server/features/companies/company-types.ts
import { z as z8 } from "zod";
var companyInputSchema = z8.object({
  familyId: z8.string().min(1),
  legalName: z8.string().min(3).max(180),
  taxNumber: z8.string().max(20).optional(),
  isOffshore: z8.boolean().default(false)
}).superRefine((data, ctx) => {
  const taxNumber = data.taxNumber?.trim() || null;
  if (data.isOffshore) {
    if (taxNumber) {
      ctx.addIssue({
        code: z8.ZodIssueCode.custom,
        path: ["taxNumber"],
        message: "Sociedade offshore n\xE3o possui CNPJ."
      });
    }
    return;
  }
  if (!taxNumber) {
    ctx.addIssue({
      code: z8.ZodIssueCode.custom,
      path: ["taxNumber"],
      message: "Informe o CNPJ da sociedade nacional."
    });
    return;
  }
  if (!isCnpjValido(taxNumber)) {
    ctx.addIssue({
      code: z8.ZodIssueCode.custom,
      path: ["taxNumber"],
      message: "CNPJ inv\xE1lido."
    });
  }
});
var removeCompanySchema = z8.object({
  familyId: z8.string().min(1),
  companyId: z8.string().min(1)
});

// server/features/companies/company-details.ts
init_schema();
init_uf();
import { z as z9 } from "zod";
var text2 = (max) => z9.string().max(max, `M\xE1ximo de ${max} caracteres.`).transform((value) => value.trim() || null).nullish();
var money = z9.number().finite().nullish();
var companyDetailsFieldsSchema = z9.object({
  nire: text2(20),
  uf: z9.enum(UFS).nullish(),
  sede: text2(160),
  cep: z9.string().max(8).transform((v) => v.replace(/\D/g, "") || null).nullish(),
  street: text2(160),
  number: text2(20),
  complement: text2(80),
  district: text2(80),
  city: text2(120),
  societaryType: z9.enum(societaryTypeValues).nullish(),
  taxRegime: z9.enum(taxRegimeValues).nullish(),
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
  jurisdiction: z9.enum(companyJurisdictionValues).nullish(),
  residentAgent: text2(120),
  notes: text2(8e3)
}).superRefine((data, ctx) => {
  if (data.societaryType === "SA" && data.taxRegime === "SIMPLES_NACIONAL") {
    ctx.addIssue({
      code: z9.ZodIssueCode.custom,
      path: ["taxRegime"],
      message: "S.A. n\xE3o pode optar pelo Simples Nacional (LC 123/2006, art. 3\xBA, \xA74\xBA)."
    });
  }
});
var companyDetailsIdSchema = z9.object({
  companyId: z9.string().min(1, "Informe a sociedade.")
});
var companyDetailsUpsertSchema = companyDetailsIdSchema.extend({
  fields: companyDetailsFieldsSchema
});

// server/features/companies/company-details-repository.ts
init_schema();
init_database();
import { eq as eq14 } from "drizzle-orm";
function detailValues(fields) {
  const text3 = (value) => value ?? null;
  const amount = (value) => value === void 0 || value === null ? null : value.toFixed(2);
  return {
    nire: text3(fields.nire),
    uf: fields.uf ?? null,
    sede: text3(fields.sede),
    cep: text3(fields.cep),
    street: text3(fields.street),
    number: text3(fields.number),
    complement: text3(fields.complement),
    district: text3(fields.district),
    city: text3(fields.city),
    societaryType: fields.societaryType ?? null,
    taxRegime: fields.taxRegime ?? null,
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
import { z as z10 } from "zod";
var stakeholderInputSchema = z10.object({
  companyId: z10.string().min(1),
  // Sócio membro da família (people) OU não-membro informado em externalName.
  personId: z10.string().min(1).optional(),
  externalName: z10.string().min(2).max(160).optional(),
  percentage: z10.number().min(0).max(100)
}).refine((data) => Boolean(data.personId || data.externalName?.trim()), {
  message: "Informe um membro da fam\xEDlia ou o nome do n\xE3o-membro.",
  path: ["personId"]
});
var stakeholderUpdateSchema = z10.object({
  companyId: z10.string().min(1),
  stakeholderId: z10.string().min(1),
  personId: z10.string().min(1).optional(),
  externalName: z10.string().min(2).max(160).optional(),
  percentage: z10.number().min(0).max(100).optional()
}).refine(
  (data) => data.percentage !== void 0 || data.personId !== void 0 || data.externalName !== void 0,
  { message: "Nada para atualizar.", path: ["percentage"] }
);
var stakeholderDeleteSchema = z10.object({
  companyId: z10.string().min(1),
  stakeholderId: z10.string().min(1)
});

// server/features/companies/brasilapi-client.ts
var BRASIL_API_TIMEOUT_MS = 6e3;
var BRASIL_API_BASE_URL = "https://brasilapi.com.br/api/cnpj/v1";
var HTTP_USER_AGENT = "LWOS-App/1.0 (Family Office Platform; contato@lucathi.com.br)";
async function fetchCompanyByCnpj(rawCnpj) {
  const digits = rawCnpj.replace(/\D/g, "");
  if (digits.length !== 14) {
    return null;
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BRASIL_API_TIMEOUT_MS);
  try {
    const response = await fetch(`${BRASIL_API_BASE_URL}/${digits}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": HTTP_USER_AGENT
      },
      signal: controller.signal
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data && data.cnpj ? data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// server/features/companies/brasilapi-mapper.ts
init_uf();
function resolveSocietaryType(code, desc12) {
  const text3 = (desc12 ?? "").toUpperCase();
  if (code === 2062 || text3.includes("LIMITADA") || text3.includes("LTDA")) return "LTDA";
  if (code === 2046 || code === 2054 || text3.includes("ANONIMA") || text3.includes("AN\xD4NIMA")) return "SA";
  if (text3.includes("CONTA DE PARTICIP") || text3.includes("SCP")) return "SCP";
  return null;
}
function formatSede(data) {
  const parts = [
    data.descricao_tipo_de_logradouro ? `${data.descricao_tipo_de_logradouro} ${data.logradouro ?? ""}`.trim() : data.logradouro,
    data.numero ? `n\xBA ${data.numero}` : null,
    data.complemento,
    data.bairro,
    data.municipio && data.uf ? `${data.municipio}/${data.uf}` : data.municipio,
    data.cep ? `CEP ${data.cep}` : null
  ].filter(Boolean);
  return parts.length ? parts.join(", ").slice(0, 160) : null;
}
function isAdminRole(qual) {
  const q = (qual ?? "").toUpperCase();
  return q.includes("ADMINISTRA") || q.includes("DIRETOR") || q.includes("PRESIDENTE");
}
function extractAdministrators(qsa) {
  if (!qsa?.length) return [null, null];
  const admins = qsa.filter((item) => Boolean(item.nome_socio?.trim()) && isAdminRole(item.qualificacao_socio)).map((item) => item.nome_socio.trim().slice(0, 120));
  const fallback = qsa.filter((item) => Boolean(item.nome_socio?.trim())).map((item) => item.nome_socio.trim().slice(0, 120));
  const pool = admins.length ? admins : fallback;
  return [pool[0] ?? null, pool[1] ?? null];
}
function mapBrasilApiToCompanyData(data) {
  const societaryType = resolveSocietaryType(
    data.codigo_natureza_juridica,
    data.natureza_juridica
  );
  const isSimples = data.opcao_pelo_simples === true && societaryType !== "SA";
  const taxRegime = isSimples ? "SIMPLES_NACIONAL" : null;
  const uf = data.uf && UFS.includes(data.uf) ? data.uf : null;
  const [administrator1, administrator2] = extractAdministrators(data.qsa);
  const stakeholders = (data.qsa ?? []).map((item) => item.nome_socio?.trim()).filter((name) => Boolean(name)).map((name) => ({ name: name.slice(0, 160), percentage: 0 }));
  return {
    legalName: data.razao_social?.trim() ? data.razao_social.trim().slice(0, 180) : null,
    uf,
    sede: formatSede(data),
    cep: data.cep ? String(data.cep).replace(/\D/g, "").slice(0, 8) || null : null,
    street: data.logradouro ? [data.descricao_tipo_de_logradouro, data.logradouro].filter(Boolean).join(" ").trim().slice(0, 160) : null,
    number: data.numero ? String(data.numero).trim().slice(0, 20) : null,
    complement: data.complemento ? data.complemento.trim().slice(0, 80) : null,
    district: data.bairro ? data.bairro.trim().slice(0, 80) : null,
    city: data.municipio ? data.municipio.trim().slice(0, 120) : null,
    societaryType,
    taxRegime,
    corporatePurpose: data.cnae_fiscal_descricao?.trim() ? data.cnae_fiscal_descricao.trim().slice(0, 4e3) : null,
    capitalSocial: typeof data.capital_social === "number" ? data.capital_social : null,
    administrator1,
    administrator2,
    stakeholders
  };
}

// server/features/companies/company-router.ts
async function requireCompanyFamily(companyId) {
  const company = await getCompanyRecord(companyId);
  if (!company) throw new Error("Sociedade n\xE3o encontrada.");
  return company;
}
var companyRouter = router({
  lookupCnpj: protectedProcedure.input(z11.object({ cnpj: z11.string().min(14) })).query(async ({ input }) => {
    const apiData = await fetchCompanyByCnpj(input.cnpj);
    if (!apiData) return null;
    return mapBrasilApiToCompanyData(apiData);
  }),
  list: protectedProcedure.input(z11.object({ familyId: z11.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listCompanyRecords(input.familyId);
  }),
  stakeholders: protectedProcedure.input(z11.object({ companyId: z11.string() })).query(async ({ ctx, input }) => {
    const company = await requireCompanyFamily(input.companyId);
    await assertFamilyAccess(ctx, company.familyId);
    return listStakeholderRecords(input.companyId);
  }),
  create: protectedProcedure.input(companyInputSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.COMPANY_CREATE);
    await assertFamilyAccess(ctx, input.familyId);
    let finalLegalName = input.legalName;
    let mappedData = null;
    let fromApi = false;
    if (!input.isOffshore && input.taxNumber) {
      const apiData = await fetchCompanyByCnpj(input.taxNumber);
      if (apiData) {
        fromApi = true;
        mappedData = mapBrasilApiToCompanyData(apiData);
        if (mappedData.legalName) {
          finalLegalName = mappedData.legalName;
        }
      }
    }
    const companyId = await createCompanyRecord({
      ...input,
      legalName: finalLegalName
    });
    if (mappedData) {
      await upsertCompanyDetailsRecord({
        companyId,
        fields: {
          uf: mappedData.uf,
          sede: mappedData.sede,
          cep: mappedData.cep,
          street: mappedData.street,
          number: mappedData.number,
          complement: mappedData.complement,
          district: mappedData.district,
          city: mappedData.city,
          societaryType: mappedData.societaryType,
          taxRegime: mappedData.taxRegime,
          corporatePurpose: mappedData.corporatePurpose,
          capitalSocial: mappedData.capitalSocial,
          administrator1: mappedData.administrator1,
          administrator2: mappedData.administrator2
        }
      });
      if (mappedData.stakeholders.length) {
        const people2 = await listPeopleByFamily(input.familyId) ?? [];
        for (const item of mappedData.stakeholders) {
          try {
            const match = people2.find(
              (p) => normalizeName(p.fullName) === normalizeName(item.name)
            );
            await createStakeholderRecord({
              companyId,
              personId: match?.id,
              externalName: match ? void 0 : item.name,
              percentage: 0
            });
          } catch {
          }
        }
      }
    }
    let requirementsCount = 0;
    if (!input.isOffshore) {
      await ensureCertidoesForSubject({
        familyId: input.familyId,
        scope: "SOCIEDADE",
        subjectId: companyId
      });
    }
    const reconciled = await reconcileEntityDocuments({
      familyId: input.familyId,
      entityType: "SOCIEDADE",
      entityId: companyId,
      categories: computeCompanyCategories({
        isOffshore: input.isOffshore,
        societaryType: mappedData?.societaryType ?? null
      })
    });
    requirementsCount = reconciled.created;
    await recordAudit({
      action: "SOCIEDADE_CRIADA",
      entityType: "SOCIEDADE",
      entityId: companyId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { isOffshore: input.isOffshore, requirements: requirementsCount, fromApi }
    });
    return { companyId, fromApi };
  }),
  remove: protectedProcedure.input(removeCompanySchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.COMPANY_REMOVE);
    await assertFamilyAccess(ctx, input.familyId);
    const result = await removeCompanyRecord(input.familyId, input.companyId);
    await recordAudit({
      action: "SOCIEDADE_EXCLUIDA",
      entityType: "SOCIEDADE",
      entityId: input.companyId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { archivedDocuments: result.archivedDocuments }
    });
    return result;
  }),
  addStakeholder: protectedProcedure.input(stakeholderInputSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.COMPANY_ADD_STAKEHOLDER);
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
    const user = requirePermission(ctx, Permission.COMPANY_UPDATE_STAKEHOLDER);
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
    const user = requirePermission(ctx, Permission.COMPANY_REMOVE_STAKEHOLDER);
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
    const [details, stakeholders, certidoes2, people2] = await Promise.all([
      getCompanyDetailsRecord(company.id),
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
        isOffshore: company.isOffshore
      },
      details,
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
    const user = requirePermission(ctx, Permission.COMPANY_UPSERT_DETAILS);
    const company = await requireCompanyFamily(input.companyId);
    await assertFamilyAccess(ctx, company.familyId);
    if (company.isOffshore) {
      if (!input.fields.jurisdiction) {
        throw new Error("Informe a jurisdi\xE7\xE3o da sociedade offshore.");
      }
      if (!input.fields.companyNumber) {
        throw new Error("Informe o identificador estrangeiro (company number).");
      }
      if (input.fields.taxRegime) {
        throw new Error("Sociedade offshore n\xE3o usa regime tribut\xE1rio brasileiro.");
      }
    }
    await upsertCompanyDetailsRecord({ companyId: company.id, fields: input.fields });
    const { created, removed } = await reconcileEntityDocuments({
      familyId: company.familyId,
      entityType: "SOCIEDADE",
      entityId: company.id,
      categories: computeCompanyCategories({
        isOffshore: company.isOffshore,
        societaryType: input.fields.societaryType ?? null
      })
    });
    await recordAudit({
      action: "DETALHES_HOLDING_SALVOS",
      entityType: "SOCIEDADE",
      entityId: company.id,
      actorUserId: user.id,
      familyId: company.familyId,
      metadata: {
        isOffshore: company.isOffshore,
        capitalSocial: input.fields.capitalSocial ?? 0,
        requirementsCreated: created,
        requirementsRemoved: removed
      }
    });
    return { success: true };
  })
});

// server/features/documents/document-router.ts
import { z as z13 } from "zod";

// server/features/documents/document-review.ts
init_schema();
init_database();
import { eq as eq16 } from "drizzle-orm";

// server/features/documents/couple-docs.ts
init_schema();
init_database();
import { and as and11, eq as eq15, inArray as inArray6, ne as ne3 } from "drizzle-orm";
async function releaseSpouseCoupleDocs(sourceDocument) {
  if (sourceDocument.entityType !== "PESSOA") return 0;
  if (!isCoupleSharedCategory(sourceDocument.category)) return 0;
  const db = await requireDatabase();
  const [spouse] = await db.select({ id: people.id }).from(people).where(
    and11(
      eq15(people.familyId, sourceDocument.familyId),
      eq15(people.vinculo, "CONJUGE"),
      ne3(people.id, sourceDocument.entityId)
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
    and11(
      eq15(documents.familyId, sourceDocument.familyId),
      eq15(documents.entityType, "PESSOA"),
      eq15(documents.entityId, spouse.id),
      eq15(documents.category, sourceDocument.category),
      eq15(documents.status, "PENDENTE"),
      inArray6(documents.category, [...COUPLE_SHARED_CATEGORIES])
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
  if (document && document.entityType === "PESSOA" && document.category === "IRPF") {
    await syncDependentIrpfStatus(document.familyId);
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
import { z as z12 } from "zod";
var documentEntitySchema = z12.enum(entityTypeValues);
var documentStatusSchema = z12.enum([
  "PENDENTE",
  "RECEBIDO_EM_ANALISE",
  "VALIDADO",
  "REJEITADO",
  "VENCIDO",
  "DISPENSADO",
  "NAO_POSSUI",
  "NA"
]);
var createDocumentSchema = z12.object({
  familyId: z12.string().min(1),
  entityType: documentEntitySchema,
  entityId: z12.string().min(1),
  category: z12.string().min(2).max(80),
  validUntil: isoDateSchema("Data de validade inv\xE1lida (use AAAA-MM-DD).").optional(),
  /** Data-base do documento (ex.: balanço fechado / balancete). */
  referenceDate: isoDateSchema("Data-base inv\xE1lida (use AAAA-MM-DD).").optional()
});
var uploadVersionSchema = z12.object({
  documentId: z12.string().min(1),
  fileName: z12.string().min(1).max(255),
  mimeType: z12.string().min(1).max(120),
  base64Data: z12.string().min(8).max(8e6)
});
var reviewDocumentSchema = z12.object({
  documentId: z12.string().min(1),
  status: z12.enum(["VALIDADO", "REJEITADO", "NAO_POSSUI"]),
  rejectionReason: z12.string().min(3).max(1e3).optional()
});
var dispenseDocumentSchema = z12.object({
  documentId: z12.string().min(1),
  reason: z12.string().min(3).max(1e3),
  requestedBy: z12.string().optional()
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
  await assertIrpfUploadAllowed(document);
  const bytes = Buffer.from(input.base64Data, "base64");
  assertStorageSize(bytes);
  const sha256 = createHash2("sha256").update(bytes).digest("hex");
  const nextVersion = document.currentVersion + 1;
  const familyFolder = await resolveFamilyStorageFolder(document.familyId);
  const relativeKey = `${familyFolder}/${document.id}/v${nextVersion}/${input.fileName}`;
  const stored = await storagePut(relativeKey, bytes, input.mimeType);
  return withAdvisoryLock(
    requireDatabase(),
    "DOCUMENT_UPLOAD",
    document.id,
    async (tx) => {
      const [currentDoc] = await tx.select({ currentVersion: documents.currentVersion }).from(documents).where(eq17(documents.id, document.id)).limit(1);
      if (!currentDoc) throw new Error("Documento n\xE3o encontrado.");
      const versionNumber = currentDoc.currentVersion + 1;
      await tx.insert(documentVersions).values({
        id: createId(),
        documentId: document.id,
        versionNumber,
        originalName: input.fileName,
        mimeType: input.mimeType,
        storageKey: stored.key,
        sha256,
        uploadedBy: String(input.userId)
      });
      await tx.update(documents).set({
        currentVersion: versionNumber,
        status: "RECEBIDO_EM_ANALISE",
        rejectionReason: null
      }).where(eq17(documents.id, document.id));
      await releaseSpouseCoupleDocs({
        familyId: document.familyId,
        entityType: document.entityType,
        entityId: document.entityId,
        category: document.category
      });
      if (document.entityType === "PESSOA" && document.category === "IRPF") {
        await syncDependentIrpfStatus(document.familyId);
      }
      return { versionNumber, sha256, storageKey: stored.key };
    }
  );
}

// server/features/documents/document-router.ts
var documentRouter = router({
  list: protectedProcedure.input(z13.object({ familyId: z13.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listDocumentRecords(input.familyId);
  }),
  versions: protectedProcedure.input(z13.object({ documentId: z13.string() })).query(async ({ ctx, input }) => {
    const document = await getDocumentRecord(input.documentId);
    if (!document) return [];
    await assertFamilyAccess(ctx, document.familyId);
    return listVersions(input.documentId);
  }),
  create: protectedProcedure.input(createDocumentSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.DOCUMENT_CREATE);
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
  generateRequirements: protectedProcedure.input(z13.object({ familyId: z13.string() })).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.DOCUMENT_GENERATE_REQUIREMENTS);
    await assertFamilyAccess(ctx, input.familyId);
    const { created, removed } = await reconcileFamilyDocumentRequirements(
      input.familyId
    );
    await recordAudit({
      action: "REQUISITOS_DOCUMENTAIS_GERADOS",
      entityType: "FAMILIA",
      entityId: input.familyId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { created, removed }
    });
    return { created, removed };
  }),
  uploadVersion: protectedProcedure.input(uploadVersionSchema).mutation(async ({ ctx, input }) => {
    const document = await getDocumentRecord(input.documentId);
    if (!document) throw new Error("Documento n\xE3o encontrado.");
    const user = requirePermission(ctx, Permission.DOCUMENT_UPLOAD_VERSION);
    await assertFamilyAccess(ctx, document.familyId);
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
    const user = requirePermission(ctx, Permission.DOCUMENT_REVIEW);
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
    const user = requirePermission(ctx, Permission.DOCUMENT_DISPENSE);
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
  }),
  /** Upload de balanço fechado / balancete de uma sociedade, com data-base. */
  uploadBalance: protectedProcedure.input(
    z13.object({
      familyId: z13.string().min(1),
      companyId: z13.string().min(1),
      category: z13.enum(COMPANY_BALANCE_CATEGORIES),
      referenceDate: z13.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      fileName: z13.string().min(1).max(255),
      mimeType: z13.string().min(1).max(120).default("application/pdf"),
      base64Data: z13.string().min(8).max(8e6)
    })
  ).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.DOCUMENT_UPLOAD_BALANCE);
    await assertFamilyAccess(ctx, input.familyId);
    const documentId = await findOrCreateDocumentRecord({
      familyId: input.familyId,
      entityType: "SOCIEDADE",
      entityId: input.companyId,
      category: input.category,
      referenceDate: input.referenceDate
    });
    const result = await storeDocumentVersion({
      documentId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      base64Data: input.base64Data,
      userId: user.id
    });
    await recordAudit({
      action: "BALANCO_ENVIADO",
      entityType: "SOCIEDADE",
      entityId: input.companyId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: {
        category: input.category,
        referenceDate: input.referenceDate,
        version: result.versionNumber
      }
    });
    return { documentId, versionNumber: result.versionNumber };
  })
});

// server/features/families/family-router.ts
init_schema();
import { createHash as createHash3, randomBytes } from "node:crypto";
import { and as and13, eq as eq20 } from "drizzle-orm";
import { z as z14 } from "zod";
init_database();

// server/features/alerts/project-alerts-repository.ts
init_schema();
init_database();
import { eq as eq18, inArray as inArray7 } from "drizzle-orm";

// server/features/alerts/project-alerts.ts
var RED_CERTIDAO_STATUSES = /* @__PURE__ */ new Set(["POSITIVA", "SOMENTE_FISICA"]);
function todayIso(today) {
  return today.toISOString().slice(0, 10);
}
function certidaoAlertLevel(status, validUntil, today = /* @__PURE__ */ new Date()) {
  if (RED_CERTIDAO_STATUSES.has(status)) return "VERMELHO";
  if (status === "PENDENTE") return "AMARELO";
  if (validUntil) {
    const expiry = String(validUntil).slice(0, 10);
    if (expiry < todayIso(today)) return "AMARELO";
  }
  return "NENHUM";
}
function subjectAlertKey(scope, subjectId) {
  return `${scope}:${subjectId}`;
}
function maxAlertLevel(left, right) {
  if (left === "VERMELHO" || right === "VERMELHO") return "VERMELHO";
  if (left === "AMARELO" || right === "AMARELO") return "AMARELO";
  return "NENHUM";
}
function computeSubjectAlerts(rows, today = /* @__PURE__ */ new Date()) {
  const bySubject = {};
  for (const row of rows) {
    const level = certidaoAlertLevel(row.status, row.validUntil, today);
    if (level === "NENHUM") continue;
    const key = subjectAlertKey(row.scope, row.subjectId);
    bySubject[key] = maxAlertLevel(bySubject[key], level);
  }
  return bySubject;
}
function computeSubjectReasons(rows, today = /* @__PURE__ */ new Date()) {
  const grouped = {};
  for (const row of rows) {
    const level = certidaoAlertLevel(row.status, row.validUntil, today);
    if (level === "NENHUM") continue;
    const key = subjectAlertKey(row.scope, row.subjectId);
    const typeLabel = row.type ? CERTIDAO_TYPE_LABELS[row.type] ?? row.type : "Certid\xE3o";
    let situation = "";
    if (row.status === "POSITIVA") situation = "positiva";
    else if (row.status === "SOMENTE_FISICA") situation = "somente f\xEDsica";
    else if (row.status === "PENDENTE") situation = "pendente";
    else if (row.validUntil) {
      const iso2 = String(row.validUntil).slice(0, 10);
      if (iso2 < todayIso(today)) {
        const [y, m, d] = iso2.split("-");
        situation = `vencida em ${d}/${m}/${y}`;
      }
    }
    if (!situation) continue;
    const reason = `${typeLabel} \u2014 ${situation}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({ level, reason });
  }
  const result = {};
  for (const [key, items] of Object.entries(grouped)) {
    items.sort(
      (a, b) => a.level === "VERMELHO" && b.level !== "VERMELHO" ? -1 : b.level === "VERMELHO" && a.level !== "VERMELHO" ? 1 : 0
    );
    result[key] = items.map((i) => i.reason);
  }
  return result;
}
function computeAlertCounts(rows, today = /* @__PURE__ */ new Date()) {
  let vermelho = 0;
  let amarelo = 0;
  for (const level of Object.values(computeSubjectAlerts(rows, today))) {
    if (level === "VERMELHO") vermelho += 1;
    else if (level === "AMARELO") amarelo += 1;
  }
  return { vermelho, amarelo };
}
function certidaoLabel(row) {
  const typeLabel = row.type ? CERTIDAO_TYPE_LABELS[row.type] ?? row.type : "Certid\xE3o";
  return `${typeLabel} de ${row.subjectName ?? row.subjectId}`;
}
function computeConclusionBlockers(input) {
  const today = input.today ?? /* @__PURE__ */ new Date();
  const hardBlockers = input.properties.filter((property) => property.encumbranceType === "PENDENTE").map(
    (property) => `Im\xF3vel \xAB${property.description}\xBB com gravame Pendente \u2014 resolva o gravame antes de concluir o projeto.`
  );
  const redCertidoes = input.certidoes.filter(
    (row) => certidaoAlertLevel(row.status, row.validUntil, today) === "VERMELHO"
  ).map(certidaoLabel);
  const blockers = [...hardBlockers];
  if (redCertidoes.length && !input.justification?.trim()) {
    blockers.push(
      `Certid\xE3o em vermelho sem justificativa registrada: ${redCertidoes.join(", ")}.`
    );
  }
  return { blockers, hardBlockers, redCertidoes };
}

// server/features/alerts/project-alerts-repository.ts
async function loadAlertRows(familyId) {
  const db = await requireDatabase();
  const [certidaoRows, propertyRows, peopleRows, companyRows] = await Promise.all([
    db.select({
      scope: certidoes.scope,
      subjectId: certidoes.subjectId,
      type: certidoes.type,
      status: certidoes.status,
      validUntil: certidoes.validUntil
    }).from(certidoes).where(eq18(certidoes.familyId, familyId)),
    db.select({
      id: properties.id,
      description: properties.description,
      encumbranceType: properties.encumbranceType
    }).from(properties).where(eq18(properties.familyId, familyId)),
    db.select({ id: people.id, fullName: people.fullName }).from(people).where(eq18(people.familyId, familyId)),
    db.select({ id: companies.id, legalName: companies.legalName }).from(companies).where(eq18(companies.familyId, familyId))
  ]);
  const nameByKey = /* @__PURE__ */ new Map();
  for (const row of peopleRows) {
    nameByKey.set(`PESSOA:${row.id}`, row.fullName);
  }
  for (const row of companyRows) {
    nameByKey.set(`SOCIEDADE:${row.id}`, row.legalName);
  }
  return {
    certidoes: certidaoRows.map((row) => ({
      ...row,
      subjectName: nameByKey.get(`${row.scope}:${row.subjectId}`) ?? null
    })),
    properties: propertyRows
  };
}
async function getProjectAlertSummary(familyId) {
  const rows = await loadAlertRows(familyId);
  const bySubject = computeSubjectAlerts(rows.certidoes);
  const { blockers, hardBlockers, redCertidoes } = computeConclusionBlockers({
    certidoes: rows.certidoes,
    properties: rows.properties
  });
  const pendenteGravames = rows.properties.filter((property) => property.encumbranceType === "PENDENTE").map((property) => ({
    propertyId: property.id,
    description: property.description
  }));
  return {
    bySubject,
    reasonsBySubject: computeSubjectReasons(rows.certidoes),
    counts: computeAlertCounts(rows.certidoes),
    pendenteGravames,
    redCertidoes,
    hardBlockers,
    blockers,
    canConclude: hardBlockers.length === 0
  };
}
async function getConclusionBlockers(familyId, justification) {
  const rows = await loadAlertRows(familyId);
  return computeConclusionBlockers({
    certidoes: rows.certidoes,
    properties: rows.properties,
    justification
  }).blockers;
}
async function listProjectAlertLevels(familyIds) {
  if (!familyIds.length) return {};
  const db = await requireDatabase();
  const rows = await db.select({
    familyId: certidoes.familyId,
    scope: certidoes.scope,
    subjectId: certidoes.subjectId,
    status: certidoes.status,
    validUntil: certidoes.validUntil
  }).from(certidoes).where(inArray7(certidoes.familyId, familyIds));
  const byFamily = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const list = byFamily.get(row.familyId) ?? [];
    list.push(row);
    byFamily.set(row.familyId, list);
  }
  const levels = {};
  for (const familyId of familyIds) {
    const subjects = computeSubjectAlerts(byFamily.get(familyId) ?? []);
    let level = "NENHUM";
    for (const subjectLevel of Object.values(subjects)) {
      if (subjectLevel === "VERMELHO") {
        level = "VERMELHO";
        break;
      }
      if (subjectLevel === "AMARELO") level = "AMARELO";
    }
    levels[familyId] = level;
  }
  return levels;
}

// server/features/families/family-timeline-repository.ts
init_schema();
init_database();
import { and as and12, count as count2, desc as desc4, eq as eq19, gt, isNull } from "drizzle-orm";

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
  }).from(families).where(eq19(families.id, familyId)).limit(1);
  if (!family) return null;
  const [lead] = await db.select({
    id: leads.id,
    status: leads.status,
    createdAt: leads.createdAt,
    updatedAt: leads.updatedAt
  }).from(leads).where(eq19(leads.familyId, familyId)).orderBy(desc4(leads.createdAt)).limit(1);
  const [{ total: peopleTotal }] = await db.select({ total: count2() }).from(people).where(eq19(people.familyId, familyId));
  const [{ total: titularCount }] = await db.select({ total: count2() }).from(people).where(
    and12(eq19(people.familyId, familyId), eq19(people.isPrimaryContact, true))
  );
  const [{ total: propertiesTotal }] = await db.select({ total: count2() }).from(properties).where(eq19(properties.familyId, familyId));
  const [{ total: companiesTotal }] = await db.select({ total: count2() }).from(companies).where(eq19(companies.familyId, familyId));
  const [{ total: assetsTotal }] = await db.select({ total: count2() }).from(otherAssets).where(eq19(otherAssets.familyId, familyId));
  const documentRows = await db.select({ status: documents.status }).from(documents).where(eq19(documents.familyId, familyId));
  const [{ total: lwrVersions }] = await db.select({ total: count2() }).from(lwrReports).where(eq19(lwrReports.familyId, familyId));
  const [proposal] = await db.select({
    id: financialProposals.id,
    status: financialProposals.status,
    createdAt: financialProposals.createdAt,
    acceptedAt: financialProposals.acceptedAt
  }).from(financialProposals).where(eq19(financialProposals.familyId, familyId)).orderBy(desc4(financialProposals.createdAt)).limit(1);
  const [{ total: clientAccessCount }] = await db.select({ total: count2() }).from(familyAccess).where(
    and12(
      eq19(familyAccess.familyId, familyId),
      eq19(familyAccess.accessRole, "CLIENTE")
    )
  );
  const [{ total: activePortalLinks }] = await db.select({ total: count2() }).from(portalLinks).where(
    and12(
      eq19(portalLinks.familyId, familyId),
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
async function withAlerts(records) {
  const alerts = await listProjectAlertLevels(records.map((record) => record.id));
  return records.map((record) => ({
    ...record,
    alerts: alerts[record.id] ?? "NENHUM"
  }));
}
var familyRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    if (user.role !== "CLIENTE") return withAlerts(await listFamilyRecords());
    const db = await requireDatabase();
    const access = await db.select().from(familyAccess).where(eq20(familyAccess.userId, user.id));
    const records = await Promise.all(
      access.map((item) => getFamilyRecord(item.familyId))
    );
    return withAlerts(
      records.filter(
        (record) => record !== null
      )
    );
  }),
  get: protectedProcedure.input(z14.object({ familyId: z14.string().min(1) })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return getFamilyRecord(input.familyId);
  }),
  updateStatus: protectedProcedure.input(
    z14.object({
      familyId: z14.string().min(1),
      status: z14.enum(projectStatusValues),
      justification: z14.string().max(2e3).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.FAMILY_UPDATE_STATUS);
    await assertFamilyAccess(ctx, input.familyId);
    if (input.status === "CONCLUIDO") {
      const blockers = await getConclusionBlockers(
        input.familyId,
        input.justification
      );
      if (blockers.length) {
        throw new Error(
          `O projeto n\xE3o pode ser conclu\xEDdo: ${blockers.join(" ")}`
        );
      }
    }
    await setProjectStatusRecord(input.familyId, input.status);
    await recordAudit({
      action: "PROJETO_STATUS_ATUALIZADO",
      entityType: "FAMILIA",
      entityId: input.familyId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: {
        status: input.status,
        justification: input.justification ?? ""
      }
    });
    return { success: true, status: input.status };
  }),
  timeline: protectedProcedure.input(z14.object({ familyId: z14.string().min(1) })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return getFamilyTimelineRecord(input.familyId);
  }),
  create: protectedProcedure.input(familyInputSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.FAMILY_CREATE);
    const result = await createFamilyRecord(input, user.id);
    await recordAuditSafe({
      action: "FAMILIA_CRIADA",
      entityType: "FAMILIA",
      entityId: result.familyId,
      actorUserId: user.id,
      familyId: result.familyId
    });
    return result;
  }),
  grantClientAccess: protectedProcedure.input(z14.object({ familyId: z14.string(), userId: z14.number().int() })).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.FAMILY_GRANT_CLIENT_ACCESS);
    await assertFamilyAccess(ctx, input.familyId);
    const db = await requireDatabase();
    await db.insert(familyAccess).values({
      id: createId(),
      familyId: input.familyId,
      userId: input.userId,
      accessRole: "CLIENTE"
    }).onConflictDoNothing();
    await recordAuditSafe({
      action: "ACESSO_CLIENTE_CONCEDIDO",
      entityType: "FAMILIA",
      entityId: input.familyId,
      actorUserId: user.id,
      familyId: input.familyId
    });
    return { success: true };
  }),
  generateFirstAccessLink: protectedProcedure.input(z14.object({ familyId: z14.string().min(1) })).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.FAMILY_GENERATE_FIRST_ACCESS_LINK);
    await assertFamilyAccess(ctx, input.familyId);
    const db = await requireDatabase();
    const existingAccess = await db.select({ id: familyAccess.id }).from(familyAccess).where(
      and13(
        eq20(familyAccess.familyId, input.familyId),
        eq20(familyAccess.accessRole, "CLIENTE")
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
    await recordAuditSafe({
      action: "LINK_PRIMEIRO_ACESSO_GERADO",
      entityType: "FAMILIA",
      entityId: input.familyId,
      actorUserId: user.id,
      familyId: input.familyId
    });
    return { token, fullName: contact.fullName };
  }),
  generatePasswordResetLink: protectedProcedure.input(z14.object({ familyId: z14.string().min(1) })).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.FAMILY_GENERATE_PASSWORD_RESET_LINK);
    await assertFamilyAccess(ctx, input.familyId);
    const db = await requireDatabase();
    const existingAccess = await db.select({ id: familyAccess.id }).from(familyAccess).where(
      and13(
        eq20(familyAccess.familyId, input.familyId),
        eq20(familyAccess.accessRole, "CLIENTE")
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
    await recordAuditSafe({
      action: "LINK_REDEFINICAO_SENHA_GERADO",
      entityType: "FAMILIA",
      entityId: input.familyId,
      actorUserId: user.id,
      familyId: input.familyId
    });
    return { token, fullName: contact.fullName };
  }),
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    if (user.role === "CLIENTE") return getClientDashboardData(user.id);
    requirePermission(ctx, Permission.FAMILY_GET_DASHBOARD);
    return getDashboardData();
  }),
  listStorage: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    if (user.role === "CLIENTE") return listClientStorageFiles(user.id);
    requirePermission(ctx, Permission.FAMILY_LIST_STORAGE);
    return listStorageFiles();
  })
});

// server/features/reports/lwr-router.ts
init_schema();
import { desc as desc5, eq as eq21 } from "drizzle-orm";
import { z as z16 } from "zod";
init_database();

// server/features/reports/lwr-types.ts
import { z as z15 } from "zod";
var lwrInputSchema = z15.object({
  familyId: z15.string().min(1),
  baseDate: z15.string().min(10),
  proposedStructure: z15.string().min(10).max(12e3),
  financialProposal: z15.string().max(12e3).optional().default("Proposta financeira gerenciada no m\xF3dulo aut\xF4nomo."),
  canvaUrl: z15.string().max(1e3).optional(),
  presentationFileKey: z15.string().max(500).optional()
});

// server/features/reports/lwr-router.ts
var lwrRouter = router({
  list: protectedProcedure.input(z16.object({ familyId: z16.string() })).query(async ({ ctx, input }) => {
    requirePermission(ctx, Permission.LWR_CREATE);
    await assertFamilyAccess(ctx, input.familyId);
    const db = await requireDatabase();
    return db.select().from(lwrReports).where(eq21(lwrReports.familyId, input.familyId)).orderBy(desc5(lwrReports.version));
  }),
  create: protectedProcedure.input(lwrInputSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.LWR_CREATE);
    await assertFamilyAccess(ctx, input.familyId);
    return withAdvisoryLock(
      requireDatabase(),
      "LWR_CREATE",
      input.familyId,
      async (tx) => {
        const previous = await tx.select({ version: lwrReports.version }).from(lwrReports).where(eq21(lwrReports.familyId, input.familyId)).orderBy(desc5(lwrReports.version)).limit(1);
        const version = (previous[0]?.version ?? 0) + 1;
        const reportId = createId();
        await tx.insert(lwrReports).values({
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
      }
    );
  })
});

// server/features/people/person-router.ts
import { z as z17 } from "zod";
import { TRPCError as TRPCError4 } from "@trpc/server";
var personRouter = router({
  list: protectedProcedure.input(z17.object({ familyId: z17.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listPeopleByFamily(input.familyId);
  }),
  create: protectedProcedure.input(personInputSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.PEOPLE_CREATE);
    await assertFamilyAccess(ctx, input.familyId);
    let personId;
    try {
      personId = await addPersonRecord(input);
    } catch (err) {
      if (err instanceof TRPCError4) throw err;
      throw new TRPCError4({
        code: "BAD_REQUEST",
        message: err instanceof Error ? err.message : "Erro ao cadastrar pessoa."
      });
    }
    await ensureCertidoesForSubject({
      familyId: input.familyId,
      scope: "PESSOA",
      subjectId: personId
    });
    const person = await getPersonRecord(personId);
    await recordAudit({
      action: "PESSOA_CRIADA",
      entityType: "PESSOA",
      entityId: personId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { isDependent: person?.isDependent ?? false }
    });
    return { personId };
  }),
  update: protectedProcedure.input(personUpdateSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.PEOPLE_UPDATE);
    await assertFamilyAccess(ctx, input.familyId);
    let result;
    try {
      result = await updatePersonRecord(input);
    } catch (err) {
      if (err instanceof TRPCError4) throw err;
      throw new TRPCError4({
        code: "BAD_REQUEST",
        message: err instanceof Error ? err.message : "Erro ao atualizar pessoa."
      });
    }
    const person = await getPersonRecord(input.personId);
    let requirementsCreated = 0;
    let requirementsRemoved = 0;
    if (person) {
      const { created, removed } = await reconcileEntityDocuments({
        familyId: input.familyId,
        entityType: "PESSOA",
        entityId: input.personId,
        categories: computePersonCategories({
          vinculo: person.vinculo,
          civilStatus: person.civilStatus
        })
      });
      requirementsCreated = created;
      requirementsRemoved = removed;
    }
    await recordAudit({
      action: "PESSOA_ATUALIZADA",
      entityType: "PESSOA",
      entityId: input.personId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: {
        migratedFiles: result.migratedFiles,
        requirementsCreated,
        requirementsRemoved,
        isDependent: person?.isDependent ?? false
      }
    });
    return result;
  }),
  remove: protectedProcedure.input(removePersonSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.PEOPLE_REMOVE);
    await assertFamilyAccess(ctx, input.familyId);
    const result = await removePersonRecord(input.familyId, input.personId);
    await recordAudit({
      action: "PESSOA_EXCLUIDA",
      entityType: "PESSOA",
      entityId: input.personId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { archivedDocuments: result.archivedDocuments }
    });
    return result;
  }),
  attachDocuments: protectedProcedure.input(attachDocumentsSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.PEOPLE_ATTACH_DOCUMENTS);
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
    const user = requirePermission(ctx, Permission.PEOPLE_SET_PRIMARY_CONTACT);
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
import { and as and14, desc as desc6, eq as eq22, gt as gt3, isNull as isNull3 } from "drizzle-orm";
import { z as z18 } from "zod";
init_database();
function hashToken2(token) {
  return createHash4("sha256").update(token).digest("hex");
}
async function getActivePortalLink(token) {
  const db = await requireDatabase();
  const result = await db.select().from(portalLinks).where(and14(
    eq22(portalLinks.tokenHash, hashToken2(token)),
    isNull3(portalLinks.revokedAt),
    gt3(portalLinks.expiresAt, /* @__PURE__ */ new Date())
  )).limit(1);
  return result[0] ?? null;
}
var portalRouter = router({
  createLink: protectedProcedure.input(z18.object({ familyId: z18.string(), origin: z18.string().url() })).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.PORTAL_CREATE_LINK);
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
  listLinks: protectedProcedure.input(z18.object({ familyId: z18.string() })).query(async ({ ctx, input }) => {
    requirePermission(ctx, Permission.PORTAL_LIST_LINKS);
    const db = await requireDatabase();
    return db.select({ id: portalLinks.id, expiresAt: portalLinks.expiresAt, revokedAt: portalLinks.revokedAt, createdAt: portalLinks.createdAt }).from(portalLinks).where(eq22(portalLinks.familyId, input.familyId)).orderBy(desc6(portalLinks.createdAt));
  }),
  revokeLink: protectedProcedure.input(z18.object({ linkId: z18.string() })).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.PORTAL_REVOKE_LINK);
    const db = await requireDatabase();
    const [link] = await db.select().from(portalLinks).where(eq22(portalLinks.id, input.linkId)).limit(1);
    if (!link) throw new Error("Link n\xE3o encontrado.");
    await db.update(portalLinks).set({ revokedAt: /* @__PURE__ */ new Date() }).where(eq22(portalLinks.id, input.linkId));
    await recordAudit({ action: "LINK_PORTAL_REVOGADO", entityType: "FAMILIA", entityId: link.familyId, actorUserId: user.id, familyId: link.familyId });
    return { success: true };
  }),
  status: publicProcedure.input(z18.object({ token: z18.string().min(16) })).query(async ({ input }) => {
    const link = await getActivePortalLink(input.token);
    if (!link) throw new Error("Link inv\xE1lido, revogado ou expirado.");
    const db = await requireDatabase();
    const [family] = await db.select().from(families).where(eq22(families.id, link.familyId)).limit(1);
    const [project] = await db.select().from(projects).where(eq22(projects.familyId, link.familyId)).limit(1);
    const documentList = await db.select().from(documents).where(eq22(documents.familyId, link.familyId));
    const reports = await db.select().from(lwrReports).where(eq22(lwrReports.familyId, link.familyId));
    return { family, project, documents: documentList, reports };
  }),
  uploadDocument: publicProcedure.input(z18.object({ token: z18.string().min(16), documentId: z18.string(), fileName: z18.string(), mimeType: z18.string(), base64Data: z18.string() })).mutation(async ({ input }) => {
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
import { z as z20 } from "zod";

// server/features/properties/property-repository.ts
init_schema();
init_database();
import { desc as desc7, eq as eq23, and as and15 } from "drizzle-orm";
var PCT_EPSILON2 = 1e-3;
function totalOwnership(rows) {
  return rows.reduce((sum, row) => sum + Number(row.ownershipPercentage ?? 0), 0);
}
function money2(value) {
  return value === void 0 ? null : value.toFixed(2);
}
function propertyValues(input) {
  return {
    description: input.description,
    kind: input.kind ?? null,
    uf: input.uf ?? null,
    cep: input.cep ? input.cep.replace(/\D/g, "").slice(0, 8) || null : null,
    hasRegistration: input.hasRegistration,
    registrationNumber: input.hasRegistration ? input.registrationNumber || null : null,
    alternativeDocType: input.hasRegistration ? null : input.alternativeDocType || null,
    noRegistrationReason: input.hasRegistration ? null : input.noRegistrationReason || null,
    registryOfficeNumber: input.registryOfficeNumber ?? null,
    registryUf: input.registryUf ?? null,
    registryCity: input.registryCity || null,
    propertyCity: input.propertyCity,
    inscricaoImobiliaria: input.inscricaoImobiliaria || null,
    ccir: input.ccir || null,
    nirf: input.nirf || null,
    notes: input.notes || null,
    acquisitionDate: input.acquisitionDate || null,
    irpfBalanceValue: money2(input.declaredValue),
    marketValue: money2(input.marketValue),
    venalValue: money2(input.venalValue),
    irGcapValue: money2(input.irGcapValue),
    emolumentsValue: money2(input.emolumentsValue),
    itbiRate: money2(input.itbiRate),
    hasLaudemio: input.hasLaudemio,
    laudemioRate: input.hasLaudemio ? money2(input.laudemioRate) : null,
    utility: input.utility,
    rentValue: input.utility === "LOCACAO_ARRENDAMENTO" ? money2(input.rentValue) : null,
    encumbranceType: input.encumbranceType,
    encumbranceNote: input.encumbranceNote || null
  };
}
async function createPropertyRecord(input) {
  const db = await requireDatabase();
  const id = createId();
  const existingProperty = await db.select().from(properties).where(
    and15(
      eq23(properties.familyId, input.familyId),
      eq23(properties.description, input.description),
      eq23(properties.propertyCity, input.propertyCity)
    )
  ).limit(1);
  if (existingProperty.length > 0) {
    return existingProperty[0].id;
  }
  await db.insert(properties).values({
    ...propertyValues(input),
    id,
    familyId: input.familyId
  });
  return id;
}
async function updatePropertyRecord(input) {
  const db = await requireDatabase();
  const [current] = await db.select().from(properties).where(eq23(properties.id, input.propertyId)).limit(1);
  if (!current) throw new Error("Im\xF3vel n\xE3o encontrado.");
  await db.update(properties).set({ ...propertyValues(input), updatedAt: /* @__PURE__ */ new Date() }).where(eq23(properties.id, input.propertyId));
  return { propertyId: input.propertyId };
}
async function removePropertyRecord(familyId, propertyId) {
  const db = await requireDatabase();
  const [property] = await db.select().from(properties).where(and15(eq23(properties.id, propertyId), eq23(properties.familyId, familyId))).limit(1);
  if (!property) throw new Error("Im\xF3vel n\xE3o encontrado nesta fam\xEDlia.");
  const [owner] = await db.select({ id: propertyOwners.id }).from(propertyOwners).where(eq23(propertyOwners.propertyId, propertyId)).limit(1);
  if (owner) {
    throw new Error(
      "N\xE3o \xE9 poss\xEDvel excluir: remova as titularidades do im\xF3vel antes."
    );
  }
  const documentsToArchive = await db.select({ id: documents.id }).from(documents).where(
    and15(eq23(documents.familyId, familyId), eq23(documents.entityId, propertyId))
  );
  if (documentsToArchive.length) {
    await db.update(documents).set({ status: "DISPENSADO" }).where(
      and15(
        eq23(documents.familyId, familyId),
        eq23(documents.entityId, propertyId)
      )
    );
  }
  await db.delete(properties).where(eq23(properties.id, propertyId));
  return { archivedDocuments: documentsToArchive.length };
}
async function listPropertyRecords(familyId) {
  const db = await requireDatabase();
  return db.select().from(properties).where(eq23(properties.familyId, familyId)).orderBy(desc7(properties.updatedAt));
}
async function getPropertyRecord(propertyId) {
  const db = await requireDatabase();
  const result = await db.select().from(properties).where(eq23(properties.id, propertyId)).limit(1);
  return result[0] ?? null;
}
async function addPropertyOwnerRecord(input) {
  const db = await requireDatabase();
  const id = createId();
  await db.transaction(async (tx) => {
    const existing = await tx.select().from(propertyOwners).where(eq23(propertyOwners.propertyId, input.propertyId));
    const duplicate = input.personId && existing.some((row) => row.personId === input.personId) || input.companyId && existing.some((row) => row.companyId === input.companyId);
    if (duplicate) {
      throw new Error("Este membro j\xE1 est\xE1 vinculado a este im\xF3vel.");
    }
    const total = totalOwnership(existing) + input.ownershipPercentage;
    if (total > 100 + PCT_EPSILON2) {
      throw new Error(
        `A soma das titularidades n\xE3o pode passar de 100% (atual ${totalOwnership(existing)}%).`
      );
    }
    await tx.insert(propertyOwners).values({
      ...input,
      id,
      personId: input.personId ?? null,
      companyId: input.companyId ?? null,
      ownershipPercentage: input.ownershipPercentage.toFixed(2)
    });
  });
  return id;
}
async function updatePropertyOwnerRecord(input) {
  const db = await requireDatabase();
  await db.transaction(async (tx) => {
    const current = await tx.select().from(propertyOwners).where(eq23(propertyOwners.id, input.ownerId)).limit(1);
    const owner = current[0];
    if (!owner || owner.propertyId !== input.propertyId) {
      throw new Error("Titularidade n\xE3o encontrada.");
    }
    const others = await tx.select().from(propertyOwners).where(eq23(propertyOwners.propertyId, input.propertyId));
    const remaining = others.filter((row) => row.id !== input.ownerId);
    const personId = input.personId ?? owner.personId;
    const companyId = input.companyId ?? owner.companyId;
    if (Boolean(personId) === Boolean(companyId)) {
      throw new Error(
        "A titularidade exige exatamente um dono: pessoa ou sociedade."
      );
    }
    const duplicate = personId && remaining.some((row) => row.personId === personId) || companyId && remaining.some((row) => row.companyId === companyId);
    if (duplicate) {
      throw new Error("Este membro j\xE1 est\xE1 vinculado a este im\xF3vel.");
    }
    const percentage = input.ownershipPercentage ?? Number(owner.ownershipPercentage);
    const total = totalOwnership(remaining) + percentage;
    if (total > 100 + PCT_EPSILON2) {
      throw new Error(
        `A soma das titularidades n\xE3o pode passar de 100% (atual ${totalOwnership(remaining)}%).`
      );
    }
    await tx.update(propertyOwners).set({
      personId: personId ?? null,
      companyId: companyId ?? null,
      ownershipPercentage: percentage.toFixed(2),
      rightType: input.rightType ?? owner.rightType
    }).where(eq23(propertyOwners.id, input.ownerId));
  });
}
async function removePropertyOwnerRecord(input) {
  const db = await requireDatabase();
  const removed = await db.delete(propertyOwners).where(eq23(propertyOwners.id, input.ownerId)).returning({ id: propertyOwners.id, propertyId: propertyOwners.propertyId });
  const row = removed[0];
  if (!row || row.propertyId !== input.propertyId) {
    throw new Error("Titularidade n\xE3o encontrada.");
  }
  return row.id;
}
async function listPropertyOwners(propertyId) {
  const db = await requireDatabase();
  return db.select().from(propertyOwners).where(eq23(propertyOwners.propertyId, propertyId));
}

// server/features/properties/property-types.ts
import { z as z19 } from "zod";
init_schema();
var propertyKindSchema = z19.enum(propertyKindValues);
var propertyUtilitySchema = z19.enum(propertyUtilityValues);
var encumbranceTypeSchema = z19.enum(encumbranceTypeValues);
var moneySchema = z19.number().nonnegative();
var propertyInputSchema = z19.object({
  familyId: z19.string().min(1, "Projeto obrigat\xF3rio."),
  description: z19.string().min(3, "Informe a descri\xE7\xE3o (m\xEDnimo 3 caracteres).").max(240),
  kind: propertyKindSchema.optional(),
  uf: ufSchema.optional(),
  cep: z19.string().max(8).optional().or(z19.literal("")),
  hasRegistration: z19.boolean().default(true),
  registrationNumber: z19.string().max(120).optional(),
  alternativeDocType: z19.enum(["ESCRITURA_PUBLICA", "CONTRATO_COMPRA_VENDA"]).optional(),
  noRegistrationReason: z19.string().max(1e3).optional(),
  registryOfficeNumber: z19.number().int().min(1).max(55).optional(),
  registryUf: ufSchema.optional(),
  registryCity: z19.string().max(120).optional(),
  propertyCity: z19.string().min(2, "Informe a cidade do im\xF3vel.").max(120),
  inscricaoImobiliaria: z19.string().max(120).optional(),
  ccir: z19.string().max(40).optional(),
  nirf: z19.string().max(40).optional(),
  notes: z19.string().max(4e3).optional(),
  acquisitionDate: isoDateSchema("Data de aquisi\xE7\xE3o inv\xE1lida (use AAAA-MM-DD).").optional(),
  declaredValue: moneySchema.optional(),
  marketValue: moneySchema.optional(),
  venalValue: moneySchema.optional(),
  irGcapValue: moneySchema.optional(),
  emolumentsValue: moneySchema.optional(),
  itbiRate: z19.number().min(0, "Al\xEDquota de ITBI n\xE3o pode ser negativa.").max(100, "Al\xEDquota de ITBI deve estar entre 0 e 100.").optional(),
  hasLaudemio: z19.boolean().default(false),
  laudemioRate: z19.number().min(0, "Al\xEDquota de laudemio n\xE3o pode ser negativa.").max(100, "Al\xEDquota de laudemio deve estar entre 0 e 100.").optional(),
  utility: propertyUtilitySchema.default("PENDENTE"),
  rentValue: moneySchema.optional(),
  encumbranceType: encumbranceTypeSchema.default("PENDENTE"),
  encumbranceNote: z19.string().max(1e3).optional()
}).refine(
  (data) => {
    if (!data.hasRegistration) {
      return Boolean(
        data.alternativeDocType && data.noRegistrationReason && data.noRegistrationReason.trim().length >= 3
      );
    }
    return true;
  },
  {
    message: "Im\xF3veis sem matr\xEDcula exigem documento alternativo (Escritura P\xFAblica ou Contrato de Compra e Venda) e justificativa.",
    path: ["alternativeDocType"]
  }
).refine(
  (data) => {
    if (data.kind === "RURAL") {
      return Boolean(data.ccir?.trim() && data.nirf?.trim());
    }
    return true;
  },
  {
    message: "Im\xF3vel rural exige CCIR e NIRF.",
    path: ["ccir"]
  }
).refine(
  (data) => {
    if (data.hasLaudemio) {
      return data.laudemioRate !== void 0 && data.laudemioRate > 0;
    }
    return true;
  },
  {
    message: "Laud\xEAmio confirmado exige al\xEDquota maior que zero.",
    path: ["laudemioRate"]
  }
).refine(
  (data) => {
    if (data.utility === "LOCACAO_ARRENDAMENTO") {
      return data.rentValue !== void 0 && data.rentValue > 0;
    }
    return true;
  },
  {
    message: "Loca\xE7\xE3o/Arrendamento exige valor de loca\xE7\xE3o maior que zero.",
    path: ["rentValue"]
  }
);
var propertyUpdateSchema = propertyInputSchema.omit({ familyId: true }).extend({ propertyId: z19.string().min(1) });
var propertyOwnerInputSchema = z19.object({
  propertyId: z19.string().min(1),
  personId: z19.string().min(1).optional(),
  companyId: z19.string().min(1).optional(),
  ownershipPercentage: z19.number().positive("Percentual deve ser maior que zero.").max(100, "Percentual deve estar entre 0 e 100."),
  rightType: z19.enum(["PROPRIEDADE", "USUFRUTO", "NUA_PROPRIEDADE"])
}).refine((data) => Boolean(data.personId) !== Boolean(data.companyId), {
  message: "A titularidade exige exatamente um dono: pessoa ou sociedade.",
  path: ["personId"]
});
var propertyOwnerUpdateSchema = z19.object({
  propertyId: z19.string().min(1),
  ownerId: z19.string().min(1),
  personId: z19.string().min(1).optional(),
  companyId: z19.string().min(1).optional(),
  ownershipPercentage: z19.number().positive().max(100).optional(),
  rightType: z19.enum(["PROPRIEDADE", "USUFRUTO", "NUA_PROPRIEDADE"]).optional()
}).refine(
  (data) => {
    if (data.personId === void 0 && data.companyId === void 0) {
      return true;
    }
    return Boolean(data.personId) !== Boolean(data.companyId);
  },
  {
    message: "A titularidade exige exatamente um dono: pessoa ou sociedade.",
    path: ["personId"]
  }
);
var propertyOwnerDeleteSchema = z19.object({
  propertyId: z19.string().min(1),
  ownerId: z19.string().min(1)
});
var removePropertySchema = z19.object({
  familyId: z19.string().min(1),
  propertyId: z19.string().min(1)
});

// server/features/properties/property-router.ts
var propertyRouter = router({
  list: protectedProcedure.input(z20.object({ familyId: z20.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listPropertyRecords(input.familyId);
  }),
  owners: protectedProcedure.input(z20.object({ propertyId: z20.string() })).query(async ({ ctx, input }) => {
    const property = await getPropertyRecord(input.propertyId);
    if (!property) return [];
    await assertFamilyAccess(ctx, property.familyId);
    return listPropertyOwners(input.propertyId);
  }),
  create: protectedProcedure.input(propertyInputSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.PROPERTY_CREATE);
    await assertFamilyAccess(ctx, input.familyId);
    const propertyId = await createPropertyRecord(input);
    const { created, removed } = await reconcileEntityDocuments({
      familyId: input.familyId,
      entityType: "IMOVEL",
      entityId: propertyId,
      categories: computePropertyCategories(input)
    });
    await recordAudit({
      action: "IMOVEL_CRIADO",
      entityType: "IMOVEL",
      entityId: propertyId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { requirements: created, requirementsRemoved: removed }
    });
    return { propertyId };
  }),
  update: protectedProcedure.input(propertyUpdateSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.PROPERTY_UPDATE);
    const property = await getPropertyRecord(input.propertyId);
    if (!property) throw new Error("Im\xF3vel n\xE3o encontrado.");
    await assertFamilyAccess(ctx, property.familyId);
    const result = await updatePropertyRecord(input);
    const updated = await getPropertyRecord(input.propertyId);
    let requirementsCreated = 0;
    let requirementsRemoved = 0;
    if (updated) {
      const reconciled = await reconcileEntityDocuments({
        familyId: property.familyId,
        entityType: "IMOVEL",
        entityId: input.propertyId,
        categories: computePropertyCategories(updated)
      });
      requirementsCreated = reconciled.created;
      requirementsRemoved = reconciled.removed;
    }
    await recordAudit({
      action: "IMOVEL_ATUALIZADO",
      entityType: "IMOVEL",
      entityId: input.propertyId,
      actorUserId: user.id,
      familyId: property.familyId,
      metadata: { requirementsCreated, requirementsRemoved }
    });
    return result;
  }),
  remove: protectedProcedure.input(removePropertySchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.PROPERTY_REMOVE);
    await assertFamilyAccess(ctx, input.familyId);
    const result = await removePropertyRecord(input.familyId, input.propertyId);
    await recordAudit({
      action: "IMOVEL_EXCLUIDO",
      entityType: "IMOVEL",
      entityId: input.propertyId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { archivedDocuments: result.archivedDocuments }
    });
    return result;
  }),
  addOwner: protectedProcedure.input(propertyOwnerInputSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.PROPERTY_ADD_OWNER);
    const property = await getPropertyRecord(input.propertyId);
    if (!property) throw new Error("Im\xF3vel n\xE3o encontrado.");
    await assertFamilyAccess(ctx, property.familyId);
    const ownerId = await addPropertyOwnerRecord(input);
    await recordAudit({ action: "TITULARIDADE_REGISTRADA", entityType: "IMOVEL", entityId: input.propertyId, actorUserId: user.id, familyId: property.familyId, metadata: { ownerId, personId: input.personId ?? "", companyId: input.companyId ?? "", ownershipPercentage: input.ownershipPercentage } });
    return { ownerId };
  }),
  updateOwner: protectedProcedure.input(propertyOwnerUpdateSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.PROPERTY_UPDATE_OWNER);
    const property = await getPropertyRecord(input.propertyId);
    if (!property) throw new Error("Im\xF3vel n\xE3o encontrado.");
    await assertFamilyAccess(ctx, property.familyId);
    await updatePropertyOwnerRecord(input);
    await recordAudit({ action: "TITULARIDADE_ATUALIZADA", entityType: "IMOVEL", entityId: input.propertyId, actorUserId: user.id, familyId: property.familyId, metadata: { ownerId: input.ownerId } });
    return { success: true };
  }),
  removeOwner: protectedProcedure.input(propertyOwnerDeleteSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.PROPERTY_REMOVE_OWNER);
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
import { desc as desc8, eq as eq24 } from "drizzle-orm";
import { z as z21 } from "zod";
init_database();
var userRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    requirePermission(ctx, Permission.USER_LIST);
    const db = await requireDatabase();
    return db.select({ id: users.id, name: users.name, email: users.email, role: users.role }).from(users).orderBy(desc8(users.lastSignedIn));
  }),
  changeRole: protectedProcedure.input(z21.object({ userId: z21.number().int(), role: z21.enum(APP_ROLES) })).mutation(async ({ ctx, input }) => {
    const actor = requirePermission(ctx, Permission.USER_CHANGE_ROLE);
    if (input.userId === actor.id && input.role !== "SOCIO") throw new Error("O SOCIO respons\xE1vel n\xE3o pode remover o pr\xF3prio papel.");
    const db = await requireDatabase();
    await db.update(users).set({ role: input.role }).where(eq24(users.id, input.userId));
    await recordAudit({ action: "PAPEL_ALTERADO", entityType: "USUARIO", entityId: String(input.userId), actorUserId: actor.id, metadata: { role: input.role } });
    return { success: true };
  })
});

// server/features/audit/audit-router.ts
init_schema();
import { desc as desc9, eq as eq25 } from "drizzle-orm";
import { z as z22 } from "zod";
init_database();
var auditRouter = router({
  listByFamily: protectedProcedure.input(z22.object({ familyId: z22.string() })).query(async ({ ctx, input }) => {
    requirePermission(ctx, Permission.AUDIT_LIST_BY_FAMILY);
    await assertFamilyAccess(ctx, input.familyId);
    const db = await requireDatabase();
    return db.select().from(auditLogs).where(eq25(auditLogs.familyId, input.familyId)).orderBy(desc9(auditLogs.createdAt));
  })
});

// server/features/people/first-access-router.ts
import { createHash as createHash5 } from "node:crypto";
import { and as and16, eq as eq26, isNull as isNull4, gt as gt4 } from "drizzle-orm";
import { z as z23 } from "zod";
import bcrypt2 from "bcryptjs";
init_db();
init_database();
init_schema();
var BCRYPT_ROUNDS2 = 12;
function hashToken3(token) {
  return createHash5("sha256").update(token).digest("hex");
}
async function assertExistingClientUsable(db, existing, familyId) {
  if (existing.role !== "CLIENTE") {
    throw new Error("J\xE1 existe uma conta de equipe com este e-mail. Use a redefini\xE7\xE3o de senha para acess\xE1-la.");
  }
  const linked = await db.select({ id: familyAccess.id }).from(familyAccess).where(and16(eq26(familyAccess.userId, existing.id), eq26(familyAccess.familyId, familyId))).limit(1);
  if (!linked[0]) {
    throw new Error("J\xE1 existe uma conta com este e-mail sem v\xEDnculo com esta fam\xEDlia. Contate o s\xF3cio respons\xE1vel.");
  }
  return existing.id;
}
var firstAccessRouter = router({
  verifyToken: publicProcedure.input(z23.object({ token: z23.string().min(16) })).query(async ({ input }) => {
    checkRateLimit(`verify:${input.token}`);
    const db = await requireDatabase();
    const [link] = await db.select().from(firstAccessLinks).where(
      and16(
        eq26(firstAccessLinks.tokenHash, hashToken3(input.token)),
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
  setPassword: publicProcedure.input(z23.object({ token: z23.string().min(16), password: z23.string().min(6) })).mutation(async ({ input }) => {
    checkRateLimit(`setpwd:${input.token}`);
    return withAdvisoryLock(
      requireDatabase(),
      "FIRST_ACCESS",
      input.token,
      // discriminator: token único por link
      async (tx) => {
        const [link] = await tx.select().from(firstAccessLinks).where(
          and16(
            eq26(firstAccessLinks.tokenHash, hashToken3(input.token)),
            isNull4(firstAccessLinks.consumedAt),
            gt4(firstAccessLinks.expiresAt, /* @__PURE__ */ new Date())
          )
        ).limit(1);
        if (!link) throw new Error("Link inv\xE1lido, expirado ou j\xE1 utilizado.");
        const person = await getPersonRecord(link.personId);
        if (!person) throw new Error("Pessoa n\xE3o encontrada.");
        if (!person.email) throw new Error("Pessoa sem e-mail cadastrado. Contate o s\xF3cio.");
        let userId;
        const existing = await getUserByEmail(person.email);
        if (existing) {
          userId = await assertExistingClientUsable(tx, existing, person.familyId);
          const passwordHash = await bcrypt2.hash(input.password, BCRYPT_ROUNDS2);
          await tx.update(users).set({ passwordHash }).where(eq26(users.id, userId));
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
            const raced = await getUserByEmail(person.email);
            if (!raced) throw error;
            if (raced.role !== "CLIENTE") {
              throw new Error("J\xE1 existe uma conta de equipe com este e-mail. Use a redefini\xE7\xE3o de senha para acess\xE1-la.");
            }
            userId = raced.id;
          }
        }
        await tx.insert(familyAccess).values({
          id: createId(),
          familyId: person.familyId,
          userId,
          accessRole: "CLIENTE"
        }).onConflictDoNothing();
        await tx.update(firstAccessLinks).set({ consumedAt: /* @__PURE__ */ new Date() }).where(eq26(firstAccessLinks.id, link.id));
        await recordAuditSafe({
          action: "PRIMEIRO_ACESSO_SENHA_DEFINIDA",
          entityType: "USUARIO",
          entityId: String(userId),
          actorUserId: userId,
          familyId: person.familyId,
          metadata: { personId: person.id, tokenHash: hashToken3(input.token) }
        });
        return { success: true };
      }
    );
  })
});

// server/features/assets/assets-router.ts
import { z as z25 } from "zod";

// server/features/assets/assets-repository.ts
init_schema();
init_database();
import { and as and17, desc as desc10, eq as eq27 } from "drizzle-orm";
async function createAssetRecord(input) {
  const db = await requireDatabase();
  const id = createId();
  await db.insert(otherAssets).values({
    ...input,
    id,
    declaredValue: input.declaredValue.toFixed(2),
    notes: input.notes || null
  });
  return id;
}
async function listAssetRecords(familyId) {
  const db = await requireDatabase();
  return db.select().from(otherAssets).where(eq27(otherAssets.familyId, familyId)).orderBy(desc10(otherAssets.updatedAt));
}
async function getAssetRecord(assetId) {
  const db = await requireDatabase();
  const [result] = await db.select().from(otherAssets).where(eq27(otherAssets.id, assetId)).limit(1);
  return result ?? null;
}
async function updateAssetRecord(input) {
  const db = await requireDatabase();
  const existing = await getAssetRecord(input.assetId);
  if (!existing) throw new Error("Ativo n\xE3o encontrado.");
  await db.update(otherAssets).set({
    category: input.category,
    description: input.description,
    declaredValue: input.declaredValue.toFixed(2),
    ownerPersonId: input.ownerPersonId,
    notes: input.notes || null,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq27(otherAssets.id, input.assetId));
  return { assetId: input.assetId };
}
async function removeAssetRecord(familyId, assetId) {
  const db = await requireDatabase();
  const [asset] = await db.select().from(otherAssets).where(and17(eq27(otherAssets.id, assetId), eq27(otherAssets.familyId, familyId))).limit(1);
  if (!asset) throw new Error("Ativo n\xE3o encontrado nesta fam\xEDlia.");
  const docs = await db.select({ id: documents.id }).from(documents).where(
    and17(eq27(documents.entityType, "ATIVO"), eq27(documents.entityId, assetId))
  );
  for (const doc of docs) {
    await db.update(documents).set({ status: "DISPENSADO" }).where(eq27(documents.id, doc.id));
  }
  await db.delete(otherAssets).where(eq27(otherAssets.id, assetId));
  return { archivedDocuments: docs.length };
}

// server/features/assets/assets-types.ts
init_schema();
import { z as z24 } from "zod";
var assetCategorySchema = z24.enum(assetCategoryValues);
var createAssetSchema = z24.object({
  familyId: z24.string().min(1),
  category: assetCategorySchema,
  description: z24.string().min(2).max(240),
  declaredValue: z24.number().positive("Informe o valor declarado (> 0)."),
  ownerPersonId: z24.string().min(1, "Informe o respons\xE1vel pelo ativo."),
  notes: z24.string().max(1e3).optional()
});
var updateAssetSchema = createAssetSchema.omit({ familyId: true }).extend({ assetId: z24.string().min(1) });
var removeAssetSchema = z24.object({
  familyId: z24.string().min(1),
  assetId: z24.string().min(1)
});

// server/features/assets/assets-router.ts
var assetRouter = router({
  list: protectedProcedure.input(z25.object({ familyId: z25.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listAssetRecords(input.familyId);
  }),
  create: protectedProcedure.input(createAssetSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.ASSET_CREATE);
    await assertFamilyAccess(ctx, input.familyId);
    const assetId = await createAssetRecord(input);
    const { created, removed } = await reconcileEntityDocuments({
      familyId: input.familyId,
      entityType: "ATIVO",
      entityId: assetId,
      categories: computeAssetCategories()
    });
    await recordAudit({
      action: "ATIVO_CRIADO",
      entityType: "ATIVO",
      entityId: assetId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { category: input.category, description: input.description, requirements: created, requirementsRemoved: removed }
    });
    return { assetId };
  }),
  update: protectedProcedure.input(updateAssetSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.ASSET_UPDATE);
    const asset = await getAssetRecord(input.assetId);
    if (!asset) throw new Error("Ativo n\xE3o encontrado.");
    await assertFamilyAccess(ctx, asset.familyId);
    const result = await updateAssetRecord(input);
    const { created, removed } = await reconcileEntityDocuments({
      familyId: asset.familyId,
      entityType: "ATIVO",
      entityId: input.assetId,
      categories: computeAssetCategories()
    });
    await recordAudit({
      action: "ATIVO_ATUALIZADO",
      entityType: "ATIVO",
      entityId: input.assetId,
      actorUserId: user.id,
      familyId: asset.familyId,
      metadata: { category: input.category, description: input.description, requirementsCreated: created, requirementsRemoved: removed }
    });
    return result;
  }),
  remove: protectedProcedure.input(removeAssetSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.ASSET_REMOVE);
    await assertFamilyAccess(ctx, input.familyId);
    const result = await removeAssetRecord(input.familyId, input.assetId);
    await recordAudit({
      action: "ATIVO_EXCLUIDO",
      entityType: "ATIVO",
      entityId: input.assetId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { archivedDocuments: result.archivedDocuments }
    });
    return result;
  })
});

// server/features/proposals/proposal-router.ts
import { z as z27 } from "zod";

// server/features/proposals/proposal-repository.ts
init_schema();
init_database();
import { desc as desc11, eq as eq28 } from "drizzle-orm";
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
  return db.select().from(financialProposals).where(eq28(financialProposals.familyId, familyId)).orderBy(desc11(financialProposals.createdAt));
}
async function getProposalRecord(proposalId) {
  const db = await requireDatabase();
  const [result] = await db.select().from(financialProposals).where(eq28(financialProposals.id, proposalId)).limit(1);
  return result ?? null;
}
async function acceptProposalRecord(proposalId, clientNotes) {
  const db = await requireDatabase();
  await db.update(financialProposals).set({
    status: "ACEITA",
    clientNotes: clientNotes || null,
    acceptedAt: /* @__PURE__ */ new Date()
  }).where(eq28(financialProposals.id, proposalId));
}
async function submitCounterProposalRecord(input) {
  const db = await requireDatabase();
  await db.update(financialProposals).set({
    status: "CONTRAPROPOSTA_RECEBIDA",
    counterProposalValue: input.counterProposalValue.toFixed(2),
    counterProposalNotes: input.counterProposalNotes
  }).where(eq28(financialProposals.id, input.proposalId));
}
async function reviewCounterProposalRecord(input) {
  const db = await requireDatabase();
  const status = input.decision === "ACEITAR" ? "ACEITA" : "RECUSADA";
  await db.update(financialProposals).set({
    status,
    approvedBySocioId: String(input.socioUserId),
    acceptedAt: input.decision === "ACEITAR" ? /* @__PURE__ */ new Date() : null,
    clientNotes: input.notes || null
  }).where(eq28(financialProposals.id, input.proposalId));
}

// server/features/proposals/proposal-types.ts
import { z as z26 } from "zod";
var proposalStatusSchema = z26.enum([
  "RASCUNHO",
  "ENVIADA",
  "ACEITA",
  "CONTRAPROPOSTA_RECEBIDA",
  "RECUSADA"
]);
var createProposalSchema = z26.object({
  familyId: z26.string().min(1),
  scopeDescription: z26.string().min(10, "Descri\xE7\xE3o do escopo de trabalho deve ter ao menos 10 caracteres."),
  proposedValue: z26.number().positive("Valor da proposta deve ser maior que zero.")
});
var acceptProposalSchema = z26.object({
  proposalId: z26.string().min(1),
  clientNotes: z26.string().max(1e3).optional()
});
var counterProposalSchema = z26.object({
  proposalId: z26.string().min(1),
  counterProposalValue: z26.number().positive("Valor da contraproposta deve ser maior que zero."),
  counterProposalNotes: z26.string().min(3, "Justificativa da contraproposta \xE9 obrigat\xF3ria.").max(1e3)
});
var reviewCounterProposalSchema = z26.object({
  proposalId: z26.string().min(1),
  decision: z26.enum(["ACEITAR", "RECUSAR"]),
  notes: z26.string().max(1e3).optional()
});

// server/features/proposals/proposal-router.ts
var proposalRouter = router({
  list: protectedProcedure.input(z27.object({ familyId: z27.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listProposalRecords(input.familyId);
  }),
  create: protectedProcedure.input(createProposalSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.PROPOSAL_CREATE);
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
    const user = requirePermission(ctx, Permission.PROPOSAL_REVIEW_COUNTER);
    const proposal = await getProposalRecord(input.proposalId);
    if (!proposal) throw new Error("Proposta financeira n\xE3o encontrada.");
    await reviewCounterProposalRecord({
      proposalId: input.proposalId,
      decision: input.decision,
      socioUserId: user.id,
      notes: input.notes
    });
    await recordAudit({
      action: input.decision === "ACEITAR" ? "CONTRAPROPOSTA_ACEITA_PELO_SOCIO" : "CONTRAPROPOSTA_RECUSADA_PELO_SOCIO",
      entityType: "PROPOSTA_FINANCEIRA",
      entityId: input.proposalId,
      actorUserId: user.id,
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
    const result = await createLeadRecord(input);
    await recordAuditSafe({
      action: "LEAD_CRIADO",
      entityType: "LEAD",
      entityId: result.leadId,
      familyId: result.familyId,
      metadata: { source: "public_form" }
    });
    return result;
  }),
  list: protectedProcedure.query(async ({ ctx }) => {
    requirePermission(ctx, Permission.LEAD_LIST);
    return listLeadRecords();
  }),
  accept: protectedProcedure.input(leadAcceptSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.LEAD_ACCEPT);
    const result = await acceptLeadRecord(input, user.id);
    await recordAuditSafe({ action: "INTERESSADO_ACEITO", entityType: "FAMILIA", entityId: result.familyId, actorUserId: user.id, familyId: result.familyId });
    return result;
  }),
  reject: protectedProcedure.input(leadRejectSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.LEAD_REJECT);
    const result = await rejectLeadRecord(input.leadId, user.id, input.reviewNote);
    await recordAuditSafe({ action: "INTERESSADO_RECUSADO", entityType: "INTERESSADO", entityId: input.leadId, actorUserId: user.id });
    return result;
  })
});

// server/features/certidoes/certidao-router.ts
import { z as z28 } from "zod";
var certidaoRouter = router({
  list: protectedProcedure.input(z28.object({ familyId: z28.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listCertidaoRecords(input.familyId);
  }),
  summary: protectedProcedure.input(z28.object({ familyId: z28.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return getProjectAlertSummary(input.familyId);
  }),
  generate: protectedProcedure.input(z28.object({ familyId: z28.string() })).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.CERTIDAO_GENERATE);
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
    const user = requirePermission(ctx, Permission.CERTIDAO_UPDATE_STATUS);
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

// server/features/address/address-router.ts
import { z as z29 } from "zod";

// server/features/address/viacep-client.ts
var TIMEOUT_MS = 4e3;
var USER_AGENT = "LWOS-App/1.0 (Family Office Platform; contato@lucathi.com.br)";
function sanitizeCep(raw) {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 8 ? digits : null;
}
async function fetchWithTimeout(url, timeoutMs, headers) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal, headers });
  } finally {
    clearTimeout(timer);
  }
}
async function fetchFromViaCep(cleanCep) {
  try {
    const url = `https://viacep.com.br/ws/${cleanCep}/json/`;
    const response = await fetchWithTimeout(url, TIMEOUT_MS);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.erro === true || data.erro === "true") return null;
    return {
      cep: cleanCep,
      street: (data.logradouro ?? "").trim(),
      complement: (data.complemento ?? "").trim(),
      district: (data.bairro ?? "").trim(),
      city: (data.localidade ?? "").trim(),
      uf: (data.uf ?? "").trim().toUpperCase(),
      source: "VIACEP"
    };
  } catch {
    return null;
  }
}
async function fetchFromBrasilApi(cleanCep) {
  try {
    const url = `https://brasilapi.com.br/api/cep/v1/${cleanCep}`;
    const response = await fetchWithTimeout(url, TIMEOUT_MS, { "User-Agent": USER_AGENT });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      cep: cleanCep,
      street: (data.street ?? "").trim(),
      complement: "",
      district: (data.neighborhood ?? "").trim(),
      city: (data.city ?? "").trim(),
      uf: (data.state ?? "").trim().toUpperCase(),
      source: "BRASILAPI"
    };
  } catch {
    return null;
  }
}
async function lookupAddressByCep(rawCep) {
  const cleanCep = sanitizeCep(rawCep);
  if (!cleanCep) return null;
  const viaCepResult = await fetchFromViaCep(cleanCep);
  if (viaCepResult) return viaCepResult;
  return fetchFromBrasilApi(cleanCep);
}

// server/features/address/address-router.ts
var addressRouter = router({
  lookupCep: protectedProcedure.input(z29.object({ cep: z29.string().min(1, "Informe o CEP.") })).query(async ({ input }) => {
    return lookupAddressByCep(input.cep);
  })
});

// server/features/birthdays/birthday-router.ts
import { TRPCError as TRPCError5 } from "@trpc/server";

// server/features/birthdays/birthday-repository.ts
init_schema();
init_database();
import { asc as asc2, eq as eq29 } from "drizzle-orm";
async function listProjectBirthdays() {
  try {
    const db = await requireDatabase();
    return await db.select({
      id: people.id,
      fullName: people.fullName,
      birthDate: people.birthDate,
      vinculo: people.vinculo,
      projectName: families.name
    }).from(people).leftJoin(families, eq29(people.familyId, families.id)).orderBy(asc2(people.fullName));
  } catch (cause) {
    throw new Error("N\xE3o foi poss\xEDvel consultar os anivers\xE1rios dos projetos.", {
      cause
    });
  }
}

// server/features/birthdays/birthday-router.ts
var birthdayRouter = router({
  list: protectedProcedure.query(({ ctx }) => {
    if (ctx.user?.role !== "SOCIO") {
      throw new TRPCError5({
        code: "FORBIDDEN",
        message: "Acesso restrito ao perfil S\xF3cio."
      });
    }
    return listProjectBirthdays();
  })
});

// server/routers.ts
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  address: addressRouter,
  birthdays: birthdayRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      if (ctx.sessionJti && ctx.user) {
        await revokeSession(ctx.sessionJti, ctx.user.id, "LOGOUT");
      }
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
  let sessionJti = null;
  try {
    const session = await authenticateRequest(opts.req);
    user = session.user;
    sessionJti = session.jti;
  } catch {
    user = null;
    sessionJti = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user,
    sessionJti
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
