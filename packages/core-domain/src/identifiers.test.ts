import test from "node:test";
import assert from "node:assert/strict";
import { employeeId, organizationId, tenantId, userId, employmentId } from "./identifiers.js";

test("core identifiers preserve supplied values", () => {
  assert.equal(organizationId("org-1"), "org-1");
  assert.equal(tenantId("tenant-1"), "tenant-1");
  assert.equal(userId("user-1"), "user-1");
  assert.equal(employeeId("emp-1"), "emp-1");
  assert.equal(employmentId("employment-1"), "employment-1");
});
