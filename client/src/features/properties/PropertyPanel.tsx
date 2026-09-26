import { useState } from "react";
import { AlertTriangle, Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { PropertyRow } from "./PropertyRow";

export function PropertyPanel({ familyId }: { familyId: string }) {
  const utils = trpc.useUtils();
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [hasRegistration, setHasRegistration] = useState(true);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [alternativeDocType, setAlternativeDocType] = useState<"ESCRITURA_PUBLICA" | "CONTRATO_COMPRA_VENDA">("ESCRITURA_PUBLICA");
  const [noRegistrationReason, setNoRegistrationReason] = useState("");
  const [registryOffice, setRegistryOffice] = useState("");
  const [registryCity, setRegistryCity] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [declaredValue, setDeclaredValue] = useState("");
  const [marketValue, setMarketValue] = useState("");

  const list = trpc.properties.list.useQuery({ familyId });
  const create = trpc.properties.create.useMutation({
    onSuccess: () => {
      utils.properties.list.invalidate({ familyId });
      setDescription("");
      setCity("");
      setRegistrationNumber("");
      setNoRegistrationReason("");
      setDeclaredValue("");
      setMarketValue("");
      toast.success("Imóvel cadastrado na Due Diligence.");
    },
    onError: (e) => toast.error(e.message),
  });

  const gravame = trpc.properties.addEncumbrance.useMutation({
    onSuccess: () => {
      utils.properties.list.invalidate({ familyId });
      toast.success("Gravame cadastrado. Alerta visual exibido imediatamente.");
    },
    onError: (e) => toast.error(e.message),
  });

  const submit = () => {
    create.mutate({
      familyId,
      description,
      propertyCity: city,
      hasRegistration,
      registrationNumber: hasRegistration ? registrationNumber : undefined,
      alternativeDocType: !hasRegistration ? alternativeDocType : undefined,
      noRegistrationReason: !hasRegistration ? noRegistrationReason : undefined,
      registryOffice,
      registryCity,
      acquisitionDate: acquisitionDate || undefined,
      declaredValue: declaredValue ? Number(declaredValue) : undefined,
      marketValue: marketValue ? Number(marketValue) : undefined,
    });
  };

  const isFormValid =
    description.trim() &&
    city.trim() &&
    (hasRegistration || (alternativeDocType && noRegistrationReason.trim().length >= 3));

  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-lucathi-mist text-lucathi-navy">
          <Building2 className="size-5" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-lucathi-navy">Imóveis & Gravames (Due Diligence)</h2>
          <p className="text-sm text-lucathi-gray">
            Registro imobiliário, titularidades, usufruto em destaque e alertas imediatos de ônus.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição do imóvel (ex: Fazenda Boa Vista, Apto 101 Jardins...)"
        />
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Cidade do imóvel"
        />

        {/* Controle de Matrícula: Opção 'Não há' para imóveis na planta / posse */}
        <div className="col-span-full rounded-xl bg-lucathi-mist/50 p-3 border border-lucathi-line/50">
          <label className="flex items-center gap-2 text-xs font-semibold text-lucathi-navy cursor-pointer">
            <input
              type="checkbox"
              checked={!hasRegistration}
              onChange={(e) => setHasRegistration(!e.target.checked)}
              className="size-4 rounded border-gray-300 text-lucathi-navy"
            />
            Não há matrícula registrada (Imóvel em construção, posse ou loteamento)
          </label>

          {!hasRegistration ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div>
                <label className="text-xs text-lucathi-gray block mb-1">Documento Alternativo Obrigatório:</label>
                <select
                  value={alternativeDocType}
                  onChange={(e) => setAlternativeDocType(e.target.value as typeof alternativeDocType)}
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="ESCRITURA_PUBLICA">Escritura Pública de Compra e Venda / Posse</option>
                  <option value="CONTRATO_COMPRA_VENDA">Contrato de Compra e Venda / Cessão de Direitos</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-lucathi-gray block mb-1">Justificativa da Ausência de Matrícula:</label>
                <Input
                  value={noRegistrationReason}
                  onChange={(e) => setNoRegistrationReason(e.target.value)}
                  placeholder="Ex: Empreendimento em construção na planta, matrícula-mãe em desmembramento"
                  className="h-9 text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <Input
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="Número da Matrícula"
                className="h-9 text-xs"
              />
              <Input
                value={registryOffice}
                onChange={(e) => setRegistryOffice(e.target.value)}
                placeholder="Cartório de Registro de Imóveis (RGI)"
                className="h-9 text-xs"
              />
              <Input
                value={registryCity}
                onChange={(e) => setRegistryCity(e.target.value)}
                placeholder="Cidade do Cartório"
                className="h-9 text-xs"
              />
            </div>
          )}
        </div>

        <Input
          type="date"
          value={acquisitionDate}
          onChange={(e) => setAcquisitionDate(e.target.value)}
          placeholder="Data de aquisição"
        />
        <Input
          inputMode="decimal"
          value={declaredValue}
          onChange={(e) => setDeclaredValue(e.target.value)}
          placeholder="Valor IRPF / Balanço (R$)"
        />
        <Input
          inputMode="decimal"
          value={marketValue}
          onChange={(e) => setMarketValue(e.target.value)}
          placeholder="Valor estimado de mercado (R$)"
        />
      </div>

      <Button
        className="mt-3"
        disabled={!isFormValid || create.isPending}
        onClick={submit}
      >
        <Plus className="mr-2 size-4" /> Cadastrar Imóvel
      </Button>

      <div className="mt-5 space-y-3">
        {list.data?.map((item) => (
          <PropertyRow
            key={item.id}
            familyId={familyId}
            property={item}
            onAddEncumbrance={(propertyId, type, description) => gravame.mutateAsync({ propertyId, type, description })}
          />
        ))}
        {!list.data?.length ? (
          <p className="text-sm text-lucathi-gray">Nenhum imóvel cadastrado.</p>
        ) : null}
      </div>
    </section>
  );
}
