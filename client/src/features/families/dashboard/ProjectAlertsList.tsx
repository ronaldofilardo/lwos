import { CircleAlert, TriangleAlert } from "lucide-react";
import { useProjectAlerts } from "@/features/alerts/useProjectAlerts";
import { trpc } from "@/lib/trpc";

type AlertItem = {
  id: string;
  level: "vermelho" | "amarelo";
  message: string;
  action: string;
};

/** Lista de alertas acionáveis do projeto, agrupados por severidade. */
export function ProjectAlertsList({ familyId }: { familyId: string }) {
  const { blockers, hardBlockers, redCertidoes, counts, loading } =
    useProjectAlerts(familyId);

  const calcData = trpc.calculations.getData.useQuery(
    { familyId },
    { enabled: Boolean(familyId) }
  );

  const items: AlertItem[] = [];

  /* certidões em vermelho */
  redCertidoes.forEach((desc, i) => {
    items.push({
      id: `red-cert-${i}`,
      level: "vermelho",
      message: desc,
      action: "Renovar ou justificar em Documentos e Certidões",
    });
  });

  /* bloqueadores duros */
  hardBlockers.forEach((b, i) => {
    if (!redCertidoes.includes(b)) {
      items.push({
        id: `hard-${i}`,
        level: "vermelho",
        message: b,
        action: "Resolver antes de concluir o projeto",
      });
    }
  });

  /* bloqueadores gerais (amarelos) */
  blockers.forEach((b, i) => {
    if (!hardBlockers.includes(b)) {
      items.push({
        id: `blocker-${i}`,
        level: "amarelo",
        message: b,
        action: "Verificar e resolver",
      });
    }
  });

  /* IBS/CBS se disparado */
  if (calcData.data) {
    const rentals = calcData.data.properties.filter(
      (p: { utility?: string | null }) => p.utility === "LOCACAO_ARRENDAMENTO"
    );
    const annualRevenue = rentals.reduce((s: number, p: { rentValue?: string | number | null }) => {
      const v = typeof p.rentValue === "number"
        ? p.rentValue
        : parseFloat(String(p.rentValue ?? "0")) || 0;
      return s + v * 12;
    }, 0);
    const tooManyRentals = rentals.length > 3 && annualRevenue > 240000;
    const highRevenue    = annualRevenue > 288000;
    if (tooManyRentals || highRevenue) {
      items.push({
        id: "ibs-cbs",
        level: "amarelo",
        message: `Gatilho IBS/CBS atingido — ${rentals.length} imóvel(is) locado(s) · R$ ${(annualRevenue / 1000).toFixed(0)}k/ano`,
        action: "Avaliar holding imobiliária na aba Cálculos",
      });
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lucathi-gray">
          Alertas do Projeto
        </p>
        <p className="mt-3 text-sm text-lucathi-gray">Verificando…</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
          Alertas do Projeto
        </p>
        <p className="mt-2 text-sm text-emerald-700">
          Nenhum alerta aberto — projeto em ordem.
        </p>
      </section>
    );
  }

  const vermelhos = items.filter(i => i.level === "vermelho");
  const amarelos  = items.filter(i => i.level === "amarelo");

  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lucathi-gray">
          Alertas do Projeto
        </p>
        <div className="flex gap-2 text-xs font-semibold">
          {vermelhos.length > 0 && (
            <span className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-red-700">
              <CircleAlert className="size-3.5" /> {vermelhos.length} vermelho(s)
            </span>
          )}
          {amarelos.length > 0 && (
            <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-amber-700">
              <TriangleAlert className="size-3.5" /> {amarelos.length} amarelo(s)
            </span>
          )}
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {items.map(item => (
          <li
            key={item.id}
            className={`flex items-start gap-3 rounded-xl border p-4 ${
              item.level === "vermelho"
                ? "border-red-200 bg-red-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <span className="mt-0.5 shrink-0">
              {item.level === "vermelho" ? (
                <CircleAlert className="size-4 text-red-600" />
              ) : (
                <TriangleAlert className="size-4 text-amber-500" />
              )}
            </span>
            <div>
              <p
                className={`text-sm font-medium ${
                  item.level === "vermelho" ? "text-red-800" : "text-amber-800"
                }`}
              >
                {item.message}
              </p>
              <p
                className={`mt-0.5 text-xs ${
                  item.level === "vermelho" ? "text-red-600" : "text-amber-600"
                }`}
              >
                → {item.action}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
