import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

export function CompanyModalActions({
  onClose,
  disabled,
  isPending,
}: {
  onClose: () => void;
  disabled: boolean;
  isPending: boolean;
}) {
  return (
    <DialogFooter className="gap-2 border-t border-lucathi-line pt-4">
      <Button type="button" variant="outline" onClick={onClose}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isPending || disabled}>
        <Scale className="mr-1.5 size-4" />
        {isPending ? "Salvando…" : "Salvar detalhes"}
      </Button>
    </DialogFooter>
  );
}
