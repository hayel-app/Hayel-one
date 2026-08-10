import type { Employee } from "./api.js";

export interface EmployeeProfile {
  identity: { id: string; displayName: string; userId: string | null; active: boolean };
  organizationId: string;
  departmentId: string | null;
  positionId: string | null;
  managerEmployeeId: string | null;
}

export function toEmployeeProfile(employee: Employee): EmployeeProfile {
  return {
    identity: {
      id: employee.id,
      displayName: employee.display_name,
      userId: employee.user_id,
      active: employee.active,
    },
    organizationId: employee.organization_id,
    departmentId: employee.department_id,
    positionId: employee.position_id,
    managerEmployeeId: employee.manager_employee_id,
  };
}
