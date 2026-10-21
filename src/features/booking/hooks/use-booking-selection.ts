import { useMemo, useCallback } from "react";
import { useBookingDraft } from "./draft-context.ts";
import { useBookingQuote } from "../api/booking-queries.ts";
import { getPrice } from "../api/booking-service.ts";
import { useDepartures } from "../../tours/api/tour-queries.ts";
import { isOpen, quote, validatePassengers } from "../domain/pricing.ts";

export function useBookingSelection() {
  const context = useBookingDraft();
  const { draft, update } = context;
  const departuresQuery = useDepartures(draft.tourId);
  const quoteQuery = useBookingQuote(draft);
  const departures = departuresQuery.data;
  const departure = departures?.find((item) => item.id === draft.departureId);
  const price = getPrice(draft);
  const fallbackQuote = useMemo(() => quote(draft, getPrice(draft)), [draft]);
  const priceQuote = quoteQuery.data ?? fallbackQuote;
  const reason = !departure
    ? "Chọn ngày khởi hành để tiếp tục."
    : !draft.packageId
      ? "Chọn gói dịch vụ để tiếp tục."
      : !isOpen(departure)
        ? "Chuyến đã ngừng bán."
        : validatePassengers(draft, departure.availableSeats);
  const pick = useCallback(
    (id: string) => update({ departureId: id }),
    [update],
  );
  return {
    ...context,
    dep: departure,
    deps: departures ?? [],
    price,
    q: priceQuote,
    reason,
    pick,
    quoteQuery,
    departuresQuery,
  };
}
