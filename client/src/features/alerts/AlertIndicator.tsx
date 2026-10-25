import { CircleAlert, TriangleAlert } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function AlertIndicator({
  level,
  title,
  reasons,
}: {
  level?: string | null;
  title?: string;
  reasons?: string[];
}) {
  if (level === "VERMELHO") {
    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild tabIndex={0} aria-label="Alerta vermelho">
          <span className="inline-flex items-center">
            <CircleAlert className="size-4 text-red-600" aria-hidden="true" />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {reasons && reasons.length
            ? reasons.map((r, i) => <div key={i}>{r}</div>)
            : title ?? "Certidão positiva ou somente física"}
        </TooltipContent>
      </Tooltip>
    );
  }
  if (level === "AMARELO") {
    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild tabIndex={0} aria-label="Alerta amarelo">
          <span className="inline-flex items-center">
            <TriangleAlert className="size-4 text-amber-500" aria-hidden="true" />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {reasons && reasons.length
            ? reasons.map((r, i) => <div key={i}>{r}</div>)
            : title ?? "Certidão pendente ou vencida"}
        </TooltipContent>
      </Tooltip>
    );
  }
  return null;
}