CREATE TABLE IF NOT EXISTS "itcmdBrackets" (
    "id" varchar(36) PRIMARY KEY NOT NULL,
    "uf" varchar(2) NOT NULL,
    "bracketOrder" integer NOT NULL,
    "limitValue" numeric(15, 2) NOT NULL,
    "rate" numeric(6, 4) NOT NULL,
    "accumulatedTax" numeric(15, 2) DEFAULT 0.00 NOT NULL,
    "deductionValue" numeric(15, 2) DEFAULT 0.00 NOT NULL,
    "indexedUnitName" varchar(30),
    "indexedUnitValue" numeric(10, 4),
    "updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "itcmd_brackets_uf_idx" ON "itcmdBrackets" ("uf");


