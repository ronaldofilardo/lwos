"use client";

import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { errorMessage } from "@/lib/trpcError";

interface Props {
  familyId: string;
  blockers: string[];
  redCertidoes: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConcludeProjectModal({ familyId, blockers, redCertidoes, open, onOpenChange }: Props) {
  const [justification, setJustification] = useState("");
  const [concludeOpen, setConcludeOpen] = useState(open);
  const utils = trpc.useUtils();
  const conclude = trpc.families.updateStatus.useMutation({
    onSuccess: () => {
      utils.families.list.invalidate();
      utils.families.get.invalidate({ familyId });
      utils.certidoes.summary.invalidate({ familyId });
      setConcludeOpen(false);
      setJustification("");
      toast.success("Projeto concluído.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <Dialog open={concludeOpen} onOpenChange={v => { setConcludeOpen(v); if (!v) onOpenChange(false); }}>
      <DialogContent className="rounded-2xl border border-lucathi-line bg-white p-5 shadow-sm">
        <DialogHeader>
          <DialogTitle className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">Concluir projeto</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-lucathi-navy">
            O projeto só vai para «Concluído» sem gravame pendente e com as certidões em vermelho justificadas.
          </DialogDescription>
        </DialogHeader>
        {blockers.length ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-status-warning-text">{blockers.map(b => <li key={b}>{b}</li>)}</ul>
        ) : (
          <p className="mt-3 text-sm text-status-success-text">Nenhum bloqueio encontrado.</p>
        )}
        {redCertidoes.length ? (
          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">Justificativa para as certidões em vermelho (obrigatória)</span>
            <Textarea className="mt-1 w-full rounded-xl border border-lucathi-line px-3 py-2 text-sm" rows={3} value={justification} onChange={e => setJustification(e.target.value)} placeholder="Explique por que as certidões em vermelho podem ser aceitas neste projeto." />
          </label>
        ) : null}
        <DialogFooter className="mt-4 flex items-center gap-2">
          <Button size="sm" disabled={conclude.isPending || (redCertidoes.length > 0 && !justification.trim())} onClick={() => conclude.mutate({ familyId, status: "CONCLUIDO", justification: justification.trim() || undefined })}>
            <CheckCircle2 className="mr-1 size-3.5" /> Confirmar conclusão
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setConcludeOpen(false); setJustification(""); onOpenChange(false); }}>
            <X className="mr-1 size-3.5" /> Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
