export type TenantId = string;

export interface SqlExecutor {
  query<T = unknown>(sql: string, params?: readonly unknown[]): Promise<{ rows: T[] }>;
}

/**
 * Establishes tenant context for the current PostgreSQL transaction.
 * The caller owns the transaction lifecycle and must not reuse a connection
 * carrying one tenant context for another tenant without resetting it.
 */
export async function setTenantContext(db: SqlExecutor, tenantId: TenantId): Promise<void> {
  if (!tenantId.trim()) throw new Error("tenantId is required");
  await db.query("select set_config('app.current_tenant_id', $1, true)", [tenantId]);
}

/** Explicitly clears transaction-local tenant context. */
export async function clearTenantContext(db: SqlExecutor): Promise<void> {
  await db.query("select set_config('app.current_tenant_id', '', true)");
}
