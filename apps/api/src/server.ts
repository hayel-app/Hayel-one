import { createServer } from "node:http";
import { createHayelServer } from "./http.js";

const port = Number(process.env.PORT ?? 3000);

// The database pool is intentionally injected by the runtime composition root.
// Until infrastructure wiring is configured, keep the service explicit rather than
// silently connecting with unsafe defaults.
const server = createServer((_request, response) => {
  response.writeHead(503, { "content-type": "application/json" });
  response.end(JSON.stringify({ error: "persistence_not_configured" }));
});

void createHayelServer;

server.listen(port, () => {
  console.log(`Hayel API listening on :${port}`);
});
