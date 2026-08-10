import test from "node:test";
import assert from "node:assert/strict";
import { Pool } from "pg";
import { createHayelServer } from "./http.js";

const adminUrl = process.env.HAYEL_POSTGRES_ADMIN_URL;
const appUrl = process.env.HAYEL_POSTGRES_APP_URL;

if (!adminUrl || !appUrl) {
  throw new Error("API integration gate misconfigured: HAYEL_POSTGRES_ADMIN_URL and HAYEL_POSTGRES_APP_URL are required");
}

const TENANT_A = "10000000-0000-0000-0000-000000000001";
const TENANT_B = "20000000-0000-0000-0000-000000000002";
const ORG_A = "00000000-0000-0000-0000-000000000001";
const ORG_B = "00000000-0000-0000-0000-000000000002";
const EMP_A = "00000000-0000-0000-0000-000000000011";
const EMP_B = "00000000-0000-0000-0000-000000000022";

const seed = async (admin: Pool) => {
  await admin.query("TRUNCATE employments, employees, users, organizations CASCADE");
  await admin.query(
    `INSERT INTO organizations (id, tenant_id, legal_name, country_code, currency_code, time_zone)
     VALUES ($1,$3,'Tenant A Org','EG','EGP','Africa/Cairo'), ($2,$4,'Tenant B Org','SA','SAR','Asia/Riyadh')`,
    [ORG_A, ORG_B, TENANT_A, TENANT_B],
  );
  await admin.query(
    `INSERT INTO employees (id, tenant_id, organization_id, display_name)
     VALUES ($1,$3,$5,'Employee A'), ($2,$4,$6,'Employee B')`,
    [EMP_A, EMP_B, TENANT_A, TENANT_B, ORG_A, ORG_B],
  );
};

test("real PostgreSQL API enforces tenant isolation", { timeout: 60_000 }, async () => {
  const admin = new Pool({ connectionString: adminUrl });
  const app = new Pool({ connectionString: appUrl });
  const server = createHayelServer(app);
  let listening = false;

  try {
    await seed(admin);
    await new Promise<void>((resolve, reject) => {
      const onError = (error: Error) => reject(error);
      server.once("error", onError);
      server.listen(0, "127.0.0.1", () => {
        server.off("error", onError);
        listening = true;
        resolve();
      });
    });

    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const base = `http://127.0.0.1:${address.port}`;

    const missingTenant = await fetch(`${base}/api/v1/employees`);
    assert.equal(missingTenant.status, 400);

    const invalidTenant = await fetch(`${base}/api/v1/employees`, {
      headers: { "x-tenant-id": "not-a-uuid" },
    });
    assert.equal(invalidTenant.status, 400);

    const tenantA = await fetch(`${base}/api/v1/employees`, {
      headers: { "x-tenant-id": TENANT_A },
    });
    assert.equal(tenantA.status, 200);

    const tenantB = await fetch(`${base}/api/v1/employees`, {
      headers: { "x-tenant-id": TENANT_B },
    });
    assert.equal(tenantB.status, 200);

    const aRows = (await tenantA.json()).data as Array<{ id: string; tenant_id: string }>;
    const bRows = (await tenantB.json()).data as Array<{ id: string; tenant_id: string }>;
    assert.deepEqual(aRows.map((row) => row.id), [EMP_A]);
    assert.deepEqual(bRows.map((row) => row.id), [EMP_B]);
    assert.ok(aRows.every((row) => row.tenant_id === TENANT_A));
    assert.ok(bRows.every((row) => row.tenant_id === TENANT_B));

    const crossTenant = await fetch(`${base}/api/v1/employees/${EMP_B}`, {
      headers: { "x-tenant-id": TENANT_A },
    });
    assert.equal(crossTenant.status, 404);
  } finally {
    if (listening) {
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
    await app.end();
    try {
      await admin.query("TRUNCATE employments, employees, users, organizations CASCADE");
    } finally {
      await admin.end();
    }
  }
});
