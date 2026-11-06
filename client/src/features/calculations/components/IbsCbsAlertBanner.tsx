import { TriangleAlert } from "lucide-react";
import { formatBRL } from "@/features/properties/propertyCardView";
import type { RentalPortfolio } from "@shared/domain/property-tax-engine";

/**
 * Banner de alerta fiscal condicional para o gatilho IBS/CBS.
 * Só renderiza quando o gatilho está ativo — ocupa zero espaço caso contrário.
 */
export function IbsCbsAlertBanner({
  portfolio,
  triggered,
}: {
  portfolio: RentalPortfolio;
  triggered: boolean;
}) {
  if (!triggered) return null;

  const annualBRL   = formatBRL(portfolio.annualRevenue) ?? "—";
  const exposurePct = "8,4%";

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-500" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-amber-800">
          Gatilho IBS/CBS atingido — locação PF tributável pela Reforma
        </p>
        <p className="text-sm text-amber-700">
          {portfolio.rentedCount} imóvel(is) locado(s) ·{" "}
          <strong>{annualBRL}/ano</strong> de receita ·
          alíquota {exposurePct} sobre o faturamento de locação.
        </p>
        <p className="text-xs text-amber-600">
          {portfolio.rentedCount > 3
            ? `Mais de 3 imóveis locados e receita acima de R$ 240.000/ano.`
            : `Receita anual acima de R$ 288.000 — gatilho independe da quantidade de imóveis.`}{" "}
          Avalie a integralização em holding imobiliária — compare o payback na
          tabela abaixo.
        </p>
      </div>
    </div>
  );
}
