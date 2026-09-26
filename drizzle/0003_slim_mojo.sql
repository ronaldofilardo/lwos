CREATE TYPE "public"."assetCategory" AS ENUM('INVESTIMENTO', 'VEICULO', 'PARTICIPACAO_OUTRA', 'DIREITO', 'OUTRO');--> statement-breakpoint
CREATE TYPE "public"."proposalStatus" AS ENUM('RASCUNHO', 'ENVIADA', 'ACEITA', 'CONTRAPROPOSTA_RECEBIDA', 'RECUSADA');--> statement-breakpoint
ALTER TYPE "public"."documentStatus" ADD VALUE 'DISPENSADO' BEFORE 'NA';--> statement-breakpoint
CREATE TABLE "financialProposals" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"familyId" varchar(36) NOT NULL,
	"scopeDescription" text NOT NULL,
	"proposedValue" numeric(15, 2) NOT NULL,
	"status" "proposalStatus" DEFAULT 'RASCUNHO' NOT NULL,
	"counterProposalValue" numeric(15, 2),
	"counterProposalNotes" text,
	"clientNotes" text,
	"acceptedAt" timestamp,
	"approvedBySocioId" varchar(36),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otherAssets" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"familyId" varchar(36) NOT NULL,
	"category" "assetCategory" DEFAULT 'OUTRO' NOT NULL,
	"description" varchar(240) NOT NULL,
	"declaredValue" numeric(15, 2),
	"marketValue" numeric(15, 2),
	"ownerPersonId" varchar(36),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "dispensationReason" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "dispensationRequestedBy" varchar(36);--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "dispensationApprovedBy" varchar(36);--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "dispensedAt" timestamp;--> statement-breakpoint
ALTER TABLE "lwrReports" ADD COLUMN "canvaUrl" text;--> statement-breakpoint
ALTER TABLE "lwrReports" ADD COLUMN "presentationFileKey" varchar(500);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "hasRegistration" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "alternativeDocType" varchar(80);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "noRegistrationReason" text;--> statement-breakpoint
CREATE INDEX "financial_proposals_family_idx" ON "financialProposals" USING btree ("familyId");--> statement-breakpoint
CREATE INDEX "other_assets_family_idx" ON "otherAssets" USING btree ("familyId");