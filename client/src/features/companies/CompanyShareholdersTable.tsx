import { mascaraCpf } from "@shared/validation";
import {
  computeStakeholderValues,
  type CompanyTotals,
} from "@shared/domain/company-valuation";
import { StakeholderValues } from "./StakeholderValues";

type StakeholderSummary = {
  id: string;
  displayName: string | null;
  externalCpf?: string | null;
  percentage: string | number;
};

export function CompanyShareholdersTable({
  stakeholders,
  totals,
  international = false,
}: {
  stakeholders: StakeholderSummary[];
  totals: CompanyTotals;
  international?: boolean;
}) {
  return (
    <div className="rounded-xl border border-lucathi-line bg-lucathi-mist/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
        Sócios (quadro societário)
      </p>
      {stakeholders.length ? (
        <ul className="mt-2 space-y-2">
          {stakeholders.map(stakeholder => {
            const cpfSuffix = stakeholder.externalCpf
              ? ` · CPF ${mascaraCpf(stakeholder.externalCpf)}`
              : "";
            return (
              <li key={stakeholder.id} className="text-sm text-lucathi-navy">
                <div className="flex items-center justify-between">
                  <span>
                    {stakeholder.displayName ?? "Sem vínculo"}
                    {cpfSuffix}
                  </span>
                <span className="text-xs text-lucathi-gray">
                  {Number(stakeholder.percentage).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  %
                </span>
              </div>
              <StakeholderValues
                values={computeStakeholderValues(stakeholder.percentage, totals)}
                international={international}
                className="text-xs text-lucathi-gray"
              />
            </li>
          );
        })}
        </ul>
      ) : (
        <p className="mt-1 text-xs text-lucathi-gray">
          Nenhum sócio vinculado — cadastre no painel “Sociedades”.
        </p>
      )}
    </div>
  );
}
