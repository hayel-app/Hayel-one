import type { TenantId } from "./identifiers.js";

export interface TenantContext {
  readonly tenantId: TenantId;
  readonly actorId: string;
}

export class TenantAccessError extends Error {
  constructor(message = "Tenant context is required") {
    super(message);
    this.name = "TenantAccessError";
  }
}

export function assertTenantAccess(
  context: TenantContext | undefined,
  resourceTenantId: TenantId,
): void {
  if (!context) throw new TenantAccessError();
  if (context.tenantId !== resourceTenantId) {
    throw new TenantAccessError("Cross-tenant access denied");
  }
}
