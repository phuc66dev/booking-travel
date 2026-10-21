import type { departures, tours } from "../../data/mock-tours.ts";

export type Tour = (typeof tours)[number];
export type Departure = (typeof departures)[number];

export type TourSort = "relevance" | "price-asc" | "price-desc" | "nearest";

export interface TourSearchParams {
  q?: string;
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  departureDate?: string;
  sort?: TourSort;
  page?: number;
  pageSize?: number;
  fixture?: "network";
}

export interface TourPage {
  items: Tour[];
  total: number;
  page: number;
  pageSize: number;
}
