import { AlertTriangle, KeyRound, ShieldAlert, Sparkles, UserCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { EncumbranceForm } from "./EncumbranceForm";
import { PropertyOwnerForm } from "./PropertyOwnerForm";
import { encumbranceTypeLabels, type EncumbranceType } from "./types";

type Property = {
  id: string;
  description: string;
  propertyCity: string;
  hasRegistration?: boolean;
  registrationNumber: string | null;
  alternativeDocType?: string | null;
  noRegistrationReason?: string | null;
  declaredValue?: string | null;
  marketValue?: string | null;
  acquisitionDate?: string | null;
};

export function PropertyRow({
  familyId,
  property,
  onAddEncumbrance,
}: {
  familyId: string;
  property: Property;
  onAddEncumbrance: (
    propertyId: string,
    type: EncumbranceType,
    description?: string
  ) => Promise<unknown>;
}) {
  const encumbrances = trpc.properties.encumbrances.useQuery({ propertyId: property.id });
  const owners = trpc.properties.owners.useQuery({ propertyId: property.id });
  const people = trpc.people.list.useQuery({ familyId });

  const activeEncumbrances = encumbrances.data?.filter((item) => item.active) || [];
  const hasAlert = activeEncumbrances.length > 0;

  const hasUsufruto = owners.data?.some((o) => o.rightType === "USUFRUTO");
  const hasNuaPropriedade = owners.data?.some((o) => o.rightType === "NUA_PROPRIEDADE");

  const docTypeLabels: Record<string, string> = {
    ESCRITURA_PUBLICA: "Escritura Pública",
    CONTRATO_COMPRA_VENDA: "Contrato de Compra e Venda",
  };

  return (
    <div className="rounded-xl border border-lucathi-line/70 bg-lucathi-mist/60 px-4 py-3 transition-all space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-lucathi-navy">{property.description}</p>
            {/* Destaque Visual Imediato para Usufruto / Nua-Propriedade */}
            {hasUsufruto && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800">
                <Sparkles className="size-3" /> Usufruto Declarado
              </span>
            )}
            {hasNuaPropriedade && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800">
                <KeyRound className="size-3" /> Nua-Propriedade
              </span>
            )}
          </div>

          <p className="text-xs text-lucathi-gray mt-0.5">
            {property.propertyCity} ·{" "}
            {property.hasRegistration !== false ? (
              <span>Matrícula: {property.registrationNumber || "Em análise"}</span>
            ) : (
              <span className="text-amber-800 font-medium">
                Sem Matrícula (Doc: {property.alternativeDocType ? (docTypeLabels[property.alternativeDocType] || property.alternativeDocType) : "Doc Alternativo"}
                {property.noRegistrationReason ? ` · Motivo: ${property.noRegistrationReason}` : ""})
              </span>
            )}
          </p>

          <div className="mt-1 flex flex-wrap gap-3 text-xs text-lucathi-gray">
            {property.acquisitionDate ? (
              <span>
                Aquisição: {new Date(property.acquisitionDate).toLocaleDateString("pt-BR")}
              </span>
            ) : null}
            {property.marketValue ? (
              <span>Mercado: R$ {Number(property.marketValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            ) : null}
            {property.declaredValue ? (
              <span>IRPF: R$ {Number(property.declaredValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            ) : null}
          </div>
        </div>

        {/* Alerta Visual de Gravames */}
        {hasAlert ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800 shadow-sm border border-red-200">
            <AlertTriangle className="size-3.5" />
            {activeEncumbrances.map(item => encumbranceTypeLabels[item.type as EncumbranceType] ?? item.type).join(", ")}
          </span>
        ) : (
          <span className="text-xs text-lucathi-gray">Sem gravame ativo</span>
        )}
      </div>

      {/* Lista de Titulares & Direitos com Destaque */}
      {owners.data && owners.data.length > 0 ? (
        <div className="rounded-lg bg-white/70 p-2.5 text-xs border border-lucathi-line/40">
          <p className="font-semibold text-lucathi-navy mb-1 flex items-center gap-1">
            <UserCheck className="size-3.5 text-lucathi-navy" /> Titularidade e Direitos Registrados:
          </p>
          <div className="flex flex-wrap gap-2">
            {owners.data.map((owner) => {
              const person = people.data?.find((p) => p.id === owner.personId);
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
                  <span className="font-medium">{person?.fullName || "Pessoa"}</span>
                  <span>({owner.ownershipPercentage}% — {rightLabel})</span>
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      <PropertyOwnerForm familyId={familyId} propertyId={property.id} />
      <EncumbranceForm
        propertyId={property.id}
        onSubmit={(type, description) => onAddEncumbrance(property.id, type, description)}
      />
    </div>
  );
}
