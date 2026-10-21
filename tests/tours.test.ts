import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalize,
  departures,
  startingPrice,
} from "../src/data/mock-tours.ts";
test("Vietnamese search normalizes accents, case and Đ", () => {
  assert.equal(normalize("ĐỒNG BẰNG SÔNG CỬU LONG"), "dong bang song cuu long");
  assert.equal(normalize("CẦN THƠ"), normalize("can tho"));
});
test("departure identifiers encode stable dates and starting prices are bookable", () => {
  for (const d of departures) assert.ok(d.id.endsWith(d.startAt.slice(0, 10)));
  assert.equal(startingPrice("t0"), 1600000);
  assert.equal(startingPrice("t6"), 850000);
  assert.equal(startingPrice("missing"), null);
});
