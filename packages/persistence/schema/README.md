# Initial Core Schema

`001_initial_core.sql` is the first executable schema draft for the canonical Core model.

It establishes:

- organizations
- users
- employees
- employments
- tenant-aware foreign-key relationships
- country/currency constraints
- employment date integrity
- tenant-oriented indexes

## QA gate

This schema is **not yet marked production-ready**. It requires execution against a supported PostgreSQL version, migration validation, rollback/forward migration review, constraint tests, and tenant-isolation attack tests before Gouda can approve the persistence gate.
