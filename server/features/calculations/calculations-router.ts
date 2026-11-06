import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { assertFamilyAccess } from "../access/family-access";
import { getFamilyCalculationsData } from "./calculations-repository";

export const calculationsRouter = router({
  /** Base dos cálculos patrimoniais e tributários do projeto (aba «Cálculos»). */
  getData: protectedProcedure
    .input(z.object({ familyId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertFamilyAccess(ctx, input.familyId);
      return getFamilyCalculationsData(input.familyId);
    }),
});
