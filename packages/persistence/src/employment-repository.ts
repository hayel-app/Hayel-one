import { withTenantTransaction, type TransactionPool } from "./postgres-tenant-transaction.js";
import type { TenantId } from "./tenant-session.js";

export type EmploymentId = string;

export interface EmploymentRecord {
  id: EmploymentId;
  tenant_id: string;
  employee_id: string;
  organization_id: string;
  status: string;
  start_date: string;
  end_date: string | null;
}

export class EmploymentRepository {
  constructor(private readonly pool: TransactionPool) {}

  async listByEmployee(tenantId: TenantId, employeeId: string): Promise<EmploymentRecord[]> {
    return withTenantTransaction(this.pool, tenantId, async (db) => {
      const result = await db.query<EmploymentRecord>(
        `SELECT id, tenant_id, employee_id, organization_id, status,
                start_date::text AS start_date, end_date::text AS end_date
           FROM employments
          WHERE employee_id = $1
          ORDER BY start_date DESC, id DESC`,
        [employeeId],
      );
      return result.rows;
    });
  }
}
