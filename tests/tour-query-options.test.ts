import { test } from "node:test";
import assert from "node:assert/strict";
import { QueryClient } from "@tanstack/react-query";
import {
  tourQueryOptions,
  tourDetailQueryOptions,
} from "../src/features/tours/api/tour-queries.ts";

test("missing detail resolves to null, a valid query result distinct from network error", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  try {
    assert.equal(
      await client.fetchQuery(tourDetailQueryOptions("missing")),
      null,
    );
  } finally {
    client.clear();
  }
});

test("tour query options cache results by normalized URL search", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const first = tourQueryOptions({ q: "CẦN THƠ", page: 1 });
  const equivalent = tourQueryOptions({ q: "can tho", page: 1 });
  const different = tourQueryOptions({ q: "can tho", page: 2 });

  assert.deepEqual(first.queryKey, equivalent.queryKey);
  assert.notDeepEqual(first.queryKey, different.queryKey);
  const initial = await client.fetchQuery(first);
  const cached = await client.fetchQuery(equivalent);
  assert.deepEqual(cached, initial);
  assert.equal(client.getQueryCache().getAll().length, 1);
  client.clear();
});
