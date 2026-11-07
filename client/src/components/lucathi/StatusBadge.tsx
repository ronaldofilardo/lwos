import { Badge } from "@/components/ui/badge";

const labels: Record<string, string> = {
  PENDENTE: "Pendente",
  RECEBIDO_EM_ANALISE: "Recebido · Em análise",
  VALIDADO: "Validado",
  REJEITADO: "Rejeitado",
  VENCIDO: "Vencido",
  DISPENSADO: "Dispensado",
  NAO_POSSUI: "Não possui",
  NA: "N/A",
  EM_ANDAMENTO: "Em andamento",
  AGUARDANDO_DOCUMENTOS: "Aguardando documentos",
  EM_REVISAO: "Em revisão",
  CONCLUIDO: "Concluído",
};

const statusClasses: Record<string, string> = {
  VALIDADO: "bg-status-success-bg text-status-success-text border-status-success-border",
  CONCLUIDO: "bg-status-success-bg text-status-success-text border-status-success-border",
  REJEITADO: "bg-status-danger-bg text-status-danger-text border-status-danger-border",
  VENCIDO: "bg-status-danger-bg text-status-danger-text border-status-danger-border",
  DISPENSADO: "bg-status-neutral-bg text-status-neutral-text border-status-neutral-border",
  NAO_POSSUI: "bg-status-neutral-bg text-status-neutral-text border-status-neutral-border",
  NA: "bg-status-neutral-bg text-status-neutral-text border-status-neutral-border",
  EM_ANDAMENTO: "bg-status-info-bg text-status-info-text border-status-info-border",
  AGUARDANDO_DOCUMENTOS: "bg-status-info-bg text-status-info-text border-status-info-border",
  EM_REVISAO: "bg-status-warning-bg text-status-warning-text border-status-warning-border",
  PENDENTE: "bg-status-warning-bg text-status-warning-text border-status-warning-border",
};

export function StatusBadge({ status }: { status: string }) {
  const className = statusClasses[status] || "bg-lucathi-mist text-lucathi-navy border-lucathi-line";
  return <Badge className={`border font-medium ${className}`}>{labels[status] || status}</Badge>;
}