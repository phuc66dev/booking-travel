import { test } from "node:test";
import assert from "node:assert/strict";
import { queryClient } from "../src/app/query-client.ts";

test("query client keeps tour data briefly and does not retry mutations", () => {
  const defaults = queryClient.getDefaultOptions();
  assert.equal(defaults.queries?.staleTime, 60_000);
  assert.equal(defaults.queries?.gcTime, 5 * 60_000);
  assert.equal(defaults.mutations?.retry, false);
});
