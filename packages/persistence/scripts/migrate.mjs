import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const here = dirname(fileURLToPath(import.meta.url));
const schemaDir = join(here, "../schema");
const files = (await readdir(schemaDir))
  .filter((f) => /^\d+_[A-Za-z0-9_-]+\.sql$/.test(f))
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

if (files.length === 0) throw new Error("No numbered schema migrations found");

const client = new Client({ connectionString: databaseUrl });
await client.connect();
try {
  await client.query("BEGIN");
  await client.query(`CREATE TABLE IF NOT EXISTS hayel_schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
  const appliedRows = await client.query("SELECT version FROM hayel_schema_migrations ORDER BY version");
  const applied = new Set(appliedRows.rows.map((r) => r.version));

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(join(schemaDir, file), "utf8");
    if (!sql.trim()) throw new Error(`Migration ${file} is empty`);
    console.log(`applying ${file}`);
    await client.query(sql);
    await client.query("INSERT INTO hayel_schema_migrations(version) VALUES($1)", [file]);
  }

  const appPassword = process.env.HAYEL_APP_PASSWORD;
  if (appPassword) {
    await client.query("ALTER ROLE hayel_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS");
    await client.query(`ALTER ROLE hayel_app PASSWORD '${appPassword.replaceAll("'", "''")}'`);
  }

  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
