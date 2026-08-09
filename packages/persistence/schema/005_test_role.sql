-- QA role bootstrap. Production role provisioning should use the deployment
-- secret-management process; this migration is intentionally deterministic for CI.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'hayel_app') THEN
    CREATE ROLE hayel_app NOLOGIN NOSUPERUSER NOBYPASSRLS;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO hayel_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON organizations, users, employees, employments TO hayel_app;

ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE employees FORCE ROW LEVEL SECURITY;
ALTER TABLE employments FORCE ROW LEVEL SECURITY;
