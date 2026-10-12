import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { authenticateRequest } from "./auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  /** jti do JWT da sessão atual (para revogação em logout). */
  sessionJti: string | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  let sessionJti: string | null = null;

  try {
    const session = await authenticateRequest(opts.req);
    user = session.user;
    sessionJti = session.jti;
  } catch {
    // Autenticação é opcional para procedures públicas.
    user = null;
    sessionJti = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    sessionJti,
  };
}
