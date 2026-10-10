import { useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  isCpfValido,
  isNascimentoValido,
  isTelefoneValido,
  idadeDecimal,
  idadeEmAnosCompletos,
  formatarIdadeDecimal,
  mascaraCpf,
  normalizarCpf,
  UFS,
  type Uf,
} from "@shared/validation";
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
  taxId: string;
  birthDate: string;
  phone?: string;
  exSpouseNote?: string;
  vinculo: Vinculo;
  parentPersonId?: string;
  spouseName?: string;
  civilStatus?: CivilStatus;
  maritalRegime?: MaritalRegime;
  isDependent?: boolean;
  addressSameAsPrimary?: boolean;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  uf?: Uf;
};

type PersonSummary = {
  id: string;
  fullName: string;
  vinculo: Vinculo | null;
  birthDate?: string | null;
  isPrimaryContact?: boolean;
};

type Props = {
  disabled: boolean;
  people?: PersonSummary[];
  initial?: Partial<PersonFormSubmit>;
  isEdit?: boolean;
  onSubmit: (data: PersonFormSubmit) => Promise<unknown>;
};

function mascaraTelefone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function PersonForm({
  disabled,
  people = [],
  initial,
  isEdit = false,
  onSubmit,
}: Props) {
  const [vinculo, setVinculo] = useState<Vinculo>(initial?.vinculo ?? "TITULAR");
  const [parentPersonId, setParentPersonId] = useState(
    initial?.parentPersonId ?? ""
  );
  const [name, setName] = useState(initial?.fullName ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [taxId, setTaxId] = useState(mascaraCpf(initial?.taxId ?? ""));
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [note, setNote] = useState(initial?.exSpouseNote ?? "");
  const [civilStatus, setCivilStatus] = useState<CivilStatus>(
    initial?.civilStatus ?? "SOLTEIRO"
  );
  const [maritalRegime, setMaritalRegime] = useState<MaritalRegime>(
    initial?.maritalRegime ?? "CPB"
  );
  const [spouseName, setSpouseName] = useState(initial?.spouseName ?? "");
  const [isDependent, setIsDependent] = useState(
    initial?.isDependent ?? false
  );
  const [addressSameAsPrimary, setAddressSameAsPrimary] = useState(
    initial?.addressSameAsPrimary ?? false
  );
  const [cep, setCep] = useState(initial?.cep ?? "");
  const [street, setStreet] = useState(initial?.street ?? "");
  const [number, setNumber] = useState(initial?.number ?? "");
  const [complement, setComplement] = useState(initial?.complement ?? "");
  const [district, setDistrict] = useState(initial?.district ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [uf, setUf] = useState<Uf | "">(initial?.uf ?? "");

  const needsParent = vinculo === "NETO" || vinculo === "BISNETO";
  const showCivilStatus = vinculo !== "CONJUGE";
  const isTitular = vinculo === "TITULAR";
  const menor = Boolean(birthDate) && isNascimentoValido(birthDate) && idadeEmAnosCompletos(birthDate) < 18;
  const effectiveCivilStatus: CivilStatus = menor ? "SOLTEIRO" : civilStatus;
  const married = showCivilStatus && !menor && isMarriedStatus(effectiveCivilStatus);
  const requiresOwnAddress = !addressSameAsPrimary;

  const parentOptions = useMemo(() => {
    if (!needsParent) return [];
    const expected = parentVinculoOptions[vinculo];
    return people.filter(person => person.vinculo === expected);
  }, [needsParent, people, vinculo]);

  const parentBirth = parentOptions.find(p => p.id === parentPersonId)?.birthDate;
  const parentTooClose =
    Boolean(parentBirth) &&
    isNascimentoValido(parentBirth as string) &&
    isNascimentoValido(birthDate) &&
    Math.abs(idadeDecimal(birthDate) - idadeDecimal(parentBirth as string)) < 12;

  const cpfDigits = normalizarCpf(taxId);
  const cpfOk = isCpfValido(cpfDigits);
  const birthOk = !birthDate || isNascimentoValido(birthDate);
  const emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneOk = !phoneDigits || isTelefoneValido(phoneDigits);
  const titularOk =
    !isTitular ||
    (email.trim().length > 0 && emailOk && isTelefoneValido(phoneDigits));
  const addressOk =
    isTitular || addressSameAsPrimary || (city.trim().length > 0 && uf.length > 0);

  const canSubmit =
    name.trim().length >= 3 &&
    cpfOk &&
    birthOk &&
    phoneOk &&
    titularOk &&
    addressOk &&
    (!needsParent || Boolean(parentPersonId)) &&
    (menor ||
      !showCivilStatus ||
      Boolean(effectiveCivilStatus)) &&
    (menor ||
      !married ||
      (Boolean(maritalRegime) && spouseName.trim().length > 0));

  const submit = async () => {
    if (!canSubmit) return;
    await onSubmit({
      fullName: name,
      email,
      taxId: cpfDigits,
      birthDate,
      phone: phoneDigits,
      exSpouseNote: note,
      vinculo,
      parentPersonId: needsParent ? parentPersonId : undefined,
      spouseName: married ? spouseName : undefined,
      civilStatus: showCivilStatus ? effectiveCivilStatus : undefined,
      maritalRegime: married ? maritalRegime : undefined,
      isDependent: isTitular ? undefined : isDependent,
      addressSameAsPrimary: isTitular ? false : addressSameAsPrimary,
      cep,
      street,
      number,
      complement,
      district,
      city,
      uf: uf || undefined,
    });
    if (!isEdit) {
      setName("");
      setEmail("");
      setTaxId("");
      setBirthDate("");
      setPhone("");
      setNote("");
      setParentPersonId("");
      setSpouseName("");
      setIsDependent(false);
      setAddressSameAsPrimary(false);
      setCep("");
      setStreet("");
      setNumber("");
      setComplement("");
      setDistrict("");
      setCity("");
      setUf("");
    }
  };

  const selectClass =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

  return (
    <div className="space-y-3">
      <div className="grid gap-2 md:grid-cols-2">
        {!isEdit ? (
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
        ) : (
          <div className="flex h-10 items-center rounded-md bg-lucathi-mist px-3 text-sm text-lucathi-gray">
            {vinculoLabels[initial?.vinculo ?? vinculo]}
          </div>
        )}
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
          placeholder={isTitular ? "E-mail (obrigatório)" : "E-mail (opcional)"}
        />
        <div>
          <Input
            value={taxId}
            onChange={e => setTaxId(mascaraCpf(e.target.value))}
            placeholder="CPF (obrigatório)"
            inputMode="numeric"
          />
          {taxId.replace(/\D/g, "").length > 0 && !cpfOk ? (
            <p className="mt-1 text-xs text-red-600">CPF inválido.</p>
          ) : null}
        </div>
        <div>
          <Input
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
          />
          {birthDate && birthOk ? (
            <p className="mt-1 text-xs text-lucathi-gray">
              {formatarIdadeDecimal(idadeDecimal(birthDate))}
            </p>
          ) : null}
          {birthDate && !birthOk ? (
            <p className="mt-1 text-xs text-red-600">
              Data de nascimento inválida.
            </p>
          ) : null}
        </div>
        <Input
          value={phone}
          onChange={e => setPhone(mascaraTelefone(e.target.value))}
          placeholder={isTitular ? "Telefone (obrigatório)" : "Telefone (opcional)"}
          inputMode="tel"
        />
      </div>
      {showCivilStatus ? (
        <div className="grid gap-2 md:grid-cols-2">
          <select
            value={effectiveCivilStatus}
            disabled={menor}
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
      {menor ? (
        <p className="text-xs text-lucathi-gray">
          Menor de 18 anos: estado civil «Solteiro» (automático).
        </p>
      ) : null}
      {!isTitular ? (
        <label className="flex items-center gap-2 text-sm text-lucathi-navy">
          <input
            type="checkbox"
            className="size-4 accent-lucathi-deep"
            checked={isDependent}
            onChange={e => setIsDependent(e.target.checked)}
          />
          Dependente — herda o IRPF do titular
        </label>
      ) : null}
      {parentTooClose ? (
        <p className="text-xs text-amber-700">
          A idade do pai/mãe é muito próxima da do filho(a) — confira as datas de nascimento.
        </p>
      ) : null}
      <fieldset className="space-y-2 rounded-xl border border-lucathi-line/70 p-3">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
          Endereço
        </legend>
        {!isTitular ? (
          <label className="flex items-center gap-2 text-sm text-lucathi-navy">
            <input
              type="checkbox"
              className="size-4 accent-lucathi-deep"
              checked={addressSameAsPrimary}
              onChange={e => setAddressSameAsPrimary(e.target.checked)}
            />
            Mesmo endereço do titular
          </label>
        ) : null}
        {!addressSameAsPrimary || isTitular ? (
          <div className="grid gap-2 md:grid-cols-3">
            <Input
              value={cep}
              onChange={e => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="CEP"
              inputMode="numeric"
            />
            <Input
              value={street}
              onChange={e => setStreet(e.target.value)}
              placeholder="Logradouro"
              className="md:col-span-2"
            />
            <Input
              value={number}
              onChange={e => setNumber(e.target.value)}
              placeholder="Número"
            />
            <Input
              value={complement}
              onChange={e => setComplement(e.target.value)}
              placeholder="Complemento"
            />
            <Input
              value={district}
              onChange={e => setDistrict(e.target.value)}
              placeholder="Bairro"
            />
            <Input
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Cidade"
            />
            <select
              value={uf}
              onChange={e => setUf(e.target.value as Uf | "")}
              className={selectClass}
              aria-label="UF do endereço"
            >
              <option value="">UF</option>
              {UFS.map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </fieldset>
      <Textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Observação"
      />

      <div className="flex justify-end">
        <Button
          className="w-full md:w-auto"
          disabled={disabled || !canSubmit}
          onClick={submit}
        >
          <UserPlus className="mr-2 size-4" />
          {isEdit ? "Salvar" : "Adicionar"}
        </Button>
      </div>
    </div>
  );
}
