# Persistence Completion Gate

The persistence layer is not complete until all of the following are evidenced:

- PostgreSQL version is supported and recorded.
- All migrations apply cleanly to an empty database.
- Migrations apply cleanly to a representative existing database where applicable.
- Constraints reject invalid data.
- Foreign keys reject cross-tenant relationships.
- RLS is enabled and forced on tenant-scoped core tables.
- Same-tenant reads/writes succeed when authorized.
- Cross-tenant reads/writes/deletes fail.
- Missing tenant context fails closed.
- List/search/export paths remain tenant-scoped.
- Roll-forward and migration ordering are verified.
- Automated integration tests run in CI.
- Gouda independently reviews the evidence.

Until these conditions are satisfied, the persistence status remains **NOT QA VERIFIED**.
