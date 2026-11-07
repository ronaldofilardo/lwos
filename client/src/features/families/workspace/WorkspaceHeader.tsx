import { trpc } from "@/lib/trpc";
import {
  FolderKanban,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectAlerts } from "@/features/alerts/useProjectAlerts";
import { AlertIndicator } from "@/features/alerts/AlertIndicator";
import { projectStatusLabels } from "../types";

interface Props {
  familyId: string;
  familyName: string;
  objectives: string[];
  status: string;
  counts: { vermelho?: number; amarelo?: number } | null | undefined;
  onConclude: () => void;
  concludeOpen: boolean;
}

export function WorkspaceHeader({
  familyId,
  familyName,
  objectives,
  status,
  counts,
  onConclude,
  concludeOpen,
}: Props) {
  const { counts: alertCounts, blockers, redCertidoes } = useProjectAlerts(
    familyId
  );
  const effectiveCounts = counts ?? alertCounts;
  const level =
    (effectiveCounts?.vermelho ?? 0) > 0
      ? "VERMELHO"
      : (effectiveCounts?.amarelo ?? 0) > 0
        ? "AMARELO"
        : undefined;
  const canConclude =
    status !== "CONCLUIDO" && status !== "CANCELADO";

  return (
    <header className="rounded-2xl bg-lucathi-deep p-7 text-white shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
            Área de Trabalho - Projeto
          </p>
          <h1 className="mt-2 font-display text-4xl">{familyName}</h1>
          <p className="mt-2 text-sm text-white/80">
            {objectives.length
              ? objectives.slice(0, 2).join(" · ") +
                (objectives.length > 2 ? ` +${objectives.length - 2}` : "")
              : "Sem objetivos registrados."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
            <FolderKanban className="size-5 text-white/80" />
            <div className="text-xs">
              <p className="text-white/60 uppercase tracking-wider font-semibold">
                Estrutura Ativa
              </p>
              <p className="text-white font-medium">Due Diligence Integrada</p>
            </div>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-white/60">
              Status do Projeto
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium">
              {projectStatusLabels[status as keyof typeof projectStatusLabels]}
              <AlertIndicator level={level} />
            </p>
            {canConclude && (
              <Button
                size="sm"
                className="mt-2 bg-white text-lucathi-navy hover:bg-white/90"
                onClick={onConclude}
              >
                <ShieldCheck className="mr-1 size-3.5" />
                {concludeOpen ? "Fechar" : "Concluir projeto"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
