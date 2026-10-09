CREATE TYPE "public"."propertyEncumbranceType" AS ENUM('PENDENTE', 'ALIENACAO_FIDUCIARIA', 'ARROLAMENTO', 'HIPOTECA', 'INCOMUNICABILIDADE_INALIENABILIDADE_IMPENHORABILIDADE', 'NA', 'NAO_HA', 'OUTROS', 'PENHORA', 'SERVIDAO_PASSAGEM', 'USUFRUTO');--> statement-breakpoint
CREATE TYPE "public"."projectObjective" AS ENUM('PROTECAO_PATRIMONIAL', 'PLANEJAMENTO_SUCESSORIO', 'GOVERNANCA_FAMILIAR_OU_SOCIETARIA', 'PREVENCAO_DE_CONFLITOS_ENTRE_HERDEIROS', 'FORMALIZACAO_DE_RELACIONAMENTOS', 'SEGURO_DE_VIDA', 'SEGURO_SAUDE', 'EFICIENCIA_FISCAL', 'REESTRUTURACAO_SOCIETARIA', 'DIVERSIFICACAO_DE_JURISDICAO_E_MOEDA', 'FUNDOS_DE_INVESTIMENTOS', 'SAIDA_DEFINITIVA_DO_BRASIL', 'REPERFILAMENTO_DE_DIVIDA', 'FILANTROPIA');--> statement-breakpoint
CREATE TYPE "public"."propertyKind" AS ENUM('URBANO', 'RURAL');--> statement-breakpoint
CREATE TYPE "public"."propertyUtility" AS ENUM('ATIVIDADE_INDUSTRIAL_COMERCIAL', 'ATIVIDADE_RURAL', 'INVESTIMENTO', 'LAZER', 'LOCACAO_ARRENDAMENTO', 'OUTRA', 'PENDENTE', 'RESIDENCIAL');--> statement-breakpoint
CREATE TYPE "public"."societaryType" AS ENUM('LTDA', 'SA', 'SCP');--> statement-breakpoint
CREATE TYPE "public"."taxRegime" AS ENUM('SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL');--> statement-breakpoint
CREATE TYPE "public"."uf" AS ENUM('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO');--> statement-breakpoint
ALTER TYPE "public"."documentStatus" ADD VALUE 'NAO_POSSUI';--> statement-breakpoint
CREATE TABLE "projectObjectives" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"projectId" varchar(36) NOT NULL,
	"objective" "projectObjective" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "companyDetailDocs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "encumbrances" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "propertyContributions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "companyDetailDocs" CASCADE;--> statement-breakpoint
