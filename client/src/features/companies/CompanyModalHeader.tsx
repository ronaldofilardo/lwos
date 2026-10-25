import { mascaraCnpj } from "@shared/validation";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CompanyModalHeader({
  legalName,
  taxNumber,
  international,
}: {
  legalName: string | null;
  taxNumber: string | null;
  international: boolean;
}) {
  return (
    <DialogHeader>
      <DialogTitle className="font-display text-2xl text-lucathi-navy">
        Detalhes — {legalName ?? "sociedade"}
      </DialogTitle>
      <DialogDescription>
        Ficha cadastral, balanço, documentos e certidões.{" "}
        {taxNumber ? `CNPJ ${mascaraCnpj(taxNumber)}.` : ""}{" "}
        {international
          ? "Holding internacional — valores em $."
          : "Valores em R$."}
      </DialogDescription>
    </DialogHeader>
  );
}
