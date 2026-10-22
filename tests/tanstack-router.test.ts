import { test } from "node:test";
import assert from "node:assert/strict";
import {
  router,
  rootRoute,
  indexRoute,
  toursRoute,
  tourDetailRoute,
  bookingRoute,
  bookingLookupRoute,
  bookingResultRoute,
  policiesRoute,
} from "../src/app/routes.tsx";
import { queryClient } from "../src/app/query-client.ts";

test("TanStack Router route tree contains all required routes", () => {
  const children = rootRoute.children as Array<{ id?: string; fullPath?: string }>;
  assert.ok(children, "rootRoute should have children");

  const fullPaths = children.map((r) => r.fullPath || r.id);
  assert.ok(fullPaths.includes("/"), "Index route / registered");
  assert.ok(fullPaths.includes("/tours"), "Tours listing /tours registered");
  assert.ok(
    fullPaths.includes("/tours/$slug"),
    "Tour detail /tours/$slug registered",
  );
  assert.ok(fullPaths.includes("/booking"), "Booking /booking registered");
  assert.ok(
    fullPaths.includes("/booking/lookup"),
    "Booking lookup /booking/lookup registered",
  );
  assert.ok(
    fullPaths.includes("/booking/$bookingId"),
    "Booking result /booking/$bookingId registered",
  );
  assert.ok(fullPaths.includes("/policies"), "Policies /policies registered");
});

test("TanStack Router injects QueryClient into context", () => {
  assert.equal(router.options.context?.queryClient, queryClient);
});

test("validateSearch in toursRoute parses, validates and coerces search params safely", () => {
  const validate = toursRoute.options.validateSearch;
  assert.ok(typeof validate === "function", "validateSearch must be a function");

  // Valid params
  const valid = validate({
    q: "Can Tho",
    date: "2026-11-01",
    duration: 2,
    price: 2000000,
    sort: "price-asc",
    page: 2,
  });
  assert.equal(valid.q, "Can Tho");
  assert.equal(valid.departureDate, "2026-11-01");
  assert.equal(valid.duration, 2);
  assert.equal(valid.maxPrice, 2000000);
  assert.equal(valid.sort, "price-asc");
  assert.equal(valid.page, 2);
  assert.equal(valid.pageSize, 6);

  // Invalid and malicious params coerced safely
  const coerced = validate({
    duration: -5,
    price: "Infinity",
    page: "invalid_page",
    sort: "hacked_sort_order",
  });
  assert.equal(coerced.duration, undefined, "Negative duration must be stripped");
  assert.equal(coerced.maxPrice, undefined, "Infinity price must be stripped");
  assert.equal(coerced.page, 1, "Invalid page must default to 1");
  assert.equal(
    coerced.sort,
    "relevance",
    "Invalid sort must default to relevance",
  );

  // Fallback compatibility with departureDate & maxPrice
  const fallback = validate({
    departureDate: "2026-12-15",
    maxPrice: 1800000,
  });
  assert.equal(fallback.departureDate, "2026-12-15");
  assert.equal(fallback.maxPrice, 1800000);
});

test("route loaders prefetch query data without waterfall", async () => {
  // Test toursRoute loader
  const toursLoader = toursRoute.options.loader;
  assert.ok(typeof toursLoader === "function");
  const toursData = await toursLoader({
    context: { queryClient },
    deps: { page: 1, pageSize: 6 },
  } as any);
  assert.ok(toursData && Array.isArray(toursData.items));

  // Test tourDetailRoute loader
  const detailLoader = tourDetailRoute.options.loader;
  assert.ok(typeof detailLoader === "function");
  const detailData = await detailLoader({
    context: { queryClient },
    params: { slug: "my-tho-ben-tre-can-tho" },
  } as any);
  assert.ok(detailData && detailData.slug === "my-tho-ben-tre-can-tho");

  // Test bookingResultRoute loader
  const bookingLoader = bookingResultRoute.options.loader;
  assert.ok(typeof bookingLoader === "function");
  const bookingData = await bookingLoader({
    context: { queryClient },
    params: { bookingId: "non-existent" },
  } as any);
  assert.equal(bookingData, null);

  queryClient.clear();
});
