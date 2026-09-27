import { ArrowRight, FileStack, FolderKanban, Stamp, UsersRound, type LucideIcon } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/lucathi/StatusBadge";
import { useDocumentActions } from "@/features/documents/hooks/useDocumentActions";
import { DocumentActions } from "@/features/documents/common/DocumentActions";
import { ProcessTimeline } from "@/features/families/common/ProcessTimeline";
import {
  summarizeCertidoes,
  summarizeClientDocuments,
} from "@/features/families/client/clientFamilyStats";
import { trpc } from "@/lib/trpc";

function MetricCard({
  label,
  value,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        highlight
          ? "border-lucathi-navy/30 bg-lucathi-navy/5"
          : "border-lucathi-line bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="size-6 text-lucathi-navy" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-lucathi-gray">
            {label}
          </p>
          <p className="text-3xl font-display text-lucathi-navy">{value}</p>
        </div>
      </div>
    </div>
  );
}

const ACTION_STATUSES = new Set(["PENDENTE", "REJEITADO", "VENCIDO"]);

function ActionRequiredList({ familyId }: { familyId: string }) {
  const documents = trpc.documents.list.useQuery({ familyId });
  const people = trpc.people.list.useQuery({ familyId });
  const companies = trpc.companies.list.useQuery({ familyId });
  const properties = trpc.properties.list.useQuery({ familyId });
  const assets = trpc.assets.list.useQuery({ familyId });
  const actions = useDocumentActions(familyId);

  const pending = (documents.data ?? []).filter(
    doc =>
      doc.entityType !== "CERTIDAO" &&
      ACTION_STATUSES.has(doc.status) &&
      doc.status !== "DISPENSADO"
  );

  const groups = [
    { title: "Familiar e Pessoas", items: pending.filter(d => d.entityType === "FAMILIA" || d.entityType === "PESSOA") },
    { title: "Holdings e Sociedades", items: pending.filter(d => d.entityType === "SOCIEDADE") },
    { title: "Imóveis", items: pending.filter(d => d.entityType === "IMOVEL") },
    { title: "Investimentos e Outros Ativos", items: pending.filter(d => d.entityType === "ATIVO") },
  ];

  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-lucathi-navy">
            Precisa da sua ação
          </h2>
          <p className="text-sm text-lucathi-gray">
            Documentos pendentes, vencidos ou que precisam de novo envio.
          </p>
        </div>
        <span className="rounded-full bg-lucathi-mist px-3 py-1 text-sm font-semibold text-lucathi-navy">
          {pending.length}
        </span>
      </header>

      <div className="mt-6 space-y-6">
        {documents.isLoading ? (
          <p className="text-sm text-lucathi-gray">Carregando documentos…</p>
        ) : null}
        {!documents.isLoading && !pending.length ? (
          <p className="rounded-xl border border-dashed border-lucathi-line px-4 py-3 text-sm text-lucathi-gray">
            Nenhum documento precisa da sua ação no momento.
          </p>
        ) : null}
        {groups.map(group => {
          if (group.items.length === 0) return null;

          const byEntity = group.items.reduce((acc, doc) => {
            let key = "Núcleo Familiar / Outro";

            if (doc.entityType === "PESSOA") {
              const person = people.data?.find(p => p.id === doc.entityId);
              if (person) key = person.fullName;
            } else if (doc.entityType === "SOCIEDADE") {
              const company = companies.data?.find(c => c.id === doc.entityId);
              if (company) key = company.legalName || "Holding sem nome";
            } else if (doc.entityType === "IMOVEL") {
              const property = properties.data?.find(p => p.id === doc.entityId);
              if (property) key = property.description || "Imóvel sem descrição";
            } else if (doc.entityType === "ATIVO") {
              const asset = assets.data?.find(a => a.id === doc.entityId);
              if (asset) key = asset.description || "Ativo sem nome";
            }

            if (!acc[key]) acc[key] = [];
            acc[key].push(doc);
            return acc;
          }, {} as Record<string, typeof group.items>);

          const getGroupBgColor = (title: string) => {
            switch(title) {
              case "Familiar e Pessoas": return "bg-blue-50";
              case "Holdings e Sociedades": return "bg-purple-50";
              case "Imóveis": return "bg-amber-50";
              case "Investimentos e Outros Ativos": return "bg-emerald-50";
              default: return "bg-slate-50";
            }
          };

          return (
            <div key={group.title} className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-lucathi-gray border-b pb-1">
                {group.title}
              </h3>
              {Object.entries(byEntity).map(([entityName, docs]) => (
                <div key={entityName} className={`space-y-3 rounded-2xl border border-lucathi-line p-4 ${getGroupBgColor(group.title)}`}>
                  {entityName !== "Núcleo Familiar / Outro" && (
                    <h4 className="text-sm font-semibold text-lucathi-navy px-1">{entityName}</h4>
                  )}
                  {docs.map(doc => (
                    <div
                      key={doc.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-lucathi-line/60 bg-white p-4 shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-lucathi-navy">
                          {doc.category}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <StatusBadge status={doc.status} />
                          <span className="text-xs text-lucathi-gray">
                            {doc.currentVersion
                              ? `v${doc.currentVersion} enviada`
                              : "ainda não enviada"}
                          </span>
                        </div>
                      </div>
                      <DocumentActions
                        documentId={doc.id}
                        canReview={false}
                        busy={actions.uploading}
                        status={doc.status}
                        onUpload={file => actions.upload(doc.id, file)}
                        onReview={async () => undefined}
                        onDispense={async () => undefined}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

type FamilyRow = {
  id: string;
  name: string;
  civilStatus: string;
  maritalRegime: string;
};

import { useState } from "react";

function ClientFamilyOverview({ family }: { family: FamilyRow }) {
  const familyId = family.id;
  const [activeTab, setActiveTab] = useState<"geral" | "timeline">("geral");
  const people = trpc.people.list.useQuery({ familyId });
  const documents = trpc.documents.list.useQuery({ familyId });
  const properties = trpc.properties.list.useQuery({ familyId });
  const companies = trpc.companies.list.useQuery({ familyId });
  const assets = trpc.assets.list.useQuery({ familyId });
  const certidoes = trpc.certidoes.list.useQuery({ familyId });
  const timeline = trpc.families.timeline.useQuery({ familyId });

  const docStats = summarizeClientDocuments(documents.data ?? []);
  const certStats = summarizeCertidoes(certidoes.data ?? []);
  const percent = timeline.data?.overallPercent;

  return (
    <section className="space-y-8">
      <header className="rounded-[28px] bg-lucathi-deep p-7 text-white shadow-lg">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
              Acesso do titular
            </p>
            <h1 className="mt-2 font-display text-4xl">{family.name}</h1>
            <p className="mt-2 text-sm text-white/80">{family.civilStatus}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {typeof percent === "number" ? (
              <div className="rounded-2xl bg-white/10 px-4 py-2.5 text-center backdrop-blur-sm">
                <p className="text-xl font-semibold text-white">{percent}%</p>
                <p className="text-[11px] uppercase tracking-wider text-white/60">
                  Progresso
                </p>
              </div>
            ) : null}
            <Button
              asChild
              className="bg-white text-lucathi-deep hover:bg-lucathi-mist"
            >
              <Link href={`/minha-familia/${family.id}`}>
                Abrir minha família{" "}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-1">
          <button
            onClick={() => setActiveTab("geral")}
            className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
              activeTab === "geral"
                ? "bg-lucathi-navy text-white"
                : "text-lucathi-gray hover:bg-lucathi-mist hover:text-lucathi-navy"
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
              activeTab === "timeline"
                ? "bg-lucathi-navy text-white"
                : "text-lucathi-gray hover:bg-lucathi-mist hover:text-lucathi-navy"
            }`}
          >
            Visão Unificada Completa
          </button>
        </aside>

        <div className="min-w-0">
          {activeTab === "geral" && (
            <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Precisam da sua ação"
                  value={String(docStats.actionRequired)}
                  icon={FileStack}
                  highlight={docStats.actionRequired > 0}
                />
                <MetricCard
                  label="Em análise da Lucathi"
                  value={String(docStats.inAnalysis)}
                  icon={FolderKanban}
                />
                <MetricCard
                  label="Documentos resolvidos"
                  value={`${docStats.resolved}/${docStats.total}`}
                  icon={UsersRound}
                />
                <MetricCard
                  label="Certidões vencidas"
                  value={String(certStats.expired)}
                  icon={Stamp}
                  highlight={certStats.expired > 0}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-lucathi-line bg-white px-3 py-1 text-sm text-lucathi-gray">
                  Pessoas:{" "}
                  <strong className="text-lucathi-navy">
                    {people.data?.length ?? "—"}
                  </strong>
                </span>
                <span className="rounded-full border border-lucathi-line bg-white px-3 py-1 text-sm text-lucathi-gray">
                  Imóveis:{" "}
                  <strong className="text-lucathi-navy">
                    {properties.data?.length ?? "—"}
                  </strong>
                </span>
                <span className="rounded-full border border-lucathi-line bg-white px-3 py-1 text-sm text-lucathi-gray">
                  Sociedades:{" "}
                  <strong className="text-lucathi-navy">
                    {companies.data?.length ?? "—"}
                  </strong>
                </span>
                <span className="rounded-full border border-lucathi-line bg-white px-3 py-1 text-sm text-lucathi-gray">
                  Demais ativos:{" "}
                  <strong className="text-lucathi-navy">
                    {assets.data?.length ?? "—"}
                  </strong>
                </span>
                <span className="rounded-full border border-lucathi-line bg-white px-3 py-1 text-sm text-lucathi-gray">
                  Certidões pendentes:{" "}
                  <strong className="text-lucathi-navy">{certStats.pending}</strong>
                </span>
              </div>

              <ActionRequiredList familyId={familyId} />
            </div>
          )}

          {activeTab === "timeline" && (
            <ProcessTimeline familyId={familyId} />
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Dashboard pós-login do titular (CLIENTE): cada titular tem uma única
 * família — sem seletor; múltiplos vínculos (improváveis) viram lista.
 */
export default function ClientFamilyDashboard() {
  const families = trpc.families.list.useQuery();
  const [, navigate] = useLocation();
  const data = families.data ?? [];

  if (families.isLoading) {
    return (
      <div className="p-8 text-center text-lucathi-gray">
        Carregando seus dados…
      </div>
    );
  }

  if (families.isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Erro ao carregar seus dados
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-2xl border border-lucathi-line bg-white p-8 text-center text-sm text-lucathi-gray">
        Você ainda não tem nenhuma família vinculada ao seu acesso. Fale com
        seu consultor Lucathi.
      </div>
    );
  }

  if (data.length > 1) {
    return (
      <section className="space-y-8">
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
                  {family.civilStatus}
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

  return <ClientFamilyOverview family={data[0]} />;
}
