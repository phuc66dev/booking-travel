import { test } from "node:test";
import assert from "node:assert/strict";
import { tourService } from "../src/features/tours/api/tour-service.ts";
import {
  dateLabel,
  departurePackagePrices,
  departures,
  startingPrice,
} from "../src/data/mock-tours.ts";

test("tour search normalizes Vietnamese and applies filters before pagination", async () => {
  const result = await tourService.searchTours({
    q: "CAN THO",
    duration: 2,
    page: 1,
    pageSize: 1,
  });

  assert.equal(result.total, 2);
  assert.equal(result.items.length, 1);
  assert.equal(result.page, 1);
});

test("tour detail and departure service return undefined or empty for unknown ids", async () => {
  assert.equal(await tourService.getTour("missing"), undefined);
  assert.deepEqual(await tourService.getDepartures("missing"), []);
});

test("price sorting uses the selected departure date price", async () => {
  const departure = departures.find(
    (item) => item.tourId === "t0" && item.premium > 0,
  )!;
  const date = dateLabel(departure.startAt).split("/").reverse().join("-");
  const changed = departurePackagePrices.filter(
    (item) => item.departureId === departure.id,
  );
  const oldPrices = changed.map((item) => item.adultPrice);
  changed.forEach((item) => {
    item.adultPrice += 5_000_000;
  });
  try {
    const result = await tourService.searchTours({
      sort: "price-asc",
      departureDate: date,
      pageSize: 100,
    });
    const prices = result.items.map((tour) => startingPrice(tour.id, date)!);
    assert.deepEqual(
      prices,
      [...prices].sort((a, b) => a - b),
    );
  } finally {
    changed.forEach((item, index) => {
      item.adultPrice = oldPrices[index];
    });
  }
});
