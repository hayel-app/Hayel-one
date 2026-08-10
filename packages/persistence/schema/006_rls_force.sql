-- Defense-in-depth: table owners must also be subject to tenant RLS policies.
-- The application role is intentionally non-owner and non-bypassrls, but forced RLS
-- closes the owner-level escape hatch as well.
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE employees FORCE ROW LEVEL SECURITY;
ALTER TABLE employments FORCE ROW LEVEL SECURITY;
