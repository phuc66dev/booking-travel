import { test } from "node:test";
import assert from "node:assert/strict";
import {
  quote,
  validatePassengers,
  voucherError,
  isOpen,
  statusLabel,
} from "../src/features/booking/domain/pricing.ts";
const draft = {
  adults: 2,
  children: 0,
  infants: 0,
  paymentRatio: 100,
  voucherCode: "",
};
const price = {
  adultPrice: 1600000,
  childPrice: 1200000,
  infantPrice: 0,
  singleRoomSupplement: 300000,
};
test("required pricing examples", () => {
  assert.equal(quote(draft, price).total, 3200000);
  const q = quote(
    { ...draft, voucherCode: "MEKONG100", paymentRatio: 50 },
    price,
  );
  assert.deepEqual(
    [q.total, q.payableNow, q.remaining],
    [3100000, 1550000, 1550000],
  );
  assert.equal(quote({ ...draft, adults: 1 }, price).total, 1900000);
  assert.equal(
    quote(
      { ...draft, children: 1 },
      { ...price, adultPrice: 1950000, childPrice: 1462500 },
    ).total,
    5362500,
  );
});
test("passenger limits and shared seats", () => {
  assert.ok(validatePassengers({ ...draft, adults: 0 }, 10));
  assert.ok(validatePassengers({ ...draft, infants: 3 }, 10));
  assert.ok(validatePassengers({ ...draft, children: 1 }, 2));
  assert.ok(validatePassengers({ ...draft, adults: 11 }, 20));
  assert.ok(validatePassengers({ ...draft, children: -1 }, 20));
  assert.equal(validatePassengers(draft, 2), "");
});
test("voucher, cutoff and status", () => {
  assert.equal(voucherError(" mekong100 ", 3200000), "");
  assert.ok(voucherError("HETHAN", 3200000));
  assert.ok(voucherError("MEKONG100", 1600000));
  assert.equal(
    isOpen({
      status: "open",
      availableSeats: 4,
      bookingCutoffAt: new Date(Date.now() - 1000).toISOString(),
    }),
    false,
  );
  assert.equal(statusLabel("pending_confirmation"), "Chờ xác nhận");
  assert.equal(statusLabel("unpaid"), "Chưa thanh toán");
});
test("cutoff and every booking/payment status mapping", () => {
  const departure = {
    status: "open",
    availableSeats: 1,
    bookingCutoffAt: new Date(Date.now() + 3600000).toISOString(),
  };
  assert.equal(isOpen(departure), true);
  assert.equal(isOpen({ ...departure, availableSeats: 0 }), false);
  assert.equal(isOpen({ ...departure, status: "closed" }), false);
  assert.equal(
    isOpen({
      ...departure,
      bookingCutoffAt: new Date(Date.now() - 1).toISOString(),
    }),
    false,
  );
  for (const status of [
    "pending_confirmation",
    "confirmed",
    "cancelled",
    "unpaid",
    "partially_paid",
    "paid",
    "failed",
  ])
    assert.notEqual(statusLabel(status), status);
});