DROP TABLE "encumbrances" CASCADE;--> statement-breakpoint
DROP TABLE "propertyContributions" CASCADE;--> statement-breakpoint
ALTER TABLE "otherAssets" ALTER COLUMN "category" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "otherAssets" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."assetCategory";--> statement-breakpoint
CREATE TYPE "public"."assetCategory" AS ENUM('ATIVOS_AGRO', 'CONTA_CORRENTE', 'CREDITO', 'DINHEIRO_ESPECIE', 'INVESTIMENTOS', 'OUTROS', 'SEMOVENTES', 'VEICULO_EMBARCACAO_AERONAVE');--> statement-breakpoint
ALTER TABLE "otherAssets" ALTER COLUMN "category" SET DATA TYPE "public"."assetCategory" USING "category"::"public"."assetCategory";--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'ATIVO'::text;--> statement-breakpoint
DROP TYPE "public"."projectStatus";--> statement-breakpoint
CREATE TYPE "public"."projectStatus" AS ENUM('ATIVO', 'SUSPENSO', 'CONCLUIDO', 'CANCELADO');--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'ATIVO'::"public"."projectStatus";--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET DATA TYPE "public"."projectStatus" USING "status"::"public"."projectStatus";--> statement-breakpoint
ALTER TABLE "companyDetails" ALTER COLUMN "uf" SET DATA TYPE "public"."uf" USING "uf"::"public"."uf";--> statement-breakpoint
ALTER TABLE "companyDetails" ALTER COLUMN "societaryType" SET DATA TYPE "public"."societaryType" USING "societaryType"::"public"."societaryType";--> statement-breakpoint
ALTER TABLE "companyDetails" ALTER COLUMN "taxRegime" SET DATA TYPE "public"."taxRegime" USING "taxRegime"::"public"."taxRegime";--> statement-breakpoint
ALTER TABLE "otherAssets" ALTER COLUMN "declaredValue" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "otherAssets" ALTER COLUMN "ownerPersonId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "propertyOwners" ALTER COLUMN "personId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "isOffshore" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "issuedAt" date;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "referenceDate" date;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "apostilled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "translated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "phone" varchar(20);--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "cep" varchar(8);--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "street" varchar(160);--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "number" varchar(20);--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "complement" varchar(80);--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "district" varchar(80);--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "city" varchar(120);--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "uf" varchar(2);--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "addressSameAsPrimary" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "isDependent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "kind" "propertyKind";--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "registryOfficeNumber" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "registryUf" varchar(2);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "uf" varchar(2);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "irpfBalanceValue" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "venalValue" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "irGcapValue" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "emolumentsValue" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "itbiRate" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "hasLaudemio" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "laudemioRate" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "utility" "propertyUtility" DEFAULT 'PENDENTE' NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "rentValue" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "inscricaoImobiliaria" varchar(120);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "ccir" varchar(40);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "nirf" varchar(40);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "encumbranceType" "propertyEncumbranceType" DEFAULT 'PENDENTE' NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "encumbranceNote" text;--> statement-breakpoint
ALTER TABLE "propertyOwners" ADD COLUMN "companyId" varchar(36);--> statement-breakpoint
CREATE UNIQUE INDEX "project_objective_unique" ON "projectObjectives" USING btree ("projectId","objective");--> statement-breakpoint
CREATE UNIQUE INDEX "companies_family_tax_number_unique" ON "companies" USING btree ("familyId","taxNumber");--> statement-breakpoint
CREATE UNIQUE INDEX "people_family_taxid_unique" ON "people" USING btree ("familyId","taxId");--> statement-breakpoint
CREATE UNIQUE INDEX "people_conjuge_unique" ON "people" USING btree ("familyId") WHERE "people"."vinculo" = 'CONJUGE';--> statement-breakpoint
CREATE UNIQUE INDEX "property_owner_person_unique" ON "propertyOwners" USING btree ("propertyId","personId");--> statement-breakpoint
CREATE UNIQUE INDEX "property_owner_company_unique" ON "propertyOwners" USING btree ("propertyId","companyId");--> statement-breakpoint
ALTER TABLE "companies" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "families" DROP COLUMN "civilStatus";--> statement-breakpoint
ALTER TABLE "families" DROP COLUMN "maritalRegime";--> statement-breakpoint
ALTER TABLE "otherAssets" DROP COLUMN "marketValue";--> statement-breakpoint
ALTER TABLE "properties" DROP COLUMN "registryOffice";--> statement-breakpoint
ALTER TABLE "properties" DROP COLUMN "declaredValue";--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_tax_number_ck" CHECK ("companies"."isOffshore" = true OR "companies"."taxNumber" IS NOT NULL);--> statement-breakpoint
ALTER TABLE "otherAssets" ADD CONSTRAINT "other_assets_declared_value_ck" CHECK ("otherAssets"."declaredValue" > 0);--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_registry_office_number_ck" CHECK ("properties"."registryOfficeNumber" BETWEEN 1 AND 55);--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_values_non_negative_ck" CHECK ("properties"."irpfBalanceValue" >= 0 AND "properties"."marketValue" >= 0 AND "properties"."venalValue" >= 0 AND "properties"."irGcapValue" >= 0 AND "properties"."emolumentsValue" >= 0);--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_itbi_rate_ck" CHECK ("properties"."itbiRate" >= 0 AND "properties"."itbiRate" <= 100);--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_laudemio_ck" CHECK (NOT "properties"."hasLaudemio" OR ("properties"."laudemioRate" IS NOT NULL AND "properties"."laudemioRate" > 0));--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_rent_value_ck" CHECK ("properties"."utility" <> 'LOCACAO_ARRENDAMENTO' OR ("properties"."rentValue" IS NOT NULL AND "properties"."rentValue" > 0));--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_rural_docs_ck" CHECK ("properties"."kind" IS DISTINCT FROM 'RURAL' OR ("properties"."ccir" IS NOT NULL AND "properties"."nirf" IS NOT NULL));--> statement-breakpoint
ALTER TABLE "propertyOwners" ADD CONSTRAINT "property_owner_exactly_one_ck" CHECK ((CASE WHEN "propertyOwners"."personId" IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN "propertyOwners"."companyId" IS NOT NULL THEN 1 ELSE 0 END) = 1);--> statement-breakpoint
DROP TYPE "public"."companyDocStatus";--> statement-breakpoint
DROP TYPE "public"."companyDocType";--> statement-breakpoint
DROP TYPE "public"."companyType";--> statement-breakpoint
DROP TYPE "public"."contributionStatus";--> statement-breakpoint
DROP TYPE "public"."encumbranceType";