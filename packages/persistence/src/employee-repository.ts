import { withTenantTransaction, type TransactionPool } from "./postgres-tenant-transaction.js";
import type { TenantId } from "./tenant-session.js";

export type EmployeeId = string;

export interface EmployeeRecord {
  id: string;
  tenant_id: string;
  organization_id: string;
  user_id: string | null;
  display_name: string;
  department_id: string | null;
  position_id: string | null;
  manager_employee_id: string | null;
  active: boolean;
}

export class EmployeeRepository {
  constructor(private readonly pool: TransactionPool) {}

  async getById(tenantId: TenantId, employeeId: EmployeeId): Promise<EmployeeRecord | null> {
    return withTenantTransaction(this.pool, tenantId, async (db) => {
      const result = await db.query<EmployeeRecord>(
        `SELECT id, tenant_id, organization_id, user_id, display_name,
                department_id, position_id, manager_employee_id, active
           FROM employees
          WHERE id = $1`,
        [employeeId],
      );
      return result.rows[0] ?? null;
    });
  }

  async list(tenantId: TenantId): Promise<EmployeeRecord[]> {
    return withTenantTransaction(this.pool, tenantId, async (db) => {
      const result = await db.query<EmployeeRecord>(
        `SELECT id, tenant_id, organization_id, user_id, display_name,
                department_id, position_id, manager_employee_id, active
           FROM employees
          ORDER BY display_name, id`,
      );
      return result.rows;
    });
  }
}
