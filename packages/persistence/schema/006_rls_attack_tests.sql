-- Executable PostgreSQL RLS attack checks.
-- CI must execute this file as the postgres bootstrap role.
-- Fixture creation occurs before SET LOCAL ROLE so both tenants exist.

BEGIN;

INSERT INTO organizations (id, tenant_id, legal_name, country_code, currency_code, time_zone)
VALUES
  ('00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Tenant A Org','EG','EGP','Africa/Cairo'),
  ('00000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','Tenant B Org','SA','SAR','Asia/Riyadh');

INSERT INTO users (id, tenant_id, email)
VALUES ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','a@example.test');

INSERT INTO employees (id, tenant_id, organization_id, user_id, display_name)
VALUES ('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Tenant A Employee');

SET LOCAL ROLE hayel_app;
SET LOCAL app.current_tenant_id = '10000000-0000-0000-0000-000000000001';

DO $$
BEGIN
  IF (SELECT count(*) FROM employees) <> 1 THEN
    RAISE EXCEPTION 'RLS read isolation failed';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM employees WHERE tenant_id = '20000000-0000-0000-0000-000000000002') THEN
    RAISE EXCEPTION 'Cross-tenant read isolation failed';
  END IF;
END $$;

-- Cross-tenant insert must be rejected by WITH CHECK.
DO $$
BEGIN
  BEGIN
    INSERT INTO organizations (id, tenant_id, legal_name, country_code, currency_code, time_zone)
    VALUES ('00000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000002','Forbidden','SA','SAR','Asia/Riyadh');
    RAISE EXCEPTION 'Cross-tenant insert unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END $$;

-- Missing tenant context must fail closed.
RESET app.current_tenant_id;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM organizations) THEN
    RAISE EXCEPTION 'Missing tenant context did not fail closed';
  END IF;
END $$;

ROLLBACK;
