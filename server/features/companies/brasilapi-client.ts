import type { BrasilApiCnpjResponse } from "./brasilapi-types";

const BRASIL_API_TIMEOUT_MS = 6000;
const BRASIL_API_BASE_URL = "https://brasilapi.com.br/api/cnpj/v1";
const HTTP_USER_AGENT =
  "LWOS-App/1.0 (Family Office Platform; contato@lucathi.com.br)";

/**
 * Consulta resiliente de CNPJ na BrasilAPI.
 * Retorna os dados oficiais ou null em caso de erro, timeout ou 404.
 */
export async function fetchCompanyByCnpj(
  rawCnpj: string
): Promise<BrasilApiCnpjResponse | null> {
  const digits = rawCnpj.replace(/\D/g, "");
  if (digits.length !== 14) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BRASIL_API_TIMEOUT_MS);

  try {
    const response = await fetch(`${BRASIL_API_BASE_URL}/${digits}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": HTTP_USER_AGENT,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as BrasilApiCnpjResponse;
    return data && data.cnpj ? data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
