import { useMemo, useState } from "react";
import {
  isCpfValido,
  isNascimentoValido,
  isTelefoneValido,
  idadeDecimal,
  idadeEmAnosCompletos,
  mascaraCpf,
  normalizarCpf,
  type Uf,
} from "@shared/validation";
import {
  isMarriedStatus,
  parentVinculoOptions,
  type CivilStatus,
  type MaritalRegime,
  type Vinculo,
} from "@/features/families/types";
import type { PersonFormSubmit, PersonSummary } from "./personFormTypes";

export function usePersonFormState({
  initial,
  people,
}: {
  initial?: Partial<PersonFormSubmit>;
  people: PersonSummary[];
}) {
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
  const menor =
    Boolean(birthDate) &&
    isNascimentoValido(birthDate) &&
    idadeEmAnosCompletos(birthDate) < 18;
  const effectiveCivilStatus: CivilStatus = menor ? "SOLTEIRO" : civilStatus;
  const married = showCivilStatus && !menor && isMarriedStatus(effectiveCivilStatus);

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
    (menor || !showCivilStatus || Boolean(effectiveCivilStatus)) &&
    (menor || !married || (Boolean(maritalRegime) && spouseName.trim().length > 0));

  const submitData: PersonFormSubmit = {
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
  };

  const reset = () => {
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
  };

  return {
    vinculo,
    setVinculo,
    parentPersonId,
    setParentPersonId,
    name,
    setName,
    email,
    setEmail,
    taxId,
    setTaxId,
    birthDate,
    setBirthDate,
    phone,
    setPhone,
    note,
    setNote,
    civilStatus,
    setCivilStatus,
    maritalRegime,
    setMaritalRegime,
    spouseName,
    setSpouseName,
    isDependent,
    setIsDependent,
    addressSameAsPrimary,
    setAddressSameAsPrimary,
    cep,
    setCep,
    street,
    setStreet,
    number,
    setNumber,
    complement,
    setComplement,
    district,
    setDistrict,
    city,
    setCity,
    uf,
    setUf,
    needsParent,
    showCivilStatus,
    isTitular,
    menor,
    effectiveCivilStatus,
    married,
    parentOptions,
    parentTooClose,
    cpfOk,
    birthOk,
    phoneOk,
    canSubmit,
    submitData,
    reset,
  };
}

export type PersonFormState = ReturnType<typeof usePersonFormState>;
