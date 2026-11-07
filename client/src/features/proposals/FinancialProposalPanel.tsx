import { useState } from "react";
import { CheckCircle2, MessageSquare, XCircle, Handshake, Pencil, Trash2, Send, AlertTriangle, BadgeCheck, DollarSign, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { errorMessage } from "@/lib/trpcError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatBRL } from "@/features/properties/propertyCardView";

const isTeam = (role?: string) => role === "SOCIO" || role === "ANALISTA";

const statusBadge = (status: string) => {
  switch (status) {
    case "ACEITA":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-status-success-bg px-2.5 py-0.5 text-xs font-semibold text-status-success-text">
          <CheckCircle2 className="size-3.5" /> Proposta Aceita
        </span>
      );
    case "CONTRAPROPOSTA_RECEBIDA":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-status-warning-bg px-2.5 py-0.5 text-xs font-semibold text-status-warning-text">
          <MessageSquare className="size-3.5" /> Contraproposta em Análise
        </span>
      );
    case "RECUSADA":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-status-danger-bg px-2.5 py-0.5 text-xs font-semibold text-status-danger-text">
          <XCircle className="size-3.5" /> Recusada
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-status-info-bg px-2.5 py-0.5 text-xs font-semibold text-status-info-text">
          <Handshake className="size-3.5" /> Proposta Aberta
        </span>
      );
  }
};

