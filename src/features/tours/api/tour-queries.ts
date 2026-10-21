import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { tourService } from "./tour-service.ts";
import { tourKeys } from "./tour-keys.ts";
import type { TourSearchParams } from "../types.ts";

export { tourKeys } from "./tour-keys.ts";

export function tourQueryOptions(params: TourSearchParams = {}) {
  return queryOptions({
    queryKey: tourKeys.list(params),
    queryFn: () => tourService.searchTours(params),
  });
}

export function tourDetailQueryOptions(slug: string) {
  return queryOptions({
    queryKey: tourKeys.detail(slug),
    queryFn: async () => (await tourService.getTour(slug)) ?? null,
    staleTime: 5 * 60_000,
  });
}

export function departuresQueryOptions(tourId: string) {
  return queryOptions({
    queryKey: tourKeys.departures(tourId),
    queryFn: () => tourService.getDepartures(tourId),
    staleTime: 30_000,
  });
}

export function useTours(params: TourSearchParams = {}, enabled = true) {
  return useQuery({
    ...tourQueryOptions(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useTour(slug: string) {
  return useQuery({
    ...tourDetailQueryOptions(slug),
    enabled: Boolean(slug),
  });
}

export function useDepartures(tourId: string) {
  return useQuery({
    ...departuresQueryOptions(tourId),
    enabled: Boolean(tourId),
  });
}
