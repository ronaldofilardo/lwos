import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { readAsBase64 } from "@/lib/file";
import type {
  PersonAttachment,
  PersonFormSubmit,
} from "@/features/people/common/PersonForm";

export function usePeople(familyId: string) {
  const utils = trpc.useUtils();
  const list = trpc.people.list.useQuery({ familyId });

  const create = trpc.people.create.useMutation({
    onSuccess: () => {
      utils.people.list.invalidate({ familyId });
      utils.documents.list.invalidate({ familyId });
      utils.certidoes.list.invalidate({ familyId });
      toast.success("Pessoa cadastrada e requisitos documentais criados.");
    },
    onError: error => toast.error(error.message),
  });

  const attach = trpc.people.attachDocuments.useMutation({
    onSuccess: result => {
      utils.documents.list.invalidate({ familyId });
      toast.success(
        `${result.stored.length} anexo(s) enviado(s) para análise.`
      );
    },
    onError: error => toast.error(error.message),
  });

  const addPerson = async (
    data: PersonFormSubmit,
    attachments: PersonAttachment[] = []
  ) => {
    const result = await create.mutateAsync({ familyId, ...data });
    if (attachments.length) {
      const payload = [];
      for (const attachment of attachments) {
        payload.push({
          category: attachment.category,
          fileName: attachment.file.name,
          mimeType: attachment.file.type,
          base64Data: await readAsBase64(attachment.file),
        });
      }
      await attach.mutateAsync({
        familyId,
        personId: result.personId,
        attachments: payload,
      });
    }
    return result;
  };

  const setPrimary = trpc.people.setPrimaryContact.useMutation({
    onSuccess: result => {
      utils.people.list.invalidate({ familyId });
      utils.documents.list.invalidate({ familyId });
      toast.success(
        result.migratedFiles > 0
          ? `Titular atualizado. ${result.migratedFiles} arquivo(s) movido(s) de pasta.`
          : "Titular da família atualizado."
      );
    },
    onError: error => toast.error(error.message),
  });
  const markPrimary = (personId: string) =>
    setPrimary.mutateAsync({ familyId, personId });

  return {
    people: list.data ?? [],
    loading: list.isLoading,
    addPerson,
    creating: create.isPending || attach.isPending,
    markPrimary,
    markingPrimary: setPrimary.isPending,
  };
}
