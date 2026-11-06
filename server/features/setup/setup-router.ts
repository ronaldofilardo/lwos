import { router } from "../../_core/trpc";
import { itcmdRouter } from "./itcmd-router";

export const setupRouter = router({
  itcmd: itcmdRouter,
});

