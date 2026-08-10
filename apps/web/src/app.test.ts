import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("People web entry contains the core first-phase user flow", () => {
  const source = readFileSync(resolve(import.meta.dirname, "main.ts"), "utf8");
  for (const required of [
    "People",
    "Employee profile",
    "Employment history",
    "listEmployees",
    "getEmployee",
    "listEmployments",
    "Tenant context is not configured",
  ]) {
    assert.ok(source.includes(required), `missing web contract: ${required}`);
  }
});
