import { Input } from "@/components/ui/input";
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
          <select
            value={state.effectiveCivilStatus}
            disabled={state.menor}
            onChange={e =>
              state.setCivilStatus(e.target.value as CivilStatus)
            }
            className={selectClass}
            aria-label="Estado civil"
          >
            {Object.entries(civilStatusLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          {state.married ? (
            <select
              value={state.maritalRegime}
              onChange={e =>
                state.setMaritalRegime(e.target.value as MaritalRegime)
              }
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
      {state.married ? (
        <Input
          value={state.spouseName}
          onChange={e => state.setSpouseName(e.target.value)}
          placeholder="Nome do cônjuge"
        />
      ) : null}
      {state.menor ? (
        <p className="text-xs text-lucathi-gray">
          Menor de 18 anos: estado civil «Solteiro» (automático).
        </p>
      ) : null}
      {!state.isTitular ? (
        <label className="flex items-center gap-2 text-sm text-lucathi-navy">
          <input
            type="checkbox"
            className="size-4 accent-lucathi-deep"
            checked={state.isDependent}
            onChange={e => state.setIsDependent(e.target.checked)}
          />
          Dependente — herda o IRPF do titular
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
