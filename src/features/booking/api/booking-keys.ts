import type { Draft } from "../types.ts";

export const bookingKeys = {
  all: ["booking"] as const,
  quotes: () => [...bookingKeys.all, "quote"] as const,
  quote: (draft: Draft) =>
    [
      ...bookingKeys.quotes(),
      {
        tourId: draft.tourId,
        departureId: draft.departureId,
        packageId: draft.packageId,
        adults: draft.adults,
        children: draft.children,
        infants: draft.infants,
        voucherCode: draft.voucherCode.trim().toUpperCase(),
        paymentRatio: draft.paymentRatio,
      },
    ] as const,
};
