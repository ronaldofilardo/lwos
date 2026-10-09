import { useState } from "react";
import { Building2, Info, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { CompanyDetailsModal } from "./CompanyDetailsModal";

type Person = { id: string; fullName: string };

function StakeholderManager({
  companyId,
  familyId,
  people,
}: {
  companyId: string;
  familyId: string;
  people: Person[];
}) {
  const utils = trpc.useUtils();
  const refresh = () => utils.companies.stakeholders.invalidate({ companyId });
  const stakeholders = trpc.companies.stakeholders.useQuery({ companyId });

  const [personId, setPersonId] = useState("");
  const [externalName, setExternalName] = useState("");
  const [percentage, setPercentage] = useState("");

  const onError = (error: { message: string }) => toast.error(error.message);
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
            return (
              <div
                key={row.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-lucathi-line/60 bg-white px-2.5 py-1.5 text-xs"
              >
                <span className="font-medium text-lucathi-navy">{label}</span>
                <span className="text-lucathi-gray">
                  {row.percentage}%
                  {person ? "" : " · não-membro"}
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
    </div>
  );
}

export function CompanyPanel({ familyId }: { familyId: string }) {
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [isOffshore, setIsOffshore] = useState(false);
  const [taxNumber, setTaxNumber] = useState("");
  const [detailsCompanyId, setDetailsCompanyId] = useState<string | null>(null);

  const list = trpc.companies.list.useQuery({ familyId });
  const people = trpc.people.list.useQuery({ familyId });

  const create = trpc.companies.create.useMutation({
    onSuccess: () => {
      utils.companies.list.invalidate({ familyId });
      utils.certidoes.list.invalidate({ familyId });
      utils.documents.list.invalidate({ familyId });
      setName("");
      setTaxNumber("");
      toast.success("Sociedade criada.");
    },
    onError: e => toast.error(e.message),
  });

  const selectClass =
    "h-10 rounded-md border border-input bg-background px-3 text-sm";

  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6">
      <div className="flex items-center gap-3">
        <Building2 className="size-5 text-lucathi-navy" />
        <div>
          <h2 className="font-display text-2xl text-lucathi-navy">
            Holding e sociedades
          </h2>
          <p className="text-sm text-lucathi-gray">
            Nacionais e internacionais, com quadro societário de membros e
            não-membros somando 100%.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]">
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Razão social"
        />
        <Input
          value={taxNumber}
          onChange={e => setTaxNumber(e.target.value)}
          placeholder="CNPJ (opcional)"
        />
        <select
          value={isOffshore ? "internacional" : "nacional"}
          onChange={e => setIsOffshore(e.target.value === "internacional")}
          className={selectClass}
          aria-label="Tipo de sociedade"
        >
          <option value="nacional">Nacional</option>
          <option value="internacional">Internacional (offshore)</option>
        </select>
        <Button
          disabled={!name || create.isPending}
          onClick={() =>
            create.mutate({
              familyId,
              legalName: name,
              taxNumber: taxNumber || undefined,
              isOffshore,
            })
          }
        >
          Criar sociedade
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        {list.data?.map(item => (
          <div key={item.id} className="rounded-xl bg-lucathi-mist px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{item.legalName}</p>
                <p className="text-xs text-lucathi-gray">
                  {item.isOffshore ? "Internacional (offshore)" : "Nacional"}
                  {item.taxNumber ? ` · CNPJ ${item.taxNumber}` : ""}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => setDetailsCompanyId(item.id)}
              >
                <Info className="mr-1 size-3.5" /> Detalhes
              </Button>
            </div>
            <StakeholderManager
              companyId={item.id}
              familyId={familyId}
              people={people.data ?? []}
            />
          </div>
        ))}
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
    </section>
  );
}
