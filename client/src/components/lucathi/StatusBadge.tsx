import { Badge } from "@/components/ui/badge";

const labels: Record<string, string> = {
  PENDENTE: "Pendente", RECEBIDO_EM_ANALISE: "Recebido · Em análise", VALIDADO: "Validado", REJEITADO: "Rejeitado", VENCIDO: "Vencido", DISPENSADO: "Dispensado", NA: "N/A", EM_ANDAMENTO: "Em andamento", AGUARDANDO_DOCUMENTOS: "Aguardando documentos", EM_REVISAO: "Em revisão", CONCLUIDO: "Concluído",
};

export function StatusBadge({ status }: { status: string }) {
  const className =
    status === "VALIDADO" || status === "CONCLUIDO"
      ? "bg-emerald-50 text-emerald-700"
      : status === "REJEITADO" || status === "VENCIDO"
      ? "bg-red-50 text-red-700"
      : status === "DISPENSADO"
      ? "bg-purple-50 text-purple-700 border border-purple-200"
      : "bg-lucathi-mist text-lucathi-navy";
  return <Badge className={`border-0 font-medium ${className}`}>{labels[status] || status}</Badge>;
}
