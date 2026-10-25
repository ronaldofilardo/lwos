import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LabeledField } from "@/components/LabeledField";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  MAX_DINHEIRO,
  formatarDinheiro,
  parseNumeroPtBR,
} from "@shared/validation/dinheiro";
import { errorMessage } from "@/lib/trpcError";
import {
  ASSET_CATEGORY_LABELS,
  ASSET_CATEGORY_VALUES,
  DECLARED_VALUE_LABEL,
  assetCategoryLabel,
  declaredValuePlaceholder,
  formatAssetValue,
  type AssetCategory,
} from "./assetLabels";

type AssetRow = {
  id: string;
  category: string;
  description: string;
  declaredValue: string;
  ownerPersonId: string;
  notes: string | null;
};

type Person = { id: string; fullName: string };

/**
 * Valor declarado em pt-BR ("100.000,00", "1.500", "R$ 10,50"). Antes o painel
 * usava Number(x.replace(",", ".")), que transformava o próprio formato do
 * placeholder ("100.000,00") em NaN e desabilitava o botão sem explicação.
 */
function parseDeclaredValue(raw: string): number | null {
  const value = parseNumeroPtBR(raw);
  return value !== null && value > 0 && value <= MAX_DINHEIRO ? value : null;
}

const selectClass = "h-10 rounded-md border border-input bg-background px-3 text-sm";

