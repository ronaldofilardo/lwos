import { useState } from "react";
import { FileText, ThumbsDown, ThumbsUp, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { formatDateOnlyBR } from "@/lib/utils";

const civilStatusOptions = [
  { value: "SOLTEIRO", label: "Solteiro(a)" },
  { value: "CASADO", label: "Casado(a)" },
  { value: "UNIAO_ESTAVEL", label: "União Estável" },
  { value: "DIVORCIADO", label: "Divorciado(a)" },
  { value: "VIUVO", label: "Viúvo(a)" },
] as const;

const maritalRegimeOptions = [
  { value: "CPB", label: "Comunhão Parcial de Bens" },
  { value: "CUB", label: "Comunhão Universal de Bens" },
  { value: "STB", label: "Separação Total de Bens" },
  { value: "STOB", label: "Separação Obrigatória de Bens" },
  { value: "NA", label: "Não Aplicável" },
] as const;

type Lead = {
  id: string;
  fullName: string;
  taxId: string;
  email: string;
  birthDate: string;
  fileUrl: string;
  fileName: string;
  status: "PENDENTE" | "ACEITO" | "RECUSADO";
};

export default function Leads() {
  const { user } = useAuth();
  const leads = trpc.leads.list.useQuery(undefined, { enabled: user?.role === "SOCIO" || user?.role === "ADMIN" });

  if (user && user.role !== "SOCIO" && user.role !== "ADMIN") {
    return <div className="p-8 text-center text-sm text-lucathi-gray">Área exclusiva do time Lucathi.</div>;
  }

  if (leads.isLoading) return <div className="p-8 text-center text-lucathi-gray">Carregando interessados…</div>;
  if (leads.isError) return <div className="p-8 text-center text-red-500">Erro ao carregar interessados</div>;

  const data = (leads.data ?? []) as Lead[];
  const pending = data.filter(l => l.status === "PENDENTE");
  const reviewed = data.filter(l => l.status !== "PENDENTE");

  return (
    <section className="space-y-8">
      <header>
        <h1 className="font-display text-3xl text-lucathi-navy">Interessados</h1>
        <p className="mt-1 text-sm text-lucathi-gray">Cadastros recebidos pela tela pública de interesse. Contate o interessado fora do sistema antes de aceitar.</p>
      </header>

      <div className="rounded-2xl border border-lucathi-line bg-white p-6">
        <h2 className="font-display text-xl text-lucathi-navy">Pendentes ({pending.length})</h2>
        <div className="mt-4 space-y-4">
          {pending.length ? pending.map(lead => <LeadCard key={lead.id} lead={lead} />) : <p className="text-sm text-lucathi-gray">Nenhum interessado pendente.</p>}
        </div>
      </div>

      {reviewed.length ? (
        <div className="rounded-2xl border border-lucathi-line bg-white p-6">
          <h2 className="font-display text-xl text-lucathi-navy">Já analisados</h2>
          <div className="mt-4 space-y-3">
            {reviewed.map(lead => (
              <div key={lead.id} className="flex items-center justify-between rounded-xl border border-lucathi-line p-4">
                <div>
                  <p className="text-sm font-medium text-lucathi-navy">{lead.fullName}</p>
                  <p className="text-xs text-lucathi-gray">{lead.email}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${lead.status === "ACEITO" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                  {lead.status === "ACEITO" ? "Aceito" : "Recusado"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const utils = trpc.useUtils();
  const [showAccept, setShowAccept] = useState(false);
  const [familyName, setFamilyName] = useState(lead.fullName);
  const [civilStatus, setCivilStatus] = useState<(typeof civilStatusOptions)[number]["value"]>("SOLTEIRO");
  const [maritalRegime, setMaritalRegime] = useState<(typeof maritalRegimeOptions)[number]["value"]>("NA");

  const accept = trpc.leads.accept.useMutation({
    onSuccess: () => { toast.success("Interessado aceito — família criada."); utils.leads.list.invalidate(); },
    onError: error => toast.error(error.message),
  });
  const reject = trpc.leads.reject.useMutation({
    onSuccess: () => { toast.success("Interessado recusado."); utils.leads.list.invalidate(); },
    onError: error => toast.error(error.message),
  });

  return (
    <div className="rounded-xl border border-lucathi-line p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-lucathi-navy">{lead.fullName}</p>
          <p className="text-xs text-lucathi-gray">CPF {lead.taxId} · {lead.email} · Nasc. {formatDateOnlyBR(lead.birthDate)}</p>
        </div>
        <a href={lead.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-lucathi-navy hover:underline">
          <FileText className="size-4" /> Ver documento
        </a>
      </div>

      {showAccept ? (
        <div className="mt-4 space-y-3 rounded-lg bg-lucathi-mist/50 p-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Nome da família</label>
            <input value={familyName} onChange={e => setFamilyName(e.target.value)} className="h-9 w-full rounded-md border border-input px-3 text-sm" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Estado civil</label>
              <select value={civilStatus} onChange={e => setCivilStatus(e.target.value as typeof civilStatus)} className="h-9 w-full rounded-md border border-input px-2 text-sm">
                {civilStatusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Regime de bens</label>
              <select value={maritalRegime} onChange={e => setMaritalRegime(e.target.value as typeof maritalRegime)} className="h-9 w-full rounded-md border border-input px-2 text-sm">
                {maritalRegimeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" disabled={accept.isPending} onClick={() => accept.mutate({ leadId: lead.id, familyName, civilStatus, maritalRegime })}>
              <UserPlus className="mr-1.5 size-4" /> Confirmar e criar família
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAccept(false)}>Cancelar</Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => setShowAccept(true)}>
            <ThumbsUp className="mr-1.5 size-4" /> Aceitar
          </Button>
          <Button size="sm" variant="outline" disabled={reject.isPending} onClick={() => reject.mutate({ leadId: lead.id })}>
            <ThumbsDown className="mr-1.5 size-4" /> Recusar
          </Button>
        </div>
      )}
    </div>
  );
}
