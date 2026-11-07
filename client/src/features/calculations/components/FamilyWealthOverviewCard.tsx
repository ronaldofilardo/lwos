import { formatBRL } from "@/features/properties/propertyCardView";
import type { WealthBreakdown } from "@shared/domain/family-wealth-calculator";
import { FamilyWealthPieChart } from "./FamilyWealthPieChart";

/** Cor da barra de cada categoria. */
const BAR_COLORS = {
  properties: "bg-[var(--chart-1)]",
  companies:  "bg-[var(--chart-2)]",
  otherAssets:"bg-[var(--chart-3)]",
} as const;

const LABELS = {
  properties:  "Imóveis",
  companies:   "Sociedades",
  otherAssets: "Demais ativos",
} as const;

function BreakdownRow({
  label,
  value,
  pct,
  colorClass,
}: {
  label: string;
  value: number;
  pct: number;
  colorClass: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-2 text-lucathi-gray">
          <span className={`size-2 rounded-full ${colorClass}`} />
          {label}
        </span>
        <span className="tabular-nums text-lucathi-navy">
          {formatBRL(value) ?? "R$ 0,00"}
          <span className="ml-2 text-xs text-lucathi-gray">
            {pct.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
          </span>
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-lucathi-line">
        <div
          className={`h-1 rounded-full transition-all ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Insight automático baseado na composição do patrimônio. */
function WealthInsights({ wealth }: { wealth: WealthBreakdown }) {
  if (wealth.total === 0) return null;

  const propPct = (wealth.properties / wealth.total) * 100;
  const compPct = (wealth.companies / wealth.total) * 100;

  const insights: string[] = [];

  if (propPct > 70)
    insights.push(
      `${propPct.toFixed(0)}% do patrimônio concentrado em imóveis — risco de liquidez elevado.`
    );
  if (compPct === 0)
    insights.push("Nenhuma holding societária identificada — avaliar estrutura de proteção.");
  if (propPct > 0 && compPct === 0 && propPct > 50)
    insights.push("Imóveis sem blindagem societária — exposição a inventário e litígios.");

  if (insights.length === 0) return null;

  return (
    <ul className="mt-4 space-y-1.5 border-t border-lucathi-line/60 pt-4">
      {insights.map((insight, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-status-warning-text">
          <span className="mt-0.5 shrink-0 text-status-warning-text">▲</span>
          {insight}
        </li>
      ))}
    </ul>
  );
}

/**
 * Card principal da aba Cálculos.
 *
 * Layout: coluna esquerda com total + breakdown de barras + insights;
 * coluna direita com o gráfico de pizza (Recharts).
 */
export function FamilyWealthOverviewCard({
  wealth,
  patriarchNames,
  isLoading,
}: {
  wealth: WealthBreakdown;
  patriarchNames: string[];
  isLoading: boolean;
}) {
  const money = (v: number) => (isLoading ? "—" : (formatBRL(v) ?? "R$ 0,00"));
  const pct   = (v: number) =>
    !isLoading && wealth.total > 0 ? (v / wealth.total) * 100 : 0;

  const who = patriarchNames.length
    ? patriarchNames.join(" · ")
    : "Nenhum titular/cônjuge cadastrado";

  const categories = (
    ["properties", "companies", "otherAssets"] as const
  ).map(key => ({
    key,
    label:      LABELS[key],
    colorClass: BAR_COLORS[key],
    value:      wealth[key],
    pct:        pct(wealth[key]),
  }));

  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm">
      {/* cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lucathi-gray font-subtitle">
            Patrimônio Total Familiar — Visão dos Patriarcas
          </p>
          <p className="mt-1 text-sm text-lucathi-gray">
            {who}
          </p>
        </div>
        <div className="rounded-xl bg-lucathi-deep px-5 py-3 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60 font-subtitle">
            Total
          </p>
          <p className="font-display text-2xl text-white">
            {money(wealth.total)}
          </p>
        </div>
      </div>

      {/* breakdown + gráfico */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* barras de composição */}
        <div className="space-y-4">
          {categories.map(cat => (
            <BreakdownRow
              key={cat.key}
              label={cat.label}
              value={cat.value}
              pct={cat.pct}
              colorClass={cat.colorClass}
            />
          ))}
          <WealthInsights wealth={wealth} />
        </div>

        {/* gráfico de pizza integrado ao card */}
        {!isLoading && wealth.total > 0 ? (
          <FamilyWealthPieChart wealth={wealth} />
        ) : null}
      </div>
    </section>
  );
}