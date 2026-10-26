import { useRef, useState } from "react";
import { Ban, Check, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hoje } from "@shared/validation/datas";

type Props = {
  documentId: string;
  canReview: boolean;
  busy: boolean;
  status: string;
  disabled?: boolean;
  /** Balanço/balancete: o envio exige a data-base. */
  requiresReferenceDate?: boolean;
  onUpload: (file: File, referenceDate?: string) => Promise<unknown>;
  onReview: (
    status: "VALIDADO" | "REJEITADO" | "NAO_POSSUI",
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
  requiresReferenceDate = false,
  onUpload,
  onReview,
  onDispense,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [reason, setReason] = useState("");
  const [showDispense, setShowDispense] = useState(false);
  const [dispenseReason, setDispenseReason] = useState("");

  const [referenceDate, setReferenceDate] = useState("");

  const upload = async (file?: File) => {
    if (!file) return;
    if (requiresReferenceDate && !referenceDate) return;
    try {
      await onUpload(file, requiresReferenceDate ? referenceDate : undefined);
      setReferenceDate("");
    } finally {
      // Permite escolher o mesmo arquivo de novo (o onChange não dispara sem limpar).
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDispense = async () => {
    if (dispenseReason.trim().length < 3) return;
    try {
      await onDispense(dispenseReason.trim());
    } catch {
      // O toast de erro já é exibido pela mutation; mantém o campo aberto.
      return;
    }
    setShowDispense(false);
    setDispenseReason("");
  };

  const cancelDispense = () => {
    setShowDispense(false);
    setDispenseReason("");
  };

  const isDispensed = status === "DISPENSADO";
  const isValidated = status === "VALIDADO";
  const isNoPossui = status === "NAO_POSSUI";
  const isResolved = isDispensed || isValidated || isNoPossui;
  const needsValidation = status === "RECEBIDO_EM_ANALISE";

  const resolvedLabel = () => {
    if (isDispensed) return "Documento dispensado";
    if (isValidated) return "Documento validado";
    if (isNoPossui) return "Não possui documento";
    return "";
  };

  return (
    <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {isResolved ? (
          <span className="text-purple-600 text-sm font-medium">
            {resolvedLabel()}
          </span>
        ) : (
          <>
            <input
              type="file"
              ref={fileRef}
              accept=".pdf,.jpg,.jpeg,.png,.webp,.xlsx"
              className="hidden"
              onChange={e => upload(e.target.files?.[0])}
            />
            {requiresReferenceDate ? (
              <label className="flex items-center gap-1.5 text-xs text-lucathi-gray">
                Data-base
                <input
                  type="date"
                  value={referenceDate}
                  max={hoje()}
                  onChange={e => setReferenceDate(e.target.value)}
                  disabled={busy || disabled}
                  className="h-8 rounded-md border border-input px-2 text-xs"
                />
              </label>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              disabled={busy || disabled || (requiresReferenceDate && !referenceDate)}
              title={
                requiresReferenceDate && !referenceDate
                  ? "Informe a data-base antes de enviar."
                  : undefined
              }
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="mr-1 size-3" /> Enviar Versão
            </Button>
          </>
        )}

        {canReview && !isResolved ? (
          <>
            <Button
              size="sm"
              disabled={busy || !needsValidation || disabled}
              onClick={() => onReview("VALIDADO")}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              <Check className="mr-1 size-3" /> Validar
            </Button>

            <input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Motivo da rejeição"
              disabled={!needsValidation || disabled}
              className="h-8 w-36 rounded-md border border-input px-2 text-xs"
            />

            <Button
              size="sm"
              variant="destructive"
              disabled={busy || reason.trim().length < 3 || !needsValidation || disabled}
              onClick={() => onReview("REJEITADO", reason)}
            >
              <X className="mr-1 size-3" /> Rejeitar
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="text-purple-700 border-purple-200 hover:bg-purple-50"
              disabled={busy || disabled}
              onClick={() => setShowDispense(!showDispense)}
            >
              <Ban className="mr-1 size-3" /> Dispensar
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="text-purple-700 border-purple-200 hover:bg-purple-50"
              disabled={busy || disabled}
              onClick={() => onReview("NAO_POSSUI")}
            >
              Não possui
            </Button>
          </>
        ) : null}
      </div>

      {canReview && showDispense && !isDispensed && !isResolved ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <input
            value={dispenseReason}
            onChange={e => setDispenseReason(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") void handleDispense();
              if (e.key === "Escape") cancelDispense();
            }}
            placeholder="Justificativa da dispensa (mín. 3 caracteres)"
            maxLength={1000}
            autoFocus
            aria-label="Justificativa da dispensa"
            className="h-8 w-72 rounded-md border border-input px-2 text-xs"
          />
          <Button
            size="sm"
            disabled={busy || disabled || dispenseReason.trim().length < 3}
            onClick={() => void handleDispense()}
            className="bg-purple-700 text-white hover:bg-purple-800"
          >
            <Ban className="mr-1 size-3" /> Confirmar dispensa
          </Button>
          <Button size="sm" variant="ghost" onClick={cancelDispense}>
            Cancelar
          </Button>
        </div>
      ) : null}
    </div>
  );
}