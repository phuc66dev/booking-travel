import type { TourSearchParams } from "../types.ts";

const positiveNumber = (value: string | null) => {
  const number = Number(value);
  return value && Number.isFinite(number) && number > 0 ? number : undefined;
};

export function parseTourSearch(search: string): TourSearchParams {
  const params = new URLSearchParams(search);
  const sort = params.get("sort");
  return {
    q: params.get("q") || undefined,
    departureDate: params.get("date") || undefined,
    duration: positiveNumber(params.get("duration")),
    maxPrice: positiveNumber(params.get("price")),
    sort:
      sort === "asc"
        ? "price-asc"
        : sort === "desc"
          ? "price-desc"
          : sort === "nearest"
            ? "nearest"
            : "relevance",
    page: Math.floor(positiveNumber(params.get("page")) || 1),
    pageSize: 6,
    fixture: params.get("demo") === "network" ? "network" : undefined,
  };
}

export function changeTourSearch(search: string, key: string, value: string) {
  const params = new URLSearchParams(search);
  if (value) params.set(key, value);
  else params.delete(key);
  if (key !== "page") params.delete("page");
  return `/tours${params.size ? `?${params}` : ""}`;
}
