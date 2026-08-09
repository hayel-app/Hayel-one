import test from "node:test";
import assert from "node:assert/strict";

/**
 * PostgreSQL integration gate.
 *
 * These tests are intentionally skipped unless HAYEL_POSTGRES_TEST_URL is set.
 * CI must run them against the real PostgreSQL service after migrations and
 * restricted-role setup. The suite is therefore never allowed to silently
 * become a mock-only security test.
 */
const databaseUrl = process.env.HAYEL_POSTGRES_TEST_URL;

test("tenant isolation integration environment is explicit", { skip: !databaseUrl }, async () => {
  assert.ok(databaseUrl, "HAYEL_POSTGRES_TEST_URL must be supplied by the integration environment");

  // The concrete driver/repository harness is wired by the persistence package.
  // Keep this gate explicit until the driver is installed and configured.
  assert.fail("PostgreSQL attack harness is not yet wired; do not treat this suite as a passing security test");
});
