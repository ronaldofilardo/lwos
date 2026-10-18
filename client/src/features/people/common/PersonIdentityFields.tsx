import { Input } from "@/components/ui/input";
import {
  formatarIdadeDecimal,
  idadeDecimal,
  mascaraCpf,
  UFS,
} from "@shared/validation";
import { vinculoLabels } from "@/features/families/types";
import { mascaraTelefone } from "./mascaraTelefone";
import type { PersonFormState } from "./usePersonFormState";

export function PersonIdentityFields({
  state,
  isEdit,
}: {
  state: PersonFormState;
  isEdit: boolean;
}) {
  const selectClass =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {!isEdit ? (
        <select
          value={state.vinculo}
          onChange={e => {
            state.setVinculo(e.target.value as typeof state.vinculo);
            state.setParentPersonId("");
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
          {vinculoLabels[state.vinculo]}
        </div>
      )}
      {state.needsParent ? (
        <select
          value={state.parentPersonId}
          onChange={e => state.setParentPersonId(e.target.value)}
          className={selectClass}
          aria-label={
            state.vinculo === "NETO" ? "Pai/mãe (filho(a))" : "Pai/mãe (neto(a))"
          }
        >
          <option value="">
            {state.parentOptions.length
              ? state.vinculo === "NETO"
                ? "Selecionar filho(a)…"
                : "Selecionar neto(a)…"
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
      ) : null}
      <Input
        value={state.name}
        onChange={e => state.setName(e.target.value)}
        placeholder="Nome completo"
      />
      <Input
        value={state.email}
        onChange={e => state.setEmail(e.target.value)}
        placeholder={state.isTitular ? "E-mail (obrigatório)" : "E-mail (opcional)"}
      />
      <div>
        <Input
          value={state.taxId}
          onChange={e => state.setTaxId(mascaraCpf(e.target.value))}
          placeholder="CPF (obrigatório)"
          inputMode="numeric"
        />
        {state.taxId.replace(/\D/g, "").length > 0 && !state.cpfOk ? (
          <p className="mt-1 text-xs text-red-600">CPF inválido.</p>
        ) : null}
      </div>
      <div>
        <Input
          type="date"
          value={state.birthDate}
          onChange={e => state.setBirthDate(e.target.value)}
        />
        {state.birthDate && state.birthOk ? (
          <p className="mt-1 text-xs text-lucathi-gray">
            {formatarIdadeDecimal(idadeDecimal(state.birthDate))}
          </p>
        ) : null}
        {state.birthDate && !state.birthOk ? (
          <p className="mt-1 text-xs text-red-600">
            Data de nascimento inválida.
          </p>
        ) : null}
      </div>
      <Input
        value={state.phone}
        onChange={e => state.setPhone(mascaraTelefone(e.target.value))}
        placeholder={state.isTitular ? "Telefone (obrigatório)" : "Telefone (opcional)"}
        inputMode="tel"
      />
    </div>
  );
}
