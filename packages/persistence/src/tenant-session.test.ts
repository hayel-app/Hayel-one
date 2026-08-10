import test from "node:test";
import assert from "node:assert/strict";
import { clearTenantContext, setTenantContext, type SqlExecutor } from "./tenant-session.js";

class FakeDb implements SqlExecutor {
  calls: Array<{ sql: string; params?: readonly unknown[] }> = [];
  async query<T = unknown>(sql: string, params?: readonly unknown[]) {
    if (params === undefined) {
      this.calls.push({ sql });
    } else {
      this.calls.push({ sql, params });
    }
    return { rows: [] as T[] };
  }
}

test("tenant context is transaction-local", async () => {
  const db = new FakeDb();
  await setTenantContext(db, "tenant-a");
  assert.equal(db.calls[0]?.sql, "select set_config('app.current_tenant_id', $1, true)");
  assert.deepEqual(db.calls[0]?.params, ["tenant-a"]);
});

test("empty tenant id is rejected before database access", async () => {
  const db = new FakeDb();
  await assert.rejects(() => setTenantContext(db, "   "), /tenantId is required/);
  assert.equal(db.calls.length, 0);
});

test("tenant context can be explicitly cleared", async () => {
  const db = new FakeDb();
  await clearTenantContext(db);
  assert.equal(db.calls[0]?.sql, "select set_config('app.current_tenant_id', '', true)");
});
