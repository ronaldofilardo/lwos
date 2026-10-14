import { useState } from "react";
import { Building2, Info, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { errorMessage } from "@/lib/trpcError";
import { CompanyDetailsModal } from "./CompanyDetailsModal";
import { AlertIndicator } from "@/features/alerts/AlertIndicator";
import { levelFor } from "@/features/alerts/alerts";
import { useProjectAlerts } from "@/features/alerts/useProjectAlerts";

type Person = { id: string; fullName: string };

function StakeholderManager({
  companyId,
  familyId,
  people,
  capitalSocial,
}: {
  companyId: string;
  familyId: string;
  people: Person[];
  capitalSocial: string | null;
}) {
  const utils = trpc.useUtils();
  const refresh = () => utils.companies.stakeholders.invalidate({ companyId });
  const stakeholders = trpc.companies.stakeholders.useQuery({ companyId });

  const [personId, setPersonId] = useState("");
  const [externalName, setExternalName] = useState("");
  const [percentage, setPercentage] = useState("");

  const onError = (error: unknown) => toast.error(errorMessage(error));
  const add = trpc.companies.addStakeholder.useMutation({
    onSuccess: () => {
      refresh();
      setPersonId("");
      setExternalName("");
      setPercentage("");
      toast.success("Participação societária registrada.");
    },
    onError,
  });
  const remove = trpc.companies.removeStakeholder.useMutation({
    onSuccess: () => {
      refresh();
      toast.success("Participação removida.");
    },
    onError,
  });
  const updateStakeholder = trpc.companies.updateStakeholder.useMutation({
    onSuccess: () => {
      refresh();
      toast.success("Participação atualizada.");
    },
    onError,
  });
  const requestExternalDoc = trpc.documents.create.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate({ familyId });
      toast.success("Requisito de documento pessoal criado para o não-membro.");
    },
    onError,
  });

  const rows = stakeholders.data ?? [];
  const total = rows.reduce((sum, row) => sum + Number(row.percentage), 0);
  const remaining = Math.max(0, Math.round((100 - total) * 100) / 100);
  const capital = capitalSocial ? Number(capitalSocial) : null;

  return (
    <div className="mt-3 space-y-2 border-t border-lucathi-line/60 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-lucathi-navy">
          Quadro societário
        </span>
        <span
          className={
            remaining > 0
              ? "font-semibold text-amber-700"
              : "font-semibold text-emerald-700"
          }
        >
          {total}% distribuído{remaining > 0 ? ` · falta ${remaining}%` : " · 100%"}
        </span>
      </div>

      {rows.length ? (
        <div className="space-y-1.5">
          {rows.map(row => {
            const person = row.personId
              ? people.find(item => item.id === row.personId)
              : null;
            const label = person?.fullName ?? row.externalName ?? "—";
            const invested =
              capital !== null
                ? (capital * Number(row.percentage)) / 100
                : null;
            return (
              <div
                key={row.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-lucathi-line/60 bg-white px-2.5 py-1.5 text-xs"
              >
                <span className="font-medium text-lucathi-navy">{label}</span>
                <span className="flex items-center gap-1 text-lucathi-gray">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    defaultValue={row.percentage}
                    key={row.percentage}
                    onBlur={e => {
                      const val = Number(e.target.value.replace(",", "."));
                      if (!isNaN(val) && val !== Number(row.percentage)) {
                        updateStakeholder.mutate({
                          companyId,
                          stakeholderId: row.id,
                          percentage: val,
                        });
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.currentTarget.blur();
                      }
                    }}
                    className="h-6 w-14 rounded border border-input bg-transparent px-1 text-right text-xs"
                    title="Editar participação (%)"
                  />
                  %
                  {person ? "" : " · não-membro"}
                </span>
                <span className="text-lucathi-gray">
                  {invested !== null
                    ? `· ${invested.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })} investido`
                    : "· —"}
                </span>
                {!person ? (
                  <button
                    type="button"
                    className="rounded border border-lucathi-line px-1.5 py-0.5 text-lucathi-navy hover:bg-lucathi-mist"
                    disabled={requestExternalDoc.isPending}
                    onClick={() =>
                      requestExternalDoc.mutate({
                        familyId,
                        entityType: "SOCIEDADE",
                        entityId: companyId,
                        category: `Doc. pessoal — ${label}`.slice(0, 80),
                      })
                    }
                  >
                    Doc pessoal
                  </button>
                ) : null}
                <button
                  type="button"
                  aria-label="Remover participação"
                  className="ml-auto rounded px-1.5 py-0.5 text-red-600 hover:bg-red-50"
                  disabled={remove.isPending}
                  onClick={() =>
                    remove.mutate({ companyId, stakeholderId: row.id })
                  }
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-lucathi-gray">
          Nenhuma participação registrada.
        </p>
      )}

      {remaining > 0 ? (
        <>
          <div className="grid gap-2 md:grid-cols-2">
            <select
              value={personId}
              onChange={e => {
                setPersonId(e.target.value);
                if (e.target.value) setExternalName("");
              }}
              className="h-9 rounded-md border border-input bg-background px-2 text-xs"
              aria-label="Membro da família"
            >
              <option value="">Membro da família…</option>
              {people.map(item => (
                <option key={item.id} value={item.id}>
                  {item.fullName}
                </option>
              ))}
            </select>
            <Input
              value={externalName}
              onChange={e => {
                setExternalName(e.target.value);
                if (e.target.value) setPersonId("");
              }}
              placeholder="Não-membro (nome completo)"
              className="h-9 text-xs"
              disabled={Boolean(personId)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Input
              value={percentage}
              onChange={e => setPercentage(e.target.value)}
              inputMode="decimal"
              placeholder="Participação (%)"
              className="h-9 w-40 text-xs"
            />
            <Button
              size="sm"
              disabled={
                !percentage ||
                (!personId && !externalName.trim()) ||
                add.isPending
              }
              onClick={() =>
                add.mutate({
                  companyId,
                  personId: personId || undefined,
                  externalName: externalName.trim() || undefined,
                  percentage: Number(percentage.replace(',', '.')),
                })
              }
            >
              Adicionar sócio
            </Button>
          </div>
        </>
      ) : (
        <p className="text-xs text-lucathi-gray">
          Quadro completo (100%) — remova uma participação para editar.
        </p>
      )}
    </div>
  );
}

export function CompanyPanel({ familyId }: { familyId: string }) {
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [isOffshore, setIsOffshore] = useState(false);
  const [taxNumber, setTaxNumber] = useState("");
  const [detailsCompanyId, setDetailsCompanyId] = useState<string | null>(null);
  const [removingCompany, setRemovingCompany] = useState<{
    id: string;
    legalName: string;
  } | null>(null);

  const list = trpc.companies.list.useQuery({ familyId });
  const people = trpc.people.list.useQuery({ familyId });
  const { bySubject } = useProjectAlerts(familyId);

  const removeCompany = trpc.companies.remove.useMutation({
    onSuccess: () => {
      utils.companies.list.invalidate({ familyId });
      utils.certidoes.list.invalidate({ familyId });
      utils.documents.list.invalidate({ familyId });
      setRemovingCompany(null);
      toast.success("Sociedade excluída.");
    },
    onError: error => toast.error(errorMessage(error)),
  });

  const create = trpc.companies.create.useMutation({
    onSuccess: (result) => {
      utils.companies.list.invalidate({ familyId });
      utils.certidoes.list.invalidate({ familyId });
      utils.documents.list.invalidate({ familyId });
      setName("");
      setTaxNumber("");
      if (result.fromApi) {
        toast.success("Sociedade criada com dados oficiais da Receita Federal.");
      } else {
        toast.success("Sociedade criada.");
      }
      setDetailsCompanyId(result.companyId);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const handleTaxNumberChange = (value: string) => {
    setTaxNumber(value);
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 14 && !name.trim()) {
      utils.companies.lookupCnpj.fetch({ cnpj: cleaned }).then(res => {
        if (res?.legalName && !name.trim()) {
          setName(res.legalName);
        }
      }).catch(() => {});
    }
  };

  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6">
      <div className="flex items-center gap-3">
        <Building2 className="size-5 text-lucathi-navy" />
        <div>
          <h2 className="font-display text-2xl text-lucathi-navy">
            Sociedades
          </h2>
          <p className="text-sm text-lucathi-gray">
            Nacionais e offshore, com quadro societário somando 100%.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]">
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Denominação social"
        />
        {isOffshore ? null : (
          <Input
            value={taxNumber}
            onChange={e => handleTaxNumberChange(e.target.value)}
            placeholder="CNPJ"
          />
        )}
        <label className="flex h-10 items-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm">
          <input
            type="checkbox"
            checked={isOffshore}
            onChange={e => {
              setIsOffshore(e.target.checked);
              if (e.target.checked) setTaxNumber("");
            }}
            className="size-4"
          />
          Offshore
        </label>
        <Button
          disabled={
            create.isPending ||
            (isOffshore ? !name.trim() : !taxNumber.trim())
          }
          onClick={() =>
            create.mutate({
              familyId,
              legalName: name.trim() || "Nova Sociedade",
              taxNumber: taxNumber.trim() || undefined,
              isOffshore,
            })
          }
        >
          Criar sociedade
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        {list.data?.map(item => {
          const simples = item.taxRegime === "SIMPLES_NACIONAL";
          return (
            <div
              key={item.id}
              className={
                simples
                  ? "rounded-xl border-2 border-emerald-400 bg-lucathi-mist px-4 py-3"
                  : "rounded-xl bg-lucathi-mist px-4 py-3"
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    {item.legalName}
                    <AlertIndicator
                      level={levelFor(bySubject, "SOCIEDADE", item.id)}
                    />
                  </p>
                  <p className="text-xs text-lucathi-gray">
                    {item.isOffshore ? "Offshore" : "Nacional"}
                    {item.taxNumber ? ` · CNPJ ${item.taxNumber}` : ""}
                    {simples ? " · Simples Nacional" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 text-xs"
                    onClick={() => setDetailsCompanyId(item.id)}
                  >
                    <Info className="mr-1 size-3.5" /> Detalhes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() =>
                      setRemovingCompany({ id: item.id, legalName: item.legalName })
                    }
                    title="Excluir sociedade"
                  >
                    <Trash2 className="mr-1 size-3.5" /> Excluir
                  </Button>
                </div>
              </div>
              <StakeholderManager
                companyId={item.id}
                familyId={familyId}
                people={people.data ?? []}
                capitalSocial={item.capitalSocial}
              />
            </div>
          );
        })}
        {!list.data?.length ? (
          <p className="text-sm text-lucathi-gray">
            Nenhuma sociedade cadastrada.
          </p>
        ) : null}
      </div>

      <CompanyDetailsModal
        familyId={familyId}
        companyId={detailsCompanyId}
        onClose={() => setDetailsCompanyId(null)}
      />

      <Dialog
        open={Boolean(removingCompany)}
        onOpenChange={open => !open && setRemovingCompany(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir sociedade</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir «{removingCompany?.legalName}»? Esta
              ação removerá a ficha da sociedade e o quadro societário vinculado.
              Documentos enviados permanecem arquivados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRemovingCompany(null)}
              disabled={removeCompany.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={removeCompany.isPending}
              onClick={() => {
                if (!removingCompany) return;
                removeCompany.mutate({
                  familyId,
                  companyId: removingCompany.id,
                });
              }}
            >
              {removeCompany.isPending ? "Excluindo…" : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
