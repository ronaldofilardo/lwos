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

/** Badge de urgência de payback */
function PaybackBadge({ years, isRental }: { years: number; isRental: boolean }) {
  if (!isRental || years === 0) return <span className="text-lucathi-gray">—</span>;

  const color =
    years <= 3
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : years <= 7
        ? "bg-sky-50 text-sky-700 ring-sky-200"
        : "bg-amber-50 text-amber-700 ring-amber-200";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${color}`}
    >
      {years.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}a
    </span>
  );
}

/**
 * Tabela executiva de imóveis — 5 colunas na visão resumida.
 * «Ver Ficha» abre o modal com as 14 métricas completas.
 */
export function PropertyTaxComparisonTable({ rows }: { rows: PropertyTaxRow[] }) {
  const [selected, setSelected] = useState<PropertyTaxRow | null>(null);

  /* sumários rápidos para o cabeçalho */
  const totalMarket = rows.reduce((s, r) => s + r.marketValue, 0);
  const countInteg  = rows.filter(r => r.isRental && r.paybackYears > 0).length;

  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm">
      {/* header da seção */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lucathi-gray">
            Comparativo tributário por imóvel
          </p>
          <p className="mt-1 text-sm text-lucathi-gray">
            Resumo executivo PF × PJ. Clique em «Ver Ficha» para abrir as 14
            métricas completas.
          </p>
        </div>
        {rows.length > 0 && (
          <div className="flex gap-3">
            <div className="rounded-xl bg-lucathi-mist px-3 py-2 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-lucathi-gray">
                Total de mercado
              </p>
              <p className="text-sm font-semibold text-lucathi-navy">
                {formatBRL(totalMarket) ?? "—"}
              </p>
            </div>
            {countInteg > 0 && (
              <div className="rounded-xl bg-sky-50 px-3 py-2 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-600">
                  Com payback calculado
                </p>
                <p className="text-sm font-semibold text-sky-700">
                  {countInteg} imóvel(is)
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
              <TableHead className="min-w-[180px]">Imóvel</TableHead>
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
                    {row.isRental ? "Com locação ativa" : "Sem locação"}
                  </span>
                </TableCell>

                <TableCell className="text-right tabular-nums">
                  {formatBRL(row.marketValue) ?? "—"}
                </TableCell>

                <TableCell className="text-center">
                  <PropertyTaxBadge recommendation={row.recommendation} />
                </TableCell>

                <TableCell className="text-right tabular-nums">
                  {row.isRental ? (
                    <span
                      className={
                        row.annualRentalSaving > 0
                          ? "font-semibold text-emerald-700"
                          : "text-amber-700"
                      }
                    >
                      {formatBRL(row.annualRentalSaving) ?? "—"}
                    </span>
                  ) : (
                    "—"
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
            Cadastre imóveis na aba Patrimônio para visualizar o comparativo.
          </p>
        )}
      </div>

      {/* legenda de payback */}
      {rows.some(r => r.isRental) && (
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-lucathi-gray">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" /> Payback ≤ 3a
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-sky-500" /> Payback 3–7a
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-400" /> Payback &gt; 7a
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
