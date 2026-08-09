import { clearTenantContext, setTenantContext, type SqlExecutor, type TenantId } from "./tenant-session.js";

export interface TransactionClient extends SqlExecutor {
  query<T = unknown>(sql: string, params?: readonly unknown[]): Promise<{ rows: T[] }>;
}

export interface TransactionPool {
  connect(): Promise<TransactionClient & { release(): void }>;
}

/**
 * Executes work inside one PostgreSQL transaction with an explicit tenant
 * context. Tenant context is transaction-local and cleared before release.
 */
export async function withTenantTransaction<T>(
  pool: TransactionPool,
  tenantId: TenantId,
  work: (db: TransactionClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await setTenantContext(client, tenantId);
    const result = await work(client);
    await clearTenantContext(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } finally {
      client.release();
    }
    throw error;
  }
  // Successful transactions release only after COMMIT. Keeping release here
  // avoids connection leaks while preserving transaction-local context.
}
