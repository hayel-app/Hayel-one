import test from "node:test";
import assert from "node:assert/strict";
import { createApiClient } from "./api.js";

test("employee API client sends tenant context", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    assert.equal(input, "http://api.test/api/v1/employees");
    assert.equal(new Headers(init?.headers).get("X-Tenant-ID"), "tenant-a");
    return new Response(JSON.stringify({ data: [] }), { status: 200, headers: { "content-type": "application/json" } });
  };
  try {
    assert.deepEqual(await createApiClient("http://api.test", "tenant-a").listEmployees(), []);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
