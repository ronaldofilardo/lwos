import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/features/properties/propertyCardView";
import type { PropertyTaxRow } from "../types";
import { PropertyIntegralizationSection } from "./PropertyIntegralizationSection";
import { PropertySaleSection } from "./PropertySaleSection";
import { PropertyRentalComparisonSection } from "./PropertyRentalComparisonSection";
import { PropertySuccessionSection } from "./PropertySuccessionSection";

export function PropertyTaxDetailModal({
  property,
  onClose,
}: {
  property: PropertyTaxRow | null;
  onClose: () => void;
}) {
  if (!property) return null;

  return (
    <Dialog open={Boolean(property)} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <div>
              <DialogTitle className="font-display text-xl text-lucathi-navy">
                Ficha Tributária — {property.description}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Valor de Mercado: {formatBRL(property.marketValue)} · Simulação
                completa das 14 métricas fiscais (PF × PJ).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <PropertySuccessionSection property={property} />
          <PropertyIntegralizationSection property={property} />
          <PropertySaleSection property={property} />
          <PropertyRentalComparisonSection property={property} />
        </div>

        <DialogFooter className="mt-4 border-t border-lucathi-line pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

