CREATE TYPE "public"."vinculo" AS ENUM('TITULAR', 'CONJUGE', 'FILHO', 'NETO', 'BISNETO');--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "vinculo" "vinculo";--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "parentPersonId" varchar(36);--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "spouseName" varchar(160);--> statement-breakpoint
UPDATE "people" SET "vinculo" = 'TITULAR' WHERE "isPrimaryContact" = true;