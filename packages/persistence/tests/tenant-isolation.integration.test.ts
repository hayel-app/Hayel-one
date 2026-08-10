import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";

const adminUrl = process.env.HAYEL_POSTGRES_ADMIN_URL;
const appUrl = process.env.HAYEL_POSTGRES_APP_URL;

if (!adminUrl || !appUrl) {
  throw new Error("SECURITY GATE MISCONFIGURED: HAYEL_POSTGRES_ADMIN_URL and HAYEL_POSTGRES_APP_URL are required; tenant isolation tests must never skip.");
}

const clientConfig = { connectionTimeoutMillis: 10_000, query_timeout: 10_000 };
async function connect(url: string) { const client = new Client({ connectionString: url, ...clientConfig }); await client.connect(); return client; }

const TENANT_A = "10000000-0000-0000-0000-000000000001";
const TENANT_B = "20000000-0000-0000-0000-000000000002";
const ORG_A = "00000000-0000-0000-0000-000000000001";
const ORG_B = "00000000-0000-0000-0000-000000000002";
const EMP_A = "00000000-0000-0000-0000-000000000011";
const EMP_B = "00000000-0000-0000-0000-000000000022";

async function tenant(client: Client, id: string) { await client.query("select set_config('app.current_tenant_id', $1, true)", [id]); }

test("real PostgreSQL tenant isolation attack suite", { timeout: 60_000 }, async (t) => {
  const admin = await connect(adminUrl);
  const app = await connect(appUrl);
  try {
    await admin.query("TRUNCATE employments, employees, users, organizations CASCADE");
    await admin.query(`
      INSERT INTO organizations (id, tenant_id, legal_name, country_code, currency_code, time_zone) VALUES
      ($1,$3,'Tenant A Org','EG','EGP','Africa/Cairo'), ($2,$4,'Tenant B Org','SA','SAR','Asia/Riyadh');
      INSERT INTO employees (id, tenant_id, organization_id, display_name) VALUES
      ($5,$3,$1,'Employee A'), ($6,$4,$2,'Employee B');
    `, [ORG_A, ORG_B, TENANT_A, TENANT_B, EMP_A, EMP_B]);

    await t.test("RLS is enabled and forced", async () => {
      const result = await admin.query<{ relrowsecurity: boolean; relforcerowsecurity: boolean }>("SELECT relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname = 'employees'");
      assert.equal(result.rows[0]?.relrowsecurity, true); assert.equal(result.rows[0]?.relforcerowsecurity, true);
    });
    await t.test("application role is not privileged and has no memberships", async () => {
      const role = await admin.query<{ rolsuper: boolean; rolbypassrls: boolean }>("SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = 'hayel_app'");
      assert.equal(role.rows.length, 1); assert.equal(role.rows[0]?.rolsuper, false); assert.equal(role.rows[0]?.rolbypassrls, false);
      const memberships = await admin.query("SELECT 1 FROM pg_auth_members m JOIN pg_roles r ON r.oid = m.member WHERE r.rolname = 'hayel_app'");
      assert.equal(memberships.rowCount, 0);
    });
    await t.test("Tenant A sees only Tenant A", async () => { await app.query("BEGIN"); try { await tenant(app,TENANT_A); const r=await app.query("SELECT display_name FROM employees ORDER BY id"); assert.deepEqual(r.rows.map(x=>x.display_name),["Employee A"]); } finally { await app.query("ROLLBACK"); } });
    await t.test("Tenant A cannot read Tenant B by direct ID", async () => { await app.query("BEGIN"); try { await tenant(app,TENANT_A); const r=await app.query("SELECT id FROM employees WHERE id=$1",[EMP_B]); assert.equal(r.rowCount,0); } finally { await app.query("ROLLBACK"); } });
    await t.test("Tenant A cannot create a Tenant B employee", async () => { await app.query("BEGIN"); try { await tenant(app,TENANT_A); await assert.rejects(app.query("INSERT INTO employees (id,tenant_id,organization_id,display_name) VALUES ($1,$2,$3,$4)",["00000000-0000-0000-0000-000000000033",TENANT_B,ORG_B,"Attack"])); } finally { await app.query("ROLLBACK"); } });
    await t.test("Tenant A cannot update Tenant B", async () => { await app.query("BEGIN"); try { await tenant(app,TENANT_A); const r=await app.query("UPDATE employees SET display_name='HACKED' WHERE id=$1 RETURNING id",[EMP_B]); assert.equal(r.rowCount,0); } finally { await app.query("ROLLBACK"); } });
    await t.test("Tenant A cannot delete Tenant B", async () => { await app.query("BEGIN"); try { await tenant(app,TENANT_A); const r=await app.query("DELETE FROM employees WHERE id=$1 RETURNING id",[EMP_B]); assert.equal(r.rowCount,0); } finally { await app.query("ROLLBACK"); } });
    await t.test("manipulated tenant identifier cannot expose Tenant B", async () => { await app.query("BEGIN"); try { await tenant(app,TENANT_A); const r=await app.query("SELECT id FROM employees WHERE tenant_id=$1",[TENANT_B]); assert.equal(r.rowCount,0); } finally { await app.query("ROLLBACK"); } });
    await t.test("missing tenant context fails closed", async () => { await app.query("BEGIN"); try { const r=await app.query("SELECT id FROM employees"); assert.equal(r.rowCount,0); } finally { await app.query("ROLLBACK"); } });
    await t.test("connection contamination is impossible across transactions", async () => { await app.query("BEGIN"); await tenant(app,TENANT_A); const a=await app.query("SELECT display_name FROM employees ORDER BY id"); assert.deepEqual(a.rows.map(x=>x.display_name),["Employee A"]); await app.query("COMMIT"); await app.query("BEGIN"); const none=await app.query("SELECT display_name FROM employees ORDER BY id"); assert.equal(none.rowCount,0); await app.query("ROLLBACK"); await app.query("BEGIN"); await tenant(app,TENANT_B); const b=await app.query("SELECT display_name FROM employees ORDER BY id"); assert.deepEqual(b.rows.map(x=>x.display_name),["Employee B"]); await app.query("ROLLBACK"); });
    await t.test("rollback does not contaminate the next transaction", async () => { await app.query("BEGIN"); await tenant(app,TENANT_A); await app.query("ROLLBACK"); await app.query("BEGIN"); const r=await app.query("SELECT id FROM employees"); assert.equal(r.rowCount,0); await app.query("ROLLBACK"); });
  } finally { await app.end(); await admin.end(); }
});
