CREATE TYPE "public"."companyDocStatus" AS ENUM('PENDENTE', 'RECEBIDO', 'NA', 'NAO_POSSUI');--> statement-breakpoint
CREATE TYPE "public"."companyDocType" AS ENUM('CONTRATO_SOCIAL', 'BALANCO_FECHADO', 'BALANCETE_ATUALIZADO', 'ACORDO_SOCIOS', 'LIVRO_RAZAO_IMOBILIZADO', 'LIVRO_REGISTRO_ACOES_NOMINATIVAS', 'LIVRO_TRANSFERENCIA_ACOES', 'MEMORANDUM_ARTICLES', 'BALANCE_SHEET', 'CERTIFICATE_INCORPORATION', 'REGISTER_DIRECTORS', 'REGISTER_MEMBERS', 'CERTIFICATE_GOOD_STANDING', 'SHARE_CERTIFICATE');--> statement-breakpoint
CREATE TYPE "public"."companyJurisdiction" AS ENUM('BVI', 'BAHAMAS', 'DELAWARE', 'ILHAS_MARSHALL', 'CAYMAN', 'UK', 'PANAMA');--> statement-breakpoint
CREATE TABLE "companyDetailDocs" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"companyId" varchar(36) NOT NULL,
	"docType" "companyDocType" NOT NULL,
	"status" "companyDocStatus" DEFAULT 'PENDENTE' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companyDetails" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"companyId" varchar(36) NOT NULL,
	"nire" varchar(20),
	"uf" varchar(2),
	"sede" varchar(160),
	"societaryType" varchar(60),
	"taxRegime" varchar(60),
	"corporatePurpose" text,
	"capitalSocial" numeric(15, 2),
	"shareQuantity" numeric(15, 2),
	"administrator1" varchar(120),
	"administrator2" varchar(120),
	"equity" numeric(15, 2),
	"cashAndEquivalents" numeric(15, 2),
	"inventory" numeric(15, 2),
	"accountsReceivable" numeric(15, 2),
	"investments" numeric(15, 2),
	"fixedAssets" numeric(15, 2),
	"retainedEarnings" numeric(15, 2),
	"taxLiabilities" numeric(15, 2),
	"laborLiabilities" numeric(15, 2),
	"financing" numeric(15, 2),
	"estimatedMarketValue" numeric(15, 2),
	"companyNumber" varchar(60),
	"jurisdiction" "companyJurisdiction",
	"residentAgent" varchar(120),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "company_detail_doc_unique" ON "companyDetailDocs" USING btree ("companyId","docType");--> statement-breakpoint
CREATE INDEX "company_detail_docs_idx" ON "companyDetailDocs" USING btree ("companyId");--> statement-breakpoint
CREATE UNIQUE INDEX "company_details_unique" ON "companyDetails" USING btree ("companyId");