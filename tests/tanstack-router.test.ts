import { test } from "node:test";
import assert from "node:assert/strict";
import { parseTourSearch } from "../src/features/tours/domain/search.ts";

test("route search parser accepts typed router search values", () => {
  const search = parseTourSearch({
    q: "Can Tho",
    date: "2026-11-01",
    duration: 2,
    price: 2_000_000,
    sort: "price-asc",
    page: 2,
  });

  assert.equal(search.q, "Can Tho");
  assert.equal(search.departureDate, "2026-11-01");
  assert.equal(search.duration, 2);
  assert.equal(search.maxPrice, 2_000_000);
  assert.equal(search.sort, "price-asc");
  assert.equal(search.page, 2);
  assert.equal(search.pageSize, 6);
});

test("route search parser drops malformed values and keeps safe defaults", () => {
  const search = parseTourSearch({
    duration: -5,
    price: "Infinity",
    page: "invalid_page",
    sort: "hacked_sort_order",
  });

  assert.equal(search.duration, undefined);
  assert.equal(search.maxPrice, undefined);
  assert.equal(search.page, 1);
  assert.equal(search.sort, "relevance");
});
