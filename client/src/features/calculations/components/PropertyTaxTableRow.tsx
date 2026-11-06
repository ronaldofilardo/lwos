import { FileText } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/features/properties/propertyCardView";
import type { PropertyTaxRow } from "../types";
import { PropertyTaxBadge } from "./PropertyTaxBadge";

export function PropertyTaxTableRow({
  row,
  onSelect,
}: {
  row: PropertyTaxRow;
  onSelect: (row: PropertyTaxRow) => void;
}) {
  return (
    <TableRow
      className="cursor-pointer transition-colors hover:bg-lucathi-mist/30"
      onClick={() => onSelect(row)}
    >
      <TableCell className="font-medium text-lucathi-navy">
        <div>{row.description}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="rounded bg-lucathi-mist px-1.5 py-0.5 text-[10px] font-bold text-lucathi-navy">
            {row.uf}
          </span>
          <span className="text-[11px] text-lucathi-gray">
            {row.isRental ? "Com locação ativa" : "Sem locação"}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatBRL(row.marketValue) ?? "—"}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatBRL(row.integralizationCost) ?? "—"}
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
      <TableCell className="text-right tabular-nums">
        {row.isRental && row.paybackYears > 0
          ? `${row.paybackYears.toLocaleString("pt-BR", {
              maximumFractionDigits: 1,
            })}a`
          : "—"}
      </TableCell>
      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs text-lucathi-navy"
          onClick={() => onSelect(row)}
        >
          <FileText className="size-3.5 text-lucathi-navy" />
          Ver Ficha
        </Button>
      </TableCell>
    </TableRow>
  );
}

