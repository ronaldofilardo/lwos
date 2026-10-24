// @ts-nocheck
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { revokeSession } from "./db";
import { companyRouter } from "./features/companies/company-router";
import { documentRouter } from "./features/documents/document-router";
import { familyRouter } from "./features/families/family-router";
import { lwrRouter } from "./features/reports/lwr-router";
import { personRouter } from "./features/people/person-router";
import { portalRouter } from "./features/portal/portal-router";
import { propertyRouter } from "./features/properties/property-router";
import { userRouter } from "./features/users/user-router";
import { auditRouter } from "./features/audit/audit-router";
import { firstAccessRouter } from "./features/people/first-access-router";
import { assetRouter } from "./features/assets/assets-router";
import { proposalRouter } from "./features/proposals/proposal-router";
import { leadRouter } from "./features/leads/lead-router";
import { certidaoRouter } from "./features/certidoes/certidao-router";
import { addressRouter } from "./features/address/address-router";
import { birthdayRouter } from "./features/birthdays/birthday-router";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  address: addressRouter,
  birthdays: birthdayRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      // Revoga o jti da sessão atual para que tokens capturados não sejam reutilizados.
      if (ctx.sessionJti && ctx.user) {
        await revokeSession(ctx.sessionJti, ctx.user.id, "LOGOUT");
      }
      return {
        success: true,
      } as const;
    }),
  }),
  families: familyRouter,
  people: personRouter,
  firstAccess: firstAccessRouter,
  documents: documentRouter,
  certidoes: certidaoRouter,
  properties: propertyRouter,
  companies: companyRouter,
  assets: assetRouter,
  proposals: proposalRouter,
  leads: leadRouter,
  portal: portalRouter,
  lwr: lwrRouter,
  users: userRouter,
  audit: auditRouter,
});

export type AppRouter = typeof appRouter;
