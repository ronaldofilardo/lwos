import { useState } from "react";
import { BadgeCheck, CheckCircle2, DollarSign, Handshake, MessageSquare, Send, ShieldAlert, XCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function FinancialProposalPanel({ familyId }: { familyId: string }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [scopeDescription, setScopeDescription] = useState("");
  const [proposedValue, setProposedValue] = useState("");

  const [counterValue, setCounterValue] = useState("");
  const [counterNotes, setCounterNotes] = useState("");
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  const list = trpc.proposals.list.useQuery({ familyId });

  const create = trpc.proposals.create.useMutation({
    onSuccess: () => {
      utils.proposals.list.invalidate({ familyId });
      setScopeDescription("");
      setProposedValue("");
      toast.success("Proposta financeira registrada e disponibilizada.");
    },
    onError: (e) => toast.error(e.message),
  });

  const accept = trpc.proposals.accept.useMutation({
    onSuccess: () => {
      utils.proposals.list.invalidate({ familyId });
      toast.success("Proposta financeira aceita com sucesso!");
    },
    onError: (e) => toast.error(e.message),
  });

  const counter = trpc.proposals.counterProposal.useMutation({
    onSuccess: () => {
      utils.proposals.list.invalidate({ familyId });
      setSelectedProposalId(null);
      setCounterValue("");
      setCounterNotes("");
      toast.success("Contraproposta enviada para análise do Sócio.");
    },
    onError: (e) => toast.error(e.message),
  });

  const reviewCounter = trpc.proposals.reviewCounterProposal.useMutation({
    onSuccess: () => {
      utils.proposals.list.invalidate({ familyId });
      toast.success("Deliberação da contraproposta registrada.");
    },
    onError: (e) => toast.error(e.message),
  });

  const isSocio = user?.role === "SOCIO";
  const isTeam = user?.role === "SOCIO" || user?.role === "ANALISTA" || user?.role === "ADMIN";

  const handleCreate = () => {
    if (!scopeDescription.trim() || !proposedValue) return;
    create.mutate({
      familyId,
      scopeDescription: scopeDescription.trim(),
      proposedValue: Number(proposedValue),
    });
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "ACEITA":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="size-3.5" /> Proposta Aceita
          </span>
        );
      case "CONTRAPROPOSTA_RECEBIDA":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            <MessageSquare className="size-3.5" /> Contraproposta em Análise
          </span>
        );
      case "RECUSADA":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
            <XCircle className="size-3.5" /> Recusada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
            <Handshake className="size-3.5" /> Proposta Aberta
          </span>
        );
    }
  };

  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-lucathi-mist text-lucathi-navy">
          <DollarSign className="size-5" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-lucathi-navy">Proposta Financeira & Honorários</h2>
          <p className="text-sm text-lucathi-gray">
            Módulo autônomo (separado do LWR técnico) com escopo, valores, aceite e contraproposta.
          </p>
        </div>
      </div>

      {isTeam ? (
        <div className="mt-5 rounded-xl border border-dashed border-lucathi-line p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-lucathi-gray">
            Nova Proposta Comercial / Aditivo
          </p>
          <div className="mt-3 space-y-3">
            <Textarea
              value={scopeDescription}
              onChange={(e) => setScopeDescription(e.target.value)}
              placeholder="Descrição do escopo de trabalho (ex: Planejamento sucessório completo, estruturação de Holding Familiar, elaboração de acordo de sócios e doações com reserva de usufruto)..."
              className="text-sm"
              rows={3}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Input
                inputMode="decimal"
                value={proposedValue}
                onChange={(e) => setProposedValue(e.target.value)}
                placeholder="Valor dos honorários (R$)"
                className="max-w-xs"
              />
              <Button
                disabled={!scopeDescription.trim() || !proposedValue || create.isPending}
                onClick={handleCreate}
              >
                Registrar Proposta
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        {list.data?.map((prop) => {
          const isPending = prop.status === "ENVIADA" || prop.status === "RASCUNHO";
          const isCounter = prop.status === "CONTRAPROPOSTA_RECEBIDA";
          const isAccepted = prop.status === "ACEITA";

          return (
            <article
              key={prop.id}
              className="rounded-xl border border-lucathi-line bg-lucathi-mist/40 p-4 transition-all"
            >
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-lucathi-line/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lucathi-navy">
                    Proposta de Honorários
                  </span>
                  {statusBadge(prop.status)}
                </div>
                <span className="text-xs text-lucathi-gray">
                  Cadastrada em {new Date(prop.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </header>

              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">Escopo de Trabalho</p>
                  <p className="mt-1 whitespace-pre-wrap text-lucathi-navy">{prop.scopeDescription}</p>
                </div>

                <div className="mt-3 flex flex-wrap items-baseline gap-6">
                  <div>
                    <p className="text-xs uppercase text-lucathi-gray">Valor da Proposta</p>
                    <p className="text-xl font-bold text-lucathi-navy">
                      R$ {Number(prop.proposedValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  {prop.counterProposalValue ? (
                    <div>
                      <p className="text-xs uppercase text-amber-700">Contraproposta do Cliente</p>
                      <p className="text-xl font-bold text-amber-900">
                        R$ {Number(prop.counterProposalValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      {prop.counterProposalNotes ? (
                        <p className="mt-0.5 text-xs text-amber-800 italic">“{prop.counterProposalNotes}”</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {isAccepted ? (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-800">
                    <BadgeCheck className="size-4 shrink-0 text-emerald-600" />
                    <span>
                      Aceite formalizado em {new Date(prop.acceptedAt!).toLocaleString("pt-BR")}.
                      {prop.approvedBySocioId ? ` Aprovado pelo Sócio #${prop.approvedBySocioId}.` : ""}
                    </span>
                  </div>
                ) : null}

                {/* Ações para o Cliente: Aceite ou Contraproposta */}
                {isPending && !isCounter && (
                  <div className="mt-4 flex flex-wrap items-center gap-3 pt-2">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={accept.isPending}
                      onClick={() => accept.mutate({ proposalId: prop.id })}
                    >
                      <CheckCircle2 className="mr-1.5 size-4" /> Aceitar Proposta
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setSelectedProposalId(selectedProposalId === prop.id ? null : prop.id)
                      }
                    >
                      <MessageSquare className="mr-1.5 size-4" /> Enviar Contraproposta
                    </Button>
                  </div>
                )}

                {/* Formulário de Contraproposta */}
                {selectedProposalId === prop.id && isPending && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 space-y-2">
                    <p className="text-xs font-semibold text-amber-900">
                      Indique o valor pretendido e a justificativa para avaliação do Sócio:
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        inputMode="decimal"
                        value={counterValue}
                        onChange={(e) => setCounterValue(e.target.value)}
                        placeholder="Valor sugerido (R$)"
                        className="bg-white text-sm"
                      />
                      <Input
                        value={counterNotes}
                        onChange={(e) => setCounterNotes(e.target.value)}
                        placeholder="Justificativa / Condições de pagamento"
                        className="bg-white text-sm"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="bg-amber-700 hover:bg-amber-800 text-white"
                        disabled={!counterValue || !counterNotes.trim() || counter.isPending}
                        onClick={() =>
                          counter.mutate({
                            proposalId: prop.id,
                            counterProposalValue: Number(counterValue),
                            counterProposalNotes: counterNotes.trim(),
                          })
                        }
                      >
                        <Send className="mr-1.5 size-3.5" /> Remeter ao Sócio
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedProposalId(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Deliberação exclusiva do Sócio para contrapropostas recebidas */}
                {isCounter && isSocio && (
                  <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/80 p-3">
                    <p className="text-xs font-semibold text-amber-900">
                      Deliberação do Sócio: O cliente propôs R${" "}
                      {Number(prop.counterProposalValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={reviewCounter.isPending}
                        onClick={() =>
                          reviewCounter.mutate({ proposalId: prop.id, decision: "ACEITAR" })
                        }
                      >
                        <CheckCircle2 className="mr-1.5 size-4" /> Aceitar Contraproposta
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={reviewCounter.isPending}
                        onClick={() =>
                          reviewCounter.mutate({ proposalId: prop.id, decision: "RECUSAR" })
                        }
                      >
                        <XCircle className="mr-1.5 size-4" /> Recusar Contraproposta
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}

        {!list.data?.length ? (
          <p className="text-sm text-lucathi-gray">Nenhuma proposta financeira registrada.</p>
        ) : null}
      </div>
    </section>
  );
}
