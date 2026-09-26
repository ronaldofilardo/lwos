import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FamilyFormData } from "../types";
import { civilStatusLabels, maritalRegimeLabels } from "../types";

type Props = { data: FamilyFormData; disabled: boolean; onChange: (data: FamilyFormData) => void; onSubmit: () => void };

export function FamilyForm({ data, disabled, onChange, onSubmit }: Props) {
  return <div className="space-y-4"><Input value={data.name} onChange={e => onChange({ ...data, name: e.target.value })} placeholder="Nome da família" /><div className="grid gap-3 sm:grid-cols-2"><select value={data.civilStatus} onChange={e => onChange({ ...data, civilStatus: e.target.value as FamilyFormData["civilStatus"] })} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Situação conjugal</option>{Object.entries(civilStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select value={data.maritalRegime} onChange={e => onChange({ ...data, maritalRegime: e.target.value as FamilyFormData["maritalRegime"] })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">{Object.entries(maritalRegimeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><Textarea value={data.notes} onChange={e => onChange({ ...data, notes: e.target.value })} placeholder="Observações (opcional)" /><Button disabled={disabled || data.name.trim().length < 3} onClick={onSubmit} className="w-full bg-lucathi-deep hover:bg-lucathi-navy">Criar família e projeto</Button></div>;
}
