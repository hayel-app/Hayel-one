import test from "node:test";
import assert from "node:assert/strict";
import { toEmployeeProfile } from "./profile-model.js";

test("employee profile preserves workforce relationships", () => {
  const profile = toEmployeeProfile({
    id: "emp-1",
    tenant_id: "tenant-a",
    organization_id: "org-1",
    user_id: "user-1",
    display_name: "Ada Lovelace",
    department_id: "dept-1",
    position_id: "pos-1",
    manager_employee_id: "emp-0",
    active: true,
  });
  assert.deepEqual(profile, {
    identity: { id: "emp-1", displayName: "Ada Lovelace", userId: "user-1", active: true },
    organizationId: "org-1",
    departmentId: "dept-1",
    positionId: "pos-1",
    managerEmployeeId: "emp-0",
  });
});
