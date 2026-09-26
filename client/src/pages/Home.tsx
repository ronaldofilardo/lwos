import { ArrowRight, FileCheck2, Landmark, UsersRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { MetricCard } from "@/components/lucathi/MetricCard";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  // CLIENTE não tem o que fazer nessa landing (é o painel/CTA do time) —
  // manda direto pra própria visão geral dele.
  useEffect(() => {
    if (!loading && user?.role === "CLIENTE") navigate("/dashboard");
  }, [loading, user, navigate]);

  if (loading || user?.role === "CLIENTE") return null;

  const families = trpc.families.list.useQuery();
  const total = families.data?.length ?? 0;
  return <section className="space-y-8"><div className="grid gap-6 rounded-[28px] bg-lucathi-deep p-8 text-white lg:grid-cols-[1.4fr_0.6fr]"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Lucathi Wealth OS</p><h1 className="mt-4 max-w-xl font-display text-4xl leading-tight">Governança patrimonial com clareza para as próximas gerações.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-white/72">Famílias, documentos, patrimônio e estruturas organizados em um ambiente confidencial.</p><Link href="/familias" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline">Acessar famílias <ArrowRight className="size-4" /></Link></div><div className="hidden items-end justify-end lg:flex"><Landmark className="size-32 text-white/15" /></div></div><div className="grid gap-4 md:grid-cols-3"><MetricCard label="Famílias" value={String(total).padStart(2, "0")} detail="Projetos patrimoniais ativos" /><MetricCard label="Documentos" value="—" detail="Aguardam o primeiro cadastro" /><MetricCard label="Validações" value="—" detail="Exclusivas do papel SOCIO" /></div><section className="rounded-2xl border border-lucathi-line bg-white p-6"><div className="flex items-center gap-3"><UsersRound className="size-5 text-lucathi-navy" /><div><h2 className="font-display text-2xl text-lucathi-navy">Próximo passo</h2><p className="text-sm text-lucathi-gray">Crie uma família para iniciar o fluxo de organização e diligência documental.</p></div></div><div className="mt-6 flex items-center gap-2 rounded-xl bg-lucathi-mist px-4 py-3 text-sm text-lucathi-ink"><FileCheck2 className="size-4 text-lucathi-navy" />Estados de documentos e trilha de auditoria serão visíveis por família.</div></section></section>;
}
