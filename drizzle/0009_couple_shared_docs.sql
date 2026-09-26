-- Documentos do casal (certidão de casamento/UE e comprovante de endereço)
-- não devem ser exigidos dos dois cônjuges: só o titular apresenta.
-- Dispensa as cópias pendentes/pendentes de análise do cônjuge.
UPDATE "documents" d
SET
  "status" = 'DISPENSADO',
  "dispensationReason" = 'Documento do casal — apresentado pelo titular (não exigido do cônjuge).',
  "dispensationRequestedBy" = 'SISTEMA',
  "dispensationApprovedBy" = 'SISTEMA',
  "dispensedAt" = now(),
  "rejectionReason" = NULL,
  "updatedAt" = now()
FROM "people" p
WHERE d."entityType" = 'PESSOA'
  AND d."entityId" = p."id"
  AND p."vinculo" = 'CONJUGE'
  AND d."category" IN ('Certidão de casamento/UE', 'Comprovante de endereço')
  AND d."status" IN ('PENDENTE', 'RECEBIDO_EM_ANALISE', 'REJEITADO', 'VENCIDO');
