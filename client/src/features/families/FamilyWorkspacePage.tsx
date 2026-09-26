import {
  ArrowLeft,
  FileStack,
  FolderKanban,
  Layers,
  Presentation,
  ShieldCheck,
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { PeoplePanel } from "@/features/people/PeoplePanel";
import { DocumentPanel } from "@/features/documents/DocumentPanel";
import { CertidaoPanel } from "@/features/certidoes/CertidaoPanel";
import { PropertyPanel } from "@/features/properties/PropertyPanel";
import { CompanyPanel } from "@/features/companies/CompanyPanel";
import { AssetsPanel } from "@/features/assets/AssetsPanel";
import { LwrPanel } from "@/features/reports/LwrPanel";
import { FinancialProposalPanel } from "@/features/proposals/FinancialProposalPanel";
import { PortalPanel } from "@/features/portal/PortalPanel";
import { AuditPanel } from "@/features/audit/AuditPanel";
import { ProcessTimeline } from "./common/ProcessTimeline";

export function FamilyWorkspacePage() {
  const [, params] = useRoute("/familias/:familyId");
  const familyId = params?.familyId ?? "";
  const family = trpc.families.get.useQuery(
    { familyId },
    { enabled: Boolean(familyId) }
  );

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

  const regimeLabels: Record<string, string> = {
    CPB: "Comunhão Parcial de Bens",
    CUB: "Comunhão Universal de Bens",
    STB: "Separação Total de Bens",
    STOB: "Separação Obrigatória de Bens",
    NA: "Não Aplicável",
  };

  return (
    <section className="space-y-6">
      <Button
        asChild
        variant="ghost"
        className="-ml-3 text-lucathi-gray hover:text-lucathi-navy"
      >
        <Link href="/familias">
          <ArrowLeft className="mr-2 size-4" /> Voltar para famílias
        </Link>
      </Button>

      {/* Header Executivo da Área de Trabalho */}
      <header className="rounded-[28px] bg-lucathi-deep p-7 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
              Área de Trabalho do Caso / Projeto Familiar
            </p>
            <h1 className="mt-2 font-display text-4xl">{family.data.name}</h1>
            <p className="mt-2 text-sm text-white/80">
              {family.data.civilStatus} ·{" "}
              {regimeLabels[family.data.maritalRegime] ||
                family.data.maritalRegime}{" "}
              · Título do projeto sincronizado com a família.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
            <FolderKanban className="size-5 text-white/80" />
            <div className="text-xs">
              <p className="text-white/60 uppercase tracking-wider font-semibold">
                Estrutura Ativa
              </p>
              <p className="text-white font-medium">Due Diligence Integrada</p>
            </div>
          </div>
        </div>
      </header>

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
            <FileStack className="size-4" /> Matriz Documental & Certidões
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

        {/* ABA 3: MATRIZ DOCUMENTAL, SEÇÕES E CERTIDÕES */}
        <TabsContent value="documentos" className="space-y-6">
          <DocumentPanel familyId={familyId} />
          <CertidaoPanel familyId={familyId} />
        </TabsContent>

        {/* ABA 4: PORTAL & AUDITORIA */}
        <TabsContent value="portal-auditoria" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <PortalPanel familyId={familyId} />
            <AuditPanel familyId={familyId} />
          </div>
        </TabsContent>

        {/* ABA 5: VISÃO UNIFICADA COMPLETA — timeline do processo */}
        <TabsContent value="visao-unificada" className="space-y-6">
          <ProcessTimeline familyId={familyId} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
