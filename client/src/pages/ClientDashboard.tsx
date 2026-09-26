import { UsersRound, FileStack, ShieldCheck, type LucideIcon } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { StatusBadge } from "@/components/lucathi/StatusBadge";

const regimeLabels: Record<string, string> = {
  CPB: "Comunhão Parcial de Bens",
  CUB: "Comunhão Universal de Bens",
  STB: "Separação Total de Bens",
  STOB: "Separação Obrigatória de Bens",
  NA: "Não Aplicável",
};

/**
 * Visão geral do CLIENTE — tela de consulta somente leitura dos dados e
 * documentos da(s) sua(s) família(s), cadastrados pela equipe (SOCIO/ANALISTA).
 * Não expõe métricas globais nem storage local, que são exclusivos do time.
 */
export default function ClientDashboard() {
  const families = trpc.families.list.useQuery();

  if (families.isLoading) return <div className="p-8 text-center text-lucathi-gray">Carregando seus dados…</div>;
  if (families.isError) return <div className="p-8 text-center text-red-500">Erro ao carregar seus dados</div>;

  const data = families.data ?? [];

  if (!data.length) {
    return (
      <div className="rounded-2xl border border-lucathi-line bg-white p-8 text-center text-sm text-lucathi-gray">
        Você ainda não tem nenhuma família vinculada ao seu acesso. Fale com seu consultor Lucathi.
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <header>
        <h1 className="font-display text-3xl text-lucathi-navy">Sua visão geral</h1>
        <p className="mt-1 text-sm text-lucathi-gray">Consulta somente leitura dos dados e documentos cadastrados pela sua equipe Lucathi.</p>
      </header>
      <div className="space-y-6">
        {data.map(family => <FamilyOverviewCard key={family.id} familyId={family.id} familyName={family.name} civilStatus={family.civilStatus} maritalRegime={family.maritalRegime} />)}
      </div>
    </section>
  );
}

function FamilyOverviewCard({ familyId, familyName, civilStatus, maritalRegime }: { familyId: string; familyName: string; civilStatus: string; maritalRegime: string }) {
  const people = trpc.people.list.useQuery({ familyId });
  const documents = trpc.documents.list.useQuery({ familyId });

  const peopleCount = people.data?.length ?? 0;
  // Certidões têm fluxo próprio (sócio), não entram na lista do cliente.
  const familyDocs = (documents.data ?? []).filter(
    doc => doc.entityType !== "CERTIDAO"
  );
  const documentsCount = familyDocs.length;

  return (
    <div className="rounded-2xl border border-lucathi-line bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-lucathi-navy">{familyName}</h2>
          <p className="text-xs text-lucathi-gray">{civilStatus} · {regimeLabels[maritalRegime] || maritalRegime}</p>
        </div>
        <Link href={`/familias/${familyId}`} className="text-sm font-medium text-lucathi-navy hover:underline">Ver detalhes completos →</Link>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <MetricCard label="Pessoas cadastradas" value={String(peopleCount)} icon={UsersRound} />
        <MetricCard label="Documentos" value={String(documentsCount)} icon={FileStack} />
      </div>

      <div className="mt-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.1em] text-lucathi-gray">
          <FileStack className="size-4" /> Documentos
        </h3>
        <div className="mt-3 space-y-2">
          {documents.isLoading ? <p className="text-sm text-lucathi-gray">Carregando documentos…</p> : null}
          {!documents.isLoading && !documentsCount ? <p className="text-sm text-lucathi-gray">Nenhum documento cadastrado ainda.</p> : null}
          {familyDocs.map(doc => (
            <div key={doc.id} className="flex items-center justify-between rounded-xl border border-lucathi-line p-3">
              <div>
                <p className="text-sm font-medium text-lucathi-navy">{doc.category}</p>
                <p className="text-xs text-lucathi-gray">Versão atual: {doc.currentVersion ? `v${doc.currentVersion}` : "não enviada"}</p>
              </div>
              <StatusBadge status={doc.status} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.1em] text-lucathi-gray">
          <ShieldCheck className="size-4" /> Pessoas
        </h3>
        <div className="mt-3 space-y-2">
          {people.isLoading ? <p className="text-sm text-lucathi-gray">Carregando pessoas…</p> : null}
          {!people.isLoading && !peopleCount ? <p className="text-sm text-lucathi-gray">Nenhuma pessoa cadastrada ainda.</p> : null}
          {(people.data ?? []).map(person => (
            <div key={person.id} className="flex items-center justify-between rounded-xl border border-lucathi-line p-3">
              <p className="text-sm font-medium text-lucathi-navy">{person.fullName}{person.isPrimaryContact ? " · Titular" : ""}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="rounded-xl border border-lucathi-line bg-lucathi-mist/40 p-4">
      <div className="flex items-center gap-3">
        <Icon className="size-5 text-lucathi-navy" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-lucathi-gray">{label}</p>
          <p className="text-2xl font-display text-lucathi-navy">{value}</p>
        </div>
      </div>
    </div>
  );
}
