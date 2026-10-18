import type { HoldingFormState } from "./holdingDetails";
import { Field } from "./common/CompanyFormField";
import { CompanyBalanceUpload } from "./common/CompanyBalanceUpload";

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
  { key: "estimatedMarketValue", label: "Valor estimado da empresa" },
];

export function CompanyBalanceSection({
  currency,
  form,
  update,
  familyId,
  companyId,
}: {
  currency: string;
  form: HoldingFormState;
  update: UpdateField;
  familyId: string;
  companyId: string | null;
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
      </div>
      {companyId ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
            Balanço fechado e balancete
          </p>
          <CompanyBalanceUpload
            familyId={familyId}
            companyId={companyId}
            category="Balanço Fechado"
            label="Balanço fechado (PDF/imagem)"
          />
          <CompanyBalanceUpload
            familyId={familyId}
            companyId={companyId}
            category="Balancete Atualizado"
            label="Balancete atualizado (PDF/imagem)"
          />
        </div>
      ) : null}
    </>
  );
}
