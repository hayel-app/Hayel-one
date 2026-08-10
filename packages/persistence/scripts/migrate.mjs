import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const here = dirname(fileURLToPath(import.meta.url));
const schemaDir = join(here, "../schema");
const files = (await readdir(schemaDir)).filter((f) => /^\d+_.*\.sql$/.test(f)).sort();

const client = new Client({ connectionString: databaseUrl });
await client.connect();
try {
  await client.query("BEGIN");
  await client.query(`CREATE TABLE IF NOT EXISTS hayel_schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
  const applied = new Set((await client.query("SELECT version FROM hayel_schema_migrations")).rows.map((r) => r.version));
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(join(schemaDir, file), "utf8");
    await client.query(sql);
    await client.query("INSERT INTO hayel_schema_migrations(version) VALUES($1)", [file]);
    console.log(`applied ${file}`);
  }
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
