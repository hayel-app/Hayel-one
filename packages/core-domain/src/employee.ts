import type {
  DepartmentId,
  EmployeeId,
  EmploymentId,
  OrganizationId,
  PositionId,
  TenantId,
  UserId,
} from "./identifiers.js";

export type EmploymentStatus = "active" | "on_leave" | "suspended" | "terminated";

export interface Employee {
  readonly id: EmployeeId;
  readonly tenantId: TenantId;
  readonly organizationId: OrganizationId;
  readonly userId?: UserId;
  readonly displayName: string;
  readonly departmentId?: DepartmentId;
  readonly positionId?: PositionId;
  readonly managerEmployeeId?: EmployeeId;
  readonly active: boolean;
}

export interface Employment {
  readonly id: EmploymentId;
  readonly tenantId: TenantId;
  readonly employeeId: EmployeeId;
  readonly organizationId: OrganizationId;
  readonly status: EmploymentStatus;
  readonly startDate: string;
  readonly endDate?: string;
}
