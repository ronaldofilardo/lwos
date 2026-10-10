/**
 * Fase 10 — «Todas as migrations aplicam do zero»: cria um banco descartável,
 * aplica as 13 migrations do journal do zero e compara o schema resultante
 * com o banco de desenvolvimento. Ao final, o banco descartável é removido.
 *
 * Uso: pnpm exec tsx scripts/check-migrations-fresh.ts
 */
import "dotenv/config";
import { execSync } from "node:child_process";
import { Client } from "pg";

const FRESH_DB = "lwos_migration_check";
const originalUrl = process.env.DATABASE_URL ?? "";
if (!originalUrl) throw new Error("DATABASE_URL ausente.");

const adminUrl = originalUrl.replace(/\/[^/?]+(\?|$)/, "/postgres$1");
const freshUrl = originalUrl.replace(/\/[^/?]+(\?|$)/, `/${FRESH_DB}$1`);

async function connect(url: string) {
  const client = new Client({ connectionString: url });
  await client.connect();
  return client;
}

async function main() {
  const admin = await connect(adminUrl);
  await admin.query(`DROP DATABASE IF EXISTS ${FRESH_DB} WITH (FORCE)`);
  await admin.query(`CREATE DATABASE ${FRESH_DB}`);
  await admin.end();
  console.log(`Banco criado do zero: ${FRESH_DB}`);

  try {
    execSync("pnpm exec drizzle-kit migrate", {
      env: { ...process.env, DATABASE_URL: freshUrl },
      stdio: "inherit",
    });

    const fresh = await connect(freshUrl);
    const live = await connect(originalUrl);

    const schemaOf = async (client: Client) => {
      const tables = await client.query(
        `select table_name from information_schema.tables
         where table_schema = 'public' and table_type = 'BASE TABLE'
         order by table_name`
      );
      const migrations = await client.query(
        `select count(*)::int as n from drizzle.__drizzle_migrations`
      );
      const columns = await client.query(
        `select table_name, column_name from information_schema.columns
         where table_schema = 'public' order by table_name, column_name`
      );
      return {
        tables: tables.rows.map((r: { table_name: string }) => r.table_name),
        migrations: migrations.rows[0].n as number,
        columns: columns.rows.map(
          (r: { table_name: string; column_name: string }) =>
            `${r.table_name}.${r.column_name}`
        ),
      };
    };

    const freshSchema = await schemaOf(fresh);
    const liveSchema = await schemaOf(live);
    let failed = 0;
    const check = (cond: boolean, label: string, detail = "") => {
      console.log(`${cond ? "  ok" : "FAIL"}  ${label}${cond ? "" : ` -> ${detail}`}`);
      if (!cond) failed += 1;
    };

    check(
      freshSchema.migrations === liveSchema.migrations,
      `migrations aplicadas do zero (${freshSchema.migrations}/${liveSchema.migrations})`,
      `${freshSchema.migrations} != ${liveSchema.migrations}`
    );
    check(
      JSON.stringify(freshSchema.tables) === JSON.stringify(liveSchema.tables),
      `mesmas tabelas do banco de dev (${freshSchema.tables.length})`,
      freshSchema.tables
        .filter(t => !liveSchema.tables.includes(t))
        .concat(liveSchema.tables.filter(t => !freshSchema.tables.includes(t)))
        .join(",")
    );
    check(
      JSON.stringify(freshSchema.columns) === JSON.stringify(liveSchema.columns),
      "mesmas colunas do banco de dev",
      freshSchema.columns
        .filter(c => !liveSchema.columns.includes(c))
        .concat(liveSchema.columns.filter(c => !freshSchema.columns.includes(c)))
        .join(",")
    );
    check(
      !freshSchema.columns.includes("families.civilStatus"),
      "families.civilStatus removida (Fase 2)"
    );
    check(
      !freshSchema.columns.includes("otherAssets.marketValue"),
      "otherAssets.marketValue removida (Fase 2)"
    );
    check(
      freshSchema.columns.includes("properties.encumbranceType"),
      "properties.encumbranceType existe (Fase 2)"
    );

    await fresh.end();
    await live.end();
    console.log(failed ? `\n${failed} falha(s).` : "\nSchema do zero idêntico ao dev.");
    if (failed) process.exitCode = 1;
  } finally {
    const admin = await connect(adminUrl);
    await admin.query(`DROP DATABASE IF EXISTS ${FRESH_DB} WITH (FORCE)`);
    await admin.end();
    console.log(`Banco ${FRESH_DB} removido.`);
  }
}

main().catch(error => {
  console.error("Falha:", error instanceof Error ? error.message : error);
  process.exit(1);
});
