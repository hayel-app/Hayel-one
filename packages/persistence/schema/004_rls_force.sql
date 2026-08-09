-- Force row-level security for table owners as well as ordinary roles.
-- The application/service role must therefore use an explicitly authorized
-- database role/context for administrative cross-tenant operations.

ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE employees FORCE ROW LEVEL SECURITY;
ALTER TABLE employments FORCE ROW LEVEL SECURITY;
