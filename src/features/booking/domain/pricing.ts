export interface PassengerSelection {
  adults: number;
  children: number;
  infants: number;
  voucherCode: string;
  paymentRatio: number;
}
export interface Prices {
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  singleRoomSupplement: number;
}
export function validatePassengers(d: PassengerSelection, seats: number) {
  const a = [d.adults, d.children, d.infants];
  if (a.some((n) => !Number.isInteger(n) || n < 0) || d.adults < 1)
    return "Cần ít nhất 1 người lớn; số khách phải là số nguyên không âm.";
  if (a.reduce((x, y) => x + y, 0) > 10)
    return "Tối đa 10 hành khách cho một đơn demo.";
  if (d.infants > d.adults) return "Số em bé không được vượt số người lớn.";
  if (d.adults + d.children > seats)
    return `Chuyến chỉ còn ${seats} chỗ. Vui lòng chọn chuyến khác hoặc giảm số khách.`;
  return "";
}
export function voucherError(code: string, subtotal: number, now = Date.now()) {
  const c = code.trim().toUpperCase();
  if (!c) return "";
  const config = voucherSeed[c as keyof typeof voucherSeed];
  if (!config) return "Mã giảm giá không hợp lệ.";
  if (now >= config.expiresAt) return "Mã đã hết hạn.";
  if (subtotal < config.minSubtotal)
    return c === "MEKONG100"
      ? "Tiền khách cần từ 3.000.000 ₫ để áp dụng mã."
      : "Đơn chưa đủ điều kiện áp dụng mã.";
  return "";
}
export function quote(d: PassengerSelection, p: Prices) {
  const passengerSubtotal =
    d.adults * p.adultPrice +
    d.children * p.childPrice +
    d.infants * p.infantPrice;
  const supplements =
    d.adults === 1 && d.children === 0 ? p.singleRoomSupplement : 0;
  const discount =
    d.voucherCode.trim() && !voucherError(d.voucherCode, passengerSubtotal)
      ? Math.min(100000, passengerSubtotal)
      : 0;
  const total = Math.max(0, passengerSubtotal + supplements - discount);
  const payableNow = d.paymentRatio === 50 ? Math.ceil(total * 0.5) : total;
  return {
    passengerSubtotal,
    supplements,
    discount,
    total,
    payableNow,
    remaining: total - payableNow,
    quoteVersion: `demo-v1-${p.adultPrice}-${p.childPrice}-${p.singleRoomSupplement}`,
  };
}
export function isOpen(d: {
  status: string;
  availableSeats: number;
  bookingCutoffAt: string;
}) {
  return (
    d.status === "open" &&
    d.availableSeats > 0 &&
    Date.parse(d.bookingCutoffAt) > Date.now()
  );
}
export function statusLabel(s: string) {
  return (
    (
      {
        pending_confirmation: "Chờ xác nhận",
        confirmed: "Đã xác nhận",
        cancelled: "Đã hủy",
        unpaid: "Chưa thanh toán",
        partially_paid: "Đã thanh toán một phần",
        paid: "Đã thanh toán",
        failed: "Thanh toán thất bại",
      } as Record<string, string>
    )[s] || s
  );
}
export const voucherSeed = {
  MEKONG100: {
    discount: 100000,
    minSubtotal: 3000000,
    expiresAt: Date.now() + 30 * 86400000,
  },
  HETHAN: {
    discount: 100000,
    minSubtotal: 0,
    expiresAt: Date.now() - 86400000,
  },
  CHUADU: {
    discount: 100000,
    minSubtotal: 999000000,
    expiresAt: Date.now() + 30 * 86400000,
  },
};
export { money } from "../../../shared/lib/format.ts";
