// @ts-nocheck
import { ForbiddenError } from "../../shared/_core/errors";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const";
import bcrypt from "bcryptjs";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import { createUser, getUserByEmail, getUserById, touchLastSignedIn } from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { RateLimitError, checkRateLimit, resetRateLimit } from "./rateLimit";

const BCRYPT_ROUNDS = 12;

type SessionPayload = { userId: number };

function getSessionSecret() {
  if (!ENV.cookieSecret) {
    throw new Error("JWT_SECRET não configurado. Defina em .env.local.");
  }
  return new TextEncoder().encode(ENV.cookieSecret);
}

async function signSession(userId: number, expiresInMs = ONE_YEAR_MS): Promise<string> {
  const expirationSeconds = Math.floor((Date.now() + expiresInMs) / 1000);
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(getSessionSecret());
}

async function verifySession(cookieValue: string | undefined | null): Promise<SessionPayload | null> {
  if (!cookieValue) return null;
  try {
    const { payload } = await jwtVerify(cookieValue, getSessionSecret(), { algorithms: ["HS256"] });
    const { userId } = payload as Record<string, unknown>;
    if (typeof userId !== "number") return null;
    return { userId };
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string | undefined) {
  if (!cookieHeader) return new Map<string, string>();
  return new Map(Object.entries(parseCookieHeader(cookieHeader)));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const MIN_PASSWORD_LENGTH = 6;

function assertValidPassword(password: string) {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  }
}

function assertValidEmail(email: string) {
  const isValid = typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValid) throw new Error("E-mail inválido.");
}

/** Cria um novo usuário local com senha. Uso: cadastro/admin — não é auto-cadastro público por padrão. */
export async function registerUser(input: { name: string; email: string; password: string }): Promise<User> {
  const email = normalizeEmail(input.email);
  assertValidEmail(email);
  assertValidPassword(input.password);

  const existing = await getUserByEmail(email);
  if (existing) throw new Error("Já existe um usuário com este e-mail.");

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const created = await createUser({
    name: input.name?.trim() || null,
    email,
    passwordHash,
    role: "CLIENTE",
    lastSignedIn: new Date(),
  });
  return created;
}

/** Autentica email+senha e retorna o usuário, ou lança erro se inválido. */
export async function loginWithPassword(email: string, password: string): Promise<User> {
  const normalizedEmail = normalizeEmail(email);
  const user = await getUserByEmail(normalizedEmail);
  if (!user) throw new Error("E-mail ou senha inválidos.");

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) throw new Error("E-mail ou senha inválidos.");

  await touchLastSignedIn(user.id);
  return user;
}

export function registerAuthRoutes(app: Express) {
  app.post(["/api/auth/login", "/auth/login"], async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ error: "E-mail e senha são obrigatórios." });
      return;
    }

    const ip = req.ip ?? "unknown";
    const credKey = `login:cred:${ip}:${normalizeEmail(email)}`;
    const ipKey = `login:ip:${ip}`;
    try {
      checkRateLimit(credKey, 10);
      checkRateLimit(ipKey, 30);
      const user = await loginWithPassword(email, password);
      const sessionToken = await signSession(user.id);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      resetRateLimit(credKey);
      resetRateLimit(ipKey);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof RateLimitError) {
        res.status(429).json({ error: error.message });
        return;
      }
      res.status(401).json({ error: error instanceof Error ? error.message : "Falha no login." });
    }
  });

  app.post(["/api/auth/register", "/auth/register"], async (req: Request, res: Response) => {
    const { name, email, password } = req.body ?? {};
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
      return;
    }

    try {
      checkRateLimit(`register:ip:${req.ip ?? "unknown"}`, 10);
      const user = await registerUser({ name, email, password });
      const sessionToken = await signSession(user.id);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true });
    } catch (error) {
      if (error instanceof RateLimitError) {
        res.status(429).json({ error: error.message });
        return;
      }
      res.status(400).json({ error: error instanceof Error ? error.message : "Falha no cadastro." });
    }
  });
}

/** Usado pelo contexto tRPC em cada request. */
export async function authenticateRequest(req: Request): Promise<User> {
  const cookies = parseCookies(req.headers.cookie);
  const sessionToken = cookies.get(COOKIE_NAME);

  const session = await verifySession(sessionToken);
  if (!session) throw ForbiddenError("Sessão inválida ou ausente");

  const user = await getUserById(session.userId);
  if (!user) throw ForbiddenError("Usuário não encontrado");

  return user;
}

