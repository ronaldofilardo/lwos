import { ArrowRight, Landmark } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { MetricCard } from "@/components/lucathi/MetricCard";
import { FamilyTable } from "@/features/families/common/FamilyTable";
import { formatBRL } from "@/features/properties/propertyCardView";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { isClient } from "@shared/domain/permissions";

export default function Home() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const isClientFlag = isClient(user?.role);
  // CLIENTE não tem o que fazer nessa landing (é o painel/CTA do time) —
  // manda direto pra própria visão geral dele.
  const enabled = !loading && !isClientFlag;

  useEffect(() => {
    if (!loading && isClientFlag) navigate("/dashboard");
  }, [loading, isClientFlag, navigate]);

  const families = trpc.families.list.useQuery(undefined, { enabled });
  const wealth = trpc.families.getManagedWealth.useQuery(undefined, { enabled });

  if (loading || isClientFlag) return null;

  const projects = families.data ?? [];
  const activeProjects = projects.filter(
    project => project.status === "ATIVO"
  ).length;
  const projectsValue = families.isLoading
    ? "—"
    : String(activeProjects).padStart(2, "0");
  const wealthValue = wealth.isLoading
    ? "—"
    : (formatBRL(wealth.data?.total ?? 0) ?? "—");

  return (
    <section className="space-y-8">
      <div className="grid gap-6 rounded-[28px] bg-lucathi-deep p-8 text-white lg:grid-cols-[1.4fr_0.6fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
            Lucathi Wealth OS
          </p>
          <h1 className="mt-4 max-w-xl font-display text-4xl leading-tight">
            Governança patrimonial com clareza para as próximas gerações.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/72">
            Famílias, documentos, patrimônio e estruturas organizados em um
            ambiente confidencial.
          </p>
          <Link
            href="/familias"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline"
          >
            Acessar projetos <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="hidden items-end justify-end lg:flex">
          <Landmark className="size-32 text-white/15" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          label="Projetos"
          value={projectsValue}
          detail="Projetos patrimoniais ativos"
        />
        <MetricCard
          label="Patrimônio sob Gestão"
          value={wealthValue}
          detail="Imóveis, sociedades e demais ativos"
        />
      </div>

      <section className="rounded-2xl border border-lucathi-line bg-white p-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-lucathi-navy">Projetos</h2>
            <p className="text-sm text-lucathi-gray">
              Acesso rápido à área de trabalho de cada projeto.
            </p>
          </div>
          <Link
            href="/familias"
            className="shrink-0 text-sm font-semibold text-lucathi-navy underline-offset-4 hover:underline"
          >
            Ver todos
          </Link>
        </header>
        <div className="mt-5">
          {families.isLoading ? (
            <p className="text-sm text-lucathi-gray">Carregando projetos…</p>
          ) : (
            <FamilyTable
              families={projects}
              emptyHint="Crie o primeiro projeto para iniciar o fluxo de diligência."
            />
          )}
        </div>
      </section>
    </section>
  );
}
