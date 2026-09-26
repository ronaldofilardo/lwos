import { useRef, useState } from "react";
import { Ban, Check, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  documentId: string;
  canReview: boolean;
  busy: boolean;
  onUpload: (file: File) => Promise<unknown>;
  onReview: (
    status: "VALIDADO" | "REJEITADO",
    reason?: string
  ) => Promise<unknown>;
  onDispense: (reason: string) => Promise<unknown>;
};

export function DocumentActions({
  documentId,
  canReview,
  busy,
  onUpload,
  onReview,
  onDispense,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [reason, setReason] = useState("");
  const [showDispense, setShowDispense] = useState(false);
  const [dispenseReason, setDispenseReason] = useState("");

  const upload = async (file?: File) => {
    if (file) await onUpload(file);
  };

  const handleDispense = async () => {
    if (dispenseReason.trim().length < 3) return;
    await onDispense(dispenseReason.trim());
    setShowDispense(false);
    setDispenseReason("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <input
          ref={fileRef}
          className="hidden"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.xlsx"
          onChange={e => upload(e.target.files?.[0])}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="mr-1 size-3" /> Enviar Versão
        </Button>

        {canReview ? (
          <>
            <Button
              size="sm"
              disabled={busy}
              onClick={() => onReview("VALIDADO")}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              <Check className="mr-1 size-3" /> Validar
            </Button>

            <input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Motivo da rejeição"
              className="h-8 w-36 rounded-md border border-input px-2 text-xs"
            />
            <Button
              size="sm"
              variant="destructive"
              disabled={busy || reason.trim().length < 3}
              onClick={() => onReview("REJEITADO", reason)}
            >
              <X className="mr-1 size-3" /> Rejeitar
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="text-purple-700 border-purple-200 hover:bg-purple-50"
              disabled={busy}
              onClick={() => setShowDispense(!showDispense)}
            >
              <Ban className="mr-1 size-3" /> Dispensar
            </Button>
          </>
        ) : null}
      </div>

      {showDispense && canReview ? (
        <div className="flex items-center gap-2 justify-end pt-1">
          <input
            value={dispenseReason}
            onChange={e => setDispenseReason(e.target.value)}
            placeholder="Justificativa jurídica/prática da dispensa"
            className="h-8 w-64 rounded-md border border-purple-300 px-2 text-xs bg-purple-50/40"
          />
          <Button
            size="sm"
            className="bg-purple-700 hover:bg-purple-800 text-white"
            disabled={busy || dispenseReason.trim().length < 3}
            onClick={handleDispense}
          >
            Aprovar Dispensa (Sócio)
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDispense(false)}
          >
            Cancelar
          </Button>
        </div>
      ) : null}
    </div>
  );
}
