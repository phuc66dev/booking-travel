import type { quote } from "./domain/pricing.ts";

export interface Draft {
  tourId: string;
  departureId: string;
  packageId: string;
  adults: number;
  children: number;
  infants: number;
  voucherCode: string;
  paymentRatio: number;
}

export interface Contact {
  name: string;
  phone: string;
  email: string;
  note: string;
}

export type BookingStatus = "pending_confirmation" | "confirmed" | "cancelled";
export type PaymentStatus = "unpaid" | "partially_paid" | "paid" | "failed";
export type PriceQuote = ReturnType<typeof quote>;

export interface Booking {
  id: string;
  bookingCode: string;
  contact: Contact;
  selectionSnapshot: Draft;
  priceSnapshot: PriceQuote;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}
