-- Normaliza CNPJ já gravado com máscara em "companies"."taxNumber" para somente
-- dígitos (convenção do app: ver normalizeTaxNumber em company-repository.ts).
-- Rode manualmente, uma vez, no banco (Neon) depois de publicar a Fase 0.
-- O app compara por dígitos mesmo sem este script; ele só padroniza o legado
-- e deixa o índice único (familyId, taxNumber) coerente.

-- 1) Conferência: deve retornar ZERO linhas. Se retornar, há sociedades
--    duplicadas na mesma família (mesmo CNPJ com e sem máscara): resolva antes.
SELECT "familyId",
       regexp_replace("taxNumber", '\D', '', 'g') AS cnpj,
       count(*) AS total
FROM companies
WHERE "taxNumber" IS NOT NULL
GROUP BY 1, 2
HAVING count(*) > 1;

-- 2) Normalização (só linhas que ainda têm algo além de dígitos).
BEGIN;
UPDATE companies
SET "taxNumber" = regexp_replace("taxNumber", '\D', '', 'g')
WHERE "taxNumber" ~ '\D'
  AND regexp_replace("taxNumber", '\D', '', 'g') <> '';
COMMIT;
