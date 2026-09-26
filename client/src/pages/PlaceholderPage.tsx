export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return <section className="rounded-2xl border border-dashed border-lucathi-line bg-white p-8"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-lucathi-gray">Módulo em estruturação</p><h1 className="mt-3 font-display text-4xl text-lucathi-navy">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-lucathi-gray">{description}</p></section>;
}
