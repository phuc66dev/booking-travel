import { departures } from "../../../data/mock-tours.ts";
import { emptyDraft, getPrice } from "../api/booking-service.ts";
import { quote, voucherError } from "./pricing.ts";
import type { Draft } from "../types.ts";

export { emptyDraft };

export function draftForTour(draft: Draft, tourId: string): Draft {
  return draft.tourId === tourId
    ? draft
    : {
        ...draft,
        tourId,
        departureId: "",
        packageId: "",
        voucherCode: "",
      };
}

export function transitionDraft(draft: Draft, patch: Partial<Draft>) {
  const next = { ...draft, ...patch };
  const departure = departures.find((item) => item.id === next.departureId);
  let notice = "";
  if (next.packageId && departure?.unavailablePackage === next.packageId) {
    next.packageId = "";
    notice = "Gói cũ không bán ở chuyến này. Vui lòng chọn lại.";
  }
  if (
    next.voucherCode &&
    voucherError(
      next.voucherCode,
      quote(next, getPrice(next)).passengerSubtotal,
    )
  ) {
    next.voucherCode = "";
    notice = "Đã gỡ mã vì không đủ điều kiện.";
  }
  return { draft: next, notice };
}
