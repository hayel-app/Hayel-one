# PostgreSQL RLS Verification Matrix

This matrix is the minimum evidence required for the tenant-isolation gate.

| Scenario | Expected |
|---|---|
| Tenant A reads Tenant A row | Allow |
| Tenant A reads Tenant B row by ID | Deny / zero rows |
| Tenant A lists employees | Tenant A rows only |
| Tenant A searches for Tenant B value | No Tenant B result |
| Tenant A inserts Tenant A row | Allow |
| Tenant A inserts row tagged Tenant B | Deny |
| Tenant A updates Tenant B row | Deny / zero rows |
| Tenant A deletes Tenant B row | Deny / zero rows |
| No tenant context reads | Deny / zero rows |
| No tenant context inserts | Deny |
| No tenant context updates | Deny |
| No tenant context deletes | Deny |
| RLS enabled | True |
| RLS forced | True |
| Test role is superuser | False |
| Test role has BYPASSRLS | False |

The test suite must execute against PostgreSQL and report the commit, database version, migration set, role attributes, and pass/fail result.
