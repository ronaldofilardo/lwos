import {
  certidaoStatusLabels,
  certidaoStatusStyles,
  certidaoStatusValues,
  type CertidaoStatus,
} from "@/features/certidoes/types";
import { isResolvedStatus } from "../groupDocuments";

type SummaryDocument = { status: string };
type SummaryCertidao = { status: string };

const statBlock = (label: string, value: number, highlight?: string) => (
  <div key={label} className="rounded-xl bg-white px-3 py-2">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-lucathi-gray">
      {label}
    </p>
    <p className={`text-lg font-semibold ${highlight ?? "text-lucathi-navy"}`}>
      {value}
    </p>
  </div>
);

/**
 * Visão de resumo e status da aba Documentos e Certidões: progresso da matriz
 * documental por situação e quebra das certidões por status.
 */
export function DocumentSummary({
  documents,
  certidoes,
}: {
  documents: SummaryDocument[];
  certidoes: SummaryCertidao[];
}) {
  const total = documents.length;
  const resolved = documents.filter(doc => isResolvedStatus(doc.status)).length;
  const rejected = documents.filter(doc => doc.status === "REJEITADO").length;
  const inAnalysis = documents.filter(
    doc => doc.status === "RECEBIDO_EM_ANALISE"
  ).length;
  const pending = Math.max(0, total - resolved - rejected - inAnalysis);
  const percent = total === 0 ? 0 : Math.round((resolved / total) * 100);

  return (
    <section className="rounded-2xl border border-lucathi-line/80 bg-lucathi-mist/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
          Resumo e status
        </p>
        <p className="text-sm font-semibold text-lucathi-navy">
          {resolved}/{total} requisitos resolvidos · {percent}%
        </p>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-lucathi-navy transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {statBlock("Resolvidos", resolved, "text-emerald-700")}
        {statBlock("Pendentes", pending, "text-amber-700")}
        {statBlock("Em análise", inAnalysis)}
        {statBlock("Rejeitados", rejected, "text-red-700")}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
          Certidões
        </p>
        {certidoes.length === 0 ? (
          <p className="mt-1 text-xs text-lucathi-gray">
            Nenhuma certidão registrada.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {certidaoStatusValues.map(status => ({
              status,
              count: certidoes.filter(row => row.status === status).length,
            })).filter(item => item.count > 0).map(item => (
              <span
                key={item.status}
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                  certidaoStatusStyles[item.status as CertidaoStatus]
                }`}
              >
                {certidaoStatusLabels[item.status as CertidaoStatus]} · {item.count}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
