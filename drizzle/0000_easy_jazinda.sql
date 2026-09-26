CREATE TYPE "public"."accessRole" AS ENUM('RESPONSAVEL', 'CLIENTE');--> statement-breakpoint
CREATE TYPE "public"."civilStatus" AS ENUM('SOLTEIRO', 'DIVORCIADO', 'VIUVO', 'CASADO', 'UNIAO_ESTAVEL');--> statement-breakpoint
CREATE TYPE "public"."companyType" AS ENUM('HOLDING_NACIONAL', 'SOCIEDADE_NACIONAL');--> statement-breakpoint
CREATE TYPE "public"."contributionStatus" AS ENUM('RASCUNHO', 'EM_ANALISE', 'CONCLUIDA');--> statement-breakpoint
CREATE TYPE "public"."documentStatus" AS ENUM('PENDENTE', 'RECEBIDO_EM_ANALISE', 'VALIDADO', 'REJEITADO', 'VENCIDO', 'NA');--> statement-breakpoint
CREATE TYPE "public"."entityType" AS ENUM('FAMILIA', 'PESSOA', 'IMOVEL', 'SOCIEDADE');--> statement-breakpoint
CREATE TYPE "public"."maritalRegime" AS ENUM('CPB', 'CUB', 'STB', 'STOB', 'NA');--> statement-breakpoint
CREATE TYPE "public"."projectStatus" AS ENUM('EM_ANDAMENTO', 'AGUARDANDO_DOCUMENTOS', 'EM_REVISAO', 'CONCLUIDO');--> statement-breakpoint
CREATE TYPE "public"."rightType" AS ENUM('PROPRIEDADE', 'USUFRUTO', 'NUA_PROPRIEDADE');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('SOCIO', 'ANALISTA', 'ADMIN', 'CLIENTE');--> statement-breakpoint
CREATE TABLE "auditLogs" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"familyId" varchar(36),
	"actorUserId" varchar(36),
	"action" varchar(120) NOT NULL,
	"entityType" varchar(80) NOT NULL,
	"entityId" varchar(36) NOT NULL,
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"familyId" varchar(36) NOT NULL,
	"legalName" varchar(180) NOT NULL,
	"taxNumber" varchar(20),
	"type" "companyType" DEFAULT 'HOLDING_NACIONAL' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companyStakeholders" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"companyId" varchar(36) NOT NULL,
	"personId" varchar(36) NOT NULL,
	"percentage" numeric(5, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documentVersions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"documentId" varchar(36) NOT NULL,
	"versionNumber" integer NOT NULL,
	"originalName" varchar(255) NOT NULL,
	"mimeType" varchar(120) NOT NULL,
	"storageKey" varchar(500) NOT NULL,
	"sha256" varchar(64) NOT NULL,
	"uploadedBy" varchar(36) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"familyId" varchar(36) NOT NULL,
	"entityType" "entityType" NOT NULL,
	"entityId" varchar(36) NOT NULL,
	"category" varchar(80) NOT NULL,
	"status" "documentStatus" DEFAULT 'PENDENTE' NOT NULL,
	"rejectionReason" text,
	"currentVersion" integer DEFAULT 0 NOT NULL,
	"validUntil" date,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encumbrances" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"propertyId" varchar(36) NOT NULL,
	"type" varchar(120) NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "families" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"civilStatus" "civilStatus" NOT NULL,
	"maritalRegime" "maritalRegime" NOT NULL,
	"notes" text,
	"createdBy" varchar(36) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "familyAccess" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"familyId" varchar(36) NOT NULL,
	"userId" integer NOT NULL,
	"accessRole" "accessRole" DEFAULT 'CLIENTE' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lwrReports" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"familyId" varchar(36) NOT NULL,
	"version" integer NOT NULL,
	"baseDate" date NOT NULL,
	"responsibleUserId" varchar(36) NOT NULL,
	"proposedStructure" text NOT NULL,
	"financialProposal" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"familyId" varchar(36) NOT NULL,
	"fullName" varchar(160) NOT NULL,
	"email" varchar(320),
	"taxId" varchar(20),
	"birthDate" date,
	"civilStatus" "civilStatus" NOT NULL,
	"maritalRegime" "maritalRegime" NOT NULL,
	"exSpouseNote" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portalLinks" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"familyId" varchar(36) NOT NULL,
	"tokenHash" varchar(64) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"revokedAt" timestamp,
	"createdBy" varchar(36) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "portalLinks_tokenHash_unique" UNIQUE("tokenHash")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"familyId" varchar(36) NOT NULL,
	"title" varchar(160) NOT NULL,
	"status" "projectStatus" DEFAULT 'EM_ANDAMENTO' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_familyId_unique" UNIQUE("familyId")
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"familyId" varchar(36) NOT NULL,
	"description" varchar(240) NOT NULL,
	"registrationNumber" varchar(120),
	"registryOffice" varchar(160),
	"propertyCity" varchar(120) NOT NULL,
	"registryCity" varchar(120),
	"acquisitionDate" date,
	"declaredValue" numeric(15, 2),
	"marketValue" numeric(15, 2),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "propertyContributions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"propertyId" varchar(36) NOT NULL,
	"companyId" varchar(36) NOT NULL,
	"percentage" numeric(5, 2) NOT NULL,
	"status" "contributionStatus" DEFAULT 'RASCUNHO' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "propertyOwners" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"propertyId" varchar(36) NOT NULL,
	"personId" varchar(36) NOT NULL,
	"ownershipPercentage" numeric(5, 2) NOT NULL,
	"rightType" "rightType" DEFAULT 'PROPRIEDADE' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'CLIENTE' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE INDEX "audit_family_idx" ON "auditLogs" USING btree ("familyId");--> statement-breakpoint
CREATE INDEX "companies_family_idx" ON "companies" USING btree ("familyId");--> statement-breakpoint
CREATE UNIQUE INDEX "document_version_unique" ON "documentVersions" USING btree ("documentId","versionNumber");--> statement-breakpoint
CREATE INDEX "documents_family_idx" ON "documents" USING btree ("familyId");--> statement-breakpoint
CREATE UNIQUE INDEX "family_access_unique" ON "familyAccess" USING btree ("familyId","userId");--> statement-breakpoint
CREATE INDEX "family_access_user_idx" ON "familyAccess" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "people_family_idx" ON "people" USING btree ("familyId");--> statement-breakpoint
CREATE INDEX "properties_family_idx" ON "properties" USING btree ("familyId");