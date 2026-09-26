import { getDb } from "../../db";

export async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  return db;
}
