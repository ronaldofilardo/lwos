import { Input } from "@/components/ui/input";
import { LabeledField } from "@/components/LabeledField";
import {
  civilStatusLabels,
  maritalRegimeLabels,
  type CivilStatus,
  type MaritalRegime,
} from "@/features/families/types";
import type { PersonFormState } from "./usePersonFormState";

export function PersonSpouseFields({ state }: { state: PersonFormState }) {
  const selectClass =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
  return (
    <>
      {state.showCivilStatus ? (
        <div className="grid gap-2 md:grid-cols-2">
          <LabeledField label="Estado civil">
            {id => (
              <select
                id={id}
                value={state.effectiveCivilStatus}
                disabled={state.menor}
                onChange={e =>
                  state.setCivilStatus(e.target.value as CivilStatus)
                }
                className={selectClass}
              >
                {Object.entries(civilStatusLabels).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            )}
          </LabeledField>
          {state.married ? (
            <LabeledField label="Regime de bens">
              {id => (
                <select
                  id={id}
                  value={state.maritalRegime}
                  onChange={e =>
                    state.setMaritalRegime(e.target.value as MaritalRegime)
                  }
                  className={selectClass}
                >
                  {Object.entries(maritalRegimeLabels).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              )}
            </LabeledField>
          ) : null}
        </div>
      ) : null}
      {state.married ? (
        <LabeledField label="Nome do cônjuge">
          {id => (
            <Input
              id={id}
              value={state.spouseName}
              onChange={e => state.setSpouseName(e.target.value)}
              placeholder="Ex.: João da Silva"
            />
          )}
        </LabeledField>
      ) : null}
      {state.menor ? (
        <p className="text-xs text-lucathi-gray">
          Menor de 18 anos: estado civil «Solteiro» (automático).
        </p>
      ) : null}
      {!state.isTitular ? (
        <label className="flex items-center gap-2 text-sm text-lucathi-navy cursor-pointer">
          <input
            type="checkbox"
            className="size-4 accent-lucathi-deep rounded"
            checked={state.isDependent}
            onChange={e => state.setIsDependent(e.target.checked)}
          />
          Dependente no IRPF do Titular
        </label>
      ) : null}
      {state.parentTooClose ? (
        <p className="text-xs text-amber-700">
          A idade do pai/mãe é muito próxima da do filho(a) — confira as datas de
          nascimento.
        </p>
      ) : null}
    </>
  );
}
