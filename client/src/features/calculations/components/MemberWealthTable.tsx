import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBRL } from "@/features/properties/propertyCardView";
import type { MemberWealthRow } from "@shared/domain/family-wealth-calculator";

const money = (value: number) => formatBRL(value) ?? "R$ 0,00";

function ConcentrationBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-lucathi-line">
        <div
          className="h-1.5 rounded-full bg-lucathi-navy transition-all"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs tabular-nums text-lucathi-gray">
        {pct.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
      </span>
    </div>
  );
}

/** Patrimônio consolidado por membro, com % de concentração relativa. */
export function MemberWealthTable({ rows }: { rows: MemberWealthRow[] }) {
  const grandTotal = rows.reduce((s, r) => s + r.total, 0);

  const pct = (value: number) =>
    grandTotal > 0 ? (value / grandTotal) * 100 : 0;

  /* rodapé: quem são os membros com > 50% do total (concentração no casal) */
  const top = rows
    .filter(r => r.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 2);
  const topPct =
    grandTotal > 0
      ? top.reduce((s, r) => s + r.total, 0) / grandTotal * 100
      : 0;

  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lucathi-gray">
            Patrimônio por membro
          </p>
          <p className="mt-1 text-sm text-lucathi-gray">
            Todos os membros cadastrados, na ordem da aba Família.
          </p>
        </div>
        {grandTotal > 0 && (
          <div className="rounded-xl bg-lucathi-mist px-3 py-2 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-lucathi-gray">
              Total familiar
            </p>
            <p className="text-sm font-semibold text-lucathi-navy">
              {money(grandTotal)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membro</TableHead>
              <TableHead className="text-right">Imóveis</TableHead>
              <TableHead className="text-right">Sociedades</TableHead>
              <TableHead className="text-right">Demais ativos</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">% do total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(row => (
              <TableRow key={row.personId}>
                <TableCell className="whitespace-nowrap font-medium text-lucathi-navy">
                  {row.personName}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(row.properties)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(row.companies)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(row.otherAssets)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums text-lucathi-navy">
                  {money(row.total)}
                </TableCell>
                <TableCell className="text-right">
                  <ConcentrationBar pct={pct(row.total)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!rows.length ? (
          <p className="mt-3 text-sm text-lucathi-gray">
            Cadastre os membros na aba Família para ver o patrimônio individual.
          </p>
        ) : null}
      </div>

      {/* insight de concentração */}
      {top.length > 0 && topPct > 0 && (
        <p className="mt-4 border-t border-lucathi-line/60 pt-3 text-xs text-lucathi-gray">
          {top.map(r => r.personName).join(" e ")}{" "}
          concentram{" "}
          <strong className="text-lucathi-navy">
            {topPct.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
          </strong>{" "}
          do patrimônio familiar —
          {topPct > 80
            ? " concentração elevada, avaliar distribuição sucessória."
            : " distribuição moderada."}
        </p>
      )}
    </section>
  );
}
