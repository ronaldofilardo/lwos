import { useState } from "react";
import { FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/features/properties/propertyCardView";
import type { PropertyTaxRow } from "../types";
import { PropertyTaxBadge } from "./PropertyTaxBadge";
import { PropertyTaxDetailModal } from "./PropertyTaxDetailModal";

/** Badge de urg\u00eancia de payback */
function PaybackBadge({ years, isRental }: { years: number; isRental: boolean }) {
  if (!isRental || years === 0) return <span className="text-lucathi-gray">&mdash;</span>;

  const color =
    years <= 3
      ? "bg-status-success-bg text-status-success-text border-status-success-border"
      : years <= 7
        ? "bg-status-info-bg text-status-info-text border-status-info-border"
        : "bg-status-warning-bg text-status-warning-text border-status-warning-border";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${color}`}
    >
      {years.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}a
    </span>
  );
}

/**
 * Tabela executiva de im\u00f3veis \u2014 5 colunas na vis\u00e3o resumida.
 * \u00abVer Ficha\u00bb abre o modal com as 14 m\u00e9tricas completas.
 */
export function PropertyTaxComparisonTable({ rows }: { rows: PropertyTaxRow[] }) {
  const [selected, setSelected] = useState<PropertyTaxRow | null>(null);

  /* sum\u00e1rios r\u00e1pidos para o cabe\u00e7alho */
  const totalMarket = rows.reduce((s, r) => s + r.marketValue, 0);
  const countInteg = rows.filter(r => r.isRental && r.paybackYears > 0).length;

  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm">
      {/* header da se\u00e7\u00e3o */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lucathi-gray font-subtitle">
            Comparativo tribut\u00e1rio por im\u00f3vel
          </p>
          <p className="mt-1 text-sm text-lucathi-gray">
            Resumo executivo PF \u00d7 PJ. Clique em \u00abVer Ficha\u00bb para abrir as 14
            m\u00e9tricas completas.
          </p>
        </div>
        {rows.length > 0 && (
          <div className="flex gap-3">
            <div className="rounded-xl bg-lucathi-mist px-3 py-2 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-lucathi-gray font-subtitle">
                Total de mercado
              </p>
              <p className="text-sm font-semibold text-lucathi-navy">
                {formatBRL(totalMarket) ?? "\u2014"}
              </p>
            </div>
            {countInteg > 0 && (
              <div className="rounded-xl bg-status-info-bg px-3 py-2 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-status-info-text font-subtitle">
                  Com payback calculado
                </p>
                <p className="text-sm font-semibold text-status-info-text">
                  {countInteg} im\u00f3vel(is)
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* tabela executiva */}
      <div className="mt-4 overflow-hidden rounded-xl border border-lucathi-line/70">
        <Table>
          <TableHeader className="bg-lucathi-mist/50">
            <TableRow>
              <TableHead className="min-w-[180px]">Im\u00f3vel</TableHead>
              <TableHead className="text-right">Valor de mercado</TableHead>
              <TableHead className="text-center">Desinvestir</TableHead>
              <TableHead className="text-right">Economia PJ/ano</TableHead>
              <TableHead className="text-center">Payback</TableHead>
              <TableHead className="w-[110px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(row => (
              <TableRow
                key={row.propertyId}
                className="cursor-pointer transition-colors hover:bg-lucathi-mist/30"
                onClick={() => setSelected(row)}
              >
                <TableCell className="font-medium text-lucathi-navy">
                  <div>{row.description}</div>
                  <span className="text-[11px] text-lucathi-gray">
                    {row.isRental ? "Com loca\u00e7\u00e3o ativa" : "Sem loca\u00e7\u00e3o"}
                  </span>
                </TableCell>

                <TableCell className="text-right tabular-nums">
                  {formatBRL(row.marketValue) ?? "\u2014"}
                </TableCell>

                <TableCell className="text-center">
                  <PropertyTaxBadge recommendation={row.recommendation} />
                </TableCell>

                <TableCell className="text-right tabular-nums">
                  {row.isRental ? (
                    <span
                      className={
                        row.annualRentalSaving > 0
                          ? "font-semibold text-status-success-text"
                          : "text-status-warning-text"
                      }
                    >
                      {formatBRL(row.annualRentalSaving) ?? "\u2014"}
                    </span>
                  ) : (
                    "\u2014"
                  )}
                </TableCell>

                <TableCell className="text-center">
                  <PaybackBadge
                    years={row.paybackYears}
                    isRental={row.isRental}
                  />
                </TableCell>

                <TableCell
                  className="text-right"
                  onClick={e => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs text-lucathi-navy"
                    onClick={() => setSelected(row)}
                  >
                    <FileText className="size-3.5" />
                    Ver Ficha
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!rows.length && (
          <p className="p-4 text-center text-sm text-lucathi-gray">
            Cadastre im\u00f3veis na aba Patrim\u00f4nio para visualizar o comparativo.
          </p>
        )}
      </div>

      {/* legenda de payback */}
      {rows.some(r => r.isRental) && (
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-lucathi-gray">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-status-success-text" /> Payback {'\u2264'} 3a
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-status-info-text" /> Payback 3\u20137a
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-status-warning-text" /> Payback {'>'} 7a
          </span>
        </div>
      )}

      <PropertyTaxDetailModal
        property={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}