import type { MultiStateSuccessionResult } from "@shared/domain/itcmd-types";

const formatBrl = (val: number) =>
  val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function ItcmdKpiSummary({
  result,
}: {
  result: MultiStateSuccessionResult;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl bg-lucathi-mist/40 p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-lucathi-gray font-subtitle">
          Patrimônio Sucessório Total
        </p>
        <p className="mt-1 text-lg font-bold text-lucathi-navy">
          {formatBrl(result.totalPatrimony)}
        </p>
        <p className="mt-0.5 text-[11px] text-lucathi-gray">
          Imóveis, sociedades e ativos dos patriarcas
        </p>
      </div>

      <div className="rounded-xl bg-status-warning-bg/70 p-4 border border-status-warning-border/50">
        <p className="text-[11px] font-medium uppercase tracking-wider text-status-warning-text/80 font-subtitle">
          Custo Total Sucessório (Multi-SEFAZ)
        </p>
        <p className="mt-1 text-lg font-bold text-status-warning-text">
          {formatBrl(result.totalTax)}
        </p>
        <p className="mt-0.5 text-[11px] text-status-warning-text/80">
          Soma real devida a todos os estados credores
        </p>
      </div>

      <div className="rounded-xl bg-lucathi-mist/40 p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-lucathi-gray font-subtitle">
          Alíquota Efetiva Média Global
        </p>
        <p className="mt-1 text-lg font-bold text-lucathi-navy">
          {result.effectiveRate.toFixed(2)}%
        </p>
        <p className="mt-0.5 text-[11px] text-lucathi-gray">
          Carga real consolidada da sucessão
        </p>
      </div>
    </div>
  );
}