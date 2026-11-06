import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBRL } from "@/features/properties/propertyCardView";
import type { OwnerTotalsRow } from "@shared/domain/family-wealth-calculator";

const money = (value: number) => formatBRL(value) ?? "R$ 0,00";

/**
 * Quadro «Totais por Proprietário»: soma ponderada pela cota-parte de cada
 * membro em todos os imóveis de que é titular pessoa física.
 */
export function PropertyOwnerTotalsTable({ rows }: { rows: OwnerTotalsRow[] }) {
  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lucathi-gray">
        Totais por proprietário
      </p>
      <div className="mt-3 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proprietário</TableHead>
              <TableHead className="text-right">Valor IRPF</TableHead>
              <TableHead className="text-right">Valor de Mercado</TableHead>
              <TableHead className="text-right">Locação (mensal)</TableHead>
              <TableHead className="text-right">Custo Integralização</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(row => (
              <TableRow key={row.personId}>
                <TableCell className="whitespace-nowrap font-medium text-lucathi-navy">
                  {row.personName}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(row.irpfValue)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(row.marketValue)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(row.monthlyRent)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(row.integralizationCost)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!rows.length ? (
          <p className="mt-3 text-sm text-lucathi-gray">
            Nenhum membro cadastrado para apurar titularidades.
          </p>
        ) : null}
      </div>
    </section>
  );
}
