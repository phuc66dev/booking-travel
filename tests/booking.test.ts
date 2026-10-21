import { test } from "node:test";
import assert from "node:assert/strict";
import {
  adapter,
  emptyDraft,
  contactErrors,
  normalizePhone,
} from "../src/features/booking/api/booking-service.ts";
import { departures } from "../src/data/mock-tours.ts";
const draft = { ...emptyDraft, departureId: departures[0].id, packageId: "p3" };
const contact = {
  name: "Nguyễn Thị Lan",
  phone: "0901234567",
  email: "",
  note: "",
};
test("Vietnamese contact and optional email", () => {
  assert.equal(
    Object.values(contactErrors(contact, true)).filter(Boolean).length,
    0,
  );
  assert.equal(normalizePhone("+84 901 234 567"), "0901234567");
  assert.ok(contactErrors({ ...contact, email: "abc" }, true).email);
  assert.ok(contactErrors(contact, false).agree);
});
test("concurrent idempotency returns one booking", async () => {
  const [a, b] = await Promise.all([
    adapter.createBooking(draft, contact, "same-key", "normal"),
    adapter.createBooking(draft, contact, "same-key", "normal"),
  ]);
  assert.equal(a.id, b.id);
  assert.equal(a.bookingStatus, "pending_confirmation");
  assert.equal(a.paymentStatus, "unpaid");
  assert.equal(
    (await adapter.lookupBooking(a.bookingCode, contact.phone))?.id,
    a.id,
  );
  assert.equal(
    await adapter.lookupBooking(a.bookingCode, "0911111111"),
    undefined,
  );
});
test("deterministic failures create no booking", async () => {
  await assert.rejects(
    adapter.createBooking(draft, contact, "soldout", "soldout"),
    /hết chỗ/,
  );
  await assert.rejects(
    adapter.createBooking(draft, contact, "network", "network"),
    /gián đoạn/,
  );
  await assert.rejects(
    adapter.getQuote({ ...draft, departureId: departures[2].id, children: 1 }),
    /2 chỗ/,
  );
});
test("price changes require explicit version acceptance", async () => {
  const d = { ...draft, departureId: departures[5].id };
  let version = "";
  await assert.rejects(
    adapter.createBooking(d, contact, "price-change", "price"),
    (error) => {
      const err =
        error as import("../src/features/booking/api/booking-service.ts").PriceChangedError;
      assert.equal(err.oldQuote.total, 3200000);
      assert.equal(err.newQuote.total, 3400000);
      version = err.newQuote.quoteVersion;
      return true;
    },
  );
  await assert.rejects(
    adapter.createBooking(d, contact, "price-change", "normal"),
    /chấp nhận/,
  );
  const b = await adapter.createBooking(
    d,
    contact,
    "price-change",
    "normal",
    version,
  );
  assert.equal(b.priceSnapshot.total, 3400000);
  assert.equal(
    adapter.simulatePayment(b.id, "partially_paid").paymentStatus,
    "partially_paid",
  );
  assert.equal(adapter.simulatePayment(b.id, "paid").paymentStatus, "paid");
});
import { restoreDraft } from "../src/features/booking/api/booking-service.ts";
test("invalid, expired and over-capacity persisted drafts restore safely", () => {
  let saved = "";
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: { getItem: () => saved },
  });
  saved = "{broken";
  assert.equal(restoreDraft().departureId, "");
  saved = JSON.stringify({ version: 1, savedAt: Date.now() - 86400001, draft });
  assert.equal(restoreDraft().departureId, "");
  saved = JSON.stringify({
    version: 1,
    savedAt: Date.now(),
    draft: { ...draft, departureId: "invalid" },
  });
  assert.equal(restoreDraft().departureId, "");
  saved = JSON.stringify({
    version: 1,
    savedAt: Date.now(),
    draft: { ...draft, departureId: departures[2].id, children: 1 },
  });
  assert.equal(restoreDraft().departureId, "");
  saved = JSON.stringify({ version: 1, savedAt: Date.now(), draft });
  assert.equal(restoreDraft().departureId, draft.departureId);
});
test("idempotency rejects edited payloads", async () => {
  await adapter.createBooking(draft, contact, "immutable-payload", "normal");
  await assert.rejects(
    adapter.createBooking(
      { ...draft, paymentRatio: 50 },
      contact,
      "immutable-payload",
      "normal",
    ),
    /thay đổi/,
  );
});
