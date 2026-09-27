import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { logError, logInfo } from "./lib/logger";
import { InsertUser, users } from "../drizzle/schema";

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
