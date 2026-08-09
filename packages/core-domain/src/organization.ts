import type { OrganizationId, TenantId } from "./identifiers.js";

export type CountryCode = "EG" | "SA" | "AE" | "OM";
export type CurrencyCode = "EGP" | "SAR" | "AED" | "OMR";

export interface Organization {
  readonly id: OrganizationId;
  readonly tenantId: TenantId;
  readonly legalName: string;
  readonly country: CountryCode;
  readonly currency: CurrencyCode;
  readonly timeZone: string;
  readonly active: boolean;
}
