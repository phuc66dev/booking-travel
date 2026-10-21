import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emptyDraft,
  transitionDraft,
  draftForTour,
} from "../src/features/booking/domain/booking-draft.ts";
import { departures } from "../src/data/mock-tours.ts";

test("changing departure clears an unavailable package without silently replacing it", () => {
  const nextDeparture = departures.find(
    (d) => d.tourId === "t0" && d.unavailablePackage === "p5",
  )!;
  const result = transitionDraft(
    { ...emptyDraft, packageId: "p5" },
    { departureId: nextDeparture.id },
  );
  assert.equal(result.draft.packageId, "");
  assert.match(result.notice, /chọn lại/);
});

test("lowering passenger subtotal removes a voucher that lost eligibility", () => {
  const result = transitionDraft(
    { ...emptyDraft, packageId: "p3", voucherCode: "MEKONG100" },
    { adults: 1 },
  );
  assert.equal(result.draft.voucherCode, "");
  assert.match(result.notice, /gỡ mã/);
});

test("selecting another tour preserves passenger counts but clears tour-specific selection", () => {
  const original = {
    ...emptyDraft,
    departureId: "old",
    packageId: "p3",
    adults: 3,
    voucherCode: "MEKONG100",
  };
  const next = draftForTour(original, "t1");
  assert.equal(next.tourId, "t1");
  assert.equal(next.adults, 3);
  assert.equal(next.departureId, "");
  assert.equal(next.packageId, "");
  assert.equal(next.voucherCode, "");
  assert.equal(draftForTour(next, "t1"), next);
});
