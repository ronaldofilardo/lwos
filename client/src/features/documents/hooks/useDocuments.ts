import { trpc } from "@/lib/trpc";

export function useDocuments(familyId: string) {
  const list = trpc.documents.list.useQuery({ familyId });
  return { documents: list.data ?? [], loading: list.isLoading };
}
