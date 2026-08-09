import test from "node:test";
import assert from "node:assert/strict";
import { organizationId, tenantId } from "./identifiers.js";
import type { Organization } from "./organization.js";

test("organization carries tenant, jurisdiction, currency, and timezone", () => {
  const organization: Organization = {
    id: organizationId("org-1"),
    tenantId: tenantId("tenant-1"),
    legalName: "Hayel Demo Organization",
    country: "EG",
    currency: "EGP",
    timeZone: "Africa/Cairo",
    active: true,
  };

  assert.equal(organization.tenantId, "tenant-1");
  assert.equal(organization.country, "EG");
  assert.equal(organization.currency, "EGP");
  assert.equal(organization.active, true);
});
