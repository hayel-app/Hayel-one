# ADR-0007 — Tenant Enforcement

**Status:** Accepted

## Decision

Tenant context is mandatory for tenant-scoped application operations. Access to a tenant-scoped resource is denied unless the authenticated actor has an explicit matching tenant context and authorization.

Tenant checks must exist at the application/API boundary and be enforced again at the persistence/query boundary where feasible. UI filtering is never a security control.

## Required test cases

- Same-tenant access succeeds when authorized.
- Cross-tenant resource access fails.
- Missing tenant context fails closed.
- Direct-object lookup cannot bypass tenant scoping.
- List/search/export operations remain tenant-scoped.
- Background jobs preserve tenant context.
- Integrations cannot write across tenants without an explicit authorized service context.

## Scope

This contract is a foundation requirement. The current domain helper and tests provide an initial executable contract; persistence/API enforcement remains required before the tenant-isolation gate can pass.
