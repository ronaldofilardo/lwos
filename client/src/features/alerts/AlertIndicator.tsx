import { CircleAlert, TriangleAlert } from "lucide-react";

/**
 * Exclamação vermelha (certidão positiva ou somente física) ou indicador
 * amarelo (pendente/vencida) — Fase 9. Reutilizado em Pessoas, Imóveis,
 * Sociedades, Ativos e na lista de projetos.
 */
export function AlertIndicator({
  level,
  title,
}: {
  level?: string | null;
  title?: string;
}) {
  if (level === "VERMELHO") {
    return (
      <span
        className="inline-flex items-center"
        title={title ?? "Certidão positiva ou somente física"}
        aria-label="Alerta vermelho de certidão"
      >
        <CircleAlert className="size-4 text-red-600" aria-hidden="true" />
      </span>
    );
  }
  if (level === "AMARELO") {
    return (
      <span
        className="inline-flex items-center"
        title={title ?? "Certidão pendente ou vencida"}
        aria-label="Alerta amarelo de certidão"
      >
        <TriangleAlert className="size-4 text-amber-500" aria-hidden="true" />
      </span>
    );
  }
  return null;
}
