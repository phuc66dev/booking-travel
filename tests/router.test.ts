import { test } from "node:test";
import assert from "node:assert/strict";
import { parseLocation, normalizePageSearch } from "../src/app/router.ts";

test("router reads pathname and encoded search while keeping anchors local to the page", () => {
  assert.deepEqual(parseLocation("/tours?q=Can+Tho&page=2#results"), {
    pathname: "/tours",
    search: "?q=Can+Tho&page=2",
  });
});

test("out-of-range pagination is reflected in the canonical URL", () => {
  assert.equal(normalizePageSearch("?q=mekong&page=99", 1), "q=mekong");
  assert.equal(normalizePageSearch("?q=mekong", 2), "q=mekong&page=2");
  assert.equal(normalizePageSearch("?q=mekong&page=2", 2), null);
});
