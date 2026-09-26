import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { readAsBase64 } from "@/lib/file";

export function useDocumentActions(familyId: string) {
  const utils = trpc.useUtils();
  const refresh = () => utils.documents.list.invalidate({ familyId });
  const uploadMutation = trpc.documents.uploadVersion.useMutation({
    onSuccess: () => {
      refresh();
      toast.success("Nova versão enviada para análise.");
    },
    onError: error => toast.error(error.message),
  });
  const reviewMutation = trpc.documents.review.useMutation({
    onSuccess: () => {
      refresh();
      toast.success("Status documental atualizado.");
    },
    onError: error => toast.error(error.message),
  });
  const dispenseMutation = trpc.documents.dispense.useMutation({
    onSuccess: () => {
      refresh();
      toast.success("Dispensa documental formalizada.");
    },
    onError: error => toast.error(error.message),
  });
  const upload = async (documentId: string, file: File) =>
    uploadMutation.mutateAsync({
      documentId,
      fileName: file.name,
      mimeType: file.type,
      base64Data: await readAsBase64(file),
    });
  const review = (
    documentId: string,
    status: "VALIDADO" | "REJEITADO",
    rejectionReason?: string
  ) => reviewMutation.mutateAsync({ documentId, status, rejectionReason });
  const dispense = (documentId: string, reason: string, requestedBy?: string) =>
    dispenseMutation.mutateAsync({ documentId, reason, requestedBy });
  return {
    upload,
    review,
    dispense,
    uploading: uploadMutation.isPending,
    reviewing: reviewMutation.isPending,
    dispensing: dispenseMutation.isPending,
  };
}
