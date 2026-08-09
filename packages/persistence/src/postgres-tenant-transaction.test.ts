import test from "node:test";
import assert from "node:assert/strict";
import { withTenantTransaction, type TransactionClient, type TransactionPool } from "./postgres-tenant-transaction.js";

class FakeClient implements TransactionClient {
  calls: string[] = [];
  released = false;
  async query<T = unknown>(sql: string): Promise<{ rows: T[] }> {
    this.calls.push(sql);
    return { rows: [] as T[] };
  }
  release(): void { this.released = true; }
}

class FakePool implements TransactionPool {
  constructor(readonly client = new FakeClient()) {}
  async connect(): Promise<TransactionClient> { return this.client; }
}

test("tenant transaction establishes context before work and commits", async () => {
  const pool = new FakePool();
  const result = await withTenantTransaction(pool, "tenant-a", async (db) => {
    assert.equal(pool.client.calls[0], "BEGIN");
    assert.equal(pool.client.calls[1], "select set_config('app.current_tenant_id', $1, true)");
    assert.equal(db, pool.client);
    return "ok";
  });
  assert.equal(result, "ok");
  assert.equal(pool.client.calls.at(-2), "select set_config('app.current_tenant_id', '', true)");
  assert.equal(pool.client.calls.at(-1), "COMMIT");
  assert.equal(pool.client.released, true);
});

test("tenant transaction rolls back when work fails", async () => {
  const pool = new FakePool();
  await assert.rejects(() => withTenantTransaction(pool, "tenant-a", async () => {
    throw new Error("boom");
  }), /boom/);
  assert.equal(pool.client.calls.at(-1), "ROLLBACK");
  assert.equal(pool.client.released, true);
});
