import { useMemo } from "react";
import { CircleAlert, TriangleAlert } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { AlertIndicator } from "@/features/alerts/AlertIndicator";

interface AlertItem {
  id: string;
  level: "vermelho" | "amarelo";
  message: string;
  action: string;
}

export function ProjectAlertsList({ familyId }: { familyId: string }) {
  const alerts = trpc.alerts.list.useQuery({ familyId }, { enabled: Boolean(familyId) });
  const items = useMemo(() => {
    const list: AlertItem[] = [];
    if (alerts.data?.vermelhos?.length) {
      list.push(...alerts.data.vermelhos.map(a => ({ id: `vermelho-${a.id}`, level: "vermelho" as const, message: a.message, action: a.action })));
    }
    if (alerts.data?.amarelos?.length) {
      list.push(...alerts.data.amarelos.map(a => ({ id: `amarelo-${a.id}`, level: "amarelo" as const, message: a.message, action: a.action })));
    }
    return list;
  }, [alerts.data]);

  if (alerts.isLoading) {
    return (
      <section className="rounded-2xl border border-lucathi-line bg-lucathi-mist/40 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lucathi-gray font-subtitle">
          Alertas do Projeto
        </p>
        <p className="mt-3 text-sm text-lucathi-gray">Verificando…</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-status-success-border bg-status-success-bg p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-status-success-text font-subtitle">
          Alertas do Projeto
        </p>
        <p className="mt-2 text-sm text-status-success-text">
          Nenhum alerta aberto — projeto em ordem.
        </p>
      </section>
    );
  }

  const vermelhos = items.filter(i => i.level === "vermelho");
  const amarelos = items.filter(i => i.level === "amarelo");

  return (
    <section className="rounded-2xl border border-lucathi-line bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lucathi-gray font-subtitle">
          Alertas do Projeto
        </p>
        <div className="flex gap-2 text-xs font-semibold">
          {vermelhos.length > 0 && (
            <span className="flex items-center gap-1 rounded-lg bg-status-danger-bg px-2 py-1 text-status-danger-text">
              <CircleAlert className="size-3.5" /> {vermelhos.length} vermelho(s)
            </span>
          )}
          {amarelos.length > 0 && (
            <span className="flex items-center gap-1 rounded-lg bg-status-warning-bg px-2 py-1 text-status-warning-text">
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
                ? "border-status-danger-border bg-status-danger-bg"
                : "border-status-warning-border bg-status-warning-bg"
            }`}
          >
            <span className="mt-0.5 shrink-0">
              {item.level === "vermelho" ? (
                <CircleAlert className="size-4 text-status-danger-text" />
              ) : (
                <TriangleAlert className="size-4 text-status-warning-text" />
              )}
            </span>
            <div>
              <p
                className={`text-sm font-medium ${
                  item.level === "vermelho" ? "text-status-danger-text" : "text-status-warning-text"
                }`}
              >
                {item.message}
              </p>
              <p
                className={`mt-0.5 text-xs ${
                  item.level === "vermelho" ? "text-status-danger-text" : "text-status-warning-text"
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