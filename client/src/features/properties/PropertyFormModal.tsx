import { useEffect, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PropertyFormFields } from "./PropertyFormFields";
import {
  buildPropertyPayload,
  validatePropertyValues,
} from "./propertyFormRules";
import {
  emptyPropertyValues,
  type PropertyFormValues,
} from "./propertyFormValues";

export { toPropertyFormValues } from "./propertyFormValues";
export type { PropertyFormValues } from "./propertyFormValues";

export function PropertyFormModal({
  title,
  initial,
  familyId,
  submitLabel,
  onSubmit,
  onClose,
  isPending,
}: {
  title: string;
  initial?: PropertyFormValues;
  familyId: string;
  submitLabel: string;
  onSubmit: (payload: ReturnType<typeof buildPropertyPayload>) => void;
  onClose: () => void;
  isPending?: boolean;
}) {
  const [values, setValues] = useState<PropertyFormValues>(
    initial ?? emptyPropertyValues
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => {
    const validation = validatePropertyValues(values);
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    onSubmit(buildPropertyPayload(values, familyId));
  };

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleBackdropClick = () => {
    setConfirmOpen(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-lucathi-line bg-white p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-display text-xl text-lucathi-navy">{title}</h3>
        <div className="mt-3">
          <PropertyFormFields
            values={values}
            onChange={patch => setValues(prev => ({ ...prev, ...patch }))}
          />
        </div>
        {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {submitLabel}
          </Button>
        </div>
      </div>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja encerrar e descartar as alterações?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onClose}>Encerrar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
