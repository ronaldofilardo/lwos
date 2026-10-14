import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { lookupAddressByCep } from "./viacep-client";

export const addressRouter = router({
  lookupCep: protectedProcedure
    .input(z.object({ cep: z.string().min(1, "Informe o CEP.") }))
    .query(async ({ input }) => {
      return lookupAddressByCep(input.cep);
    }),
});
