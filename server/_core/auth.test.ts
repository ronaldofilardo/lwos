/**
 * @description Valida regras reais de cadastro e login local, incluindo normalização,
 * duplicidade, hash, senha inválida, atualização de último acesso e rate limit
 * das rotas Express (429 após o teto de tentativas por IP+e-mail / IP).
 * @see server/_core/auth.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  createUser: vi.fn(),
  getUserByEmail: vi.fn(),
  getUserById: vi.fn(),
  touchLastSignedIn: vi.fn(),
}));
const bcryptMocks = vi.hoisted(() => ({ hash: vi.fn(), compare: vi.fn() }));

vi.mock("../db", () => dbMocks);
vi.mock("bcryptjs", () => ({ default: bcryptMocks }));
vi.mock("./env", () => ({ ENV: { cookieSecret: "teste-seguro" } }));

import { loginWithPassword, registerAuthRoutes, registerUser } from "./auth";
import { resetRateLimits } from "./rateLimit";

const user = {
  id: 7,
  name: "Ana",
  email: "ana@lucathi.com.br",
  passwordHash: "hash-existente",
  role: "CLIENTE",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("auth local", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimits();
  });

  it("normaliza e-mail, cria hash e registra novo cliente", async () => {
    dbMocks.getUserByEmail.mockResolvedValue(undefined);
    bcryptMocks.hash.mockResolvedValue("hash-novo");
    dbMocks.createUser.mockResolvedValue(user);

    await expect(registerUser({ name: " Ana ", email: " ANA@LUCATHI.COM.BR ", password: "senha-segura" })).resolves.toBe(user);

    expect(dbMocks.getUserByEmail).toHaveBeenCalledWith("ana@lucathi.com.br");
    expect(bcryptMocks.hash).toHaveBeenCalledWith("senha-segura", 12);
    expect(dbMocks.createUser).toHaveBeenCalledWith(expect.objectContaining({ name: "Ana", email: "ana@lucathi.com.br", role: "CLIENTE", passwordHash: "hash-novo" }));
  });

  it("recusa e-mail inválido, senha curta e e-mail já utilizado", async () => {
    await expect(registerUser({ name: "Ana", email: "invalido", password: "senha-segura" })).rejects.toThrow("E-mail inválido.");
    await expect(registerUser({ name: "Ana", email: "ana@lucathi.com.br", password: "123" })).rejects.toThrow("pelo menos 6 caracteres");
    dbMocks.getUserByEmail.mockResolvedValue(user);
    await expect(registerUser({ name: "Ana", email: "ana@lucathi.com.br", password: "senha-segura" })).rejects.toThrow("Já existe um usuário");
    expect(dbMocks.createUser).not.toHaveBeenCalled();
  });

  it("autentica somente credencial válida e atualiza o último acesso", async () => {
    dbMocks.getUserByEmail.mockResolvedValue(user);
    bcryptMocks.compare.mockResolvedValue(true);

    await expect(loginWithPassword(" ANA@LUCATHI.COM.BR ", "senha-segura")).resolves.toBe(user);

    expect(dbMocks.getUserByEmail).toHaveBeenCalledWith("ana@lucathi.com.br");
    expect(dbMocks.touchLastSignedIn).toHaveBeenCalledWith(7);
  });

  it("não atualiza acesso quando usuário não existe ou senha é inválida", async () => {
    dbMocks.getUserByEmail.mockResolvedValueOnce(undefined).mockResolvedValueOnce(user);
    bcryptMocks.compare.mockResolvedValue(false);

    await expect(loginWithPassword("ana@lucathi.com.br", "senha-segura")).rejects.toThrow("E-mail ou senha inválidos.");
    await expect(loginWithPassword("ana@lucathi.com.br", "senha-invalida")).rejects.toThrow("E-mail ou senha inválidos.");

    expect(dbMocks.touchLastSignedIn).not.toHaveBeenCalled();
  });
});

function handlers() {
  const app = { post: vi.fn() };
  registerAuthRoutes(app as never);
  const login = app.post.mock.calls.find((call) => call[0] === "/api/auth/login")![1] as (req: unknown, res: unknown) => Promise<void>;
  const register = app.post.mock.calls.find((call) => call[0] === "/api/auth/register")![1] as (req: unknown, res: unknown) => Promise<void>;
  return { login, register };
}

function request(ip: string, body: Record<string, unknown>) {
  return { ip, body, headers: {}, hostname: "localhost", protocol: "http" } as never;
}

function response() {
  return { status: vi.fn().mockReturnThis(), json: vi.fn(), cookie: vi.fn() };
}

describe("auth rotas rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimits();
  });

  it("responde 401 nas 10 primeiras tentativas de login e 429 na 11ª", async () => {
    dbMocks.getUserByEmail.mockResolvedValue(undefined);
    const { login } = handlers();
    const req = request("9.9.9.9", { email: "ana@exemplo.com", password: "senha123" });

    for (let i = 0; i < 10; i++) {
      const res = response();
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    }

    const blocked = response();
    await login(req, blocked);
    expect(blocked.status).toHaveBeenCalledWith(429);
    expect(blocked.json).toHaveBeenCalledWith({ error: "Muitas tentativas. Tente novamente mais tarde." });
  });

  it("libera o contador do login após autenticação bem-sucedida", async () => {
    const { login } = handlers();
    const req = request("8.8.8.8", { email: "ana@exemplo.com", password: "senha123" });

    dbMocks.getUserByEmail.mockResolvedValue(undefined);
    for (let i = 0; i < 9; i++) {
      const fail = response();
      await login(req, fail);
      expect(fail.status).toHaveBeenCalledWith(401);
    }

    dbMocks.getUserByEmail.mockResolvedValue(user);
    bcryptMocks.compare.mockResolvedValue(true);
    const ok = response();
    await login(req, ok);
    expect(ok.json).toHaveBeenCalledWith({ success: true });

    dbMocks.getUserByEmail.mockResolvedValue(undefined);
    for (let i = 0; i < 10; i++) {
      const fail = response();
      await login(req, fail);
      expect(fail.status).toHaveBeenCalledWith(401);
    }

    const blocked = response();
    await login(req, blocked);
    expect(blocked.status).toHaveBeenCalledWith(429);
  });

  it("responde 400 nas 10 primeiras tentativas de registro e 429 na 11ª", async () => {
    dbMocks.getUserByEmail.mockResolvedValue(user);
    const { register } = handlers();
    const req = request("7.7.7.7", { name: "Ana", email: "ana@exemplo.com", password: "senha123" });

    for (let i = 0; i < 10; i++) {
      const res = response();
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    }

    const blocked = response();
    await register(req, blocked);
    expect(blocked.status).toHaveBeenCalledWith(429);
    expect(blocked.json).toHaveBeenCalledWith({ error: "Muitas tentativas. Tente novamente mais tarde." });
  });
});
