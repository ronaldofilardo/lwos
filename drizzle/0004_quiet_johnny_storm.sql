CREATE TYPE "public"."leadStatus" AS ENUM('PENDENTE', 'ACEITO', 'RECUSADO');--> statement-breakpoint
CREATE TABLE "leads" (
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
