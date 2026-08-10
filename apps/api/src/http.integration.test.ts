import test from "node:test";
import assert from "node:assert/strict";
import { Pool } from "pg";
import { createHayelServer } from "./http.js";

const databaseUrl = process.env.DATABASE_URL;

test("real PostgreSQL API enforces tenant isolation", async (t) => {
  if (!databaseUrl) {
    t.skip("DATABASE_URL is required for the PostgreSQL integration suite");
    return;
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const server = createHayelServer(pool);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}`;

  try {
    const missingTenant = await fetch(`${base}/api/v1/employees`);
    assert.equal(missingTenant.status, 400);

    const tenantA = await fetch(`${base}/api/v1/employees`, {
      headers: { "x-tenant-id": "tenant-a" },
    });
    assert.equal(tenantA.status, 200);

    const tenantB = await fetch(`${base}/api/v1/employees`, {
      headers: { "x-tenant-id": "tenant-b" },
    });
    assert.equal(tenantB.status, 200);

    const aRows = (await tenantA.json()).data as Array<{ tenant_id: string }>;
    const bRows = (await tenantB.json()).data as Array<{ tenant_id: string }>;
    assert.ok(aRows.every((row) => row.tenant_id === "tenant-a"));
    assert.ok(bRows.every((row) => row.tenant_id === "tenant-b"));
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await pool.end();
  }
});
