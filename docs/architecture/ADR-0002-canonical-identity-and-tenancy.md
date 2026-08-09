# ADR-0002 — Canonical Identity and Tenancy

**Status:** Accepted

## Decision

Hayel maintains one canonical Organization/Tenant identity and one canonical Employee identity. A User represents an authentication identity and is distinct from an Employee and from an Employment relationship.

Core relationships:

`Organization → Legal Entity → Employment → Employee ← User`

Organizational structures such as departments, positions, locations, and reporting relationships attach to the canonical organization/employee model.

## Rules

- Domain modules must not create competing employee master records.
- Every tenant-scoped resource must carry or derive an unambiguous tenant context.
- Authorization is enforced at the API and data-access boundaries.
- Cross-tenant access is denied by default.
- Employment history must be modeled separately from the person's durable employee identity.

## Rationale

This supports payroll, talent, finance, reporting, legal compliance, and workforce intelligence without duplicate identities or inconsistent employee state.
