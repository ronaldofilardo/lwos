ALTER TABLE "companyStakeholders" ADD COLUMN IF NOT EXISTS "externalCpf" varchar(14);--> statement-breakpoint
ALTER TABLE "companyDetails" ADD COLUMN IF NOT EXISTS "administrator1PersonId" varchar(36);--> statement-breakpoint
ALTER TABLE "companyDetails" ADD COLUMN IF NOT EXISTS "administrator2PersonId" varchar(36);
