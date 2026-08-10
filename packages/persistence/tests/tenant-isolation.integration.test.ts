import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";

const adminUrl = process.env.HAYEL_POSTGRES_ADMIN_URL;
const appUrl = process.env.HAYEL_POSTGRES_APP_URL;

if (!adminUrl || !appUrl) {
  throw new Error("SECURITY GATE MISCONFIGURED: HAYEL_POSTGRES_ADMIN_URL and HAYEL_POSTGRES_APP_URL are required; tenant isolation tests must never skip.");
}

const clientConfig = { connectionTimeoutMillis: 10_000, query_timeout: 10_000 };

async function connect(url: string): Promise<Client> {
  const client = new Client({ connectionString: url, ...clientConfig });
  await client.connect();
  return client;
}

const tenantA = "10000000-0000-0000-0000-000000000001";
const tenantB = "20000000-0000-0000-0000-000000000002";
const employeeA = "00000000-0000-0000-0000-000000000011";
const employeeB = "00000000-0000-0000-0000-000000000022";

test("real PostgreSQL tenant isolation attack suite", { timeout: 60_000 }, async (t) => {
  const admin = await connect(adminUrl);
  const app = await connect(appUrl);

  try {
    await admin.query("TRUNCATE employments, employees, users, organizations CASCADE");
    await admin.query(`
      INSERT INTO organizations (id, tenant_id, legal_name, country_code, currency_code, time_zone)
      VALUES
        ('00000000-0000-0000-0000-000000000001','${tenantA}','Tenant A Org','EG','EGP','Africa/Cairo'),
        ('00000000-0000-0000-0000-000000000002','${tenantB}','Tenant B Org','SA','SAR','Asia/Riyadh');
      INSERT INTO employees (id, tenant_id, organization_id, display_name)
      VALUES
        ('${employeeA}','${tenantA}','00000000-0000-0000-0000-000000000001','Employee A'),
        ('${employeeB}','${tenantB}','00000000-0000-0000-0000-000000000002','Employee B');
      INSERT INTO employments (id, tenant_id, employee_id, organization_id, status, start_date)
      VALUES
        ('00000000-0000-0000-0000-000000000111','${tenantA}','${employeeA}','00000000-0000-0000-0000-000000000001','active','2026-01-01'),
        ('00000000-0000-0000-0000-000000000222','${tenantB}','${employeeB}','00000000-0000-0000-0000-000000000002','active','2026-01-01');
    `);

    await t.test("RLS is enabled and forced", async () => {
      const result = await admin.query<{ relrowsecurity: boolean; relforcerowsecurity: boolean }>(
        "SELECT relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname IN ('employees','employments') ORDER BY relname",
      );
      assert.deepEqual(result.rows, [
        { relrowsecurity: true, relforcerowsecurity: true },
        { relrowsecurity: true, relforcerowsecurity: true },
      ]);
    });

    await t.test("application role is not privileged and has no memberships", async () => {
      const role = await admin.query<{ rolsuper: boolean; rolbypassrls: boolean }>(
        "SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = 'hayel_app'",
      );
      assert.equal(role.rows.length, 1);
      assert.equal(role.rows[0]?.rolsuper, false);
      assert.equal(role.rows[0]?.rolbypassrls, false);
      const memberships = await admin.query(
        `SELECT 1 FROM pg_auth_members m JOIN pg_roles r ON r.oid = m.member WHERE r.rolname = 'hayel_app'`,
      );
      assert.equal(memberships.rowCount, 0);
    });

    await t.test("Tenant A sees only Tenant A employees and employments", async () => {
      await app.query("BEGIN");
      try {
        await app.query("select set_config('app.current_tenant_id', $1, true)", [tenantA]);
        const employees = await app.query<{ display_name: string }>("SELECT display_name FROM employees ORDER BY id");
        assert.deepEqual(employees.rows.map((row) => row.display_name), ["Employee A"]);
        const employments = await app.query<{ employee_id: string }>("SELECT employee_id FROM employments ORDER BY id");
        assert.deepEqual(employments.rows.map((row) => row.employee_id), [employeeA]);
      } finally { await app.query("ROLLBACK"); }
    });

    await t.test("Tenant A cannot read Tenant B employee or employment by direct ID", async () => {
      await app.query("BEGIN");
      try {
        await app.query("select set_config('app.current_tenant_id', $1, true)", [tenantA]);
        const employee = await app.query("SELECT id FROM employees WHERE id = $1", [employeeB]);
        assert.equal(employee.rowCount, 0);
        const employment = await app.query("SELECT id FROM employments WHERE id = $1", ["00000000-0000-0000-0000-000000000222"]);
        assert.equal(employment.rowCount, 0);
      } finally { await app.query("ROLLBACK"); }
    });

    await t.test("Tenant A cannot create Tenant B employee or employment", async () => {
      await app.query("BEGIN");
      try {
        await app.query("select set_config('app.current_tenant_id', $1, true)", [tenantA]);
        await assert.rejects(app.query(
          "INSERT INTO employees (id, tenant_id, organization_id, display_name) VALUES ($1,$2,$3,$4)",
          ["00000000-0000-0000-0000-000000000033", tenantB, "00000000-0000-0000-0000-000000000002", "Attack"],
        ));
        await assert.rejects(app.query(
          "INSERT INTO employments (id, tenant_id, employee_id, organization_id, status, start_date) VALUES ($1,$2,$3,$4,$5,$6)",
          ["00000000-0000-0000-0000-000000000333", tenantB, employeeB, "00000000-0000-0000-0000-000000000002", "active", "2026-01-01"],
        ));
      } finally { await app.query("ROLLBACK"); }
    });

    await t.test("Tenant A cannot update or delete Tenant B employee or employment", async () => {
      await app.query("BEGIN");
      try {
        await app.query("select set_config('app.current_tenant_id', $1, true)", [tenantA]);
        const employeeUpdate = await app.query("UPDATE employees SET display_name = 'HACKED' WHERE id = $1 RETURNING id", [employeeB]);
        assert.equal(employeeUpdate.rowCount, 0);
        const employmentUpdate = await app.query("UPDATE employments SET status = 'terminated' WHERE id = $1 RETURNING id", ["00000000-0000-0000-0000-000000000222"]);
        assert.equal(employmentUpdate.rowCount, 0);
        const employeeDelete = await app.query("DELETE FROM employees WHERE id = $1 RETURNING id", [employeeB]);
        assert.equal(employeeDelete.rowCount, 0);
        const employmentDelete = await app.query("DELETE FROM employments WHERE id = $1 RETURNING id", ["00000000-0000-0000-0000-000000000222"]);
        assert.equal(employmentDelete.rowCount, 0);
      } finally { await app.query("ROLLBACK"); }
    });

    await t.test("manipulated tenant identifier cannot expose Tenant B", async () => {
      await app.query("BEGIN");
      try {
        await app.query("select set_config('app.current_tenant_id', $1, true)", [tenantA]);
        const employees = await app.query("SELECT id FROM employees WHERE tenant_id = $1", [tenantB]);
        assert.equal(employees.rowCount, 0);
        const employments = await app.query("SELECT id FROM employments WHERE tenant_id = $1", [tenantB]);
        assert.equal(employments.rowCount, 0);
      } finally { await app.query("ROLLBACK"); }
    });

    await t.test("missing tenant context fails closed", async () => {
      await app.query("BEGIN");
      try {
        const employees = await app.query("SELECT id FROM employees");
        const employments = await app.query("SELECT id FROM employments");
        assert.equal(employees.rowCount, 0);
        assert.equal(employments.rowCount, 0);
      } finally { await app.query("ROLLBACK"); }
    });

    await t.test("connection contamination is impossible across transactions", async () => {
      await app.query("BEGIN");
      await app.query("select set_config('app.current_tenant_id', $1, true)", [tenantA]);
      const a = await app.query("SELECT display_name FROM employees ORDER BY id");
      assert.deepEqual(a.rows.map((r) => r.display_name), ["Employee A"]);
      await app.query("COMMIT");

      await app.query("BEGIN");
      const withoutContext = await app.query("SELECT display_name FROM employees ORDER BY id");
      const withoutEmploymentContext = await app.query("SELECT id FROM employments");
      assert.equal(withoutContext.rowCount, 0);
      assert.equal(withoutEmploymentContext.rowCount, 0);
      await app.query("ROLLBACK");

      await app.query("BEGIN");
      await app.query("select set_config('app.current_tenant_id', $1, true)", [tenantB]);
      const b = await app.query("SELECT display_name FROM employees ORDER BY id");
      const bEmployment = await app.query("SELECT employee_id FROM employments ORDER BY id");
      assert.deepEqual(b.rows.map((r) => r.display_name), ["Employee B"]);
      assert.deepEqual(bEmployment.rows.map((r) => r.employee_id), [employeeB]);
      await app.query("ROLLBACK");
    });

    await t.test("rollback does not contaminate the next transaction", async () => {
      await app.query("BEGIN");
      await app.query("select set_config('app.current_tenant_id', $1, true)", [tenantA]);
      await app.query("ROLLBACK");
      await app.query("BEGIN");
      const result = await app.query("SELECT id FROM employments");
      assert.equal(result.rowCount, 0);
      await app.query("ROLLBACK");
    });
  } finally {
    await app.end();
    await admin.end();
  }
});
