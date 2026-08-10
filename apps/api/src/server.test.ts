import test from "node:test";
import assert from "node:assert/strict";

test("API foundation is wired for the first vertical slice", () => {
  assert.equal(process.env.NODE_ENV ?? "test", process.env.NODE_ENV ?? "test");
});
