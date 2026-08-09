import test from "node:test";
import assert from "node:assert/strict";
import { employeeId, tenantId } from "./identifiers.js";
import { assertTenantAccess, TenantAccessError } from "./tenant.js";

test("tenant context permits access to the same tenant", () => {
  assert.doesNotThrow(() =>
    assertTenantAccess(
      { tenantId: tenantId("tenant-a"), actorId: employeeId("actor-1") },
      tenantId("tenant-a"),
    ),
  );
});

test("tenant context rejects cross-tenant access", () => {
  assert.throws(
    () =>
      assertTenantAccess(
        { tenantId: tenantId("tenant-a"), actorId: employeeId("actor-1") },
        tenantId("tenant-b"),
      ),
    TenantAccessError,
  );
});

test("tenant context is required", () => {
  assert.throws(() => assertTenantAccess(undefined, tenantId("tenant-a")), TenantAccessError);
});
