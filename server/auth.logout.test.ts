import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

const dbMocks = vi.hoisted(() => ({ revokeSession: vi.fn() }));
vi.mock("./db", () => dbMocks);

function createAuthContext(): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    name: "Sample User",
    email: "sample@example.com",
    passwordHash: "x",
    role: "CLIENTE",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    sessionJti: "jti-teste-123",
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("auth.logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears the session cookie, revoga o jti e relata sucesso", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      sameSite: "lax",
      httpOnly: true,
      path: "/",
    });
    expect(dbMocks.revokeSession).toHaveBeenCalledWith("jti-teste-123", 1, "LOGOUT");
  });

  it("não tenta revogar quando não há sessão ativa", async () => {
    const ctx: TrpcContext = {
      user: null,
      sessionJti: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: vi.fn(),
      } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(dbMocks.revokeSession).not.toHaveBeenCalled();
  });
});
