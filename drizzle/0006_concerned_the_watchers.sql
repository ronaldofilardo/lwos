CREATE TABLE "firstAccessLinks" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"familyId" varchar(36) NOT NULL,
	"personId" varchar(36) NOT NULL,
	"tokenHash" varchar(64) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"consumedAt" timestamp,
	"createdBy" varchar(36) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "firstAccessLinks_tokenHash_unique" UNIQUE("tokenHash")
);
