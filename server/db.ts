import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { logError, logInfo } from "./lib/logger";
import { InsertUser, sessionRevocations, users } from "../drizzle/schema";

let database: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!database && process.env.DATABASE_URL) {
    try {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      database = drizzle(pool);
    } catch {
      logError("database.connection_failed");
      database = null;
    }
  }
  return database;
}

/** Cria um usuário local (email + hash de senha já calculado). */
export async function createUser(user: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  try {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  } catch (error: unknown) {
    const message = String(error);
    if (message.includes("unique") || message.includes("duplicate")) {
      throw new Error("Já existe um usuário com este e-mail.");
    }
    logError("database.user_create_failed");
    throw new Error("Não foi possível criar o usuário.");
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);
    return result[0];
  } catch {
    logError("database.user_lookup_by_email_failed");
    throw new Error("Não foi possível carregar o usuário.");
  }
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  } catch {
    logError("database.user_lookup_by_id_failed");
    throw new Error("Não foi possível carregar o usuário.");
  }
}

export async function touchLastSignedIn(id: number) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, id));
  } catch {
    logInfo("database.touch_last_signed_in_failed");
  }
}

export async function updateUserPassword(id: number, passwordHash: string) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.update(users).set({ passwordHash }).where(eq(users.id, id));
  } catch {
    logInfo("database.update_user_password_failed");
  }
}

/**
 * Registra a revogação de um jti específico (logout).
 * Usado em `auth.logout` para invalidar a sessão atual.
 */
export async function revokeSession(jti: string, userId: number, reason = "LOGOUT") {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(sessionRevocations).values({
      id: crypto.randomUUID(),
      userId: String(userId),
      jti,
      reason,
    }).onConflictDoNothing();
  } catch {
    logInfo("database.session_revoke_failed");
  }
}

/**
 * Devolve true se o jti já tiver sido revogado.
 * Chamado em cada `verifySession` para checar logout em outros dispositivos.
 */
export async function revokeSessionByJti(jti: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    const [row] = await db
      .select({ id: sessionRevocations.id })
      .from(sessionRevocations)
      .where(eq(sessionRevocations.jti, jti))
      .limit(1);
    return Boolean(row);
  } catch {
    return false;
  }
}

/**
 * Revoga todas as sessões do usuário exceto a sessão corrente (jti).
 * Chamado em login/c cadastro para invalidar sessões anteriores.
 * Remove quaisquer revogações registradas para o usuário (o jti atual
 * é válido e não deve estar na tabela de revogações).
 */
export async function revokeUserSessions(userId: number, _keepJti: string) {
  const db = await getDb();
  if (!db) return;
  try {
    await db
      .delete(sessionRevocations)
      .where(eq(sessionRevocations.userId, String(userId)));
  } catch {
    logInfo("database.revoke_user_sessions_failed");
  }
}
