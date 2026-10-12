import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { errorMessage } from "@/lib/trpcError";
import { parsePercentual } from "@shared/validation";
import type { EncumbranceSeverity } from "./types";

type RightType = "PROPRIEDADE" | "USUFRUTO" | "NUA_PROPRIEDADE";

const rightTypeLabels: Record<RightType, string> = {
  PROPRIEDADE: "Propriedade",
  USUFRUTO: "Usufruto",
  NUA_PROPRIEDADE: "Nua-propriedade",
};

export function PropertyOwnerForm({
  familyId,
  propertyId,
  encumbranceSeverity,
}: {
  familyId: string;
  propertyId: string;
  encumbranceSeverity?: EncumbranceSeverity | null;
}) {
  const utils = trpc.useUtils();
  const refresh = () => utils.properties.owners.invalidate({ propertyId });

  const people = trpc.people.list.useQuery({ familyId });
  const companies = trpc.companies.list.useQuery({ familyId });
  const owners = trpc.properties.owners.useQuery({ propertyId });

  const [ownerKind, setOwnerKind] = useState<"PESSOA" | "SOCIEDADE">("PESSOA");
  const [personId, setPersonId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [percentage, setPercentage] = useState("100");
  const [rightType, setRightType] = useState<RightType>("PROPRIEDADE");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPercentage, setEditPercentage] = useState("");
  const [editRightType, setEditRightType] = useState<RightType>("PROPRIEDADE");

  const onError = (error: unknown) => toast.error(errorMessage(error));
  const addOwner = trpc.properties.addOwner.useMutation({
    onSuccess: () => {
      refresh();
      setPersonId("");
      setCompanyId("");
      setPercentage("100");
      toast.success("Titularidade vinculada.");
    },
    onError,
  });
  const updateOwner = trpc.properties.updateOwner.useMutation({
    onSuccess: () => {
      refresh();
      setEditingId(null);
      toast.success("Titularidade atualizada.");
    },
    onError,
  });
  const removeOwner = trpc.properties.removeOwner.useMutation({
    onSuccess: () => {
      refresh();
      toast.success("Titularidade removida.");
    },
    onError,
  });

  const rows = owners.data ?? [];
  const total = rows.reduce(
    (sum, row) => sum + Number(row.ownershipPercentage),
    0
  );
  const remaining = Math.max(0, Math.round((100 - total) * 100) / 100);
  const isFull = remaining <= 0;
  const companyBlocked = encumbranceSeverity === "vermelho";

  const startEdit = (row: (typeof rows)[number]) => {
    setEditingId(row.id);
    setEditPercentage(String(row.ownershipPercentage));
    setEditRightType(row.rightType as RightType);
  };

  const ownerLabel = (row: { personId: string | null; companyId: string | null }) => {
    if (row.companyId) {
      const company = companies.data?.find(c => c.id === row.companyId);
      return company?.legalName ?? "Sociedade";
    }
    const person = people.data?.find(p => p.id === row.personId);
    return person?.fullName ?? "Pessoa removida";
  };

  const selectClass =
    "h-9 rounded-md border border-input bg-background px-2 text-xs";

  const canAdd =
    !isFull &&
    (ownerKind === "PESSOA" ? Boolean(personId) : Boolean(companyId));

  if (!people.data?.length && !companies.data?.length) {
    return (
      <p className="mt-3 text-xs text-lucathi-gray">
        Cadastre uma pessoa ou sociedade antes de informar a titularidade.
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-lucathi-navy">
          Titularidades do imóvel
        </span>
        <span
          className={
            remaining > 0
              ? "font-semibold text-amber-700"
              : "font-semibold text-emerald-700"
          }
        >
          {total}% vinculado
          {remaining > 0 ? ` · falta ${remaining}%` : " · 100%"}
        </span>
      </div>

      {rows.length ? (
        <div className="space-y-1.5">
          {rows.map(row => {
            const isEditing = editingId === row.id;
            return (
              <div
                key={row.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-lucathi-line/60 bg-white px-2.5 py-1.5 text-xs"
              >
                <span className="font-medium text-lucathi-navy">
                  {ownerLabel(row)}
                </span>
                {isEditing ? (
                  <>
                    <input
                      value={editPercentage}
                      onChange={e => setEditPercentage(e.target.value)}
                      inputMode="decimal"
                      className="h-7 w-20 rounded-md border border-input px-2 text-xs"
                      placeholder="%"
                    />
                    <select
                      value={editRightType}
                      onChange={e =>
                        setEditRightType(e.target.value as RightType)
                      }
                      className={selectClass}
                      aria-label="Direito"
                    >
                      {Object.entries(rightTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      className="h-7 px-2 text-xs"
                      disabled={updateOwner.isPending}
                      onClick={() => {
                        const parsed = parsePercentual(editPercentage);
                        if (parsed === null || parsed <= 0) {
                          toast.error("Percentual inválido (0 a 100).");
                          return;
                        }
                        updateOwner.mutate({
                          propertyId,
                          ownerId: row.id,
                          ownershipPercentage: parsed,
                          rightType: editRightType,
                        });
                      }}
                    >
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-lucathi-gray">
                      {row.ownershipPercentage}% ·{" "}
                      {rightTypeLabels[row.rightType as RightType] ??
                        row.rightType}
                    </span>
                    <button
                      type="button"
                      className="ml-auto rounded px-1.5 py-0.5 text-[11px] font-medium text-lucathi-navy hover:bg-lucathi-mist"
                      onClick={() => startEdit(row)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      aria-label="Remover titularidade"
                      className="rounded px-1.5 py-0.5 text-red-600 hover:bg-red-50"
                      disabled={removeOwner.isPending}
                      onClick={() =>
                        removeOwner.mutate({
                          propertyId,
                          ownerId: row.id,
                        })
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-lucathi-gray">
          Nenhum membro vinculado a este imóvel.
        </p>
      )}

      {isFull ? (
        <p className="text-xs font-semibold text-emerald-700">
          Titularidade completa (100%) — não é possível adicionar novas linhas.
        </p>
      ) : (
        <div className="grid gap-2 md:grid-cols-5">
          <select
            value={ownerKind}
            onChange={e => {
              setOwnerKind(e.target.value as "PESSOA" | "SOCIEDADE");
              setPersonId("");
              setCompanyId("");
            }}
            className={selectClass}
            aria-label="Tipo de titular"
          >
            <option value="PESSOA">Pessoa</option>
            <option value="SOCIEDADE" disabled={companyBlocked}>
              Sociedade
            </option>
          </select>
          {ownerKind === "PESSOA" ? (
            <select
              value={personId}
              onChange={e => setPersonId(e.target.value)}
              className={selectClass}
              aria-label="Membro da família"
            >
              <option value="">Selecionar membro…</option>
              {people.data?.map(person => (
                <option key={person.id} value={person.id}>
                  {person.fullName}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={companyId}
              onChange={e => setCompanyId(e.target.value)}
              className={selectClass}
              aria-label="Sociedade"
              disabled={companyBlocked}
            >
              <option value="">Selecionar sociedade…</option>
              {companies.data?.map(company => (
                <option key={company.id} value={company.id}>
                  {company.legalName}
                </option>
              ))}
            </select>
          )}
          <input
            value={percentage}
            onChange={e => setPercentage(e.target.value)}
            inputMode="decimal"
            className="h-9 rounded-md border border-input px-2 text-xs"
            placeholder="Percentual (%)"
          />
          <select
            value={rightType}
            onChange={e => setRightType(e.target.value as RightType)}
            className={selectClass}
            aria-label="Direito"
          >
            {Object.entries(rightTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            disabled={!canAdd || addOwner.isPending}
            onClick={() => {
              const parsed = parsePercentual(percentage);
              if (parsed === null || parsed <= 0) {
                toast.error("Percentual inválido (0 a 100).");
                return;
              }
              addOwner.mutate({
                propertyId,
                personId: ownerKind === "PESSOA" ? personId : undefined,
                companyId: ownerKind === "SOCIEDADE" ? companyId : undefined,
                ownershipPercentage: parsed,
                rightType,
              });
            }}
          >
            Vincular
          </Button>
        </div>
      )}
      {companyBlocked ? (
        <p className="text-xs font-medium text-red-800">
          Gravame vermelho ativo: o vínculo com sociedade está travado até o
          gravame ser resolvido.
        </p>
      ) : null}
    </div>
  );
}
