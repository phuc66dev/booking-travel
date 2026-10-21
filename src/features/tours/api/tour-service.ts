import {
  dateLabel,
  departures,
  normalize,
  startingPrice,
  tours,
} from "../../../data/mock-tours.ts";
import { isOpen } from "../../booking/domain/pricing.ts";
import type { Departure, Tour, TourPage, TourSearchParams } from "../types.ts";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 120));

const departureDate = (departure: Departure) =>
  dateLabel(departure.startAt).split("/").reverse().join("-");

const soonestOpenDeparture = (tourId: string) =>
  departures
    .filter((item) => item.tourId === tourId && isOpen(item))
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))[0];

export const tourService = {
  async searchTours(params: TourSearchParams = {}): Promise<TourPage> {
    await wait();
    if (params.fixture === "network")
      throw new Error(
        "Kết nối demo bị gián đoạn. Bấm Thử lại để tải lại danh mục.",
      );
    const query = normalize(params.q?.trim() || "");
    const destination = normalize(params.destination?.trim() || "");
    const filtered = tours.filter((tour) => {
      const text = normalize(`${tour.title} ${tour.destinations.join(" ")}`);
      const price = startingPrice(tour.id, params.departureDate) ?? Infinity;
      const hasDate =
        !params.departureDate ||
        departures.some(
          (item) =>
            item.tourId === tour.id &&
            departureDate(item) === params.departureDate &&
            isOpen(item),
        );
      return (
        (!query || text.includes(query)) &&
        (!destination ||
          normalize(tour.destinations.join(" ")).includes(destination)) &&
        (params.duration === undefined ||
          tour.durationDays === params.duration) &&
        (params.minPrice === undefined || price >= params.minPrice) &&
        (params.maxPrice === undefined || price <= params.maxPrice) &&
        hasDate
      );
    });

    if (params.sort === "price-asc" || params.sort === "price-desc") {
      const direction = params.sort === "price-asc" ? 1 : -1;
      filtered.sort(
        (a, b) =>
          direction *
          ((startingPrice(a.id, params.departureDate) ?? Infinity) -
            (startingPrice(b.id, params.departureDate) ?? Infinity)),
      );
    } else if (params.sort === "nearest") {
      filtered.sort((a, b) => {
        const aDate = Date.parse(soonestOpenDeparture(a.id)?.startAt || "9999");
        const bDate = Date.parse(soonestOpenDeparture(b.id)?.startAt || "9999");
        return aDate - bDate;
      });
    }

    const pageSize = Math.max(1, Math.floor(params.pageSize || 6));
    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    const page = Math.min(pageCount, Math.max(1, Math.floor(params.page || 1)));
    const offset = (page - 1) * pageSize;
    return {
      items: filtered.slice(offset, offset + pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
  },

  async getTour(slug: string): Promise<Tour | undefined> {
    await wait();
    return tours.find((tour) => tour.slug === slug);
  },

  async getDepartures(tourId: string): Promise<Departure[]> {
    await wait();
    return departures.filter((departure) => departure.tourId === tourId);
  },
};
