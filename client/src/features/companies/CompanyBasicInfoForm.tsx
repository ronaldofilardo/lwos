import { mascaraCnpj } from "@shared/validation";
import {
  companyJurisdictionLabels,
  companyJurisdictionValues,
  societaryTypeLabels,
  societaryTypeValues,
  taxRegimeLabels,
  taxRegimeValues,
  ufValues,
  type HoldingFormState,
} from "./holdingDetails";
import { Field, ReadonlyField } from "./common/CompanyFormField";

type UpdateField = (key: keyof HoldingFormState, value: string) => void;

export function CompanyBasicInfoForm({
  international,
  legalName,
  taxNumber,
  form,
  update,
}: {
  international: boolean;
  legalName: string | null;
  taxNumber: string | null;
  form: HoldingFormState;
  update: UpdateField;
}) {
  return (
    <>
      <ReadonlyField label="Denominação" value={legalName ?? ""} />
      {international ? (
        <Field
          label="Company Number"
          value={form.companyNumber}
          onChange={value => update("companyNumber", value)}
          placeholder="Company number"
        />
      ) : (
        <ReadonlyField label="CNPJ" value={taxNumber ? mascaraCnpj(taxNumber) : ""} />
      )}

      {international ? (
        <>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-lucathi-gray">
              Jurisdição
            </span>
            <select
              value={form.jurisdiction}
              onChange={event => update("jurisdiction", event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              aria-label="Jurisdição"
            >
              <option value="">Selecione</option>
              {companyJurisdictionValues.map(value => (
                <option key={value} value={value}>
                  {companyJurisdictionLabels[value]}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Agente residente"
            value={form.residentAgent}
            onChange={value => update("residentAgent", value)}
          />
        </>
      ) : (
        <>
          <Field
            label="NIRE"
            value={form.nire}
            onChange={value => update("nire", value)}
          />
          <label className="block space-y-1">
            <span className="text-xs font-medium text-lucathi-gray">UF</span>
            <select
              value={form.uf}
              onChange={event => update("uf", event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              aria-label="UF"
            >
              <option value="">Selecione</option>
              {ufValues.map(value => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-lucathi-gray">
              Tipo societário
            </span>
            <select
              value={form.societaryType}
              onChange={event => update("societaryType", event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              aria-label="Tipo societário"
            >
              <option value="">Selecione</option>
              {societaryTypeValues.map(value => (
                <option key={value} value={value}>
                  {societaryTypeLabels[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-lucathi-gray">
              Regime tributário
            </span>
            <select
              value={form.taxRegime}
              onChange={event => update("taxRegime", event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              aria-label="Regime tributário"
            >
              <option value="">Selecione</option>
              {taxRegimeValues.map(value => (
                <option key={value} value={value}>
                  {taxRegimeLabels[value]}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      <Field
        label={international ? "Sede" : "Sede (endereço consolidado)"}
        value={form.sede}
        onChange={value => update("sede", value)}
        placeholder="Endereço da sede da sociedade"
      />
      {!international ? (
        <Field
          label="Objeto social"
          value={form.corporatePurpose}
          onChange={value => update("corporatePurpose", value)}
          multiline
        />
      ) : null}
    </>
  );
}
