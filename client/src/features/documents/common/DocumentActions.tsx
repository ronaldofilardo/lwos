import { useRef, useState } from "react";
import { Ban, Check, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  documentId: string;
  canReview: boolean;
  busy: boolean;
  status: string;
  disabled?: boolean;
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
  status,
  disabled,
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

  const isDispensed = status === "DISPENSADO";
  const needsValidation = status === "RECEBIDO_EM_ANALISE";

  return (
    <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {isDispensed ? (
          // Quando dispensado: mostra mensagem em vez de botões
          <span className="text-purple-600 text-sm font-medium">
            Documento dispensado
          </span>
        ) : (
          <>
            <input 
              type="file" 
              ref={fileRef} 
              accept=".pdf,image/*"
              className="hidden" 
              onChange={e => upload(e.target.files?.[0])} 
            />
            <Button
              size="sm"
              variant="outline"
              disabled={busy || disabled}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="mr-1 size-3" /> Enviar Versão
            </Button>
          </>
        )}

        {canReview ? (
          <>
            {/* Ocultando botão Enviar Versão duplicado que existia aqui */}

            {isDispensed ? null : (
              <Button
                size="sm"
                disabled={busy || !needsValidation || disabled}
                onClick={() => onReview("VALIDADO")}
                className="bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                <Check className="mr-1 size-3" /> Validar
              </Button>
            )}

            {isDispensed ? null : (
              <input
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Motivo da rejeição"
                disabled={!needsValidation || disabled}
                className="h-8 w-36 rounded-md border border-input px-2 text-xs"
              />
            )}

            {isDispensed ? null : (
              <Button
                size="sm"
                variant="destructive"
                disabled={busy || reason.trim().length < 3 || !needsValidation || disabled}
                onClick={() => onReview("REJEITADO", reason)}
              >
                <X className="mr-1 size-3" /> Rejeitar
              </Button>
            )}

            {isDispensed ? null : (
              <Button
                size="sm"
                variant="outline"
                className="text-purple-700 border-purple-200 hover:bg-purple-50"
                disabled={busy || disabled}
                onClick={() => setShowDispense(!showDispense)}
              >
                <Ban className="mr-1 size-3" /> Dispensar
              </Button>
            )}

            {isDispensed ? (
              <span className="text-purple-600 text-sm ml-2">
                Dispensado por Sócio
              </span>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}