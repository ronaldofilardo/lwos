CREATE TABLE "sessionRevocations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"userId" varchar(36) NOT NULL,
	"jti" varchar(64) NOT NULL,
	"revokedAt" timestamp DEFAULT now() NOT NULL,
	"reason" varchar(120)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "session_revocations_jti_key" ON "sessionRevocations" USING btree ("jti");