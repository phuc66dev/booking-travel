import type { TourFilterKey, TourSearchParams } from "../types.ts";

const positiveNumber = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : undefined;
  }
  const number = Number(value);
  return value && Number.isFinite(number) && number > 0 ? number : undefined;
};

export function parseTourSearch(
  search: string | Record<string, unknown>,
): TourSearchParams {
  let q: string | undefined;
  let departureDate: string | undefined;
  let duration: number | undefined;
  let maxPrice: number | undefined;
  let sortParam: string | null = null;
  let pageParam: unknown = null;
  let demoParam: unknown = null;

  if (typeof search === "string") {
    const params = new URLSearchParams(search);
    q = params.get("q") || undefined;
    departureDate = params.get("date") || undefined;
    duration = positiveNumber(params.get("duration"));
    maxPrice = positiveNumber(params.get("price"));
    sortParam = params.get("sort");
    pageParam = params.get("page");
    demoParam = params.get("demo");
  } else if (search && typeof search === "object") {
    q = typeof search.q === "string" && search.q ? search.q : undefined;
    departureDate =
      typeof search.date === "string" && search.date
        ? search.date
        : typeof search.departureDate === "string" && search.departureDate
          ? search.departureDate
          : undefined;
    duration = positiveNumber(search.duration);
    maxPrice = positiveNumber(search.price ?? search.maxPrice);
    sortParam = typeof search.sort === "string" ? search.sort : null;
    pageParam = search.page;
    demoParam = search.demo ?? search.fixture;
  }

  return {
    q,
    departureDate,
    duration,
    maxPrice,
    sort:
      sortParam === "asc" || sortParam === "price-asc"
        ? "price-asc"
        : sortParam === "desc" || sortParam === "price-desc"
          ? "price-desc"
          : sortParam === "nearest"
            ? "nearest"
            : "relevance",
    page: Math.floor(positiveNumber(pageParam) || 1),
    pageSize: 6,
    fixture: demoParam === "network" ? "network" : undefined,
  };
}

export function changeTourSearch(
  search: string,
  key: TourFilterKey,
  value: string,
) {
  const params = new URLSearchParams(search);
  if (value) params.set(key, value);
  else params.delete(key);
  if (key !== "page") params.delete("page");
  return `/tours${params.size ? `?${params}` : ""}`;
}
