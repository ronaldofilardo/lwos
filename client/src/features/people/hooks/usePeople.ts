import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { errorMessage } from "@/lib/trpcError";
import type { PersonFormSubmit } from "@/features/people/common/PersonForm";

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
    onError: error => toast.error(errorMessage(error)),
  });

  const addPerson = async (data: PersonFormSubmit) =>
    create.mutateAsync({ familyId, ...data });

  const update = trpc.people.update.useMutation({
    onSuccess: result => {
      utils.people.list.invalidate({ familyId });
      utils.documents.list.invalidate({ familyId });
      toast.success(
        result.migratedFiles > 0
          ? `Pessoa atualizada. ${result.migratedFiles} arquivo(s) movido(s) de pasta.`
          : "Pessoa atualizada."
      );
    },
    onError: error => toast.error(errorMessage(error)),
  });
  const updatePerson = async (data: PersonFormSubmit & { personId: string }) =>
    update.mutateAsync({ familyId, ...data });

  const remove = trpc.people.remove.useMutation({
    onSuccess: result => {
      utils.people.list.invalidate({ familyId });
      utils.documents.list.invalidate({ familyId });
      toast.success(
        result.archivedDocuments > 0
          ? `Pessoa excluída. ${result.archivedDocuments} documento(s) arquivado(s).`
          : "Pessoa excluída."
      );
    },
    onError: error => toast.error(errorMessage(error)),
  });
  const removePerson = (personId: string) =>
    remove.mutateAsync({ familyId, personId });

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
    onError: error => toast.error(errorMessage(error)),
  });
  const markPrimary = (personId: string) =>
    setPrimary.mutateAsync({ familyId, personId });

  return {
    people: list.data ?? [],
    loading: list.isLoading,
    addPerson,
    creating: create.isPending,
    updatePerson,
    updating: update.isPending,
    removePerson,
    removing: remove.isPending,
    markPrimary,
    markingPrimary: setPrimary.isPending,
  };
}
