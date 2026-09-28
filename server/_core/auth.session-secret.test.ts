/**
 * @description Garante falha explícita quando JWT_SECRET não está configurado — o login
 * não pode emitir cookie assinado com segredo vazio.
 * @see server/_core/auth.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  createUser: vi.fn(),
  getUserByEmail: vi.fn(),
  getUserById: vi.fn(),
  touchLastSignedIn: vi.fn(),
  updateUserPassword: vi.fn(),
}));
const bcryptMocks = vi.hoisted(() => ({ hash: vi.fn(), compare: vi.fn() }));

vi.mock("../db", () => dbMocks);
vi.mock("bcryptjs", () => ({ default: bcryptMocks }));
vi.mock("./env", () => ({ ENV: { cookieSecret: "" } }));

import { registerAuthRoutes } from "./auth";

const user = {
  id: 7,
  name: "Ana",
  email: "ana@lucathi.com.br",
  passwordHash: "hash",
  role: "CLIENTE",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function loginHandler() {
  const app = { post: vi.fn() };
  registerAuthRoutes(app as never);
  const call = app.post.mock.calls.find(entry => entry[0] === "/api/auth/login");
  return call![1] as (req: unknown, res: unknown) => Promise<void>;
}

function response() {
  return { status: vi.fn().mockReturnThis(), json: vi.fn(), cookie: vi.fn() };
}

describe("sessão sem JWT_SECRET", () => {
  beforeEach(() => vi.clearAllMocks());

  it("recusa o login com erro claro quando o segredo de sessão está vazio", async () => {
    dbMocks.getUserByEmail.mockResolvedValue(user);
    bcryptMocks.compare.mockResolvedValue(true);

    const res = response();
    await loginHandler()(
      { ip: "1.2.3.4", body: { email: user.email, password: "senha123" }, headers: {}, hostname: "localhost", protocol: "http" } as never,
      res
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "JWT_SECRET não configurado. Defina em .env.local." });
    expect(res.cookie).not.toHaveBeenCalled();
  });
});
