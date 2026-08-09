import test from "node:test";
import assert from "node:assert/strict";
import { employeeId, employmentId, organizationId, tenantId, userId } from "./identifiers.js";
import type { Employee, Employment } from "./employee.js";

test("employee and employment remain distinct concepts", () => {
  const employee: Employee = {
    id: employeeId("emp-1"),
    tenantId: tenantId("tenant-1"),
    organizationId: organizationId("org-1"),
    userId: userId("user-1"),
    displayName: "Demo Employee",
    active: true,
  };

  const employment: Employment = {
    id: employmentId("employment-1"),
    tenantId: tenantId("tenant-1"),
    employeeId: employee.id,
    organizationId: organizationId("org-1"),
    status: "active",
    startDate: "2026-01-01",
  };

  assert.notEqual(employee.id, employment.id);
  assert.equal(employment.employeeId, employee.id);
  assert.equal(employment.status, "active");
});
