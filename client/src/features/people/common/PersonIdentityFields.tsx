import { Input } from "@/components/ui/input";
import { LabeledField } from "@/components/LabeledField";
import {
  formatarIdadeDecimal,
  idadeDecimal,
  mascaraCpf,
  UFS,
} from "@shared/validation";
import { vinculoLabels } from "@/features/families/types";
import { mascaraTelefone } from "./mascaraTelefone";
import type { PersonFormState } from "./usePersonFormState";
import type { PersonSummary } from "./personFormTypes";

export function PersonIdentityFields({
  state,
  isEdit,
  people = [],
}: {
  state: PersonFormState;
  isEdit: boolean;
  people?: PersonSummary[];
}) {
  const selectClass =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
  const parentLabel =
    state.vinculo === "NETO" ? "Pai/mãe (filho(a))" : "Pai/mãe (neto(a))";
  const requirement = state.isTitular ? "obrigatório" : "opcional";
  return (
    <div className="grid gap-2 md:grid-cols-2">
      <LabeledField label="Vínculo com a família">
        {id =>
          !isEdit ? (
            <select
              id={id}
              value={state.vinculo}
              onChange={e => {
                state.setVinculo(e.target.value as typeof state.vinculo);
                state.setParentPersonId("");
              }}
              className={selectClass}
            >
              {Object.entries(vinculoLabels)
                .filter(([v]) => {
                  const hasTitular = people.some(
                    p => p.isPrimaryContact || p.vinculo === "TITULAR"
                  );
                  const hasConjuge = people.some(p => p.vinculo === "CONJUGE");
                  if (v === "CONJUGE" && (!hasTitular || hasConjuge)) return false;
                  if (v === "TITULAR" && hasTitular) return false;
                  return true;
                })
                .map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          ) : (
            <div
              id={id}
              className="flex h-10 items-center rounded-md bg-lucathi-mist px-3 text-sm text-lucathi-gray"
            >
              {vinculoLabels[state.vinculo]}
            </div>
          )
        }
      </LabeledField>
      {state.needsParent ? (
        <LabeledField label={parentLabel}>
          {id => (
            <select
              id={id}
              value={state.parentPersonId}
              onChange={e => state.setParentPersonId(e.target.value)}
              className={selectClass}
            >
              <option value="">
                {state.parentOptions.length
                  ? "Selecione"
                  : state.vinculo === "NETO"
                    ? "Nenhum filho(a) cadastrado"
                    : "Nenhum neto(a) cadastrado"}
              </option>
              {state.parentOptions.map(person => (
                <option key={person.id} value={person.id}>
                  {person.fullName}
                </option>
              ))}
            </select>
          )}
        </LabeledField>
      ) : null}
      <LabeledField label="Nome completo">
        {id => (
          <Input
            id={id}
            value={state.name}
            onChange={e => state.setName(e.target.value)}
            placeholder="Ex.: Maria da Silva"
          />
        )}
      </LabeledField>
      <LabeledField label={`E-mail (${requirement})`}>
        {id => (
          <Input
            id={id}
            value={state.email}
            onChange={e => state.setEmail(e.target.value)}
            placeholder="Ex.: maria@email.com"
          />
        )}
      </LabeledField>
      <LabeledField label="CPF (obrigatório)">
        {id => (
          <>
            <Input
              id={id}
              value={state.taxId}
              onChange={e => state.setTaxId(mascaraCpf(e.target.value))}
              placeholder="Ex.: 123.456.789-09"
              inputMode="numeric"
            />
            {state.taxId.replace(/\D/g, "").length > 0 && !state.cpfOk ? (
              <p className="text-xs text-red-600">CPF inválido.</p>
            ) : null}
          </>
        )}
      </LabeledField>
      <LabeledField label="Data de nascimento">
        {id => (
          <>
            <Input
              id={id}
              type="date"
              value={state.birthDate}
              onChange={e => state.setBirthDate(e.target.value)}
              placeholder="dd/mm/aaaa"
            />
            {state.birthDate && state.birthOk ? (
              <p className="text-xs text-lucathi-gray">
                {formatarIdadeDecimal(idadeDecimal(state.birthDate))}
              </p>
            ) : null}
            {state.birthDate && !state.birthOk ? (
              <p className="text-xs text-red-600">
                Data de nascimento inválida.
              </p>
            ) : null}
          </>
        )}
      </LabeledField>
      <LabeledField label={`Telefone (${requirement})`}>
        {id => (
          <Input
            id={id}
            value={state.phone}
            onChange={e => state.setPhone(mascaraTelefone(e.target.value))}
            placeholder="Ex.: (11) 91234-5678"
            inputMode="tel"
          />
        )}
      </LabeledField>
    </div>
  );
}
