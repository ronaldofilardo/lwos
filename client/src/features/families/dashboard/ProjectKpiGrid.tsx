import { CircleAlert, FileStack, Landmark, UsersRound } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatBRL } from "@/features/properties/propertyCardView";
import { companyTotalsFromRow, toNumberOrNull } from "@shared/domain/company-valuation";
import { useProjectAlerts } from "@/features/alerts/useProjectAlerts";

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  variant = "default",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  variant?: "default" | "alert" | "ok";
}) {
  const variantClass =
    variant === "alert"
      ? "border-status-danger-border bg-status-danger-bg"
      : variant === "ok"
        ? "border-status-success-border bg-status-success-bg"
        : "border-lucathi-line bg-white";

  const valueClass =
    variant === "alert"
      ? "text-status-danger-text"
      : variant === "ok"
        ? "text-status-success-text"
        : "text-lucathi-navy";

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 shadow-sm ${variantClass}`}
    >
      <span className="mt-0.5 rounded-xl bg-lucathi-mist p-2">
        <Icon className="size-4 text-lucathi-navy" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lucathi-gray">
          {label}
        </p>
        <p className={`mt-0.5 text-xl font-semibold tabular-nums ${valueClass}`}>
          {value}
        </p>
        <p className="mt-0.5 text-xs text-lucathi-gray">{sub}</p>
      </div>
    </div>
  );
}

/** Grade de 4 KPIs executivos: pessoas, patrimônio, documentos e alertas. */
export function ProjectKpiGrid({ familyId }: { familyId: string }) {
  const enabled = Boolean(familyId);

  const people    = trpc.people.list.useQuery({ familyId }, { enabled });
  const props     = trpc.properties.list.useQuery({ familyId }, { enabled });
  const companies = trpc.companies.list.useQuery({ familyId }, { enabled });
  const assets    = trpc.assets.list.useQuery({ familyId }, { enabled });
  const docs      = trpc.documents.list.useQuery({ familyId }, { enabled });
  const { counts, loading: alertsLoading } = useProjectAlerts(familyId);

  /* patrimônio bruto (soma simples — sem anti-dupla-contagem societária) */
  const propTotal = (props.data ?? []).reduce(
    (s, p) => s + (toNumberOrNull(p.marketValue) ?? 0),
    0
  );
  const compTotal = (companies.data ?? []).reduce((s, c) => {
    const ev = companyTotalsFromRow(c, c.propertyValue).estimatedValue ?? 0;
    return s + ev;
  }, 0);
  const assetTotal = (assets.data ?? []).reduce(
    (s, a) => s + (toNumberOrNull(a.declaredValue) ?? 0),
    0
  );
  const totalWealth = propTotal + compTotal + assetTotal;

  /* documentos entregues (status diferente de PENDENTE) */
  const docRows     = docs.data ?? [];
  const docsOk      = docRows.filter(d => d.status !== "PENDENTE").length;
  const docsTotal   = docRows.length;

  /* alertas */
  const red    = counts?.vermelho ?? 0;
  const yellow = counts?.amarelo ?? 0;
  const hasRed = red > 0;

  const alertValue = alertsLoading
    ? "—"
    : red + yellow === 0
      ? "Sem alertas"
      : `${red > 0 ? `${red} 🔴` : ""} ${yellow > 0 ? `${yellow} 🟡` : ""}`.trim();

  const alertSub = alertsLoading
    ? "Verificando…"
    : red + yellow === 0
      ? "Nenhuma certidão em risco"
      : `${red} vermelho(s) · ${yellow} amarelo(s)`;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        icon={UsersRound}
        label="Membros da família"
        value={people.isLoading ? "—" : String(people.data?.length ?? 0)}
        sub="pessoas cadastradas no projeto"
      />
      <KpiCard
        icon={Landmark}
        label="Patrimônio total"
        value={
          props.isLoading || companies.isLoading || assets.isLoading
            ? "—"
            : (formatBRL(totalWealth) ?? "R$ 0")
        }
        sub={`${props.data?.length ?? 0} imóv. · ${companies.data?.length ?? 0} soc. · ${assets.data?.length ?? 0} ativos`}
      />
      <KpiCard
        icon={FileStack}
        label="Documentos"
        value={docs.isLoading ? "—" : `${docsOk}/${docsTotal}`}
        sub={
          docsTotal === 0
            ? "Nenhum requisito gerado"
            : docsOk === docsTotal
              ? "Todos entregues"
              : `${docsTotal - docsOk} pendente(s)`
        }
        variant={
          docs.isLoading || docsTotal === 0
            ? "default"
            : docsOk === docsTotal
              ? "ok"
              : "default"
        }
      />
      <KpiCard
        icon={CircleAlert}
        label="Alertas abertos"
        value={alertValue}
        sub={alertSub}
        variant={alertsLoading ? "default" : hasRed ? "alert" : "default"}
      />
    </div>
  );
}
