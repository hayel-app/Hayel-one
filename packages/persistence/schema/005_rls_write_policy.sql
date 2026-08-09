-- Companion migration for the RLS foundation.
-- Adds explicit WITH CHECK protections for tenant-scoped writes.

DROP POLICY IF EXISTS organizations_tenant_isolation ON organizations;
DROP POLICY IF EXISTS users_tenant_isolation ON users;
DROP POLICY IF EXISTS employees_tenant_isolation ON employees;
DROP POLICY IF EXISTS employments_tenant_isolation ON employments;

CREATE POLICY organizations_tenant_isolation ON organizations
  USING (tenant_id::text = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY users_tenant_isolation ON users
  USING (tenant_id::text = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY employees_tenant_isolation ON employees
  USING (tenant_id::text = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY employments_tenant_isolation ON employments
  USING (tenant_id::text = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));
