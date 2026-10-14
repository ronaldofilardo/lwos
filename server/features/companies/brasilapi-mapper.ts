import type { BrasilApiCnpjResponse, BrasilApiQsaItem } from "./brasilapi-types";
import { UFS, type Uf } from "../../../shared/validation/uf";
import {
  societaryTypeValues,
  taxRegimeValues,
} from "../../../drizzle/schema";

export type SocietaryType = (typeof societaryTypeValues)[number];
export type TaxRegime = (typeof taxRegimeValues)[number];

export type MappedCompanyData = {
  legalName: string | null;
  uf: Uf | null;
  sede: string | null;
  societaryType: SocietaryType | null;
  taxRegime: TaxRegime | null;
  corporatePurpose: string | null;
  capitalSocial: number | null;
  administrator1: string | null;
  administrator2: string | null;
  stakeholders: Array<{ name: string; percentage: number }>;
};

function resolveSocietaryType(
  code?: number | null,
  desc?: string | null
): SocietaryType | null {
  const text = (desc ?? "").toUpperCase();
  if (code === 2062 || text.includes("LIMITADA") || text.includes("LTDA")) return "LTDA";
  if (code === 2046 || code === 2054 || text.includes("ANONIMA") || text.includes("ANÔNIMA")) return "SA";
  if (text.includes("CONTA DE PARTICIP") || text.includes("SCP")) return "SCP";
  return null;
}

function formatSede(data: BrasilApiCnpjResponse): string | null {
  const parts = [
    data.descricao_tipo_de_logradouro
      ? `${data.descricao_tipo_de_logradouro} ${data.logradouro ?? ""}`.trim()
      : data.logradouro,
    data.numero ? `nº ${data.numero}` : null,
    data.complemento,
    data.bairro,
    data.municipio && data.uf ? `${data.municipio}/${data.uf}` : data.municipio,
    data.cep ? `CEP ${data.cep}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(", ").slice(0, 160) : null;
}

function isAdminRole(qual?: string | null): boolean {
  const q = (qual ?? "").toUpperCase();
  return q.includes("ADMINISTRA") || q.includes("DIRETOR") || q.includes("PRESIDENTE");
}

function extractAdministrators(qsa?: BrasilApiQsaItem[] | null): [string | null, string | null] {
  if (!qsa?.length) return [null, null];
  const admins = qsa
    .filter(item => Boolean(item.nome_socio?.trim()) && isAdminRole(item.qualificacao_socio))
    .map(item => item.nome_socio!.trim().slice(0, 120));
  const fallback = qsa
    .filter(item => Boolean(item.nome_socio?.trim()))
    .map(item => item.nome_socio!.trim().slice(0, 120));
  const pool = admins.length ? admins : fallback;
  return [pool[0] ?? null, pool[1] ?? null];
}

export function mapBrasilApiToCompanyData(
  data: BrasilApiCnpjResponse
): MappedCompanyData {
  const societaryType = resolveSocietaryType(
    data.codigo_natureza_juridica,
    data.natureza_juridica
  );
  const isSimples = data.opcao_pelo_simples === true && societaryType !== "SA";
  const taxRegime: TaxRegime | null = isSimples ? "SIMPLES_NACIONAL" : null;
  const uf = data.uf && UFS.includes(data.uf as Uf) ? (data.uf as Uf) : null;
  const [administrator1, administrator2] = extractAdministrators(data.qsa);

  const stakeholders = (data.qsa ?? [])
    .map(item => item.nome_socio?.trim())
    .filter((name): name is string => Boolean(name))
    .map(name => ({ name: name.slice(0, 160), percentage: 0 }));

  return {
    legalName: data.razao_social?.trim() ? data.razao_social.trim().slice(0, 180) : null,
    uf,
    sede: formatSede(data),
    societaryType,
    taxRegime,
    corporatePurpose: data.cnae_fiscal_descricao?.trim() ? data.cnae_fiscal_descricao.trim().slice(0, 4000) : null,
    capitalSocial: typeof data.capital_social === "number" ? data.capital_social : null,
    administrator1,
    administrator2,
    stakeholders,
  };
}
