import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { isClient } from "@shared/domain/permissions";
import { WorkspaceHeader } from "./workspace/WorkspaceHeader";
import { WorkspaceTabsNav } from "./workspace/WorkspaceTabsNav";
import { ConcludeProjectModal } from "./workspace/ConcludeProjectModal";
import { PeoplePanel } from "@/features/people/PeoplePanel";
import { DocumentPanel } from "@/features/documents/DocumentPanel";
import { CalculationsTab } from "@/features/calculations/CalculationsTab";
import { PatrimonyTabContent } from "./workspace/PatrimonyTabContent";
import { LwrPanel } from "@/features/reports/LwrPanel";
import { FinancialProposalPanel } from "@/features/proposals/FinancialProposalPanel";
import { PortalPanel } from "@/features/portal/PortalPanel";
import { AuditPanel } from "@/features/audit/AuditPanel";
import { ProjectHealthDashboard } from "./dashboard/ProjectHealthDashboard";
import { useProjectAlerts } from "@/features/alerts/useProjectAlerts";

type Tab = { value: "due-diligence" | "documentos" | "patrimonio" | "calculos" | "lwr-proposta" | "portal-auditoria" | "visao-unificada"; content: React.ReactNode };

export function FamilyWorkspacePage() {
  const [, params] = useRoute("/familias/:familyId");
  const familyId = params?.familyId ?? "";
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const isClientFlag = isClient(user?.role);

  useEffect(() => { if (isClientFlag && familyId) navigate(`/minha-familia/${familyId}`); }, [isClientFlag, familyId, navigate]);

  const family = trpc.families.get.useQuery({ familyId }, { enabled: Boolean(familyId) });
  const { counts, blockers, redCertidoes } = useProjectAlerts(familyId);
  const [concludeOpen, setConcludeOpen] = useState(false);

  if (!user || isClientFlag) return <p className="text-sm text-lucathi-gray">Abrindo sua família…</p>;
  if (family.isLoading) return <p className="text-sm text-lucathi-gray">Carregando caso familiar…</p>;
  if (!family.data) return <p className="text-sm text-lucathi-gray">Família não encontrada ou sem permissão de acesso.</p>;

  const tabs: Tab[] = [
    { value: "due-diligence", content: <DueDiligenceTab familyId={familyId} /> },
    { value: "documentos", content: <DocumentPanel familyId={familyId} /> },
    { value: "patrimonio", content: <PatrimonyTabContent familyId={familyId} /> },
    { value: "calculos", content: <CalculationsTab familyId={familyId} /> },
    { value: "lwr-proposta", content: <LwrProposalTab familyId={familyId} /> },
    { value: "portal-auditoria", content: <PortalAuditTab familyId={familyId} /> },
    { value: "visao-unificada", content: <UnifiedTab familyId={familyId} /> },
  ];

  return (
    <section className="space-y-6">
      <Button asChild variant="ghost" className="-ml-3 text-lucathi-gray hover:text-lucathi-navy"><Link href="/familias"><ArrowLeft className="mr-2 size-4" /> Voltar para Projetos</Link></Button>
      <WorkspaceHeader familyId={familyId} familyName={family.data.name} objectives={family.data.objectives ?? []} status={family.data.status ?? "ATIVO"} counts={counts} onConclude={() => setConcludeOpen(true)} concludeOpen={concludeOpen} />
      <ConcludeProjectModal familyId={familyId} blockers={blockers} redCertidoes={redCertidoes} open={concludeOpen} onOpenChange={setConcludeOpen} />
      <WorkspaceTabsNav tabs={tabs} />
    </section>
  );
}

function DueDiligenceTab({ familyId }: { familyId: string }) {
  return (
    <div className="space-y-6 rounded-2xl border border-lucathi-line/80 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">Planilha de Due Diligence Patrimonial & Sucessória</p>
      <p className="mt-1 text-sm text-lucathi-navy">Pilar <strong>Família</strong>: composição familiar, titulares e requisitos de cada membro. Imóveis, sociedades e demais ativos ficam na aba <strong>Patrimônio</strong>.</p>
      <PeoplePanel familyId={familyId} />
    </div>
  );
}

function LwrProposalTab({ familyId }: { familyId: string }) {
  return (
    <div className="space-y-6 rounded-2xl border border-lucathi-line/80 bg-white p-5 shadow-sm">
      <div className="grid gap-6 xl:grid-cols-2"><LwrPanel familyId={familyId} /><FinancialProposalPanel familyId={familyId} /></div>
    </div>
  );
}

function PortalAuditTab({ familyId }: { familyId: string }) {
  return (
    <div className="space-y-6 rounded-2xl border border-lucathi-line/80 bg-white p-5 shadow-sm">
      <div className="grid gap-6 xl:grid-cols-2"><PortalPanel familyId={familyId} /><AuditPanel familyId={familyId} /></div>
    </div>
  );
}

function UnifiedTab({ familyId }: { familyId: string }) {
  return (
    <div className="space-y-6 rounded-2xl border border-lucathi-line/80 bg-white p-5 shadow-sm"><ProjectHealthDashboard familyId={familyId} /></div>
  );
}
