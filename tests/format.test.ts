import { test } from "node:test";
import assert from "node:assert/strict";
import { money } from "../src/shared/lib/format.ts";

test("VND formatting uses the Vietnamese locale and one currency marker", () => {
  const formatted = money(1_600_000);
  assert.match(formatted, /1\.600\.000/);
  assert.equal((formatted.match(/₫/g) || []).length, 1);
});
