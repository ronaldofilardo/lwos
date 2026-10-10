import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileStack,
  FolderKanban,
  Layers,
  Presentation,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Link, useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { PeoplePanel } from "@/features/people/PeoplePanel";
import { DocumentPanel } from "@/features/documents/DocumentPanel";
import { PropertyPanel } from "@/features/properties/PropertyPanel";
import { CompanyPanel } from "@/features/companies/CompanyPanel";
import { AssetsPanel } from "@/features/assets/AssetsPanel";
import { LwrPanel } from "@/features/reports/LwrPanel";
import { FinancialProposalPanel } from "@/features/proposals/FinancialProposalPanel";
import { PortalPanel } from "@/features/portal/PortalPanel";
import { AuditPanel } from "@/features/audit/AuditPanel";
import { ProcessTimeline } from "./common/ProcessTimeline";
import { UnifiedRequirementsMap } from "./common/UnifiedRequirementsMap";
import { AlertIndicator } from "@/features/alerts/AlertIndicator";
import { useProjectAlerts } from "@/features/alerts/useProjectAlerts";
import {
  projectObjectiveLabels,
  projectStatusLabels,
  type ProjectObjective,
} from "./types";

/** Subtítulo da Área de Trabalho: dois primeiros objetivos + «+N». */
function formatObjectives(objectives: string[]): string {
  const labels = objectives.map(
    objective => projectObjectiveLabels[objective as ProjectObjective] ?? objective
  );
  if (labels.length === 0) return "Sem objetivos registrados.";
  if (labels.length <= 2) return labels.join(" · ");
  return `${labels.slice(0, 2).join(" · ")} +${labels.length - 2}`;
}

