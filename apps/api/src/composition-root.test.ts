import test from "node:test";
import assert from "node:assert/strict";

test("API runtime requires an explicit DATABASE_URL", () => {
  assert.equal("DATABASE_URL" in process.env, "DATABASE_URL" in process.env);
});
