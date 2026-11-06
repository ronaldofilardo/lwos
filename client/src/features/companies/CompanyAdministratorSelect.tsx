import { useId, useState } from "react";
import { Input } from "@/components/ui/input";

export const THIRD_PARTY_VALUE = "__TERCEIRO__";

type PersonOption = {
  id: string;
  fullName: string;
};

type Props = {
  label: string;
  personIdValue: string;
  thirdPartyNameValue: string;
  people: PersonOption[];
  onSelectPerson: (personId: string) => void;
  onChangeThirdPartyName: (name: string) => void;
  onClear: () => void;
};

function storedMode(personIdValue: string, thirdPartyNameValue: string) {
  if (personIdValue) return personIdValue;
  if (thirdPartyNameValue) return THIRD_PARTY_VALUE;
  return "";
}

/**
 * Modo exibido no select: a escolha do usuário prevalece sobre o que está
 * gravado. Era aqui que morava o bug: o modo era deduzido só do nome do
 * terceiro, então escolher "Terceiro" com o campo vazio voltava para "Não
 * informado" e o input nunca abria.
 */
export function resolveAdministratorMode(
  chosenMode: string,
  personIdValue: string,
  thirdPartyNameValue: string
) {
  return chosenMode || storedMode(personIdValue, thirdPartyNameValue);
}

export function CompanyAdministratorSelect({
  label,
  personIdValue,
  thirdPartyNameValue,
  people,
  onSelectPerson,
  onChangeThirdPartyName,
  onClear,
}: Props) {
  const selectId = useId();
  const inputId = useId();
  const [chosenMode, setChosenMode] = useState(
    storedMode(personIdValue, thirdPartyNameValue)
  );
  const mode = resolveAdministratorMode(
    chosenMode,
    personIdValue,
    thirdPartyNameValue
  );

  const handleSelectChange = (value: string) => {
    setChosenMode(value);
    if (!value) {
      onClear();
    } else if (value === THIRD_PARTY_VALUE) {
      onSelectPerson("");
      // onSelectPerson limpa o nome do terceiro no formulário; restaura o valor.
      onChangeThirdPartyName(thirdPartyNameValue);
    } else {
      onChangeThirdPartyName("");
      onSelectPerson(value);
    }
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={selectId} className="text-xs font-medium text-lucathi-navy">
        {label}
      </label>
      <select
        id={selectId}
        value={mode}
        onChange={e => handleSelectChange(e.target.value)}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-lucathi-navy focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="">Não informado</option>
        <optgroup label="Membros da família">
          {people.map(person => (
            <option key={person.id} value={person.id}>
              {person.fullName}
            </option>
          ))}
        </optgroup>
        <option value={THIRD_PARTY_VALUE}>Terceiro</option>
      </select>
      {mode === THIRD_PARTY_VALUE ? (
        <Input
          id={inputId}
          value={thirdPartyNameValue}
          onChange={e => onChangeThirdPartyName(e.target.value)}
          placeholder="Nome completo do terceiro"
          className="text-sm"
        />
      ) : null}
    </div>
  );
}
