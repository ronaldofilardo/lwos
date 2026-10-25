import { administratorLabel, type HoldingFormState } from "./holdingDetails";
import { Field } from "./common/CompanyFormField";
import { CompanyAdministratorSelect } from "./CompanyAdministratorSelect";

type PersonOption = {
  id: string;
  fullName: string;
};

type UpdateField = (key: keyof HoldingFormState, value: string) => void;

export function CompanyCapitalFields({
  currency,
  international = false,
  form,
  update,
  people = [],
}: {
  currency: string;
  international?: boolean;
  form: HoldingFormState;
  update: UpdateField;
  people?: PersonOption[];
}) {
  const adminLabel1 = administratorLabel(international, 1);
  const adminLabel2 = administratorLabel(international, 2);

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
      <CompanyAdministratorSelect
        label={adminLabel1}
        personIdValue={form.administrator1PersonId}
        thirdPartyNameValue={form.administrator1}
        people={people}
        onSelectPerson={personId => {
          update("administrator1PersonId", personId);
          update("administrator1", "");
        }}
        onChangeThirdPartyName={name => {
          update("administrator1PersonId", "");
          update("administrator1", name);
        }}
        onClear={() => {
          update("administrator1PersonId", "");
          update("administrator1", "");
        }}
      />
      <CompanyAdministratorSelect
        label={adminLabel2}
        personIdValue={form.administrator2PersonId}
        thirdPartyNameValue={form.administrator2}
        people={people}
        onSelectPerson={personId => {
          update("administrator2PersonId", personId);
          update("administrator2", "");
        }}
        onChangeThirdPartyName={name => {
          update("administrator2PersonId", "");
          update("administrator2", name);
        }}
        onClear={() => {
          update("administrator2PersonId", "");
          update("administrator2", "");
        }}
      />
    </div>
  );
}

