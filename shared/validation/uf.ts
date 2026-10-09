import { z } from "zod";

/** As 27 unidades federativas do Brasil, em ordem alfabética de sigla. */
export const UFS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

export type Uf = (typeof UFS)[number];

/** Enum zod reutilizável para qualquer campo de UF (imóvel, cartório, membro, sociedade). */
export const ufSchema = z.enum(UFS);

export function isUf(value: string): value is Uf {
  return (UFS as readonly string[]).includes(value);
}
