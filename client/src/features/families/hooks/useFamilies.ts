import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { errorMessage } from "@/lib/trpcError";
import type { FamilyFormData } from "../types";

export function useFamilies() {
  const utils = trpc.useUtils();
  const list = trpc.families.list.useQuery();
  const create = trpc.families.create.useMutation({ onSuccess: () => { utils.families.list.invalidate(); toast.success("Projeto criado."); }, onError: error => toast.error(errorMessage(error)) });
  const generateFirstAccessLink = trpc.families.generateFirstAccessLink.useMutation({ onSuccess: () => toast.success("Link gerado!"), onError: error => toast.error(errorMessage(error)) });
  const generatePasswordResetLink = trpc.families.generatePasswordResetLink.useMutation({ onSuccess: () => toast.success("Link de redefinição de senha gerado!"), onError: error => toast.error(errorMessage(error)) });
  const createFamily = async (data: FamilyFormData) => create.mutateAsync(data);
  return { families: list.data ?? [], loading: list.isLoading, createFamily, creating: create.isPending, generateFirstAccessLink, generatePasswordResetLink };
}
