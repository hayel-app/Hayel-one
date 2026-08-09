import { clearTenantContext, setTenantContext, type SqlExecutor, type TenantId } from "./tenant-session.js";

export interface TransactionClient extends SqlExecutor {
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
  // The pool client is released by the success path below.
}
