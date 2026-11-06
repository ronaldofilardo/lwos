import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatBRL } from "@/features/properties/propertyCardView";
import type { WealthBreakdown } from "@shared/domain/family-wealth-calculator";

const chartConfig = {
  properties: { label: "Imóveis", color: "#003663" },
  companies: { label: "Sociedades", color: "#5b7f9b" },
  otherAssets: { label: "Demais ativos", color: "#b3c2cc" },
} satisfies ChartConfig;

const CATEGORIES = [
  { key: "properties", label: "Imóveis", color: "#003663" },
  { key: "companies", label: "Sociedades", color: "#5b7f9b" },
  { key: "otherAssets", label: "Demais ativos", color: "#b3c2cc" },
] as const;

/** Proporção (R$ e %) das 3 categorias do patrimônio dos patriarcas. */
export function FamilyWealthPieChart({
  wealth,
}: {
  wealth: WealthBreakdown;
}) {
  const data = CATEGORIES.map(category => ({
    key: category.key,
    label: category.label,
    value: wealth[category.key],
    fill: category.color,
  }));
  const percent = (value: number) =>
    wealth.total > 0 ? (value / wealth.total) * 100 : 0;

  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lucathi-gray">
        Composição do patrimônio
      </p>
      <ChartContainer config={chartConfig} className="mx-auto mt-2 h-[240px] w-full">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                formatter={value => formatBRL(Number(value)) ?? "—"}
              />
            }
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="key"
            innerRadius={55}
            outerRadius={105}
            paddingAngle={2}
            strokeWidth={1}
          >
            {data.map(item => (
              <Cell key={item.key} fill={item.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul className="mt-2 space-y-1.5">
        {data.map(item => (
          <li key={item.key} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-lucathi-gray">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              {item.label}
            </span>
            <span className="text-lucathi-navy">
              {formatBRL(item.value) ?? "R$ 0,00"}
              <span className="ml-2 text-xs text-lucathi-gray">
                {percent(item.value).toLocaleString("pt-BR", {
                  maximumFractionDigits: 1,
                })}
                %
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
