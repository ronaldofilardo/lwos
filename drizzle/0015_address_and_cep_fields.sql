ALTER TABLE "companyDetails" ADD COLUMN IF NOT EXISTS "cep" varchar(8);--> statement-breakpoint
ALTER TABLE "companyDetails" ADD COLUMN IF NOT EXISTS "street" varchar(160);--> statement-breakpoint
ALTER TABLE "companyDetails" ADD COLUMN IF NOT EXISTS "number" varchar(20);--> statement-breakpoint
ALTER TABLE "companyDetails" ADD COLUMN IF NOT EXISTS "complement" varchar(80);--> statement-breakpoint
ALTER TABLE "companyDetails" ADD COLUMN IF NOT EXISTS "district" varchar(80);--> statement-breakpoint
ALTER TABLE "companyDetails" ADD COLUMN IF NOT EXISTS "city" varchar(120);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "cep" varchar(8);
