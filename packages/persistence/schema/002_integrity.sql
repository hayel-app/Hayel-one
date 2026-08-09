ALTER TABLE organizations
  ADD CONSTRAINT organizations_tenant_id_not_empty CHECK (tenant_id IS NOT NULL);

ALTER TABLE users
  ADD CONSTRAINT users_email_not_empty CHECK (length(trim(email)) > 0);

ALTER TABLE employees
  ADD CONSTRAINT employees_display_name_not_empty CHECK (length(trim(display_name)) > 0);

ALTER TABLE employments
  ADD CONSTRAINT employments_start_date_valid CHECK (start_date IS NOT NULL);
