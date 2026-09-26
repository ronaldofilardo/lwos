CREATE TYPE "public"."certidaoScope" AS ENUM('PESSOA', 'SOCIEDADE');--> statement-breakpoint
CREATE TYPE "public"."certidaoStatus" AS ENUM('PENDENTE', 'NEGATIVA', 'POSITIVA_COM_EFEITOS_DE_NEGATIVA', 'SOMENTE_FISICA', 'POSITIVA');--> statement-breakpoint
CREATE TYPE "public"."certidaoType" AS ENUM('CND_FEDERAL', 'CND_ESTADUAL', 'CND_MUNICIPAL', 'CERTIDAO_TJ', 'CERTIDAO_TRF', 'CNAT', 'CNDT', 'CERTIDAO_PROTESTOS');--> statement-breakpoint
CREATE TYPE "public"."encumbranceType" AS ENUM('HIPOTECA', 'ALIENACAO_FIDUCIARIA', 'PENHOR', 'USUFRUTO', 'SERVIDAO', 'SEQUESTRO', 'OUTRO');--> statement-breakpoint
ALTER TYPE "public"."companyType" ADD VALUE 'HOLDING_INTERNACIONAL' BEFORE 'SOCIEDADE_NACIONAL';--> statement-breakpoint
ALTER TYPE "public"."entityType" ADD VALUE 'ATIVO';--> statement-breakpoint
ALTER TYPE "public"."entityType" ADD VALUE 'CERTIDAO';--> statement-breakpoint
CREATE TABLE "certidoes" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"familyId" varchar(36) NOT NULL,
	"scope" "certidaoScope" NOT NULL,
	"subjectId" varchar(36) NOT NULL,
	"type" "certidaoType" NOT NULL,
	"status" "certidaoStatus" DEFAULT 'PENDENTE' NOT NULL,
	"validUntil" date,
	"documentId" varchar(36),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "companyStakeholders" ALTER COLUMN "personId" DROP NOT NULL;--> statement-breakpoint
UPDATE "encumbrances" SET "description" = COALESCE("description" || E'\n', '') || 'Tipo original: ' || "type" WHERE "type" NOT IN ('HIPOTECA', 'ALIENACAO_FIDUCIARIA', 'PENHOR', 'USUFRUTO', 'SERVIDAO', 'SEQUESTRO', 'OUTRO');--> statement-breakpoint
ALTER TABLE "encumbrances" ALTER COLUMN "type" SET DATA TYPE "public"."encumbranceType" USING (CASE WHEN "type" IN ('HIPOTECA', 'ALIENACAO_FIDUCIARIA', 'PENHOR', 'USUFRUTO', 'SERVIDAO', 'SEQUESTRO', 'OUTRO') THEN "type"::"public"."encumbranceType" ELSE 'OUTRO'::"public"."encumbranceType" END);--> statement-breakpoint
ALTER TABLE "companyStakeholders" ADD COLUMN "externalName" varchar(160);--> statement-breakpoint
CREATE UNIQUE INDEX "certidao_unique" ON "certidoes" USING btree ("subjectId","type");--> statement-breakpoint
CREATE INDEX "certidoes_family_idx" ON "certidoes" USING btree ("familyId");--> statement-breakpoint
CREATE UNIQUE INDEX "stakeholder_person_unique" ON "companyStakeholders" USING btree ("companyId","personId");--> statement-breakpoint
CREATE UNIQUE INDEX "stakeholder_external_unique" ON "companyStakeholders" USING btree ("companyId","externalName");