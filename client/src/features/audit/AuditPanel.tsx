import { History } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export function AuditPanel({ familyId }: { familyId: string }) {
  const { user } = useAuth(); const enabled = user?.role === "SOCIO" || user?.role === "ADMIN";
  const logs = trpc.audit.listByFamily.useQuery({ familyId }, { enabled });
  if (!enabled) return null;
  return <section className="rounded-2xl border border-lucathi-line bg-white p-6"><div className="flex items-center gap-3"><History className="size-5 text-lucathi-navy" /><div><h2 className="font-display text-2xl text-lucathi-navy">Trilha de auditoria</h2><p className="text-sm text-lucathi-gray">Eventos críticos registrados por família.</p></div></div><div className="mt-5 space-y-2">{logs.data?.slice(0, 8).map(log => <div key={log.id} className="flex justify-between gap-3 rounded-xl bg-lucathi-mist px-4 py-3"><span className="text-sm font-medium">{log.action}</span><span className="text-xs text-lucathi-gray">{new Date(log.createdAt).toLocaleString("pt-BR")}</span></div>)}{!logs.data?.length ? <p className="text-sm text-lucathi-gray">Nenhuma ação crítica registrada ainda.</p> : null}</div></section>;
}
