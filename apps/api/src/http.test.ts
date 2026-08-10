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

test("API rejects requests without tenant context", async () => {
  const server = createHayelServer(new FakePool());
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/employees`);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "tenant_context_required" });
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});
