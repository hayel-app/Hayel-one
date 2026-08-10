import { Pool } from "pg";
import { createHayelServer } from "./http.js";

const port = Number(process.env.PORT ?? 3000);
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required; refusing to start without an explicit database target");
}

const pool = new Pool({ connectionString: databaseUrl });
const server = createHayelServer(pool);

server.listen(port, () => {
  console.log(`Hayel API listening on :${port}`);
});

const shutdown = async () => {
  await pool.end();
  server.close();
};

process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
