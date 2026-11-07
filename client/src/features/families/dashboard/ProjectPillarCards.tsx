import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatBRL } from "@/features/properties/propertyCardView";
import { toNumberOrNull } from "@shared/domain/company-valuation";
import { useProjectAlerts } from "@/features/alerts/useProjectAlerts";

function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  const color =
    pct === 100
      ? "bg-status-success-text"
      : pct >= 60
        ? "bg-lucathi-navy"
        : "bg-status-warning-text";
  return (
    <div className="mt-2 h-1.5 w-full rounded-full bg-lucathi-line">
      <div
        className={`h-1.5 rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function PillarRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "ok" | "warn" | "empty";
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <span className="text-sm text-lucathi-gray">{label}</span>
      <span className="flex items-center gap-1.5">
        {status === "ok" ? (
          <CheckCircle2 className="size-3.5 shrink-0 text-status-success-text" />
        ) : status === "warn" ? (
          <XCircle className="size-3.5 shrink-0 text-status-danger-text" />
        ) : (
          <Circle className="size-3.5 shrink-0 text-lucathi-line" />
        )}
        <span className="text-sm font-medium text-lucathi-navy">{value}</span>
      </span>
    </div>
  );
}

/** Dois cards lado a lado: pilar Due Diligence e pilar Patrimônio. */
export function ProjectPillarCards({ familyId }: { familyId: string }) {
  const enabled = Boolean(familyId);

  const people = trpc.people.list.useQuery({ familyId }, { enabled });
  const docs = trpc.documents.list.useQuery({ familyId }, { enabled });
  const props = trpc.properties.list.useQuery({ familyId }, { enabled });
  const companies = trpc.companies.list.useQuery({ familyId }, { enabled });
  const assets = trpc.assets.list.useQuery({ familyId }, { enabled });
  const { counts, redCertidoes } = useProjectAlerts(familyId);

  /* --- pilar due diligence --- */
  const docRows = docs.data ?? [];
  const docsOk = docRows.filter(d => d.status !== "PENDENTE").length;
  const docsTotal = docRows.length;
  const docPct = docsTotal > 0 ? (docsOk / docsTotal) * 100 : 0;

  const certVermelhas = redCertidoes.length;
  const certAmarelas = counts?.amarelo ?? 0;

  const peopleCount = people.data?.length ?? 0;

  /* progresso geral de due diligence: média de docs + certidões sem risco */
  const certOkFactor = certVermelhas === 0 ? 100 : Math.max(0, 100 - certVermelhas * 20);
  const ddPct = docsTotal === 0 ? 0 : Math.round((docPct + certOkFactor) / 2);

  /* --- pilar patrimônio --- */
  const propRows = props.data ?? [];
  const compRows = companies.data ?? [];
  const assetRows = assets.data ?? [];

  const propTotal = propRows.reduce((s, p) => s + (toNumberOrNull(p.marketValue) ?? 0), 0);
  const assetTotal = assetRows.reduce((s, a) => s + (toNumberOrNull(a.declaredValue) ?? 0), 0);

  const hasHolding = compRows.length > 0;
  const rentals = propRows.filter(
    p => (p as Record<string, unknown>).utility === "LOCACAO_ARRENDAMENTO"
  ).length;

  const isLoading =
    people.isLoading ||
    docs.isLoading ||
    props.isLoading ||
    companies.isLoading ||
    assets.isLoading;

  const money = (v: number) => (isLoading ? "—" : (formatBRL(v) ?? "R$ 0"));

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {/* PILAR 1 — DUE DILIGENCE */}
      <section className="rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lucathi-gray font-subtitle">
            Pilar — Due Diligence
          </p>
          <span className="rounded-lg bg-lucathi-mist px-2.5 py-1 text-xs font-semibold text-lucathi-navy">
            {isLoading ? "—" : `${ddPct}%`}
          </span>
        </div>
        <ProgressBar value={isLoading ? 0 : ddPct} />

        <div className="mt-4 divide-y divide-lucathi-line/60">
          <PillarRow
            label="Membros cadastrados"
            value={isLoading ? "—" : String(peopleCount)}
            status={peopleCount > 0 ? "ok" : "empty"}
          />
          <PillarRow
            label="Documentos entregues"
            value={isLoading ? "—" : `${docsOk} / ${docsTotal}`}
            status={
              docsTotal === 0 ? "empty" : docsOk === docsTotal ? "ok" : "warn"
            }
          />
          <PillarRow
            label="Certidões em risco"
            value={
              isLoading
                ? "—"
                : certVermelhas + certAmarelas === 0
                  ? "Nenhuma"
                  : `${certVermelhas} 🔴  ${certAmarelas} 🟡`
            }
            status={
              isLoading
                ? "empty"
                : certVermelhas > 0
                  ? "warn"
                  : "ok"
            }
          />
        </div>
      </section>

      {/* PILAR 2 — PATRIMÔNIO */}
      <section className="rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lucathi-gray font-subtitle">
          Pilar — Patrimônio do Projeto
        </p>
        <p className="mt-1 text-sm text-lucathi-gray">
          Visão bruta dos ativos — sem anti-dupla-contagem societária.
        </p>

        <div className="mt-4 divide-y divide-lucathi-line/60">
          <PillarRow
            label="Imóveis"
            value={isLoading ? "—" : `${propRows.length} · ${money(propTotal)}`}
            status={propRows.length > 0 ? "ok" : "empty"}
          />
          <PillarRow
            label="Sociedades / Holdings"
            value={isLoading ? "—" : compRows.length > 0 ? `${compRows.length} cadastrada(s)` : "Nenhuma"}
            status={hasHolding ? "ok" : "empty"}
          />
          <PillarRow
            label="Demais ativos"
            value={isLoading ? "—" : `${assetRows.length} · ${money(assetTotal)}`}
            status={assetRows.length > 0 ? "ok" : "empty"}
          />
          <PillarRow
            label="Imóveis em locação"
            value={isLoading ? "—" : rentals > 0 ? `${rentals} locado(s)` : "Nenhum"}
            status={rentals > 0 ? "ok" : "empty"}
          />
          <PillarRow
            label="Cobertura de holding"
            value={hasHolding ? "Identificada" : "Não identificada"}
            status={hasHolding ? "ok" : "warn"}
          />
        </div>
      </section>
    </div>
  );
}