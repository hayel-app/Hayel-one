# PostgreSQL Integration Environment

The persistence QA suite uses a real PostgreSQL service in CI rather than mocks.

The intended test sequence is:

1. Start PostgreSQL.
2. Create the restricted application role.
3. Apply migrations in order.
4. Grant only required schema/table privileges to the application role.
5. Seed two tenants and representative records using an isolated setup role.
6. Execute same-tenant and cross-tenant CRUD tests.
7. Execute missing-tenant-context tests.
8. Inspect `pg_class.relrowsecurity` and `pg_class.relforcerowsecurity` for every tenant-scoped table.
9. Fail the job on any unexpected access.

The test role must not be a PostgreSQL superuser and must not have `BYPASSRLS`.