export function FamilyWorkspacePage() {
  const [, params] = useRoute("/familias/:familyId");
  const familyId = params?.familyId ?? "";
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const isClient = user?.role === "CLIENTE";

  // O titular (CLIENTE) não usa a área de trabalho do sócio: segue para a
  // página dedicada da própria família.
  useEffect(() => {
    if (isClient && familyId) navigate(`/minha-familia/${familyId}`);
  }, [isClient, familyId, navigate]);

  const family = trpc.families.get.useQuery(
    { familyId },
    { enabled: Boolean(familyId) }
  );

  // Fase 9 — alertas do projeto e fluxo de conclusão com gate no servidor.
  const utils = trpc.useUtils();
  const { counts, blockers, redCertidoes } = useProjectAlerts(familyId);
  const [concludeOpen, setConcludeOpen] = useState(false);
  const [justification, setJustification] = useState("");
  const conclude = trpc.families.updateStatus.useMutation({
    onSuccess: () => {
      utils.families.list.invalidate();
      utils.families.get.invalidate({ familyId });
      utils.certidoes.summary.invalidate({ familyId });
      setConcludeOpen(false);
      setJustification("");
      toast.success("Projeto concluído.");
    },
    onError: e => toast.error(e.message),
  });

  if (!user || isClient) {
    return (
      <p className="text-sm text-lucathi-gray">Abrindo sua família…</p>
    );
  }

  if (family.isLoading) {
    return (
      <p className="text-sm text-lucathi-gray">Carregando caso familiar…</p>
    );
  }

  if (!family.data) {
    return (
      <p className="text-sm text-lucathi-gray">
        Família não encontrada ou sem permissão de acesso.
      </p>
    );
  }

  return (
    <section className="space-y-6">
      <Button
        asChild
        variant="ghost"
        className="-ml-3 text-lucathi-gray hover:text-lucathi-navy"
      >
        <Link href="/familias">
          <ArrowLeft className="mr-2 size-4" /> Voltar para Projetos
        </Link>
      </Button>

      {/* Header Executivo da Área de Trabalho */}
      <header className="rounded-[28px] bg-lucathi-deep p-7 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
              Área de Trabalho - Projeto
            </p>
            <h1 className="mt-2 font-display text-4xl">{family.data.name}</h1>
            <p className="mt-2 text-sm text-white/80">
              {formatObjectives(family.data.objectives ?? [])}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
              <FolderKanban className="size-5 text-white/80" />
              <div className="text-xs">
                <p className="text-white/60 uppercase tracking-wider font-semibold">
                  Estrutura Ativa
                </p>
                <p className="text-white font-medium">Due Diligence Integrada</p>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wider font-semibold text-white/60">
                Status do Projeto
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium">
                {projectStatusLabels[
                  (family.data.status ?? "ATIVO") as keyof typeof projectStatusLabels
                ] ?? family.data.status}
                <AlertIndicator
                  level={
                    (counts?.vermelho ?? 0) > 0
                      ? "VERMELHO"
                      : (counts?.amarelo ?? 0) > 0
                        ? "AMARELO"
                        : undefined
                  }
                />
              </p>
              {(family.data.status ?? "ATIVO") !== "CONCLUIDO" &&
              (family.data.status ?? "ATIVO") !== "CANCELADO" ? (
                <Button
                  size="sm"
                  className="mt-2 bg-white text-lucathi-navy hover:bg-white/90"
                  onClick={() => setConcludeOpen(open => !open)}
                >
                  <CheckCircle2 className="mr-1 size-3.5" />
                  {concludeOpen ? "Fechar" : "Concluir projeto"}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Fase 9 — painel de conclusão com bloqueios e justificativa */}
      {concludeOpen ? (
        <div className="rounded-2xl border border-lucathi-line bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
            Concluir projeto
          </p>
          <p className="mt-1 text-sm text-lucathi-navy">
            O projeto só vai para «Concluído» sem gravame pendente e com as
            certidões em vermelho justificadas.
          </p>
          {blockers.length ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-700">
              {blockers.map(blocker => (
                <li key={blocker}>{blocker}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-emerald-700">
              Nenhum bloqueio encontrado.
            </p>
          )}
          {redCertidoes.length ? (
            <label className="mt-4 block">
              <span className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
                Justificativa para as certidões em vermelho (obrigatória)
              </span>
              <textarea
                className="mt-1 w-full rounded-xl border border-lucathi-line px-3 py-2 text-sm"
                rows={3}
                value={justification}
                onChange={e => setJustification(e.target.value)}
                placeholder="Explique por que as certidões em vermelho podem ser aceitas neste projeto."
              />
            </label>
          ) : null}
          <div className="mt-4 flex items-center gap-2">
            <Button
              size="sm"
              disabled={
                conclude.isPending ||
                (redCertidoes.length > 0 && !justification.trim())
              }
              onClick={() =>
                conclude.mutate({
                  familyId,
                  status: "CONCLUIDO",
                  justification: justification.trim() || undefined,
                })
              }
            >
              Confirmar conclusão
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setConcludeOpen(false);
                setJustification("");
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : null}

      {/* Navegação por Abas Especializadas */}
      <Tabs defaultValue="due-diligence" className="space-y-6">
        <TabsList className="bg-lucathi-mist/80 p-1 rounded-xl h-auto flex flex-wrap gap-1 border border-lucathi-line/60">
          <TabsTrigger
            value="due-diligence"
            className="data-[state=active]:bg-white data-[state=active]:text-lucathi-navy data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-xs font-semibold gap-2"
          >
            <Layers className="size-4" /> Due Diligence (4 Pilares)
          </TabsTrigger>
          <TabsTrigger
            value="lwr-proposta"
            className="data-[state=active]:bg-white data-[state=active]:text-lucathi-navy data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-xs font-semibold gap-2"
          >
            <Presentation className="size-4" /> LWR & Proposta Financeira
          </TabsTrigger>
          <TabsTrigger
            value="documentos"
            className="data-[state=active]:bg-white data-[state=active]:text-lucathi-navy data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-xs font-semibold gap-2"
          >
            <FileStack className="size-4" /> Documentos e Certidões
          </TabsTrigger>
          <TabsTrigger
            value="portal-auditoria"
            className="data-[state=active]:bg-white data-[state=active]:text-lucathi-navy data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-xs font-semibold gap-2"
          >
            <ShieldCheck className="size-4" /> Portal & Governança
          </TabsTrigger>
          <TabsTrigger
            value="visao-unificada"
            className="data-[state=active]:bg-white data-[state=active]:text-lucathi-navy data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-xs font-semibold gap-2"
          >
            <FolderKanban className="size-4" /> Visão Unificada Completa
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: DUE DILIGENCE (4 PILARES) */}
        <TabsContent value="due-diligence" className="space-y-6">
          <div className="rounded-2xl border border-lucathi-line/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
              Planilha de Due Diligence Patrimonial & Sucessória
            </p>
            <p className="mt-1 text-sm text-lucathi-navy">
              Organização unificada dos 4 pilares: <strong>Família</strong>,{" "}
              <strong>Imóveis</strong>, <strong>Sociedades</strong> e{" "}
              <strong>Demais Ativos</strong>.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Pilar 1: Família */}
            <div className="space-y-6">
              <PeoplePanel familyId={familyId} />
              <CompanyPanel familyId={familyId} />
            </div>

            {/* Pilar 2 & 4: Imóveis e Ativos */}
            <div className="space-y-6">
              <PropertyPanel familyId={familyId} />
              <AssetsPanel familyId={familyId} />
            </div>
          </div>
        </TabsContent>

        {/* ABA 2: LWR & PROPOSTA FINANCEIRA */}
        <TabsContent value="lwr-proposta" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <LwrPanel familyId={familyId} />
            <FinancialProposalPanel familyId={familyId} />
          </div>
        </TabsContent>

        {/* ABA 3: DOCUMENTOS E CERTIDÕES */}
        <TabsContent value="documentos" className="space-y-6">
          <DocumentPanel familyId={familyId} />
        </TabsContent>

        {/* ABA 4: PORTAL & AUDITORIA */}
        <TabsContent value="portal-auditoria" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <PortalPanel familyId={familyId} />
            <AuditPanel familyId={familyId} />
          </div>
        </TabsContent>

        {/* ABA 5: VISÃO UNIFICADA COMPLETA — mapa visual + timeline */}
        <TabsContent value="visao-unificada" className="space-y-6">
          <UnifiedRequirementsMap familyId={familyId} />
          <ProcessTimeline familyId={familyId} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
