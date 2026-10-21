import { demoId } from "../../id.ts";
import {
  departures,
  packages,
  tours,
  departurePackagePrices,
} from "../../../data/mock-tours.ts";
import {
  isOpen,
  quote,
  validatePassengers,
  voucherError,
  money,
} from "../domain/pricing.ts";
import type { Booking, Contact, Draft, PaymentStatus } from "../types.ts";
import { contactErrors, normalizePhone } from "../domain/validation.ts";
export { contactErrors, normalizePhone } from "../domain/validation.ts";
export type {
  Booking,
  BookingStatus,
  Contact,
  Draft,
  PaymentStatus,
  PriceQuote,
} from "../types.ts";
export const emptyDraft: Draft = {
  tourId: "t0",
  departureId: "",
  packageId: "",
  adults: 2,
  children: 0,
  infants: 0,
  voucherCode: "",
  paymentRatio: 100,
};
const overrides = new Map<string, number>();
export function getPrice(d: Draft) {
  const p = packages.find((p) => p.id === d.packageId) || packages[0];
  const row = departurePackagePrices.find(
    (x) => x.departureId === d.departureId && x.packageId === p.id,
  );
  const extra = overrides.get(d.departureId + ":" + d.packageId) || 0;
  return {
    ...p,
    adultPrice: (row?.adultPrice ?? p.adultPrice) + extra,
    childPrice: (row?.childPrice ?? p.childPrice) + extra * 0.75,
    infantPrice: row?.infantPrice ?? 0,
  };
}

type Quote = ReturnType<typeof quote>;
export class PriceChangedError extends Error {
  oldQuote: Quote;
  newQuote: Quote;
  constructor(oldQuote: Quote, newQuote: Quote) {
    super(
      `Giá demo đã thay đổi: ${money(oldQuote.total)} → ${money(newQuote.total)}. Vui lòng chấp nhận báo giá mới trước khi gửi lại.`,
    );
    this.oldQuote = oldQuote;
    this.newQuote = newQuote;
  }
}
const delay = () => new Promise((r) => setTimeout(r, 450));
const bookings = new Map<string, Booking>();
const revisions = new Map<string, { old: Quote; next: Quote }>();
function reuseBooking(key: string, d: Draft, contact: Contact) {
  const b = bookings.get(key);
  if (!b) return undefined;
  const c = {
    ...contact,
    name: contact.name.trim(),
    phone: normalizePhone(contact.phone),
    email: contact.email.trim(),
  };
  if (
    JSON.stringify(b.selectionSnapshot) !== JSON.stringify(d) ||
    JSON.stringify(b.contact) !== JSON.stringify(c)
  )
    throw Error(
      "Yêu cầu đã thay đổi. Vui lòng bắt đầu một yêu cầu mới để tiếp tục.",
    );
  return b;
}
export const adapter = {
  async getQuote(d: Draft) {
    await delay();
    const dep = departures.find(
      (x) => x.id === d.departureId && x.tourId === d.tourId,
    );
    if (!dep || !isOpen(dep))
      throw Error("Chuyến không còn mở bán. Vui lòng chọn chuyến khác.");
    if (
      !packages.some((p) => p.id === d.packageId) ||
      dep.unavailablePackage === d.packageId
    )
      throw Error("Vui lòng chọn gói khả dụng.");
    if (![50, 100].includes(d.paymentRatio))
      throw Error("Tỷ lệ thanh toán không hợp lệ.");
    const error =
      validatePassengers(d, dep.availableSeats) ||
      voucherError(d.voucherCode, quote(d, getPrice(d)).passengerSubtotal);
    if (error) throw Error(error);
    return quote(d, getPrice(d));
  },
  async createBooking(
    d: Draft,
    contact: Contact,
    key: string,
    fixture: string,
    acceptedVersion?: string,
  ) {
    {
      const existing = reuseBooking(key, d, contact);
      if (existing) return existing;
    }
    const snapshot = { ...d };
    const price = await this.getQuote(snapshot);
    {
      const existing = reuseBooking(key, d, contact);
      if (existing) return existing;
    }
    const invalid = Object.values(contactErrors(contact, true)).find(Boolean);
    if (invalid) throw Error(invalid);
    if (fixture === "network")
      throw Error(
        "Kết nối bị gián đoạn. Dữ liệu vẫn được giữ, vui lòng thử lại.",
      );
    if (fixture === "soldout")
      throw Error("Chuyến vừa hết chỗ. Vui lòng quay lại chọn chuyến khác.");
    if (fixture === "price" && !revisions.has(key)) {
      overrides.set(d.departureId + ":" + d.packageId, 100000);
      const next = quote(d, getPrice(d));
      revisions.set(key, { old: price, next });
      throw new PriceChangedError(price, next);
    }
    const revision = revisions.get(key);
    if (revision && acceptedVersion !== price.quoteVersion)
      throw new PriceChangedError(revision.old, price);
    const id = demoId();
    const b: Booking = {
      id,
      bookingCode: "MJ-" + id.slice(0, 8).toUpperCase(),
      contact: {
        ...contact,
        name: contact.name.trim(),
        phone: normalizePhone(contact.phone),
        email: contact.email.trim(),
      },
      selectionSnapshot: snapshot,
      priceSnapshot: price,
      bookingStatus: "pending_confirmation",
      paymentStatus: "unpaid",
      createdAt: new Date().toISOString(),
    };
    bookings.set(key, b);
    bookings.set(id, b);
    return b;
  },
  async lookupBooking(code: string, phone: string) {
    await delay();
    return [...bookings.values()].find(
      (b) =>
        b.bookingCode === code.trim().toUpperCase() &&
        b.contact.phone === normalizePhone(phone),
    );
  },
  getBooking(id: string) {
    return bookings.get(id);
  },
  simulatePayment(id: string, status: PaymentStatus) {
    const booking = bookings.get(id);
    if (!booking) throw Error("Không tìm thấy đơn phù hợp");
    booking.paymentStatus = status;
    return { ...booking };
  },
};
export function restoreDraft(): Draft {
  try {
    const s = JSON.parse(sessionStorage.getItem("mj-draft") || "null");
    if (
      s?.version !== 1 ||
      !Number.isFinite(s.savedAt) ||
      Date.now() - s.savedAt >= 86400000 ||
      s.savedAt > Date.now()
    )
      return { ...emptyDraft };
    const d = s.draft as Draft;
    if (
      !d ||
      typeof d.voucherCode !== "string" ||
      ![50, 100].includes(d.paymentRatio) ||
      !tours.some((t) => t.id === d.tourId) ||
      validatePassengers(d, 100)
    )
      return { ...emptyDraft };
    const dep = departures.find(
      (x) => x.id === d.departureId && x.tourId === d.tourId,
    );
    const validDep =
      dep && isOpen(dep) && !validatePassengers(d, dep.availableSeats);
    const result: Draft = {
      tourId: d.tourId,
      departureId: validDep ? dep.id : "",
      packageId:
        validDep &&
        packages.some((p) => p.id === d.packageId) &&
        dep.unavailablePackage !== d.packageId
          ? d.packageId
          : "",
      adults: d.adults,
      children: d.children,
      infants: d.infants,
      voucherCode: d.voucherCode,
      paymentRatio: d.paymentRatio,
    };
    if (
      voucherError(
        result.voucherCode,
        quote(result, getPrice(result)).passengerSubtotal,
      )
    )
      result.voucherCode = "";
    return result;
  } catch {
    return { ...emptyDraft };
  }
}
