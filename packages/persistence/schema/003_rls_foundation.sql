-- Tenant isolation foundation.
-- Application code must set app.current_tenant_id for each transaction.
-- This migration intentionally establishes the policy contract; execution and
-- integration tests are required before the persistence QA gate can pass.

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employments ENABLE ROW LEVEL SECURITY;

CREATE POLICY organizations_tenant_isolation ON organizations
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY users_tenant_isolation ON users
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY employees_tenant_isolation ON employees
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY employments_tenant_isolation ON employments
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));
