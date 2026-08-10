import { withTenantTransaction, type TransactionPool } from "./postgres-tenant-transaction.js";
import type { TenantId } from "./tenant-session.js";

export type OrganizationId = string;

export interface OrganizationRecord {
  id: OrganizationId;
  tenant_id: string;
  legal_name: string;
  display_name: string;
  country_code: string;
  status: string;
}

export class OrganizationRepository {
  constructor(private readonly pool: TransactionPool) {}

  async getById(tenantId: TenantId, organizationId: OrganizationId): Promise<OrganizationRecord | null> {
    return withTenantTransaction(this.pool, tenantId, async (db) => {
      const result = await db.query<OrganizationRecord>(
        `SELECT id, tenant_id, legal_name, display_name, country_code, status
           FROM organizations
          WHERE id = $1`,
        [organizationId],
      );
      return result.rows[0] ?? null;
    });
  }

  async list(tenantId: TenantId): Promise<OrganizationRecord[]> {
    return withTenantTransaction(this.pool, tenantId, async (db) => {
      const result = await db.query<OrganizationRecord>(
        `SELECT id, tenant_id, legal_name, display_name, country_code, status
           FROM organizations
          ORDER BY display_name, id`,
      );
      return result.rows;
    });
  }
}
