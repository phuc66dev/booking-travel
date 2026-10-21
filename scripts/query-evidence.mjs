import {
  QueryClient,
  QueryObserver,
  MutationObserver,
} from "@tanstack/react-query";
import { mkdirSync, writeFileSync } from "node:fs";
import { tourQueryOptions } from "../src/features/tours/api/tour-queries.ts";
import { bookingMutationOptions } from "../src/features/booking/api/booking-mutations.ts";
import { bookingKeys } from "../src/features/booking/api/booking-keys.ts";
import {
  adapter,
  emptyDraft,
} from "../src/features/booking/api/booking-service.ts";
import { departures } from "../src/data/mock-tours.ts";

const client = new QueryClient({
  defaultOptions: { queries: { retry: false, gcTime: Infinity } },
});
const trace = [];
const unsubscribe = client
  .getQueryCache()
  .subscribe((event) =>
    trace.push({
      event: event.type,
      key: event.query.queryKey,
      status: event.query.state.status,
      fetchStatus: event.query.state.fetchStatus,
      invalidated: event.query.state.isInvalidated,
    }),
  );
const draft = { ...emptyDraft, departureId: departures[0].id, packageId: "p3" };
let catalogCalls = 0;
let quoteCalls = 0;
const catalog = tourQueryOptions({ q: "CAN THO" });
const catalogOptions = {
  ...catalog,
  staleTime: 60_000,
  queryFn: () => {
    catalogCalls++;
    return catalog.queryFn();
  },
};
const quoteOptions = {
  queryKey: bookingKeys.quote(draft),
  staleTime: 15_000,
  queryFn: () => {
    quoteCalls++;
    return adapter.getQuote(draft);
  },
};
const observer = new QueryObserver(client, quoteOptions);
const stopObserver = observer.subscribe(() => {});
try {
  await client.fetchQuery(catalogOptions);
  await client.fetchQuery({
    ...catalogOptions,
    queryKey: tourQueryOptions({ q: "  cần thơ " }).queryKey,
  });
  await client.fetchQuery(quoteOptions);
  const mutation = new MutationObserver(client, bookingMutationOptions(client));
  await mutation.mutate({
    draft,
    contact: {
      name: "Người dùng demo",
      phone: "0901234567",
      email: "",
      note: "",
    },
    idempotencyKey: "evidence-only",
    fixture: "normal",
  });
  if (catalogCalls !== 1 || quoteCalls !== 2)
    throw new Error(`Unexpected request counts ${catalogCalls}/${quoteCalls}`);
  mkdirSync("docs/evidence", { recursive: true });
  writeFileSync(
    "docs/evidence/query-cache-trace.json",
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        scenario:
          "Equivalent normalized search reuses cache; successful mutation invalidates and refetches active exact quote; catalog remains cached",
        catalogCalls,
        quoteCalls,
        trace,
      },
      null,
      2,
    ),
  );
  console.log(
    `Catalog query calls: ${catalogCalls}; quote query calls: ${quoteCalls}; exact quote invalidation verified.`,
  );
} finally {
  stopObserver();
  unsubscribe();
  client.clear();
}
