import { z } from "zod";
import { MAX_DINHEIRO } from "./dinheiro";

const MENSAGEM_FAIXA = "Valor fora da faixa permitida (0 a 9.999.999.999.999,99).";

/**
 * Valor monetário não negativo dentro de numeric(15,2). Evita aceitar
 * negativos ou números que estourariam a coluna (erro de banco → 500).
 */
export const dinheiroSchema = z
  .number()
  .finite()
  .min(0, MENSAGEM_FAIXA)
  .max(MAX_DINHEIRO, MENSAGEM_FAIXA);

/** Quantidade de quotas/ações: inteiro positivo dentro do teto de numeric(15,2). */
export const quantidadeQuotasSchema = z
  .number()
  .finite()
  .int("A quantidade de quotas/ações deve ser um número inteiro.")
  .positive("A quantidade de quotas/ações deve ser maior que zero.")
  .max(MAX_DINHEIRO, MENSAGEM_FAIXA);
