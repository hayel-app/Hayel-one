import test from "node:test";
import assert from "node:assert/strict";

import { createHayelServer } from "./http.js";

class FakePool {
  async connect() {
    return {
      async query<T = unknown>(sql: string, params?: readonly unknown[]) {
        if (sql === "BEGIN" || sql === "COMMIT" || sql === "ROLLBACK" || sql.includes("set_config")) return { rows: [] as T[] };
        if (sql.includes("FROM organizations")) return { rows: [] as T[] };
        if (sql.includes("FROM employees")) return { rows: [] as T[] };
        return { rows: [] as T[] };
      },
      release() {},
    };
  }
}

async function startServer() {
  const server = createHayelServer(new FakePool());
  await new Promise<void>((resolve, reject) => server.listen(0, "127.0.0.1", (error) => (error ? reject(error) : resolve())));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  return { server, base: `http://127.0.0.1:${address.port}` };
}

async function stopServer(server: ReturnType<typeof createHayelServer>) {
  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

test("API rejects requests without tenant context", async () => {
  const { server, base } = await startServer();
  try {
    const response = await fetch(`${base}/api/v1/employees`);
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "tenant_context_required" });
  } finally {
    await stopServer(server);
  }
});

test("API rejects malformed tenant context", async () => {
  const { server, base } = await startServer();
  try {
    const response = await fetch(`${base}/api/v1/employees`, {
      headers: { "x-tenant-id": "tenant-a" },
    });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "tenant_context_required" });
  } finally {
    await stopServer(server);
  }
});
