CREATE TABLE "fileBlobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(600) NOT NULL UNIQUE,
	"fileName" varchar(300) NOT NULL,
	"mimeType" varchar(150) NOT NULL,
	"sizeBytes" integer NOT NULL CHECK ("sizeBytes" > 0 AND "sizeBytes" <= 5242880),
	"sha256" varchar(64) NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
COMMENT ON TABLE "fileBlobs" IS 'Arquivos do MVP armazenados no banco (≤5MB). Chave referência usada por storageProxy e document uploads.';