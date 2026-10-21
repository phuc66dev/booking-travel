import { test } from "node:test";
import assert from "node:assert/strict";
import { tourKeys } from "../src/features/tours/api/tour-keys.ts";

test("tour list keys normalize equivalent text and distinguish query params", () => {
  assert.deepEqual(
    tourKeys.list({ q: "CẦN THƠ" }),
    tourKeys.list({ q: "can tho" }),
  );
  assert.notDeepEqual(
    tourKeys.list({ q: "can tho" }),
    tourKeys.list({ q: "can tho", page: 2 }),
  );
  assert.notDeepEqual(tourKeys.detail("my-tho"), tourKeys.detail("can-tho"));
});
