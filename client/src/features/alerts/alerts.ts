export type AlertLevel = "VERMELHO" | "AMARELO" | "NENHUM";

export type SubjectAlerts = Record<string, string | undefined>;

/** Chave do assunto no resumo do servidor («PESSOA:id» / «SOCIEDADE:id»). */
export function subjectKey(scope: "PESSOA" | "SOCIEDADE", id: string): string {
  return `${scope}:${id}`;
}

/** Nível de alerta de um assunto no resumo. */
export function levelFor(
  bySubject: SubjectAlerts | undefined,
  scope: "PESSOA" | "SOCIEDADE",
  id: string
): AlertLevel | undefined {
  return bySubject?.[subjectKey(scope, id)] as AlertLevel | undefined;
}

/** Pior nível entre vários assuntos — usado no imóvel com vários titulares. */
export function worstAlert(
  ...levels: (string | null | undefined)[]
): AlertLevel | undefined {
  if (levels.includes("VERMELHO")) return "VERMELHO";
  if (levels.includes("AMARELO")) return "AMARELO";
  return undefined;
}
