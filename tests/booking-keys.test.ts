import { test } from "node:test";
import assert from "node:assert/strict";
import { bookingKeys } from "../src/features/booking/api/booking-keys.ts";
import { emptyDraft } from "../src/features/booking/api/booking-service.ts";

test("booking quote keys use normalized selection and voucher values", () => {
  const a = {
    ...emptyDraft,
    departureId: "dep",
    packageId: "p3",
    voucherCode: " mekong100 ",
  };
  const b = { ...a, voucherCode: "MEKONG100" };
  assert.deepEqual(bookingKeys.quote(a), bookingKeys.quote(b));
  assert.notDeepEqual(
    bookingKeys.quote(a),
    bookingKeys.quote({ ...a, adults: 3 }),
  );
});
