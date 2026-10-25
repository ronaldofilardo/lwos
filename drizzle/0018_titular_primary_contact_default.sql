-- Garante que o titular da família (vinculo = 'TITULAR') tenha isPrimaryContact = true se a família ainda não tem titular marcado
UPDATE people
SET "isPrimaryContact" = true
WHERE vinculo = 'TITULAR'
  AND "isPrimaryContact" = false
  AND "familyId" NOT IN (
    SELECT "familyId" FROM people WHERE "isPrimaryContact" = true
  );

-- Para qualquer família que não tenha nenhum titular marcado, define a primeira pessoa cadastrada como titular
WITH first_members AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "familyId" ORDER BY "createdAt" ASC, id ASC) as rn
  FROM people
  WHERE "familyId" NOT IN (
    SELECT "familyId" FROM people WHERE "isPrimaryContact" = true
  )
)
UPDATE people
SET "isPrimaryContact" = true,
    vinculo = CASE WHEN vinculo IS NULL THEN 'TITULAR' ELSE vinculo END
WHERE id IN (
  SELECT id FROM first_members WHERE rn = 1
);
