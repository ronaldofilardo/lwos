import { trpc } from "@/lib/trpc";
import { useProjectAlerts } from "@/features/alerts/useProjectAlerts";
import { ProcessTimeline } from "@/features/families/common/ProcessTimeline";
import { UnifiedRequirementsMap } from "@/features/families/common/UnifiedRequirementsMap";
import { ProjectKpiGrid } from "./ProjectKpiGrid";
import { ProjectPillarCards } from "./ProjectPillarCards";
import { ProjectAlertsList } from "./ProjectAlertsList";

/**
 * Dashboard executivo do projeto — aba «Visão Unificada Completa».
 *
 * Cockpit que o sócio do escritório abre para fazer o status check semanal.
 * Compõe KPIs, pilares (due diligence + patrimônio), alertas acionáveis
 * e preserva os componentes de timeline e mapa de requisitos existentes.
 */
export function ProjectHealthDashboard({ familyId }: { familyId: string }) {
  const family = trpc.families.get.useQuery(
    { familyId },
    { enabled: Boolean(familyId) }
  );
  const { counts, loading: alertsLoading } = useProjectAlerts(familyId);

  const red    = counts?.vermelho ?? 0;
  const yellow = counts?.amarelo ?? 0;

  const statusLine = alertsLoading
    ? "Verificando alertas…"
    : red > 0
      ? `${red} alerta(s) crítico(s) exigem atenção imediata`
      : yellow > 0
        ? `${yellow} ponto(s) de atenção — projeto avançando`
        : "Projeto em ordem — sem bloqueios identificados";

  return (
    <div className="space-y-6">
      {/* Resumo executivo em 1 linha */}
      <div
        className={`rounded-2xl border px-5 py-4 text-sm font-medium ${
          red > 0
            ? "border-red-200 bg-red-50 text-red-800"
            : yellow > 0
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
        }`}
      >
        {family.data ? (
          <span className="font-semibold">{family.data.name} · </span>
        ) : null}
        {statusLine}
      </div>

      {/* Zona 1 — KPIs */}
      <ProjectKpiGrid familyId={familyId} />

      {/* Zona 2 — Pilares */}
      <ProjectPillarCards familyId={familyId} />

      {/* Zona 3 — Alertas acionáveis */}
      <ProjectAlertsList familyId={familyId} />

      {/* Zona 4 — Mapa de requisitos + Timeline (componentes existentes) */}
      <UnifiedRequirementsMap familyId={familyId} />
      <ProcessTimeline familyId={familyId} />
    </div>
  );
}
