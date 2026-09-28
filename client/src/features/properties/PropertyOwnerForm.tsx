import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

type RightType = "PROPRIEDADE" | "USUFRUTO" | "NUA_PROPRIEDADE";

const rightTypeLabels: Record<RightType, string> = {
  PROPRIEDADE: "Propriedade",
  USUFRUTO: "Usufruto",
  NUA_PROPRIEDADE: "Nua-propriedade",
};

export function PropertyOwnerForm({
  familyId,
  propertyId,
}: {
  familyId: string;
  propertyId: string;
}) {
  const utils = trpc.useUtils();
  const refresh = () => utils.properties.owners.invalidate({ propertyId });

  const people = trpc.people.list.useQuery({ familyId });
  const owners = trpc.properties.owners.useQuery({ propertyId });

  const [personId, setPersonId] = useState("");
  const [percentage, setPercentage] = useState("100");
  const [rightType, setRightType] = useState<RightType>("PROPRIEDADE");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPercentage, setEditPercentage] = useState("");
  const [editRightType, setEditRightType] = useState<RightType>("PROPRIEDADE");

  const onError = (error: { message: string }) => toast.error(error.message);
  const addOwner = trpc.properties.addOwner.useMutation({
    onSuccess: () => {
      refresh();
      setPersonId("");
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
  const total = rows.reduce((sum, row) => sum + Number(row.ownershipPercentage), 0);
  const remaining = Math.max(0, Math.round((100 - total) * 100) / 100);

  const startEdit = (row: (typeof rows)[number]) => {
    setEditingId(row.id);
    setEditPercentage(String(row.ownershipPercentage));
    setEditRightType(row.rightType as RightType);
  };

  const selectClass =
    "h-9 rounded-md border border-input bg-background px-2 text-xs";

  if (!people.data?.length) {
    return (
      <p className="mt-3 text-xs text-lucathi-gray">
        Cadastre uma pessoa antes de informar a titularidade.
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
          {total}% vinculado{remaining > 0 ? ` · falta ${remaining}%` : " · 100%"}
        </span>
      </div>

      {rows.length ? (
        <div className="space-y-1.5">
          {rows.map(row => {
            const person = people.data?.find(p => p.id === row.personId);
            const isEditing = editingId === row.id;
            return (
              <div
                key={row.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-lucathi-line/60 bg-white px-2.5 py-1.5 text-xs"
              >
                <span className="font-medium text-lucathi-navy">
                  {person?.fullName || "Membro removido"}
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
                      onChange={e => setEditRightType(e.target.value as RightType)}
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
                      onClick={() =>
                        updateOwner.mutate({
                          propertyId,
                          ownerId: row.id,
                          ownershipPercentage: Number(editPercentage.replace(',', '.')),
                          rightType: editRightType,
                        })
                      }
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

      <div className="grid gap-2 md:grid-cols-4">
        <select
          value={personId}
          onChange={e => setPersonId(e.target.value)}
          className={selectClass}
          aria-label="Membro da família"
        >
          <option value="">Selecionar membro…</option>
          {people.data.map(person => (
            <option key={person.id} value={person.id}>
              {person.fullName}
            </option>
          ))}
        </select>
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
          disabled={!personId || addOwner.isPending}
          onClick={() =>
            addOwner.mutate({
              propertyId,
              personId,
              ownershipPercentage: Number(percentage.replace(',', '.')),
              rightType,
            })
          }
        >
          Vincular membro
        </Button>
      </div>
    </div>
  );
}
