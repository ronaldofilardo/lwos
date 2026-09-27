import { useEffect } from "react";
import { ArrowLeft, FolderKanban, UsersRound } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CertidaoPanel } from "@/features/certidoes/CertidaoPanel";
import { DocumentPanel } from "@/features/documents/DocumentPanel";
import { ProcessTimeline } from "@/features/families/common/ProcessTimeline";
import { UnifiedRequirementsMap } from "@/features/families/common/UnifiedRequirementsMap";
import { ClientPatrimonio } from "@/features/families/client/ClientPatrimonio";
import { trpc } from "@/lib/trpc";

const regimeLabels: Record<string, string> = {
  CPB: "Comunhão Parcial de Bens",
  CUB: "Comunhão Universal de Bens",
  STB: "Separação Total de Bens",
  STOB: "Separação Obrigatória de Bens",
  NA: "Não Aplicável",
};

/**
 * Índice /minha-familia (sem id): cada titular tem uma única família — redireciona
 * direto; com múltiplos vínculos (caso raro), lista as famílias acessíveis.
 */
export function ClientFamilyIndex() {
  const [, navigate] = useLocation();
  const families = trpc.families.list.useQuery();
  const data = families.data ?? [];

  useEffect(() => {
    if (data.length === 1) navigate(`/minha-familia/${data[0].id}`);
  }, [data, navigate]);

  if (families.isLoading) {
    return <p className="text-sm text-lucathi-gray">Carregando sua família…</p>;
  }

  if (!data.length) {
    return (
      <div className="rounded-2xl border border-lucathi-line bg-white p-8 text-center text-sm text-lucathi-gray">
        Você ainda não tem nenhuma família vinculada ao seu acesso. Fale com
        seu consultor Lucathi.
      </div>
    );
  }

  if (data.length === 1) {
    return <p className="text-sm text-lucathi-gray">Abrindo sua família…</p>;
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-lucathi-navy">
          Suas famílias
        </h1>
        <p className="mt-1 text-sm text-lucathi-gray">
          Selecione o caso familiar que deseja acompanhar.
        </p>
      </header>
      <div className="space-y-3">
        {data.map(family => (
          <div
            key={family.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-lucathi-line bg-white p-5"
          >
            <div>
              <p className="text-sm font-medium text-lucathi-navy">
                {family.name}
              </p>
              <p className="text-xs text-lucathi-gray">
                {family.civilStatus} ·{" "}
                {regimeLabels[family.maritalRegime] ?? family.maritalRegime}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/minha-familia/${family.id}`)}
            >
              Abrir
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Área do titular: visão da própria família, sem abas operacionais do sócio. */
export default function ClientFamilyPage() {
  const [, params] = useRoute("/minha-familia/:familyId");
  const familyId = params?.familyId ?? "";
  const enabled = Boolean(familyId);

  const family = trpc.families.get.useQuery({ familyId }, { enabled });
  const timeline = trpc.families.timeline.useQuery({ familyId }, { enabled });

  if (!familyId || family.isLoading) {
    return <p className="text-sm text-lucathi-gray">Carregando sua família…</p>;
  }

  if (family.isError || !family.data) {
    return (
      <div className="rounded-2xl border border-lucathi-line bg-white p-8 text-center text-sm text-lucathi-gray">
        Família não encontrada ou sem permissão de acesso.
      </div>
    );
  }

  const percent = timeline.data?.overallPercent;

  return (
    <section className="space-y-6">
      <Button
        asChild
        variant="ghost"
        className="-ml-3 text-lucathi-gray hover:text-lucathi-navy"
      >
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 size-4" /> Voltar ao início
        </Link>
      </Button>

      <header className="rounded-[28px] bg-lucathi-deep p-7 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
              Acesso do titular · Consulta da família
            </p>
            <h1 className="mt-2 font-display text-4xl">{family.data.name}</h1>
            <p className="mt-2 text-sm text-white/80">
              {family.data.civilStatus} ·{" "}
              {regimeLabels[family.data.maritalRegime] ??
                family.data.maritalRegime}
            </p>
          </div>
          {typeof percent === "number" ? (
            <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
              <FolderKanban className="size-5 text-white/80" />
              <div className="text-xs">
                <p className="font-semibold uppercase tracking-wider text-white/60">
                  Progresso do processo
                </p>
                <p className="text-white font-medium">{percent}% concluído</p>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <Tabs defaultValue="documentos" className="space-y-6">
        <TabsList className="flex h-auto flex-wrap gap-1 rounded-xl border border-lucathi-line/60 bg-lucathi-mist/80 p-1">
          <TabsTrigger
            value="documentos"
            className="rounded-lg px-4 py-2 text-xs font-semibold gap-2 data-[state=active]:bg-white data-[state=active]:text-lucathi-navy data-[state=active]:shadow-sm"
          >
            Meus documentos
          </TabsTrigger>
          <TabsTrigger
            value="acompanhamento"
            className="rounded-lg px-4 py-2 text-xs font-semibold gap-2 data-[state=active]:bg-white data-[state=active]:text-lucathi-navy data-[state=active]:shadow-sm"
          >
            Acompanhamento
          </TabsTrigger>
          <TabsTrigger
            value="certidoes"
            className="rounded-lg px-4 py-2 text-xs font-semibold gap-2 data-[state=active]:bg-white data-[state=active]:text-lucathi-navy data-[state=active]:shadow-sm"
          >
            Certidões & CNDs
          </TabsTrigger>
          <TabsTrigger
            value="patrimonio"
            className="rounded-lg px-4 py-2 text-xs font-semibold gap-2 data-[state=active]:bg-white data-[state=active]:text-lucathi-navy data-[state=active]:shadow-sm"
          >
            <UsersRound className="size-4" /> Patrimônio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documentos" className="space-y-6">
          <DocumentPanel familyId={familyId} />
        </TabsContent>

        <TabsContent value="acompanhamento" className="space-y-6">
          <UnifiedRequirementsMap familyId={familyId} />
          <ProcessTimeline familyId={familyId} />
        </TabsContent>

        <TabsContent value="certidoes" className="space-y-6">
          <CertidaoPanel familyId={familyId} readOnly />
        </TabsContent>

        <TabsContent value="patrimonio" className="space-y-6">
          <ClientPatrimonio familyId={familyId} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
