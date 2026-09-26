import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import type {
  ProcessStage,
  ProcessStageStatus,
} from "../../../../../server/features/families/family-timeline";

const statusMeta: Record<
  ProcessStageStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    iconClass: string;
    chipClass: string;
  }
> = {
  CONCLUIDO: {
    label: "Concluído",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    chipClass: "bg-emerald-50 text-emerald-700",
  },
  EM_ANDAMENTO: {
    label: "Em andamento",
    icon: Loader2,
    iconClass: "text-lucathi-navy animate-spin",
    chipClass: "bg-lucathi-navy/10 text-lucathi-navy",
  },
  PENDENTE: {
    label: "Pendente",
    icon: CircleDashed,
    iconClass: "text-lucathi-gray",
    chipClass: "bg-lucathi-mist text-lucathi-gray",
  },
  BLOQUEADO: {
    label: "Bloqueado",
    icon: AlertTriangle,
    iconClass: "text-red-600",
    chipClass: "bg-red-50 text-red-700",
  },
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return null;
  }
}

function StageNode({ stage }: { stage: ProcessStage }) {
  const meta = statusMeta[stage.status];
  const Icon = meta.icon;
  const date = formatDate(stage.at);

  return (
    <li className="relative flex gap-4 pb-8 last:pb-0">
      <div className="flex flex-col items-center">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-full border border-lucathi-line bg-white ${meta.iconClass}`}
          aria-hidden
        >
          <Icon className="size-4.5" />
        </span>
        <span className="mt-1 w-px flex-1 bg-lucathi-line/80 last:hidden" />
      </div>
      <div className="min-w-0 flex-1 rounded-xl border border-lucathi-line/70 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-lucathi-navy">
            {stage.title}
          </p>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${meta.chipClass}`}
          >
            {meta.label}
          </span>
        </div>
        <p className="mt-1 text-xs text-lucathi-gray">{stage.description}</p>
        {stage.detail ? (
          <p className="mt-1.5 text-xs text-lucathi-navy/80">{stage.detail}</p>
        ) : null}
        {stage.progress && stage.progress.total > 0 ? (
          <div className="mt-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-lucathi-mist">
              <div
                className="h-full rounded-full bg-lucathi-navy transition-all"
                style={{
                  width: `${Math.round(
                    Math.min(1, stage.progress.current / stage.progress.total) *
                      100
                  )}%`,
                }}
              />
            </div>
            <p className="mt-1 text-[11px] text-lucathi-gray">
              {stage.progress.current}/{stage.progress.total}
            </p>
          </div>
        ) : null}
        {date ? (
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-lucathi-gray">
            <Clock className="size-3" /> {date}
          </p>
        ) : null}
      </div>
    </li>
  );
}

export function ProcessTimeline({ familyId }: { familyId: string }) {
  const timeline = trpc.families.timeline.useQuery(
    { familyId },
    { enabled: Boolean(familyId) }
  );

  if (timeline.isLoading) {
    return (
      <div className="rounded-2xl border border-lucathi-line bg-white p-6">
        <p className="text-sm text-lucathi-gray">Carregando linha do tempo…</p>
      </div>
    );
  }

  if (timeline.error || !timeline.data) {
    return (
      <div className="rounded-2xl border border-lucathi-line bg-white p-6">
        <p className="text-sm text-lucathi-gray">
          Não foi possível carregar a timeline do processo.
        </p>
      </div>
    );
  }

  const { stages, currentStageId, overallPercent } = timeline.data;
  const current = stages.find(s => s.id === currentStageId);

  return (
    <section className="space-y-4 rounded-2xl border border-lucathi-line/80 bg-white p-5 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
            Visão Unificada Completa
          </p>
          <h2 className="mt-1 font-display text-xl text-lucathi-navy">
            Linha do tempo do processo
          </h2>
          <p className="mt-1 text-sm text-lucathi-gray">
            Da origem do interesse até o momento atual da família — resumo das
            etapas, sem repetir a matriz documental.
          </p>
        </div>
        <div className="min-w-[10rem] rounded-xl bg-lucathi-mist px-4 py-3 text-center">
          <p className="text-2xl font-semibold text-lucathi-navy">
            {overallPercent}%
          </p>
          <p className="text-[11px] uppercase tracking-wider text-lucathi-gray">
            Progresso global
          </p>
        </div>
      </header>

      {current ? (
        <div className="rounded-xl border border-lucathi-navy/15 bg-lucathi-navy/5 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-lucathi-gray">
            Momento atual
          </p>
          <p className="mt-0.5 text-sm font-medium text-lucathi-navy">
            {current.title}
            {current.detail ? ` — ${current.detail}` : ""}
          </p>
        </div>
      ) : null}

      <ol className="mt-2">
        {stages.map(stage => (
          <StageNode key={stage.id} stage={stage} />
        ))}
      </ol>
    </section>
  );
}
