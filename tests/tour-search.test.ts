import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseTourSearch,
  changeTourSearch,
} from "../src/features/tours/domain/search.ts";

test("URL filters parse without accepting negative, infinite or malformed numeric values", () => {
  const parsed = parseTourSearch(
    "?q=Can+Tho&duration=-2&price=Infinity&page=abc&sort=desc",
  );
  assert.equal(parsed.q, "Can Tho");
  assert.equal(parsed.duration, undefined);
  assert.equal(parsed.maxPrice, undefined);
  assert.equal(parsed.page, 1);
  assert.equal(parsed.sort, "price-desc");
});

test("changing a filter resets page and retains other filters for Back/refresh", () => {
  const next = changeTourSearch("?q=Can+Tho&page=2&sort=asc", "duration", "2");
  assert.equal(next, "/tours?q=Can+Tho&sort=asc&duration=2");
  assert.equal(
    changeTourSearch("?q=Can+Tho", "page", "2"),
    "/tours?q=Can+Tho&page=2",
  );
});
