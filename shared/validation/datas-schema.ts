import { z } from "zod";
import { isDataIsoValida } from "./datas";

/**
 * Schema Zod reutilizável para datas de negócio em formato ISO (AAAA-MM-DD).
 * Garante que mensagens em pt-BR e validação de calendário real sejam iguais
 * em cliente e servidor, em vez do regex/`min(1)` ad hoc de cada schema.
 */
export function isoDateSchema(message = "Data inválida (use AAAA-MM-DD).") {
  return z
    .string()
    .refine(value => isDataIsoValida(value), { message });
}
