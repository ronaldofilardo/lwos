import { useState } from "react";
import { Building2, Info, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { mascaraCnpj, mascaraCpf } from "@shared/validation";
import {
  companyTotalsFromRow,
  computeStakeholderValues,
  toNumberOrNull,
  type CompanyTotals,
} from "@shared/domain/company-valuation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LabeledField } from "@/components/LabeledField";
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
import { StakeholderValues } from "./StakeholderValues";
import { formatAmount } from "./holdingDetails";
import { AlertIndicator } from "@/features/alerts/AlertIndicator";
import { levelFor } from "@/features/alerts/alerts";
import { useProjectAlerts } from "@/features/alerts/useProjectAlerts";

type Person = { id: string; fullName: string };

function StakeholderManager({
  companyId,
  familyId,
  people,
  totals,
  international,
}: {
  companyId: string;
  familyId: string;
  people: Person[];
  /** Capital, PL e valor mercado da sociedade (base dos valores de cada sócio). */
  totals: CompanyTotals;
  international: boolean;
}) {
  const utils = trpc.useUtils();
  const refresh = () => utils.companies.stakeholders.invalidate({ companyId });
  const stakeholders = trpc.companies.stakeholders.useQuery({ companyId });

  const [personId, setPersonId] = useState("");
  const [externalName, setExternalName] = useState("");
  const [externalCpf, setExternalCpf] = useState("");
  const [percentage, setPercentage] = useState("");

  const onError = (error: unknown) => toast.error(errorMessage(error));
  const add = trpc.companies.addStakeholder.useMutation({
    onSuccess: () => {
      refresh();
      setPersonId("");
      setExternalName("");
      setExternalCpf("");
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
  const total = (rows ?? []).reduce(
    (sum, row) => sum + Number(row.percentage || 0),
    0
  );
  const remaining = Math.max(0, Math.round((100 - total) * 100) / 100);

  return (
    <div className="mt-3 space-y-2 border-t border-lucathi-line/60 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-lucathi-navy">
          Participações ({rows.length})
        </span>
        <span className="font-mono text-status-danger-text">
          {remaining > 0 ? `Faltam ${remaining.toFixed(2)}%` : "100%"}
        </span>
      </div>
      {rows.length > 0 ? (
        <div className="space-y-2">
          {rows.map(row => {
            const values = computeStakeholderValues(row, totals, international);
            return (
              <div
                key={row.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-lucathi-line/60 bg-white p-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-lucathi-navy">
                    {row.person
                      ? row.person.fullName
                      : row.externalName ?? "Não-membro"}
                  </p>
                  {row.person ? (
                    <button
                      type="button"
                      aria-label="Doc pessoal"
                      className="text-[11px] text-status-info-text hover:underline"
                      onClick={() => requestExternalDoc.mutate({ companyId, personId: row.person.id, documentCategory: "DOCUMENTO_PESSOAL" })}
                    >
                      Doc pessoal
                    </button>
                  ) : null}
                  <button
                    type="button"
                    aria-label="Remover participação"
                    className="ml-auto rounded px-1.5 py-0.5 text-status-danger-text hover:bg-status-danger-bg"
                    disabled={remove.isPending}
                    onClick={() =>
                      remove.mutate({ companyId, stakeholderId: row.id })
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <StakeholderValues
                  values={values}
                  international={international}
                  className="mt-1 text-lucathi-gray"
                />
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
          <div className="grid gap-2 md:grid-cols-3">
            <LabeledField label="Membro da família">
              {id => (
                <select
                  id={id}
                  value={personId}
                  onChange={e => {
                    setPersonId(e.target.value);
                    if (e.target.value) {
                      setExternalName("");
                      setExternalCpf("");
                    }
                  }}
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="">Selecione</option>
                  {(people ?? []).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.fullName}
                    </option>
                  ))}
                </select>
              )}
            </LabeledField>
            <LabeledField label="Não-membro (nome completo)">
              {id => (
                <Input
                  id={id}
                  value={externalName}
                  onChange={e => {
                    setExternalName(e.target.value);
                    if (e.target.value) setPersonId("");
                  }}
                  placeholder="Ex.: João da Silva"
                  className="h-9 text-xs"
                  disabled={Boolean(personId)}
                />
              )}
            </LabeledField>
            <LabeledField label="CPF (opcional)">
              {id => (
                <Input
                  id={id}
                  value={externalCpf}
                  onChange={e => {
                    setExternalCpf(e.target.value);
                    if (e.target.value) setPersonId("");
                  }}
                  placeholder="000.000.000-00"
                  className="h-9 text-xs"
                  disabled={Boolean(personId)}
                />
              )}
            </LabeledField>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <LabeledField label="Participação (%)" className="w-40">
              {id => (
                <Input
                  id={id}
                  value={percentage}
                  onChange={e => setPercentage(e.target.value)}
                  inputMode="decimal"
                  placeholder="Ex.: 50"
                  className="h-9 text-xs"
                  disabled={Boolean(externalName)}
                />
              )}
            </LabeledField>
            <Button
              size="sm"
              disabled={!personId && !externalName || !percentage || add.isPending}
              onClick={() =>
                add.mutate({
                  companyId,
                  personId: personId || undefined,
                  externalName: externalName || undefined,
                  externalCpf: externalCpf || undefined,
                  percentage: Number(percentage),
                })
              }
              className="h-9"
            >
              {add.isPending ? "Adicionando…" : "Adicionar"}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function CompanyPanel({ familyId }: { familyId: string }) {
  const utils = trpc.useUtils();
  const people = trpc.people.list.useQuery({ familyId });
  const list = trpc.companies.list.useQuery({ familyId });
  const { counts, loading: alertsLoading } = useProjectAlerts(familyId);
  const [detailsCompanyId, setDetailsCompanyId] = useState<string | null>(null);
  const [removingCompany, setRemovingCompany] = useState<{
    id: string;
    legalName: string;
    propertyCount: number;
  } | null>(null);

  const create = trpc.companies.create.useMutation({
    onSuccess: () => {
      utils.companies.list.invalidate({ familyId });
      setDetailsCompanyId(null);
      toast.success("Sociedade registrada.");
    },
    onError: error => toast.error(errorMessage(error)),
  });
  const removeCompany = trpc.companies.remove.useMutation({
    onSuccess: () => {
      utils.companies.list.invalidate({ familyId });
      setRemovingCompany(null);
      toast.success("Sociedade excluída.");
    },
    onError: error => toast.error(errorMessage(error)),
  });

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-lucathi-line bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lucathi-gray font-subtitle">
              Sociedades (Holdings / Offshore)
            </p>
            <p className="mt-1 text-sm text-lucathi-gray">
              Capital, participação societária e valor de mercado estimado.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs text-lucathi-navy"
            onClick={() => setDetailsCompanyId(null)}
          >
            <Building2 className="size-3.5" /> Nova sociedade
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {list.data?.map(item => {
            const simples = item.taxRegime === "SIMPLES_NACIONAL";
            return (
              <div
                key={item.id}
                className={
                  simples
                    ? "rounded-xl border-2 border-status-danger-text bg-status-danger-bg/40 px-4 py-3"
                    : "rounded-xl bg-lucathi-mist px-4 py-3"
                }
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                      {item.legalName}
                      {simples ? (
                        <span className="rounded-full bg-status-danger-text px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          Simples Nacional
                        </span>
                      ) : null}
                      <AlertIndicator
                        level={levelFor(bySubject, "SOCIEDADE", item.id)}
                      />
                    </p>
                    {item.isOffshore ? (
                      <p className="text-xs font-medium text-lucathi-gray">
                        Offshore
                      </p>
                    ) : null}
                    {item.isOffshore ? null : (
                      <p className="text-xs text-lucathi-gray">
                        {item.taxNumber
                          ? `CNPJ ${mascaraCnpj(item.taxNumber)}`
                          : "CNPJ não informado"}
                      </p>
                    )}
                    <p className="text-xs text-lucathi-gray">
                      Capital Social Total:{" "}
                      {formatAmount(toNumberOrNull(item.capitalSocial), item.isOffshore)}
                    </p>
                    <p className="text-xs text-lucathi-gray">
                      PL: {formatAmount(toNumberOrNull(item.equity), item.isOffshore)}
                    </p>
                    <p className="text-xs text-lucathi-gray">
                      Valor Imóveis:{" "}
                      {formatAmount(item.propertyValue, item.isOffshore)}{" "}
                      ({item.propertyCount}{" "}
                      {item.propertyCount === 1 ? "imóvel" : "imóveis"})
                    </p>
                    <p className="text-xs text-lucathi-gray">
                      Valor de Mercado da Sociedade:{" "}
                      {formatAmount(
                        companyTotalsFromRow(item, item.propertyValue).estimatedValue,
                        item.isOffshore
                      )}
                    </p>
                    {item.notes ? (
                      <p className="mt-1 max-h-32 overflow-y-auto whitespace-pre-wrap text-xs text-lucathi-gray">
                        <span className="font-medium text-lucathi-navy">Observações:</span>{" "}
                        {item.notes}
                      </p>
                    ) : null}
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
                      className="h-8 px-2 text-xs text-status-danger-text hover:bg-status-danger-bg hover:text-status-danger-text"
                      onClick={() =>
                        setRemovingCompany({
                          id: item.id,
                          legalName: item.legalName,
                          propertyCount: item.propertyCount,
                        })
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
                  totals={companyTotalsFromRow(item, item.propertyValue)}
                  international={item.isOffshore}
                />
              </div>
            );
          })}
          {!list.data?.length ? (
            <p className="text-sm text-lucathi-gray text-center py-4">
              Nenhuma sociedade cadastrada. Clique em «Nova sociedade» para começar.
            </p>
          ) : null}
        </div>
      </div>

      {detailsCompanyId ? (
        <CompanyDetailsModal
          companyId={detailsCompanyId}
          familyId={familyId}
          onClose={() => setDetailsCompanyId(null)}
        />
      ) : null}

      <Dialog open={Boolean(removingCompany)} onOpenChange={value => { if (!value) setRemovingCompany(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lucathi-navy">Excluir sociedade?</DialogTitle>
            <DialogDescription>
              A sociedade “{removingCompany?.legalName}” será removida. Se houver
              {removingCompany?.propertyCount} imóvel(is) vinculado(s), eles
              permanecerão no projeto, mas sem sociedade associada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRemovingCompany(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={removeCompany.isPending}
              onClick={() =>
                removingCompany &&
                removeCompany.mutate({ familyId, companyId: removingCompany.id })
              }
            >
              {removeCompany.isPending ? "Excluindo…" : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}