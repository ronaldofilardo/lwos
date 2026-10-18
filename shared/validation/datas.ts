/**
 * Fuso horário de referência do sistema — datas de negócio (nascimento,
 * prazos, "hoje") sempre interpretadas em São Paulo, nunca em UTC/local do servidor.
 */
export const FUSO_PADRAO = "America/Sao_Paulo";

/** Idade máxima razoável para rejeitar datas de nascimento plausivelmente erradas. */
export const IDADE_MAXIMA_ANOS = 120;

const RE_DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Valida data em formato YYYY-MM-DD e calendário real (rejeita 2023-02-29). */
export function isDataIsoValida(value: string): boolean {
  if (!RE_DATA_ISO.test(value)) return false;
  const [ano, mes, dia] = value.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia
  );
}

/** Data de hoje (YYYY-MM-DD) no fuso America/Sao_Paulo. */
export function hoje(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: FUSO_PADRAO });
}

/**
 * Idade em anos completos de calendário — a que serve para regras
 * (maior de 18 anos etc.). Aniversário 29/02 em ano não bissexto
 * completa em 01/03.
 */
export function idadeEmAnosCompletos(
  nascimento: string,
  ref: string = hoje(),
): number {
  if (!isDataIsoValida(nascimento) || !isDataIsoValida(ref)) return NaN;
  const [anoNasc, mesNasc, diaNasc] = nascimento.split("-").map(Number);
  const [anoRef, mesRef, diaRef] = ref.split("-").map(Number);
  let anos = anoRef - anoNasc;
  if (mesRef < mesNasc || (mesRef === mesNasc && diaRef < diaNasc)) anos -= 1;
  return anos;
}

/**
 * Idade decimal para exibição — (hoje − nascimento) / 365,25.
 * Nunca gravar em banco: é só apresentação ao lado da data de nascimento.
 */
export function idadeDecimal(
  nascimento: string,
  ref: string = hoje(),
): number {
  if (!isDataIsoValida(nascimento) || !isDataIsoValida(ref)) return NaN;
  const paraMs = (iso: string) => {
    const [ano, mes, dia] = iso.split("-").map(Number);
    return Date.UTC(ano, mes - 1, dia);
  };
  const dias = (paraMs(ref) - paraMs(nascimento)) / 86_400_000;
  return dias / 365.25;
}

/** Formata idade decimal no padrão pt-BR: "42,3 anos". */
export function formatarIdadeDecimal(anos: number): string {
  const texto = anos.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return `${texto} anos`;
}

/**
 * Formata data "somente calendário" (YYYY-MM-DD, sem hora) pro padrão
 * brasileiro SEM passar por `new Date(...)`. `new Date("1985-02-08")` é
 * interpretado como meia-noite UTC, e `.toLocaleDateString()` depois
 * renderiza no fuso local — em horários UTC-3 (Brasil) isso sempre mostra
 * um dia a menos (ex: nascimento 08/02 aparecendo como 07/02). Usado pra
 * datas de nascimento e outros campos "date" (sem componente de hora).
 */
export function formatDateOnlyBR(value: string | null | undefined): string {
  if (!value) return "";
  const [yyyy, mm, dd] = value.slice(0, 10).split("-");
  if (!yyyy || !mm || !dd) return value;
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Valida data de nascimento: calendário real, não futura e com no
 * máximo IDADE_MAXIMA_ANOS anos completos.
 */
export function isNascimentoValido(
  value: string,
  ref: string = hoje(),
): boolean {
  if (!isDataIsoValida(value)) return false;
  if (value > ref) return false;
  const anos = idadeEmAnosCompletos(value, ref);
  return anos >= 0 && anos <= IDADE_MAXIMA_ANOS;
}
