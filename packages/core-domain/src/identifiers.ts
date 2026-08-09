export type Brand<T, B extends string> = T & { readonly __brand: B };

export type OrganizationId = Brand<string, "OrganizationId">;
export type UserId = Brand<string, "UserId">;
export type EmployeeId = Brand<string, "EmployeeId">;
export type EmploymentId = Brand<string, "EmploymentId">;
export type DepartmentId = Brand<string, "DepartmentId">;
export type PositionId = Brand<string, "PositionId">;
export type TenantId = Brand<string, "TenantId">;

export const organizationId = (value: string): OrganizationId => value as OrganizationId;
export const userId = (value: string): UserId => value as UserId;
export const employeeId = (value: string): EmployeeId => value as EmployeeId;
export const employmentId = (value: string): EmploymentId => value as EmploymentId;
export const tenantId = (value: string): TenantId => value as TenantId;
