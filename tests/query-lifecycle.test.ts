import { test } from "node:test";
import assert from "node:assert/strict";
import { QueryClient } from "@tanstack/react-query";
import { setTimeout } from "node:timers/promises";

test("fresh cache reuses data, stale data refetches and inactive cache is garbage collected", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 30 } },
  });
  let calls = 0;
  const options = {
    queryKey: ["lifecycle"],
    queryFn: async () => ++calls,
    staleTime: 1000,
  };
  try {
    assert.equal(await client.fetchQuery(options), 1);
    assert.equal(await client.fetchQuery(options), 1);
    client.setQueryData(options.queryKey, 1, { updatedAt: Date.now() - 2000 });
    assert.equal(await client.fetchQuery(options), 2);
    await setTimeout(70);
    assert.equal(client.getQueryState(options.queryKey), undefined);
  } finally {
    client.clear();
  }
});

test("query errors remain errors instead of becoming a successful empty list, and retry recovers", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  let fail = true;
  const options = {
    queryKey: ["catalog"],
    queryFn: async () => {
      if (fail) throw new Error("offline");
      return ["tour"];
    },
  };
  try {
    await assert.rejects(client.fetchQuery(options), /offline/);
    assert.equal(client.getQueryState(options.queryKey)?.status, "error");
    assert.equal(client.getQueryData(options.queryKey), undefined);
    fail = false;
    assert.deepEqual(await client.fetchQuery(options), ["tour"]);
    assert.equal(client.getQueryState(options.queryKey)?.status, "success");
  } finally {
    client.clear();
  }
});
