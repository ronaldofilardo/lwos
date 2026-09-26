import { useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  civilStatusLabels,
  isMarriedStatus,
  maritalRegimeLabels,
  parentVinculoOptions,
  vinculoLabels,
  type CivilStatus,
  type MaritalRegime,
  type Vinculo,
} from "@/features/families/types";

export type PersonFormSubmit = {
  fullName: string;
  email?: string;
  taxId?: string;
  birthDate?: string;
  exSpouseNote?: string;
  vinculo: Vinculo;
  parentPersonId?: string;
  spouseName?: string;
  civilStatus?: CivilStatus;
  maritalRegime?: MaritalRegime;
};

/** Anexo opcional escolhido no form — enviado após a pessoa ser criada. */
export type PersonAttachment = {
  slot: string;
  category: string;
  file: File;
};

type AttachmentSlot = { key: string; label: string; category: string };

/**
 * Campos de anexo por vínculo (opcionais):
 * titular → RG/CPF + doc de estado civil; cônjuge → doc pessoal;
 * filhos → doc pessoal e, se casados, certidão + doc pessoal do cônjuge.
 */
function attachmentSlots(vinculo: Vinculo, married: boolean): AttachmentSlot[] {
  const personalDoc: AttachmentSlot = {
    key: "doc-pessoal",
    label: "Documento pessoal (RG/CPF)",
    category: "CPF/RG ou CNH",
  };

  if (vinculo === "TITULAR") {
    return [
      personalDoc,
      {
        key: "estado-civil",
        label: "Documento de estado civil",
        category: married
          ? "Certidão de casamento/UE"
          : "Certidão de estado civil",
      },
    ];
  }

  if (vinculo === "CONJUGE") return [personalDoc];

  const slots: AttachmentSlot[] = [personalDoc];
  if (married) {
    slots.push(
      {
        key: "certidao-casamento",
        label: "Certidão de casamento/UE",
        category: "Certidão de casamento/UE",
      },
      {
        key: "conjuge-pessoal",
        label: "Documento pessoal do cônjuge",
        category: "Documento pessoal do cônjuge",
      }
    );
  }
  return slots;
}

type PersonSummary = { id: string; fullName: string; vinculo: Vinculo | null };

type Props = {
  disabled: boolean;
  people?: PersonSummary[];
  onSubmit: (
    data: PersonFormSubmit,
    attachments?: PersonAttachment[]
  ) => Promise<unknown>;
};