function AssetFormModal({
  familyId,
  asset,
  people,
  onClose,
}: {
  familyId: string;
  asset: AssetRow | null;
  people: Person[];
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [declaredValue, setDeclaredValue] = useState("");
  const [ownerPersonId, setOwnerPersonId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!asset) return;
    setDescription(asset.description);
    setCategory(asset.category);
    setDeclaredValue(formatarDinheiro(Number(asset.declaredValue)));
    setOwnerPersonId(asset.ownerPersonId);
    setNotes(asset.notes ?? "");
  }, [asset]);

  const update = trpc.assets.update.useMutation({
    onSuccess: () => {
      utils.assets.list.invalidate({ familyId });
      toast.success("Ativo atualizado.");
      onClose();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsedValue = parseDeclaredValue(declaredValue);
    if (!asset || parsedValue === null) return;
    update.mutate({
      assetId: asset.id,
      category: category as AssetCategory,
      description: description.trim(),
      declaredValue: parsedValue,
      ownerPersonId,
      notes: notes.trim() || undefined,
    });
  };

  const valid =
    description.trim().length >= 2 &&
    Boolean(category) &&
    parseDeclaredValue(declaredValue) !== null &&
    Boolean(ownerPersonId);

  return (
    <Dialog open={Boolean(asset)} onOpenChange={value => { if (!value) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-lucathi-navy">
            Editar ativo
          </DialogTitle>
          <DialogDescription>Campos editáveis do ativo selecionado.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-lucathi-gray">Descrição</span>
            <Input value={description} onChange={e => setDescription(e.target.value)} className="h-9" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-lucathi-gray">Categoria</span>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">Selecione…</option>
              {ASSET_CATEGORY_VALUES.map(value => (
                <option key={value} value={value}>{ASSET_CATEGORY_LABELS[value]}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-lucathi-gray">{DECLARED_VALUE_LABEL}</span>
            <Input
              inputMode="decimal"
              value={declaredValue}
              onChange={e => setDeclaredValue(e.target.value)}
              placeholder={declaredValuePlaceholder(category)}
              className="h-9"
            />
            {declaredValue.trim() && parseDeclaredValue(declaredValue) === null ? (
              <span className="text-xs text-red-600">
                Valor inválido. Use o formato 100.000,00 (maior que zero).
              </span>
            ) : null}
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-lucathi-gray">Responsável</span>
            <select
              value={ownerPersonId}
              onChange={e => setOwnerPersonId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">Selecione…</option>
              {(people ?? []).map(person => (
                <option key={person.id} value={person.id}>{person.fullName}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-lucathi-gray">Observações</span>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              maxLength={8000}
              className="min-h-20 resize-y"
            />
          </label>
          <DialogFooter className="gap-2 border-t border-lucathi-line pt-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={!valid || update.isPending}>
              {update.isPending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AssetsPanel({ familyId }: { familyId: string }) {
  const utils = trpc.useUtils();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [declaredValue, setDeclaredValue] = useState("");
  const [ownerPersonId, setOwnerPersonId] = useState("");
  const [notes, setNotes] = useState("");
  const [editing, setEditing] = useState<AssetRow | null>(null);
  const [removing, setRemoving] = useState<AssetRow | null>(null);

  const people = trpc.people.list.useQuery({ familyId });
  const list = trpc.assets.list.useQuery({ familyId });

  const create = trpc.assets.create.useMutation({
    onSuccess: () => {
      utils.assets.list.invalidate({ familyId });
      setDescription("");
      setCategory("");
      setDeclaredValue("");
      setOwnerPersonId("");
      setNotes("");
      toast.success("Ativo registrado na Due Diligence.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const remove = trpc.assets.remove.useMutation({
    onSuccess: () => {
      utils.assets.list.invalidate({ familyId });
      setRemoving(null);
      toast.success("Ativo excluído.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const value = parseDeclaredValue(declaredValue);
  const valid =
    description.trim().length >= 2 &&
    Boolean(category) &&
    value !== null &&
    Boolean(ownerPersonId);

  const submit = () => {
    if (!valid || value === null) return;
    create.mutate({
      familyId,
      category: category as AssetCategory,
      description: description.trim(),
      declaredValue: value,
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
          <h2 className="font-display text-2xl text-lucathi-navy">Demais Ativos</h2>
          <p className="text-sm text-lucathi-gray">
            Investimentos, Veículos e Outros.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <LabeledField label="Descrição do ativo *">
          {(id) => (
            <Input
              id={id}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex.: Conta XP Investimentos, BMW X5"
            />
          )}
        </LabeledField>
        <LabeledField label="Categoria *">
          {(id) => (
            <select
              id={id}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={selectClass}
            >
              <option value="">Selecione</option>
              {ASSET_CATEGORY_VALUES.map((value) => (
                <option key={value} value={value}>
                  {ASSET_CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          )}
        </LabeledField>
        <LabeledField label={`${DECLARED_VALUE_LABEL} *`}>
          {(id) => (
            <>
              <Input
                id={id}
                inputMode="decimal"
                value={declaredValue}
                onChange={(e) => setDeclaredValue(e.target.value)}
                placeholder={declaredValuePlaceholder(category)}
              />
              {declaredValue.trim() && value === null ? (
                <span className="text-xs text-red-600">
                  Valor inválido. Use o formato 100.000,00 (maior que zero).
                </span>
              ) : null}
            </>
          )}
        </LabeledField>

        <LabeledField label="Responsável *">
          {(id) => (
            <select
              id={id}
              value={ownerPersonId}
              onChange={(e) => setOwnerPersonId(e.target.value)}
              className={selectClass}
            >
              <option value="">Selecione</option>
              {people.data?.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.fullName}
                </option>
              ))}
            </select>
          )}
        </LabeledField>
        <LabeledField label="Observações">
          {(id) => (
            <Textarea
              id={id}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: Banco XP, conta corrente"
              rows={3}
              maxLength={8000}
              className="min-h-20 resize-y"
            />
          )}
        </LabeledField>
      </div>

      <Button
        className="mt-3"
        disabled={!valid || create.isPending}
        onClick={submit}
      >
        <Plus className="mr-2 size-4" /> Cadastrar ativo
      </Button>

      <div className="mt-5 space-y-2">
        {list.data?.map((asset) => {
          const owner = people.data?.find((p) => p.id === asset.ownerPersonId);
          const row: AssetRow = {
            id: asset.id,
            category: asset.category,
            description: asset.description,
            declaredValue: asset.declaredValue,
            ownerPersonId: asset.ownerPersonId,
            notes: asset.notes,
          };
          return (
            <div
              key={asset.id}
              className="flex flex-col gap-2 rounded-xl bg-lucathi-mist px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-lucathi-navy">{asset.description}</p>
                <p className="text-xs text-lucathi-gray">{assetCategoryLabel(asset.category)}</p>
                {owner ? (
                  <p className="text-xs text-lucathi-gray">Titular: {owner.fullName}</p>
                ) : null}
                {asset.notes ? (
                  <p className="mt-0.5 whitespace-pre-wrap text-xs text-lucathi-gray">
                    <span className="font-medium text-lucathi-navy">Observações:</span>{" "}
                    {asset.notes}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-xs">
                  {asset.declaredValue ? (
                    <p className="text-lucathi-gray">
                      {formatAssetValue(asset.declaredValue, asset.category)}
                    </p>
                  ) : null}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 text-xs"
                  onClick={() => setEditing(row)}
                >
                  <Pencil className="mr-1 size-3.5" /> Editar
                </Button>
                <button
                  type="button"
                  aria-label="Excluir ativo"
                  className="rounded px-1.5 py-1 text-red-600 hover:bg-red-50"
                  onClick={() => setRemoving(row)}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
        {!list.data?.length ? (
          <p className="text-sm text-lucathi-gray">Nenhum ativo registrado na Due Diligence.</p>
        ) : null}
      </div>

      <AssetFormModal
        familyId={familyId}
        asset={editing}
        people={people.data ?? []}
        onClose={() => setEditing(null)}
      />

      <Dialog open={Boolean(removing)} onOpenChange={value => { if (!value) setRemoving(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lucathi-navy">Excluir ativo?</DialogTitle>
            <DialogDescription>
              O ativo “{removing?.description}” será removido e seus documentos
              arquivados como dispensados. Esta ação não desfaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRemoving(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() =>
                removing &&
                remove.mutate({ familyId, assetId: removing.id })
              }
            >
              {remove.isPending ? "Excluindo…" : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
