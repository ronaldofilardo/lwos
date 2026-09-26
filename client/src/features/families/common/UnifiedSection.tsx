import type { ReactNode } from "react";
import { Landmark } from "lucide-react";

export function UnifiedSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3 rounded-2xl border border-lucathi-line/70 bg-white px-5 py-4 shadow-sm">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-lucathi-mist text-lucathi-navy">
          {icon ?? <Landmark className="size-4.5" />}
        </div>
        <div>
          <h2 className="font-display text-xl text-lucathi-navy">{title}</h2>
          <p className="mt-0.5 text-xs text-lucathi-gray">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
