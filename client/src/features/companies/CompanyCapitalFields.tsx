import type { HoldingFormState } from "./holdingDetails";
import { Field } from "./common/CompanyFormField";

type UpdateField = (key: keyof HoldingFormState, value: string) => void;

export function CompanyCapitalFields({
  currency,
  form,
  update,
}: {
  currency: string;
  form: HoldingFormState;
  update: UpdateField;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field
        label={`Capital Social (${currency})`}
        value={form.capitalSocial}
        onChange={value => update("capitalSocial", value)}
        placeholder="0,00"
      />
      <Field
        label="Quantidade de quotas/ações"
        value={form.shareQuantity}
        onChange={value => update("shareQuantity", value)}
        placeholder="0"
      />
      <Field
        label="Administrador"
        value={form.administrator1}
        onChange={value => update("administrator1", value)}
      />
      <Field
        label="Administrador"
        value={form.administrator2}
        onChange={value => update("administrator2", value)}
      />
    </div>
  );
}
