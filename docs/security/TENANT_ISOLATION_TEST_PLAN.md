# Tenant Isolation Attack Test Plan

## Objective

Prove that a tenant-scoped actor cannot read, modify, delete, or enumerate another tenant's data.

## Test matrix

| Operation | Same tenant | Cross tenant | Missing tenant |
|---|---|---|---|
| Get by ID | Allow if authorized | Deny | Deny |
| List | Own tenant only | No foreign rows | Deny |
| Search | Own tenant only | No foreign matches | Deny |
| Create | Own tenant | Reject mismatched tenant | Deny |
| Update | Own tenant | Deny | Deny |
| Delete | Own tenant | Deny | Deny |
| Export | Own tenant | No foreign records | Deny |

## Additional vectors

- Guessing another tenant's UUID
- Manipulating query filters
- Omitting tenant parameters
- Supplying a different tenant identifier in request body
- Background-job context substitution
- Export/report filters
- AI retrieval context
- Integration/service credentials
- Direct repository calls

## Evidence requirement

A passing result requires executable integration tests against PostgreSQL with RLS enabled and forced. Type-level or mock-only tests are insufficient.
