import { useState } from "react";
import {
  KeyRound,
  Pencil,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserCheck,
  Circle,
  TriangleAlert,
  OctagonAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { errorMessage } from "@/lib/trpcError";
import { PropertyOwnerForm } from "./PropertyOwnerForm";
import { AlertIndicator } from "@/features/alerts/AlertIndicator";
import { worstAlert } from "@/features/alerts/alerts";
import { useProjectAlerts } from "@/features/alerts/useProjectAlerts";
import {
  PropertyFormModal,
  toPropertyFormValues,
} from "./PropertyFormModal";
import { encumbranceSeverity, type EncumbranceSeverity } from "./types";
import {
  buildEncumbranceView,
  buildPropertyValueLines,
} from "./propertyCardView";

type Property = {
  id: string;
  description: string;
  propertyCity: string;
  uf?: string | null;
  cep?: string | null;
  kind?: string | null;
  hasRegistration?: boolean;
  registrationNumber: string | null;
  alternativeDocType?: string | null;
  noRegistrationReason?: string | null;
  irpfBalanceValue?: string | null;
  marketValue?: string | null;
  venalValue?: string | null;
  acquisitionDate?: string | null;
  encumbranceType?: string | null;
  encumbranceNote?: string | null;
};

const severityStyles: Record<
  EncumbranceSeverity,
  { badge: string; Icon: typeof ShieldAlert }
> = {
  verde: { badge: "bg-emerald-100 text-emerald-800 border-emerald-200", Icon: Circle },
  amarelo: { badge: "bg-amber-100 text-amber-800 border-amber-200", Icon: TriangleAlert },
  vermelho: { badge: "bg-red-100 text-red-800 border-red-200", Icon: OctagonAlert },
};

/** Badge só com o status; a observação do gravame vai em texto próprio. */
function EncumbranceBadge({ value }: { value: string | null | undefined }) {
  const { severity, statusLabel } = buildEncumbranceView(value, null);
  if (!severity) {
    return <span className="text-xs text-lucathi-gray">{statusLabel}</span>;
  }
  const { badge, Icon } = severityStyles[severity];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm ${badge}`}
    >
      <Icon className="size-3.5" />
      {statusLabel}
    </span>
  );
}

export function PropertyRow({
  familyId,
  property,
}: {
  familyId: string;
  property: Property;
}) {
  const utils = trpc.useUtils();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const owners = trpc.properties.owners.useQuery({ propertyId: property.id });
  const people = trpc.people.list.useQuery({ familyId });

  const update = trpc.properties.update.useMutation({
    onSuccess: () => {
      utils.properties.list.invalidate({ familyId });
      setEditing(false);
      toast.success("Imóvel atualizado.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const remove = trpc.properties.remove.useMutation({
    onSuccess: () => {
      utils.properties.list.invalidate({ familyId });
      setConfirmDelete(false);
      toast.success("Imóvel excluído.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const severity = encumbranceSeverity(property.encumbranceType);
  const encumbrance = buildEncumbranceView(
    property.encumbranceType,
    property.encumbranceNote
  );
  const valueLines = buildPropertyValueLines(property);
  const hasUsufruto = owners.data?.some(o => o.rightType === "USUFRUTO");
  const hasNuaPropriedade = owners.data?.some(
    o => o.rightType === "NUA_PROPRIEDADE"
  );
  // Alerta do titular (pessoa ou sociedade) — Fase 9.
  const { bySubject } = useProjectAlerts(familyId);
  const ownerAlertLevel = worstAlert(
    ...(owners.data ?? []).map(owner =>
      owner.companyId
        ? bySubject?.[`SOCIEDADE:${owner.companyId}`]
        : owner.personId
          ? bySubject?.[`PESSOA:${owner.personId}`]
          : undefined
    )
  );

  const docTypeLabels: Record<string, string> = {
    ESCRITURA_PUBLICA: "Escritura Pública",
    CONTRATO_COMPRA_VENDA: "Contrato de Compra e Venda",
  };

  return (
    <div className="space-y-3 rounded-xl border border-lucathi-line/70 bg-lucathi-mist/60 px-4 py-3 transition-all">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-lucathi-navy">
              {property.description}
            </p>
            <AlertIndicator level={ownerAlertLevel} />
            {hasUsufruto ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800">
                <Sparkles className="size-3" /> Usufruto Declarado
              </span>
            ) : null}
            {hasNuaPropriedade ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800">
                <KeyRound className="size-3" /> Nua-Propriedade
              </span>
            ) : null}
          </div>

          <p className="mt-0.5 text-xs text-lucathi-gray">
            {property.uf ? `${property.uf} · ` : ""}
            {property.propertyCity}
            {property.cep ? ` (CEP ${property.cep})` : ""}
          </p>

          {property.hasRegistration !== false ? (
            <p className="mt-0.5 text-xs text-lucathi-gray">
              Matrícula: {property.registrationNumber || "Em análise"}
            </p>
          ) : (
            <p className="mt-0.5 text-xs font-medium text-amber-800">
              Sem Matrícula (Doc:{" "}
              {property.alternativeDocType
                ? docTypeLabels[property.alternativeDocType] ||
                  property.alternativeDocType
                : "Doc Alternativo"}
              {property.noRegistrationReason
                ? ` · Motivo: ${property.noRegistrationReason}`
                : ""}
              )
            </p>
          )}

          {valueLines.length ? (
            <div className="mt-1 space-y-0.5 text-xs text-lucathi-gray">
              {valueLines.map(line => (
                <p key={line.key}>
                  {line.label}: {line.value}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
            aria-label={`Editar imóvel ${property.description}`}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            aria-label={`Excluir imóvel ${property.description}`}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {confirmDelete ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs">
          <p className="font-semibold text-red-800">
            Excluir o imóvel «{property.description}»? Documentos enviados
            permanecem arquivados (nada é apagado do disco).
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={remove.isPending}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() =>
                remove.mutate({ familyId, propertyId: property.id })
              }
              disabled={remove.isPending}
            >
              Confirmar exclusão
            </Button>
          </div>
        </div>
      ) : null}

      {editing ? (
        <PropertyFormModal
          title="Editar Imóvel"
          familyId={familyId}
          submitLabel="Salvar alterações"
          initial={toPropertyFormValues(property as Record<string, unknown>)}
          isPending={update.isPending}
          onClose={() => setEditing(false)}
          onSubmit={payload => {
            const { familyId: _ignored, ...rest } = payload;
            update.mutate({ ...rest, propertyId: property.id });
          }}
        />
      ) : null}

      <div className="rounded-lg border border-lucathi-line/40 bg-white/70 p-2.5 text-xs">
        <p className="mb-1 flex items-center gap-1 font-semibold text-lucathi-navy">
          <UserCheck className="size-3.5 text-lucathi-navy" /> Titularidade do
          Imóvel
        </p>
        {owners.data && owners.data.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {owners.data.map(owner => {
              const person = people.data?.find(p => p.id === owner.personId);
              const rightLabel =
                owner.rightType === "USUFRUTO"
                  ? "Usufrutuário(a)"
                  : owner.rightType === "NUA_PROPRIEDADE"
                    ? "Nu-proprietário(a)"
                    : "Proprietário(a)";
              const badgeBg =
                owner.rightType === "USUFRUTO"
                  ? "bg-purple-50 text-purple-900 border-purple-200"
                  : owner.rightType === "NUA_PROPRIEDADE"
                    ? "bg-indigo-50 text-indigo-900 border-indigo-200"
                    : "bg-slate-50 text-slate-900 border-slate-200";
              return (
                <span
                  key={owner.id}
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs ${badgeBg}`}
                >
                  <span className="font-medium">
                    {person?.fullName || "Pessoa"}
                  </span>
                  <span>
                    ({owner.ownershipPercentage}% — {rightLabel})
                  </span>
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-lucathi-gray">Nenhuma titularidade registrada.</p>
        )}
      </div>

      <PropertyOwnerForm
        familyId={familyId}
        propertyId={property.id}
        encumbranceSeverity={severity}
      />

      <div className="rounded-lg border border-lucathi-line/40 bg-white/70 p-2.5 text-xs">
        <p className="mb-1 flex items-center gap-1 font-semibold text-lucathi-navy">
          <ShieldAlert
            className={`size-3.5 ${
              severity === "vermelho"
                ? "text-red-600"
                : severity === "amarelo"
                  ? "text-amber-600"
                  : "text-lucathi-navy"
            }`}
          />{" "}
          Gravames
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <EncumbranceBadge value={property.encumbranceType} />
          {severity === "amarelo" ? (
            <span className="text-amber-800">
              Em verificação — não trava a movimentação.
            </span>
          ) : null}
          {severity === "vermelho" ? (
            <span className="font-medium text-red-800">
              Trava a movimentação do imóvel (vincular a sociedade e concluir).
            </span>
          ) : null}
        </div>
        {encumbrance.note ? (
          <p className="mt-1.5 text-lucathi-gray">
            <span className="font-medium text-lucathi-navy">
              Observação do gravame:
            </span>{" "}
            {encumbrance.note}
          </p>
        ) : null}
      </div>
    </div>
  );
}