export function FinancialProposalPanel({ familyId }: { familyId: string }) {
  const { user } = trpc.useAuth();
  const utils = trpc.useUtils();
  const isTeamFlag = isTeam(user?.role);
  const list = trpc.proposals.list.useQuery({ familyId });
  const create = trpc.proposals.create.useMutation({
    onSuccess: () => {
      utils.proposals.list.invalidate({ familyId });
      toast.success("Proposta registrada.");
    },
    onError: error => toast.error(errorMessage(error)),
  });
  const update = trpc.proposals.update.useMutation({
    onSuccess: () => {
      utils.proposals.list.invalidate({ familyId });
      toast.success("Proposta atualizada.");
    },
    onError: error => toast.error(errorMessage(error)),
  });
  const remove = trpc.proposals.remove.useMutation({
    onSuccess: () => {
      utils.proposals.list.invalidate({ familyId });
      toast.success("Proposta excluída.");
    },
    onError: error => toast.error(errorMessage(error)),
  });

  const [scopeDescription, setScopeDescription] = useState("");
  const [proposedValue, setProposedValue] = useState("");
  const [editing, setEditing] = useState<{ id: string; scope: string; value: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleCreate = () => {
    create.mutate({ familyId, scopeDescription, proposedValue: Number(proposedValue) });
  };

  const handleUpdate = () => {
    if (!editing) return;
    update.mutate({ proposalId: editing.id, scopeDescription: editing.scope, proposedValue: Number(editing.value) });
    setEditing(null);
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

      {isTeamFlag ? (
        <div className="mt-5 rounded-xl border border-dashed border-lucathi-line p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-lucathi-gray font-subtitle">
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
                  <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray font-subtitle">Escopo de Trabalho</p>
                  <p className="mt-1 whitespace-pre-wrap text-lucathi-navy">{prop.scopeDescription}</p>
                </div>

                <div className="mt-3 flex flex-wrap items-baseline gap-6">
                  <div>
                    <p className="text-xs text-lucathi-gray">Valor da Proposta</p>
                    <p className="text-xl font-bold text-lucathi-navy">
                      R$ {Number(prop.proposedValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  {prop.counterProposalValue ? (
                    <div>
                      <p className="text-xs uppercase text-status-warning-text">Contraproposta do Cliente</p>
                      <p className="text-xl font-bold text-status-warning-text">
                        R$ {Number(prop.counterProposalValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      {prop.counterProposalNotes ? (
                        <p className="mt-0.5 text-xs text-status-warning-text/80 italic">“{prop.counterProposalNotes}”</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {isAccepted && (
                  <div className="mt-3 rounded-xl border border-status-success-border bg-status-success-bg/60 p-3 space-y-2">
                    <p className="text-xs font-semibold text-status-success-text">
                      <BadgeCheck className="size-4 shrink-0 text-status-success-text" />
                      Proposta aceita pelo cliente
                    </p>
                    {prop.acceptedAt && (
                      <p className="text-xs text-status-success-text">
                        Aceita em {new Date(prop.acceptedAt).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                    {prop.acceptedValue && (
                      <p className="text-sm font-bold text-status-success-text">
                        Valor aceito: R$ {Number(prop.acceptedValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    )}
                    <Button
                      size="sm"
                      className="bg-status-success-bg text-status-success-text hover:bg-status-success-bg/80"
                      onClick={() =>
                        update.mutate({ proposalId: prop.id, status: "ENVIADA" })
                      }
                    >
                      <MessageSquare className="mr-1 size-3" /> Reabrir negociação
                    </Button>
                  </div>
                )}

                {isCounter && (
                  <div className="mt-3 rounded-xl border border-status-warning-border bg-status-warning-bg/60 p-3 space-y-2">
                    <p className="text-xs font-semibold text-status-warning-text">
                      <MessageSquare className="size-3.5" /> Contraproposta recebida
                    </p>
                    <p className="text-sm font-bold text-status-warning-text">
                      R$ {Number(prop.counterProposalValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    {prop.counterProposalNotes ? (
                      <p className="mt-0.5 text-xs text-status-warning-text/80 italic">“{prop.counterProposalNotes}”</p>
                    ) : null}
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          update.mutate({ proposalId: prop.id, status: "ACEITA", acceptedValue: prop.counterProposalValue })
                        }
                        className="bg-status-success-bg text-status-success-text hover:bg-status-success-bg/80"
                      >
                        <CheckCircle2 className="mr-1 size-3" /> Aceitar contraproposta
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          update.mutate({ proposalId: prop.id, status: "RECUSADA" })
                        }
                        className="bg-status-danger-bg text-status-danger-text hover:bg-status-danger-bg/80"
                      >
                        <XCircle className="mr-1 size-3" /> Recusar
                      </Button>
                    </div>
                  </div>
                )}

                {isPending && (
                  <div className="mt-4 rounded-xl border border-status-warning-border bg-status-warning-bg/80 p-3">
                    <p className="text-xs font-semibold text-status-warning-text">
                      <AlertTriangle className="size-3.5" /> Aguardando aceite do cliente
                    </p>
                    <p className="mt-1 text-xs text-status-warning-text">
                      Envie o link da proposta ao cliente para que ele possa aceitar ou contrapropor.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 bg-white text-lucathi-navy hover:bg-lucathi-mist"
                      onClick={() =>
                        update.mutate({ proposalId: prop.id, status: "RECUSADA" })
                      }
                    >
                      <X className="mr-1 size-3" /> Marcar como recusada
                    </Button>
                  </div>
                )}

                {prop.status === "RECUSADA" && (
                  <div className="mt-4 rounded-xl border border-status-danger-border bg-status-danger-bg/80 p-3">
                    <p className="text-xs font-semibold text-status-danger-text">
                      <AlertTriangle className="size-3.5" /> Proposta recusada pelo cliente
                    </p>
                    <p className="mt-1 text-xs text-status-danger-text">
                      O cliente não aceitou a proposta. Pode-se registrar uma nova ou reabrir a negociação.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 bg-white text-lucathi-navy hover:bg-lucathi-mist"
                      onClick={() =>
                        update.mutate({ proposalId: prop.id, status: "ENVIADA" })
                      }
                    >
                      <MessageSquare className="mr-1 size-3" /> Reabrir negociação
                    </Button>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-baseline gap-6">
                  {editing?.id === prop.id ? (
                    <>
                      <Textarea
                        value={editing.scope}
                        onChange={e => setEditing({ ...editing, scope: e.target.value })}
                        className="w-64 text-sm"
                        rows={2}
                        placeholder="Editar escopo"
                      />
                      <Input
                        inputMode="decimal"
                        value={editing.value}
                        onChange={e => setEditing({ ...editing, value: e.target.value })}
                        placeholder="Novo valor"
                        className="w-36 text-sm"
                      />
                      <Button size="sm" onClick={handleUpdate} disabled={update.isPending}>
                        Salvar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      {canEdit ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-lucathi-gray"
                          onClick={() => setEditing({ id: prop.id, scope: prop.scopeDescription, value: String(prop.proposedValue) })}
                        >
                          <Pencil className="mr-1 size-3" />
                          Editar
                        </Button>
                      ) : null}
                      {canEdit ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-status-danger-text hover:text-status-danger-text/80"
                          onClick={() => setDeleting(prop.id)}
                        >
                          <Trash2 className="mr-1 size-3" />
                          Excluir
                        </Button>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}
        {!list.data?.length ? (
          <p className="text-sm text-lucathi-gray text-center py-4">
            {isTeamFlag
              ? "Nenhuma proposta registrada. Use o formulário acima para criar a primeira."
              : "Nenhuma proposta registrada. Apenas SOCIO ou ANALISTA podem cadastrar propostas."}
          </p>
        ) : null}
      </div>
    </section>
  );
}