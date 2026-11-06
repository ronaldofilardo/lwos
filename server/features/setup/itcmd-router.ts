import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { requireRole } from "../access/authorization";
import { getBracketsByUf, saveUfPolicy } from "./itcmd-repository";
import { calculateItcmdForUf } from "../../../shared/domain/itcmd-engine";

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
] as const;

const bracketInputSchema = z.object({
  bracketOrder: z.number().int().min(1),
  limitValue: z.number().min(0),
  rate: z.number().min(0).max(100),
  accumulatedTax: z.number().optional().default(0),
  deductionValue: z.number().optional().default(0),
  indexedUnitName: z.string().nullable().optional(),
  indexedUnitValue: z.number().nullable().optional(),
});

export const itcmdRouter = router({
  listUfs: protectedProcedure.query(async () => {
    const list = await Promise.all(
      UFS.map(async uf => {
        const brackets = await getBracketsByUf(uf);
        const rates = brackets.map(b => b.rate);
        return {
          uf,
          bracketCount: brackets.length,
          minRate: rates.length > 0 ? Math.min(...rates) : 4,
          maxRate: rates.length > 0 ? Math.max(...rates) : 4,
          indexedUnitName: brackets[0]?.indexedUnitName ?? null,
          indexedUnitValue: brackets[0]?.indexedUnitValue ?? null,
        };
      })
    );
    return list;
  }),

  getByUf: protectedProcedure
    .input(z.object({ uf: z.string().min(2).max(2) }))
    .query(async ({ input }) => {
      const brackets = await getBracketsByUf(input.uf);
      return { uf: input.uf.toUpperCase(), brackets };
    }),

  updatePolicy: protectedProcedure
    .input(
      z.object({
        uf: z.string().min(2).max(2),
        brackets: z.array(bracketInputSchema),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireRole(ctx, ["SOCIO", "ADMIN"]);
      const updated = await saveUfPolicy(input.uf, input.brackets);
      return { uf: input.uf.toUpperCase(), brackets: updated };
    }),

  calculate: protectedProcedure
    .input(
      z.object({
        uf: z.string().min(2).max(2),
        patrimony: z.number().min(0),
      })
    )
    .query(async ({ input }) => {
      const brackets = await getBracketsByUf(input.uf);
      return calculateItcmdForUf(input.patrimony, brackets);
    }),
});

