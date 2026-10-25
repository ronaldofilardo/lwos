import { useId } from "react";
import { Input } from "@/components/ui/input";

const THIRD_PARTY_VALUE = "__TERCEIRO__";

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

  const isThirdParty = !personIdValue && Boolean(thirdPartyNameValue);
  const selectedMode = personIdValue
    ? personIdValue
    : isThirdParty
      ? THIRD_PARTY_VALUE
      : "";

  const handleSelectChange = (value: string) => {
    if (!value) {
      onClear();
    } else if (value === THIRD_PARTY_VALUE) {
      onSelectPerson("");
      onChangeThirdPartyName(thirdPartyNameValue || "");
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
        value={selectedMode}
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
        <option value={THIRD_PARTY_VALUE}>Terceiro (não-membro)</option>
      </select>
      {selectedMode === THIRD_PARTY_VALUE ? (
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
