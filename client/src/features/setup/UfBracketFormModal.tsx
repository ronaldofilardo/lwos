import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUfBracketForm } from "./hooks/useUfBracketForm";
import type { UfBracketFormData } from "./types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: UfBracketFormData | null;
  onSave: (data: UfBracketFormData) => void;
}

export function UfBracketFormModal({
  open,
  onOpenChange,
  initialData,
  onSave,
}: Props) {
  const { limitValue, setLimitValue, rate, setRate, handleSubmit } =
    useUfBracketForm({ initialData, onSave, onClose: () => onOpenChange(false) });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lucathi-navy">
            {initialData ? "Editar Faixa de ITCMD" : "Nova Faixa de ITCMD"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="limitValue" className="text-xs text-lucathi-ink">
              Teto da Faixa (R$ ou Unidades)
            </Label>
            <Input
              id="limitValue"
              type="number"
              step="any"
              value={limitValue}
              onChange={e => setLimitValue(e.target.value)}
              required
            />
            <p className="text-[11px] text-lucathi-gray">
              Para a última faixa (sem teto), informe um valor alto (ex: 999999999).
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rate" className="text-xs text-lucathi-ink">
              Alíquota da Faixa (%)
            </Label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={rate}
              onChange={e => setRate(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-lucathi-navy text-white">
              Salvar Faixa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
