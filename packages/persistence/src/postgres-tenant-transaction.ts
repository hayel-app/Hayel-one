import { clearTenantContext, setTenantContext, type TenantId } from "./tenant-session.js";

export interface TransactionClient {
  query<T = unknown>(sql: string, params?: readonly unknown[]): Promise<{ rows: T[] }>;
  release(): void;
}

export interface TransactionPool {
  connect(): Promise<TransactionClient>;
}

export async function withTenantTransaction<T>(
  pool: TransactionPool,
  tenantId: TenantId,
  work: (db: TransactionClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    try {
      await client.query("BEGIN");
      await setTenantContext(client, tenantId);
      const result = await work(client);
      await clearTenantContext(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  } finally {
    client.release();
  }
}
