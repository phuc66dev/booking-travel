import { test } from "node:test";
import assert from "node:assert/strict";
import { QueryClient } from "@tanstack/react-query";
import { bookingMutationOptions } from "../src/features/booking/api/booking-mutations.ts";
import { bookingKeys } from "../src/features/booking/api/booking-keys.ts";
import { departures } from "../src/data/mock-tours.ts";
import { emptyDraft } from "../src/features/booking/api/booking-service.ts";

test("creating a booking invalidates only its exact quote cache", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const draft = {
    ...emptyDraft,
    departureId: departures[0].id,
    packageId: "p3",
  };
  const quoteKey = bookingKeys.quote(draft);
  const unrelatedKey = ["booking", "quote", "other"] as const;
  client.setQueryData(quoteKey, { total: 3_200_000 });
  client.setQueryData(unrelatedKey, { total: 1 });
  const mutation = client
    .getMutationCache()
    .build(client, bookingMutationOptions(client));

  await mutation.execute({
    draft,
    contact: { name: "Nguyễn An", phone: "0901234567", email: "", note: "" },
    idempotencyKey: "query-invalidation-test",
    fixture: "normal",
  });

  assert.equal(client.getQueryState(quoteKey)?.isInvalidated, true);
  assert.equal(client.getQueryState(unrelatedKey)?.isInvalidated, false);
  client.clear();
});
