import { isResolvedDocumentStatus } from "@shared/domain/document-status";

/** Documentos que comprovam a titularidade do imóvel (matrícula ou, sem matrícula, escritura/contrato). */
export const REGISTRATION_DOCUMENT_CATEGORIES = [
  "Matrícula atualizada",
  "Escritura ou contrato de compra e venda",
] as const;

type RegistrationDocLite = {
  entityType: string;
  entityId: string;
  category: string;
  status: string;
};

export type MatriculaAlert = {
  level: "AMARELO" | "NENHUM";
  reasons: string[];
};

/**
 * "!" ao lado do nome do imóvel: indica se a matrícula foi entregue.
 * Imóveis não têm certidões; o alerta depende só do documento de matrícula.
 * Sem requisito gerado, enviado/em análise, validado, dispensado ou "Não possui" → sem alerta.
 */
export function matriculaAlert(
  documents: readonly RegistrationDocLite[],
  propertyId: string
): MatriculaAlert {
  const registrationDocs = documents.filter(
    doc =>
      doc.entityType === "IMOVEL" &&
      doc.entityId === propertyId &&
      (REGISTRATION_DOCUMENT_CATEGORIES as readonly string[]).includes(doc.category)
  );
  if (!registrationDocs.length) return { level: "NENHUM", reasons: [] };
  const delivered = registrationDocs.some(
    doc => isResolvedDocumentStatus(doc.status) || doc.status === "RECEBIDO_EM_ANALISE"
  );
  if (delivered) return { level: "NENHUM", reasons: [] };
  const rejected = registrationDocs.some(doc => doc.status === "REJEITADO");
  const category = registrationDocs[0].category;
  return {
    level: "AMARELO",
    reasons: [
      rejected
        ? `${category} — rejeitada, envie nova versão`
        : `${category} — não entregue`,
    ],
  };
}
