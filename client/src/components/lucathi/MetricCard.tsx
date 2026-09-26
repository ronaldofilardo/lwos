type MetricCardProps = { label: string; value: string; detail: string };

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return <article className="rounded-2xl border border-lucathi-line bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-lucathi-gray">{label}</p><p className="mt-3 font-display text-3xl text-lucathi-navy">{value}</p><p className="mt-2 text-sm text-lucathi-gray">{detail}</p></article>;
}
