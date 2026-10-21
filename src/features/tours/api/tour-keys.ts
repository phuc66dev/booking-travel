import { normalize } from "../../../data/mock-tours.ts";
import type { TourSearchParams } from "../types.ts";

export const tourKeys = {
  all: ["tours"] as const,
  lists: () => [...tourKeys.all, "list"] as const,
  list: (params: TourSearchParams = {}) =>
    [
      ...tourKeys.lists(),
      {
        ...params,
        q: normalize(params.q?.trim() || ""),
        destination: normalize(params.destination?.trim() || ""),
        page: Math.max(1, Math.floor(params.page || 1)),
        pageSize: Math.max(1, Math.floor(params.pageSize || 6)),
      },
    ] as const,
  details: () => [...tourKeys.all, "detail"] as const,
  detail: (slug: string) => [...tourKeys.details(), slug] as const,
  departures: (tourId: string) =>
    [...tourKeys.all, "departures", tourId] as const,
};
