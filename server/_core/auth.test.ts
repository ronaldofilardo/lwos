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
  updateUserPassword: vi.fn(),
}));
const bcryptMocks = vi.hoisted(() => ({ hash: vi.fn(), compare: vi.fn() }));

vi.mock("../db", () => dbMocks);
vi.mock("bcryptjs", () => ({ default: bcryptMocks }));
vi.mock("./env", () => ({ ENV: { cookieSecret: "teste-seguro" } }));

import { loginWithPassword, registerAuthRoutes, registerUser, authenticateRequest } from "./auth";
import { resetRateLimits } from "./rateLimit";
import { SignJWT } from "jose";
import { COOKIE_NAME } from "../../shared/const";

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

  it("provisiona socio@adv.com automaticamente caso não exista no banco quando a senha for 123456", async () => {
    dbMocks.getUserByEmail.mockResolvedValue(undefined);
    bcryptMocks.hash.mockResolvedValue("hash-123456");
    bcryptMocks.compare.mockResolvedValue(true);
    const socioUser = { id: 10, name: "Sócio Responsável", email: "socio@adv.com", role: "SOCIO", passwordHash: "hash-123456" };
    dbMocks.createUser.mockResolvedValue(socioUser);

    const logged = await loginWithPassword("socio@adv.com", "123456");
    expect(logged).toEqual(socioUser);
    expect(dbMocks.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Sócio Responsável", email: "socio@adv.com", role: "SOCIO" })
    );
    expect(dbMocks.touchLastSignedIn).toHaveBeenCalledWith(10);
  });

  it("sincroniza a senha de socio@adv.com caso o banco contenha um hash antigo de seed e a senha seja 123456", async () => {
    const existingSocio = { id: 10, name: "Sócio", email: "socio@adv.com", role: "SOCIO", passwordHash: "hash-antigo" };
    dbMocks.getUserByEmail.mockResolvedValue(existingSocio);
    bcryptMocks.compare.mockResolvedValue(false);
    bcryptMocks.hash.mockResolvedValue("hash-novo-123456");

    const logged = await loginWithPassword("socio@adv.com", "123456");
    expect(logged).toEqual(existingSocio);
    expect(dbMocks.updateUserPassword).toHaveBeenCalledWith(10, "hash-novo-123456");
    expect(dbMocks.touchLastSignedIn).toHaveBeenCalledWith(10);
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

describe("auth rotas com sucesso", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimits();
  });

  it("valida os campos obrigatórios do cadastro antes de tocar na base", async () => {
    const { register } = handlers();
    const res = response();

    await register(request("5.5.5.5", { name: "Ana" }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Nome, e-mail e senha são obrigatórios." });
    expect(dbMocks.createUser).not.toHaveBeenCalled();
  });

  it("emite cookie de sessão utilizável no login e no cadastro", async () => {
    const { login, register } = handlers();

    dbMocks.getUserByEmail.mockResolvedValue(user);
    bcryptMocks.compare.mockResolvedValue(true);
    const loginRes = response();
    await login(request("6.6.6.6", { email: "ana@exemplo.com", password: "senha123" }), loginRes);

    expect(loginRes.json).toHaveBeenCalledWith({ success: true });
    const [cookieName, token] = loginRes.cookie.mock.calls[0];
    expect(cookieName).toBe(COOKIE_NAME);
    expect(typeof token).toBe("string");
    dbMocks.getUserById.mockResolvedValue(user);
    await expect(
      authenticateRequest({ headers: { cookie: `${COOKIE_NAME}=${token}` } } as never)
    ).resolves.toBe(user);

    dbMocks.getUserByEmail.mockResolvedValue(undefined);
    bcryptMocks.hash.mockResolvedValue("hash-novo");
    dbMocks.createUser.mockResolvedValue(user);
    const registerRes = response();
    await register(
      request("6.6.6.6", { name: "Ana", email: "ana@exemplo.com", password: "senha123" }),
      registerRes
    );

    expect(registerRes.json).toHaveBeenCalledWith({ success: true });
    expect(registerRes.cookie.mock.calls[0][0]).toBe(COOKIE_NAME);
    expect(registerRes.status).not.toHaveBeenCalled();
  });

  it("valida o corpo ausente no login e no cadastro antes de qualquer consulta", async () => {
    const { login, register } = handlers();
    const bareReq = { headers: {}, hostname: "localhost", protocol: "http" } as never;

    const loginRes = response();
    await login(bareReq, loginRes);
    expect(loginRes.status).toHaveBeenCalledWith(400);
    expect(loginRes.json).toHaveBeenCalledWith({ error: "E-mail e senha são obrigatórios." });

    const registerRes = response();
    await register(bareReq, registerRes);
    expect(registerRes.status).toHaveBeenCalledWith(400);
    expect(registerRes.json).toHaveBeenCalledWith({ error: "Nome, e-mail e senha são obrigatórios." });
    expect(dbMocks.getUserByEmail).not.toHaveBeenCalled();
  });

  it("usa ip padrão quando ausente e responde 'Falha no login' para erro não-Error", async () => {
    const { login } = handlers();
    dbMocks.getUserByEmail.mockRejectedValue("erro-opaco");
    const res = response();

    await login(
      { headers: {}, hostname: "localhost", protocol: "http", body: { email: "a@b.com", password: "senha123" } } as never,
      res
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Falha no login." });
  });

  it("usa ip padrão no cadastro e responde 'Falha no cadastro' para erro não-Error", async () => {
    const { register } = handlers();
    dbMocks.getUserByEmail.mockRejectedValue("erro-opaco");
    const res = response();

    await register(
      { headers: {}, hostname: "localhost", protocol: "http", body: { name: "Ana", email: "a@b.com", password: "senha123" } } as never,
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Falha no cadastro." });
  });

  it("provisiona admin@adv.com sem usuário e sobrevive à corrida de inserção", async () => {
    const admin = {
      id: 11,
      name: "Administrador",
      email: "admin@adv.com",
      role: "ADMIN",
      passwordHash: "hash-admin",
    };

    dbMocks.getUserByEmail.mockResolvedValue(undefined);
    bcryptMocks.hash.mockResolvedValue("hash-admin");
    dbMocks.createUser.mockResolvedValue(admin);
    bcryptMocks.compare.mockResolvedValue(true);
    await expect(loginWithPassword("admin@adv.com", "123456")).resolves.toBe(admin);
    expect(dbMocks.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Administrador", role: "ADMIN", email: "admin@adv.com" })
    );

    dbMocks.getUserByEmail.mockReset().mockResolvedValueOnce(undefined).mockResolvedValueOnce(admin);
    dbMocks.createUser.mockReset().mockRejectedValueOnce(new Error("chave duplicada"));
    await expect(loginWithPassword("admin@adv.com", "123456")).resolves.toBe(admin);
    expect(dbMocks.getUserByEmail).toHaveBeenLastCalledWith("admin@adv.com");
  });

  it("sincroniza o hash antigo também para admin@adv.com com a senha bootstrap", async () => {
    const staleAdmin = {
      id: 12,
      name: "Administrador",
      email: "admin@adv.com",
      role: "ADMIN",
      passwordHash: "hash-velho",
    };
    dbMocks.getUserByEmail.mockResolvedValue(staleAdmin);
    bcryptMocks.compare.mockResolvedValue(false);
    bcryptMocks.hash.mockResolvedValue("hash-novo");

    await expect(loginWithPassword("admin@adv.com", "123456")).resolves.toBe(staleAdmin);
    expect(dbMocks.updateUserPassword).toHaveBeenCalledWith(12, "hash-novo");
  });
});

async function sessionCookie(
  payload: Record<string, unknown>,
  options: { secret?: string; expiresInSec?: number } = {}
) {
  const key = new TextEncoder().encode(options.secret ?? "teste-seguro");
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(Math.floor(Date.now() / 1000) + (options.expiresInSec ?? 60))
    .sign(key);
  return `${COOKIE_NAME}=${token}`;
}

function sessionRequest(cookieHeader?: string) {
  return { headers: cookieHeader ? { cookie: cookieHeader } : {} } as never;
}

describe("authenticateRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimits();
  });

  it("rejeita requisição sem cookie, com token corrompido ou assinado por outra chave", async () => {
    await expect(authenticateRequest(sessionRequest())).rejects.toMatchObject({
      statusCode: 403,
      message: "Sessão inválida ou ausente",
    });
    await expect(authenticateRequest(sessionRequest(`${COOKIE_NAME}=lixo`))).rejects.toMatchObject({
      statusCode: 403,
    });

    const forged = await sessionCookie({ userId: 7 }, { secret: "outra-chave" });
    await expect(authenticateRequest(sessionRequest(forged))).rejects.toMatchObject({ statusCode: 403 });

    expect(dbMocks.getUserById).not.toHaveBeenCalled();
  });

  it("rejeita sessão expirada e payload cujo userId não é numérico", async () => {
    const expired = await sessionCookie({ userId: 7 }, { expiresInSec: -60 });
    await expect(authenticateRequest(sessionRequest(expired))).rejects.toMatchObject({ statusCode: 403 });

    const wrongPayload = await sessionCookie({ userId: "7" });
    await expect(authenticateRequest(sessionRequest(wrongPayload))).rejects.toMatchObject({ statusCode: 403 });
  });

  it("resolve o usuário da sessão válida ignorando os demais cookies do cabeçalho", async () => {
    dbMocks.getUserById.mockResolvedValue(user);
    const cookieHeader = `${await sessionCookie({ userId: 7 })}; outro=valor; app_session_id_extra=x`;

    await expect(authenticateRequest(sessionRequest(cookieHeader))).resolves.toBe(user);
    expect(dbMocks.getUserById).toHaveBeenCalledWith(7);
  });

  it("rejeita sessão válida quando o usuário já não existe", async () => {
    dbMocks.getUserById.mockResolvedValue(undefined);
    const cookie = await sessionCookie({ userId: 999 });

    await expect(authenticateRequest(sessionRequest(cookie))).rejects.toMatchObject({
      statusCode: 403,
      message: "Usuário não encontrado",
    });
  });
});
