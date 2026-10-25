import type { HoldingFormState } from "./holdingDetails";
import { formatarDinheiro } from "@shared/validation/dinheiro";
import { Field, ReadonlyField } from "./common/CompanyFormField";

type UpdateField = (key: keyof HoldingFormState, value: string) => void;

const BALANCE_FIELDS: { key: keyof HoldingFormState; label: string }[] = [
  { key: "equity", label: "PL (Patrimônio Líquido)" },
  { key: "cashAndEquivalents", label: "Caixa/Disponibilidades" },
  { key: "inventory", label: "Estoque" },
  { key: "accountsReceivable", label: "Créditos a receber" },
  { key: "investments", label: "Investimentos" },
  { key: "fixedAssets", label: "Ativos Imobilizados" },
  { key: "retainedEarnings", label: "Lucros Acumulados" },
  { key: "taxLiabilities", label: "Obrigações tributárias" },
  { key: "laborLiabilities", label: "Obrigações trabalhistas" },
  { key: "financing", label: "Financiamentos" },
];

export function CompanyBalanceSection({
  currency,
  estimatedValue,
  form,
  update,
}: {
  currency: string;
  /** Valor estimado derivado do balanço (somente leitura). */
  estimatedValue: number | null;
  form: HoldingFormState;
  update: UpdateField;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {BALANCE_FIELDS.map(field => (
          <Field
            key={field.key}
            label={`${field.label} (${currency})`}
            value={form[field.key]}
            onChange={value => update(field.key, value)}
            placeholder="0,00"
          />
        ))}
        <ReadonlyField
          label={`Valor estimado da empresa (${currency})`}
          value={estimatedValue === null ? "" : formatarDinheiro(estimatedValue)}
        />
        <p className="text-xs text-lucathi-gray sm:col-span-2">
          Calculado automaticamente: caixa + estoque + créditos a receber + investimentos + ativos
          imobilizados + lucros acumulados − obrigações trabalhistas − obrigações tributárias −
          financiamentos. O PL não entra na conta.
        </p>
        <p className="text-xs text-lucathi-gray sm:col-span-2">
          Balanço fechado e balancete (com data-base) são enviados na aba Matriz Documental.
        </p>
      </div>
    </>
  );
}
