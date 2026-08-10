import test from "node:test";
import assert from "node:assert/strict";
import { EmployeeRepository } from "./employee-repository.js";

class FakeClient {
  queries: Array<{ sql: string; params?: readonly unknown[] }> = [];
  async query<T = unknown>(sql: string, params?: readonly unknown[]) {
    this.queries.push({ sql, params });
    return { rows: [] as T[] };
  }
  release() {}
}

class FakePool {
  readonly client = new FakeClient();
  async connect() { return this.client; }
}

test("employee repository establishes transaction-local tenant context", async () => {
  const pool = new FakePool();
  await new EmployeeRepository(pool).list("tenant-a");
  assert.equal(pool.client.queries[0]?.sql, "BEGIN");
  assert.match(pool.client.queries[1]?.sql ?? "", /set_config\('app\.current_tenant_id'/);
  assert.equal(pool.client.queries.at(-2)?.sql, "select set_config('app.current_tenant_id', '', true)");
  assert.equal(pool.client.queries.at(-1)?.sql, "COMMIT");
});
