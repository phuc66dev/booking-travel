import { useQuery } from "@tanstack/react-query";
import { bookingKeys } from "./booking-keys.ts";
import { adapter } from "./booking-service.ts";
import type { Draft } from "../types.ts";

export { bookingKeys } from "./booking-keys.ts";

export function useBookingResult(bookingId: string) {
  return useQuery({
    queryKey: ["bookings", "result", bookingId],
    queryFn: async () => adapter.getBooking(bookingId) ?? null,
    enabled: Boolean(bookingId),
    staleTime: 0,
    retry: false,
  });
}

export function useBookingQuote(draft: Draft) {
  return useQuery({
    queryKey: bookingKeys.quote(draft),
    queryFn: () => adapter.getQuote(draft),
    enabled: Boolean(draft.departureId && draft.packageId),
    staleTime: 15_000,
    retry: false,
  });
}
