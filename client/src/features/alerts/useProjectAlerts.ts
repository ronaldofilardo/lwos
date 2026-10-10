import { trpc } from "@/lib/trpc";

/** Resumo de alertas do projeto (Fase 9) — mesmo dado em todas as telas. */
export function useProjectAlerts(familyId: string) {
  const summary = trpc.certidoes.summary.useQuery(
    { familyId },
    { enabled: Boolean(familyId) }
  );
  return {
    bySubject: summary.data?.bySubject,
    counts: summary.data?.counts,
    blockers: summary.data?.blockers ?? [],
    hardBlockers: summary.data?.hardBlockers ?? [],
    redCertidoes: summary.data?.redCertidoes ?? [],
    pendenteGravames: summary.data?.pendenteGravames ?? [],
    canConclude: summary.data?.canConclude ?? true,
    loading: summary.isLoading,
  };
}
