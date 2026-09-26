UPDATE "people" SET "isPrimaryContact" = false
WHERE "isPrimaryContact" = true
AND "id" NOT IN (
	SELECT (array_agg("id" ORDER BY "createdAt", "id"))[1]
	FROM "people"
	WHERE "isPrimaryContact" = true
	GROUP BY "familyId"
);
--> statement-breakpoint
CREATE UNIQUE INDEX "people_primary_unique" ON "people" USING btree ("familyId") WHERE "people"."isPrimaryContact" = true;
