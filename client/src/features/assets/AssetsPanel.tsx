import { useState } from "react";
import { Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const categoryValues = [
  "INVESTIMENTOS",
  "VEICULO_EMBARCACAO_AERONAVE",
  "SEMOVENTES",
  "CREDITO",
  "DINHEIRO_ESPECIE",
  "CONTA_CORRENTE",
  "ATIVOS_AGRO",
  "OUTROS",
] as const;

type AssetCategory = (typeof categoryValues)[number];

const categoryLabels: Record<AssetCategory, string> = {
  INVESTIMENTOS: "Aplicações / Investimentos",
  VEICULO_EMBARCACAO_AERONAVE: "Veículo / Embarcação / Aeronave",
  SEMOVENTES: "Semoventes (animais)",
  CREDITO: "Crédito / Direito creditório",
  DINHEIRO_ESPECIE: "Dinheiro em espécie",
  CONTA_CORRENTE: "Conta corrente / Depósitos",
  ATIVOS_AGRO: "Ativos agropecuários",
  OUTROS: "Outros ativos",
};

export function AssetsPanel({ familyId }: { familyId: string }) {
  const utils = trpc.useUtils();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<AssetCategory>("INVESTIMENTOS");
  const [declaredValue, setDeclaredValue] = useState("");
  const [ownerPersonId, setOwnerPersonId] = useState("");
  const [notes, setNotes] = useState("");

  const people = trpc.people.list.useQuery({ familyId });
  const list = trpc.assets.list.useQuery({ familyId });

  const create = trpc.assets.create.useMutation({
    onSuccess: () => {
      utils.assets.list.invalidate({ familyId });
      setDescription("");
      setDeclaredValue("");
      setNotes("");
      toast.success("Ativo registrado na Due Diligence.");
    },
    onError: (e) => toast.error(e.message),
  });

  const submit = () => {
    if (!description.trim() || !declaredValue || !ownerPersonId) return;
    create.mutate({
      familyId,
      category,
      description: description.trim(),
      declaredValue: Number(declaredValue),
      ownerPersonId,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-lucathi-mist text-lucathi-navy">
          <Wallet className="size-5" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-lucathi-navy">Demais Ativos (Due Diligence)</h2>
          <p className="text-sm text-lucathi-gray">
            Aplicações financeiras, veículos, participações e outros direitos patrimoniais.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição do ativo (ex: Conta XP Investimentos, BMW X5...)"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as AssetCategory)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {categoryValues.map((value) => (
            <option key={value} value={value}>
              {categoryLabels[value]}
            </option>
          ))}
        </select>
        <Input
          inputMode="decimal"
          value={declaredValue}
          onChange={(e) => setDeclaredValue(e.target.value)}
          placeholder="Valor declarado (IRPF/Balanço) *"
        />
        <select
          value={ownerPersonId}
          onChange={(e) => setOwnerPersonId(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Titular do ativo *</option>
          {people.data?.map((person) => (
            <option key={person.id} value={person.id}>
              {person.fullName}
            </option>
          ))}
        </select>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações / Instituição financeira"
        />
      </div>

      <Button
        className="mt-3"
        disabled={!description.trim() || !declaredValue || !ownerPersonId || create.isPending}
        onClick={submit}
      >
        <Plus className="mr-2 size-4" /> Cadastrar ativo
      </Button>

      <div className="mt-5 space-y-2">
        {list.data?.map((asset) => {
          const owner = people.data?.find((p) => p.id === asset.ownerPersonId);
          return (
            <div
              key={asset.id}
              className="flex flex-col gap-2 rounded-xl bg-lucathi-mist px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-lucathi-navy">{asset.description}</p>
                <p className="text-xs text-lucathi-gray">
                  {categoryLabels[asset.category as AssetCategory] || asset.category}
                  {owner ? ` · Titular: ${owner.fullName}` : ""}
                  {asset.notes ? ` · ${asset.notes}` : ""}
                </p>
              </div>
              <div className="text-right text-xs">
                {asset.declaredValue ? (
                  <p className="text-lucathi-gray">
                    Declarado: R$ {Number(asset.declaredValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
        {!list.data?.length ? (
          <p className="text-sm text-lucathi-gray">Nenhum ativo registrado na Due Diligence.</p>
        ) : null}
      </div>
    </section>
  );
}
