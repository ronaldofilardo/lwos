import type {
  AddressLookupResult,
  BrasilApiCepResponse,
  ViaCepResponse,
} from "./viacep-types";

const TIMEOUT_MS = 4000;
const USER_AGENT = "LWOS-App/1.0 (Family Office Platform; contato@lucathi.com.br)";

function sanitizeCep(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 8 ? digits : null;
}

async function fetchWithTimeout(url: string, timeoutMs: number, headers?: Record<string, string>): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal, headers });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFromViaCep(cleanCep: string): Promise<AddressLookupResult | null> {
  try {
    const url = `https://viacep.com.br/ws/${cleanCep}/json/`;
    const response = await fetchWithTimeout(url, TIMEOUT_MS);
    if (!response.ok) return null;

    const data = (await response.json()) as ViaCepResponse;
    if (data.erro === true || data.erro === "true") return null;

    return {
      cep: cleanCep,
      street: (data.logradouro ?? "").trim(),
      complement: (data.complemento ?? "").trim(),
      district: (data.bairro ?? "").trim(),
      city: (data.localidade ?? "").trim(),
      uf: (data.uf ?? "").trim().toUpperCase(),
      source: "VIACEP",
    };
  } catch {
    return null;
  }
}

async function fetchFromBrasilApi(cleanCep: string): Promise<AddressLookupResult | null> {
  try {
    const url = `https://brasilapi.com.br/api/cep/v1/${cleanCep}`;
    const response = await fetchWithTimeout(url, TIMEOUT_MS, { "User-Agent": USER_AGENT });
    if (!response.ok) return null;

    const data = (await response.json()) as BrasilApiCepResponse;
    return {
      cep: cleanCep,
      street: (data.street ?? "").trim(),
      complement: "",
      district: (data.neighborhood ?? "").trim(),
      city: (data.city ?? "").trim(),
      uf: (data.state ?? "").trim().toUpperCase(),
      source: "BRASILAPI",
    };
  } catch {
    return null;
  }
}

export async function lookupAddressByCep(rawCep: string): Promise<AddressLookupResult | null> {
  const cleanCep = sanitizeCep(rawCep);
  if (!cleanCep) return null;

  const viaCepResult = await fetchFromViaCep(cleanCep);
  if (viaCepResult) return viaCepResult;

  return fetchFromBrasilApi(cleanCep);
}
