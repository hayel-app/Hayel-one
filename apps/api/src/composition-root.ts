import { Pool } from "pg";
import { createHayelServer } from "./http.js";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString: databaseUrl });
export const server = createHayelServer(pool);

const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => console.log(`Hayel API listening on :${port}`));

process.on("SIGTERM", async () => {
  server.close();
  await pool.end();
});
