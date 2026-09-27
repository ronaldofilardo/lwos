import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { FamilyFormData } from "../types";

export function useFamilies() {
  const utils = trpc.useUtils();
  const list = trpc.families.list.useQuery();
  const create = trpc.families.create.useMutation({ onSuccess: () => { utils.families.list.invalidate(); toast.success("Família criada com projeto vinculado."); }, onError: error => toast.error(error.message) });
  const generateFirstAccessLink = trpc.families.generateFirstAccessLink.useMutation({ onSuccess: () => toast.success("Link gerado!"), onError: error => toast.error(error.message) });
  const generatePasswordResetLink = trpc.families.generatePasswordResetLink.useMutation({ onSuccess: () => toast.success("Link de redefinição de senha gerado!"), onError: error => toast.error(error.message) });
  const createFamily = async (data: FamilyFormData) => create.mutateAsync(data);
  return { families: list.data ?? [], loading: list.isLoading, createFamily, creating: create.isPending, generateFirstAccessLink, generatePasswordResetLink };
}
