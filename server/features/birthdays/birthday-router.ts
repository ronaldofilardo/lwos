import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../_core/trpc";
import { listProjectBirthdays } from "./birthday-repository";

export const birthdayRouter = router({
  list: protectedProcedure.query(({ ctx }) => {
    if (ctx.user?.role !== "SOCIO") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Acesso restrito ao perfil Sócio.",
      });
    }
    return listProjectBirthdays();
  }),
});
