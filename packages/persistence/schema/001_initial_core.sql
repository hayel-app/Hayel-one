CREATE TABLE organizations (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  legal_name text NOT NULL,
  country_code text NOT NULL CHECK (country_code IN ('EG','SA','AE','OM')),
  currency_code text NOT NULL CHECK (currency_code IN ('EGP','SAR','AED','OMR')),
  time_zone text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id)
);

CREATE TABLE users (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  email text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);

CREATE TABLE employees (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  user_id uuid,
  display_name text NOT NULL,
  department_id uuid,
  position_id uuid,
  manager_employee_id uuid,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT employees_organization_fk
    FOREIGN KEY (tenant_id, organization_id)
    REFERENCES organizations (tenant_id, id),
  CONSTRAINT employees_user_fk
    FOREIGN KEY (tenant_id, user_id)
    REFERENCES users (tenant_id, id)
);

CREATE TABLE employments (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('active','on_leave','suspended','terminated')),
  start_date date NOT NULL,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT employments_employee_fk
    FOREIGN KEY (tenant_id, employee_id)
    REFERENCES employees (tenant_id, id),
  CONSTRAINT employments_organization_fk
    FOREIGN KEY (tenant_id, organization_id)
    REFERENCES organizations (tenant_id, id),
  CONSTRAINT employment_dates_valid CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX employees_tenant_idx ON employees (tenant_id);
CREATE INDEX employments_tenant_idx ON employments (tenant_id);
CREATE INDEX employees_org_idx ON employees (tenant_id, organization_id);
CREATE INDEX employments_employee_idx ON employments (tenant_id, employee_id);
