import { memo } from "react";
import {
  departures,
  photos,
  dateLabel,
  startingPrice,
} from "../../../data/mock-tours.ts";
import { isOpen } from "../../booking/domain/pricing.ts";
import { money } from "../../../shared/lib/format.ts";
import { AppLink } from "../../../shared/components/AppLink.tsx";
import { SafeImage } from "../../../shared/components/SafeImage.tsx";
import type { Tour } from "../types.ts";

export const TourCard = memo(function TourCard({
  tour,
  imageIndex = 0,
  dateFilter = "",
}: {
  tour: Tour;
  imageIndex?: number;
  dateFilter?: string;
}) {
  const next = departures.find(
    (item) => item.tourId === tour.id && isOpen(item),
  );
  const price = startingPrice(tour.id, dateFilter);
  const photo = photos[imageIndex % photos.length];
  return (
    <article className="tour-card">
      <AppLink href={"/tours/" + tour.slug}>
        <div className="tour-image">
          <SafeImage src={photo.src} alt={photo.alt} loading="lazy" />
          <span className="image-tag">Miền Tây thương mến</span>
        </div>
        <div className="tour-card-body">
          <small>⌖ {tour.destinations[0]}</small>
          <h3>{tour.title}</h3>
          <p>
            ◷ {tour.durationDays} ngày {tour.durationDays > 1 ? "1 đêm" : ""} ·
            Từ TP.HCM
          </p>
          <p>
            {next
              ? `Khởi hành ${dateLabel(next.startAt)}`
              : "Chưa có lịch mở bán"}
          </p>
          <div className="tour-card-bottom">
            <span>
              <small>Giá từ</small>
              <strong>{price === null ? "Chưa mở bán" : money(price)}</strong>
            </span>
            <span className="round-arrow">↗</span>
          </div>
        </div>
      </AppLink>
    </article>
  );
});
