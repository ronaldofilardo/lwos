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
  { key: "fixedAssets", label: "Ativos Imobilizados *" },
  { key: "retainedEarnings", label: "Lucros Acumulados" },
  { key: "taxLiabilities", label: "Obrigações tributárias" },
  { key: "laborLiabilities", label: "Obrigações trabalhistas" },
  { key: "financing", label: "Financiamentos" },
];

export function CompanyBalanceSection({
  currency,
  marketValue,
  propertyValue,
  form,
  update,
}: {
  currency: string;
  /** Valor mercado = balanço apurado + valor dos imóveis (somente leitura). */
  marketValue: number | null;
  /** Imóveis em nome da sociedade, somados automaticamente (somente leitura). */
  propertyValue: number;
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
          label={`Valor dos imóveis (${currency})`}
          value={formatarDinheiro(propertyValue)}
        />
        <ReadonlyField
          label={`Valor mercado (${currency})`}
          value={marketValue === null ? "" : formatarDinheiro(marketValue)}
        />
      </div>
      <p className="mt-2 text-xs text-lucathi-gray">
        * Ativos Imobilizados: não lançar o valor dos imóveis — eles entram
        automaticamente em “Valor dos imóveis”.
      </p>
    </>
  );
}
