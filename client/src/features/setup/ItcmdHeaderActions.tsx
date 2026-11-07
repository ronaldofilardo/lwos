import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  selectedUf: string;
  onSave: () => void;
  isPending: boolean;
}

export function ItcmdHeaderActions({
  selectedUf,
  onSave,
  isPending,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-base font-semibold text-lucathi-navy">
          Faixas de Tributação de {selectedUf}
        </h2>
        <p className="text-xs text-lucathi-gray">
          Configure as alíquotas e indexadores estaduais para cálculo do imposto sucessório.
        </p>
      </div>
      <Button
        onClick={onSave}
        disabled={isPending}
        className="gap-2 bg-lucathi-navy text-white hover:bg-lucathi-navy/90"
      >
        <Save className="size-4" />
        {isPending ? "Salvando…" : "Salvar Alterações"}
      </Button>
    </div>
  );
}