export function PersonForm({ disabled, people = [], onSubmit }: Props) {
  const [vinculo, setVinculo] = useState<Vinculo>("TITULAR");
  const [parentPersonId, setParentPersonId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [taxId, setTaxId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [note, setNote] = useState("");
  const [civilStatus, setCivilStatus] = useState<CivilStatus>("SOLTEIRO");
  const [maritalRegime, setMaritalRegime] = useState<MaritalRegime>("CPB");
  const [spouseName, setSpouseName] = useState("");
  const [files, setFiles] = useState<Record<string, File | null>>({});

  const needsParent = vinculo === "NETO" || vinculo === "BISNETO";
  const showCivilStatus = vinculo !== "CONJUGE";
  const married = showCivilStatus && isMarriedStatus(civilStatus);
  const slots = attachmentSlots(vinculo, married);

  const parentOptions = useMemo(() => {
    if (!needsParent) return [];
    const expected = parentVinculoOptions[vinculo];
    return people.filter(person => person.vinculo === expected);
  }, [needsParent, people, vinculo]);

  const canSubmit =
    name.trim().length >= 3 &&
    (!needsParent || Boolean(parentPersonId)) &&
    (!showCivilStatus || Boolean(civilStatus)) &&
    (!married || (Boolean(maritalRegime) && spouseName.trim().length > 0));

  const submit = async () => {
    if (!canSubmit) return;
    const attachments: PersonAttachment[] = slots
      .filter(slot => Boolean(files[slot.key]))
      .map(slot => ({
        slot: slot.key,
        category: slot.category,
        file: files[slot.key] as File,
      }));
    await onSubmit(
      {
        fullName: name,
        email,
        taxId,
        birthDate,
        exSpouseNote: note,
        vinculo,
        parentPersonId: needsParent ? parentPersonId : undefined,
        spouseName: married ? spouseName : undefined,
        civilStatus: showCivilStatus ? civilStatus : undefined,
        maritalRegime: married ? maritalRegime : undefined,
      },
      attachments
    );
    setName("");
    setEmail("");
    setTaxId("");
    setBirthDate("");
    setNote("");
    setParentPersonId("");
    setSpouseName("");
    setFiles({});
  };

  const selectClass =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

  return (
    <div className="mt-4 space-y-3">
      <div className="grid gap-2 md:grid-cols-2">
        <select
          value={vinculo}
          onChange={e => {
            setVinculo(e.target.value as Vinculo);
            setParentPersonId("");
          }}
          className={selectClass}
          aria-label="Vínculo com a família"
        >
          {Object.entries(vinculoLabels).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        {needsParent ? (
          <select
            value={parentPersonId}
            onChange={e => setParentPersonId(e.target.value)}
            className={selectClass}
            aria-label={
              vinculo === "NETO" ? "Pai/mãe (filho(a))" : "Pai/mãe (neto(a))"
            }
          >
            <option value="">
              {parentOptions.length
                ? vinculo === "NETO"
                  ? "Selecionar filho(a)…"
                  : "Selecionar neto(a)…"
                : vinculo === "NETO"
                  ? "Nenhum filho(a) cadastrado"
                  : "Nenhum neto(a) cadastrado"}
            </option>
            {parentOptions.map(person => (
              <option key={person.id} value={person.id}>
                {person.fullName}
              </option>
            ))}
          </select>
        ) : null}
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nome completo"
        />
        <Input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="E-mail (opcional)"
        />
        <Input
          value={taxId}
          onChange={e => setTaxId(e.target.value)}
          placeholder="CPF (opcional)"
        />
        <Input
          type="date"
          value={birthDate}
          onChange={e => setBirthDate(e.target.value)}
        />
      </div>
      {showCivilStatus ? (
        <div className="grid gap-2 md:grid-cols-2">
          <select
            value={civilStatus}
            onChange={e => setCivilStatus(e.target.value as CivilStatus)}
            className={selectClass}
            aria-label="Estado civil"
          >
            {Object.entries(civilStatusLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          {married ? (
            <select
              value={maritalRegime}
              onChange={e => setMaritalRegime(e.target.value as MaritalRegime)}
              className={selectClass}
              aria-label="Regime de bens"
            >
              {Object.entries(maritalRegimeLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      ) : null}
      {married ? (
        <Input
          value={spouseName}
          onChange={e => setSpouseName(e.target.value)}
          placeholder="Nome do cônjuge"
        />
      ) : null}
      <Textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Observação sobre ex-cônjuge (quando aplicável)"
      />
      <div className="rounded-xl border border-lucathi-line/70 bg-lucathi-mist/50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
          Anexos (opcional)
        </p>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {slots.map(slot => {
            const selected = files[slot.key];
            return (
              <label
                key={slot.key}
                className="flex flex-col gap-1 rounded-lg border border-lucathi-line/60 bg-white px-2.5 py-2 text-xs"
              >
                <span className="font-medium text-lucathi-navy">
                  {slot.label}
                </span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.xlsx"
                  onChange={e => {
                    const file = e.target.files?.[0] ?? null;
                    setFiles(prev => ({ ...prev, [slot.key]: file }));
                  }}
                  className="text-[11px] text-lucathi-gray file:mr-2 file:rounded-md file:border-0 file:bg-lucathi-mist file:px-2 file:py-1 file:text-[11px] file:font-medium file:text-lucathi-navy"
                />
                {selected ? (
                  <span className="truncate text-[11px] text-emerald-700">
                    {selected.name}
                  </span>
                ) : (
                  <span className="text-[11px] text-lucathi-gray">
                    Nenhum arquivo selecionado
                  </span>
                )}
              </label>
            );
          })}
        </div>
        <p className="mt-1.5 text-[11px] text-lucathi-gray">
          PDF, JPG, PNG, WEBP ou XLSX até 5 MB por arquivo.
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          className="w-full md:w-auto"
          disabled={disabled || !canSubmit}
          onClick={submit}
        >
          <UserPlus className="mr-2 size-4" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}
