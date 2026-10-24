import { useId, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/formatClasses";

/**
 * Campo com label visível acima do controle. O `id` é gerado por `useId`
 * (único mesmo se o formulário for montado mais de uma vez) e entregue ao
 * filho, que deve aplicá-lo ao controle para ligar `htmlFor` ↔ `id`.
 */
export function LabeledField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <Label htmlFor={id} className="text-xs font-medium text-lucathi-gray">
        {label}
      </Label>
      {children(id)}
    </div>
  );
}
