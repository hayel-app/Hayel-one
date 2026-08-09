import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";

const adminUrl = process.env.HAYEL_POSTGRES_ADMIN_URL;
const appUrl = process.env.HAYEL_POSTGRES_APP_URL;

if (!adminUrl || !appUrl) {
  throw new Error("SECURITY GATE MISCONFIGURED: HAYEL_POSTGRES_ADMIN_URL and HAYEL_POSTGRES_APP_URL are required; tenant isolation tests must never skip.");
}

async function connect(url: string): Promise<Client> {
  const client = new Client({ connectionString: url });
  await client.connect();
  return client;
}

test("real PostgreSQL tenant isolation attack suite", async (t) => {
  const admin = await connect(adminUrl);
  const app = await connect(appUrl);

  try {
    await admin.query("TRUNCATE employments, employees, users, organizations CASCADE");
    await admin.query(`
      INSERT INTO organizations (id, tenant_id, legal_name, country_code, currency_code, time_zone)
      VALUES
        ('00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Tenant A Org','EG','EGP','Africa/Cairo'),
        ('00000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','Tenant B Org','SA','SAR','Asia/Riyadh');
      INSERT INTO employees (id, tenant_id, organization_id, display_name)
      VALUES
        ('00000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Employee A'),
        ('00000000-0000-0000-0000-000000000022','20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','Employee B');
    `);

    await t.test("RLS is enabled and forced", async () => {
      const result = await admin.query<{ relrowsecurity: boolean; relforcerowsecurity: boolean }>(
        "SELECT relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname = 'employees'",
      );
      assert.equal(result.rows[0]?.relrowsecurity, true);
      assert.equal(result.rows[0]?.relforcerowsecurity, true);
    });

    await t.test("application role is not privileged and has no memberships", async () => {
      const role = await admin.query<{ rolsuper: boolean; rolbypassrls: boolean }>(
        "SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = 'hayel_app'",
      );
      assert.equal(role.rows.length, 1);
      assert.equal(role.rows[0]?.rolsuper, false);
      assert.equal(role.rows[0]?.rolbypassrls, false);

      const memberships = await admin.query(
        `SELECT 1 FROM pg_auth_members m
         JOIN pg_roles r ON r.oid = m.member
         JOIN pg_roles parent ON parent.oid = m.roleid
         WHERE r.rolname = 'hayel_app'`,
      );
      assert.equal(memberships.rowCount, 0);
    });

    await t.test("Tenant A sees only Tenant A", async () => {
      await app.query("BEGIN");
      await app.query("select set_config('app.current_tenant_id', $1, true)", ["10000000-0000-0000-0000-000000000001"]);
      const result = await app.query<{ display_name: string }>("SELECT display_name FROM employees ORDER BY id");
      assert.deepEqual(result.rows.map((row) => row.display_name), ["Employee A"]);
      await app.query("ROLLBACK");
    });

    await t.test("Tenant A cannot read Tenant B by direct ID", async () => {
      await app.query("BEGIN");
      await app.query("select set_config('app.current_tenant_id', $1, true)", ["10000000-0000-0000-0000-000000000001"]);
      const result = await app.query("SELECT id FROM employees WHERE id = $1", ["00000000-0000-0000-0000-000000000022"]);
      assert.equal(result.rowCount, 0);
      await app.query("ROLLBACK");
    });

    await t.test("Tenant A cannot create a Tenant B employee", async () => {
      await app.query("BEGIN");
      await app.query("select set_config('app.current_tenant_id', $1, true)", ["10000000-0000-0000-0000-000000000001"]);
      await assert.rejects(app.query(
        "INSERT INTO employees (id, tenant_id, organization_id, display_name) VALUES ($1,$2,$3,$4)",
        ["00000000-0000-0000-0000-000000000033", "20000000-0000-0000-0000-000000000002", "00000000-0000-0000-0000-000000000002", "Attack"],
      ));
      await app.query("ROLLBACK");
    });

    await t.test("Tenant A cannot update Tenant B", async () => {
      await app.query("BEGIN");
      await app.query("select set_config('app.current_tenant_id', $1, true)", ["10000000-0000-0000-0000-000000000001"]);
      const result = await app.query("UPDATE employees SET display_name = 'HACKED' WHERE id = $1 RETURNING id", ["00000000-0000-0000-0000-000000000022"]);
      assert.equal(result.rowCount, 0);
      await app.query("ROLLBACK");
    });

    await t.test("Tenant A cannot delete Tenant B", async () => {
      await app.query("BEGIN");
      await app.query("select set_config('app.current_tenant_id', $1, true)", ["10000000-0000-0000-0000-000000000001"]);
      const result = await app.query("DELETE FROM employees WHERE id = $1 RETURNING id", ["00000000-0000-0000-0000-000000000022"]);
      assert.equal(result.rowCount, 0);
      await app.query("ROLLBACK");
    });

    await t.test("manipulated tenant identifier cannot expose Tenant B", async () => {
      await app.query("BEGIN");
      await app.query("select set_config('app.current_tenant_id', $1, true)", ["10000000-0000-0000-0000-000000000001"]);
      const result = await app.query("SELECT id FROM employees WHERE tenant_id = $1", ["20000000-0000-0000-0000-000000000002"]);
      assert.equal(result.rowCount, 0);
      await app.query("ROLLBACK");
    });

    await t.test("missing tenant context fails closed", async () => {
      await app.query("BEGIN");
      const result = await app.query("SELECT id FROM employees");
      assert.equal(result.rowCount, 0);
      await app.query("ROLLBACK");
    });

    await t.test("connection contamination is impossible across transactions", async () => {
      await app.query("BEGIN");
      await app.query("select set_config('app.current_tenant_id', $1, true)", ["10000000-0000-0000-0000-000000000001"]);
      const a = await app.query("SELECT display_name FROM employees ORDER BY id");
      assert.deepEqual(a.rows.map((r) => r.display_name), ["Employee A"]);
      await app.query("COMMIT");

      await app.query("BEGIN");
      const withoutContext = await app.query("SELECT display_name FROM employees ORDER BY id");
      assert.equal(withoutContext.rowCount, 0);
      await app.query("ROLLBACK");

      await app.query("BEGIN");
      await app.query("select set_config('app.current_tenant_id', $1, true)", ["20000000-0000-0000-0000-000000000002"]);
      const b = await app.query("SELECT display_name FROM employees ORDER BY id");
      assert.deepEqual(b.rows.map((r) => r.display_name), ["Employee B"]);
      await app.query("ROLLBACK");
    });

    await t.test("rollback does not contaminate the next transaction", async () => {
      await app.query("BEGIN");
      await app.query("select set_config('app.current_tenant_id', $1, true)", ["10000000-0000-0000-0000-000000000001"]);
      await app.query("ROLLBACK");

      await app.query("BEGIN");
      const result = await app.query("SELECT id FROM employees");
      assert.equal(result.rowCount, 0);
      await app.query("ROLLBACK");
    });
  } finally {
    await app.end();
    await admin.end();
  }
});
