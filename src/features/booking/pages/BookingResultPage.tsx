import type { ReactNode } from "react";
import { PriceBreakdown } from "../../../components/PriceBreakdown.tsx";
import { money } from "../../../shared/lib/format.ts";
import type { Booking, PriceQuote } from "../types.ts";
import { useBookingResult } from "../api/booking-queries.ts";
import {
  tours,
  departures,
  packages,
  dateLabel,
} from "../../../data/mock-tours.ts";
import { statusLabel } from "../domain/pricing.ts";
import { renderLink } from "../../../shared/lib/render-link.tsx";
import { AsyncState } from "../../../shared/components/AsyncState.tsx";

export default function BookingResultRoute({
  bookingId,
}: {
  bookingId: string;
}) {
  const query = useBookingResult(bookingId);
  if (query.isPending || query.isError)
    return (
      <AsyncState error={query.error} retry={() => void query.refetch()} />
    );
  const result = query.data ?? undefined;
  const snapshot = result?.selectionSnapshot;
  const tour = tours.find((item) => item.id === snapshot?.tourId);
  const departure = departures.find(
    (item) => item.id === snapshot?.departureId,
  );
  const tourPackage = packages.find((item) => item.id === snapshot?.packageId);
  return (
    <BookingResultPage
      result={result}
      tourTitle={tour?.title}
      departureDate={departure ? dateLabel(departure.startAt) : undefined}
      packageName={tourPackage?.name}
      statusLabel={statusLabel}
      link={renderLink}
    />
  );
}

interface BookingResultPageProps {
  result?: Booking;
  tourTitle?: string;
  departureDate?: string;
  packageName?: string;
  statusLabel: (status: string) => string;
  link: (url: string, label: ReactNode, className?: string) => ReactNode;
}

export function BookingResultPage({
  result,
  tourTitle,
  departureDate,
  packageName,
  statusLabel,
  link,
}: BookingResultPageProps) {
  return (
    <main className="container narrow">
      <div className="stepper">
        <span>✓ Chọn tour</span>
        <span>✓ Thông tin đặt tour</span>
        <strong>03 Kết quả</strong>
      </div>
      {result ? (
        <>
          <span className="result-icon">✓</span>
          <span className="demo">Bản demo</span>
          <h1>Đã nhận yêu cầu của bạn</h1>
          <p>Chuyến đi đang chờ xác nhận. Chưa thanh toán hoặc giữ chỗ thật.</p>
          <section className="form-card">
            <p>Mã yêu cầu</p>
            <h2>{result.bookingCode}</h2>
            <div className="status-row">
              <span>{statusLabel(result.bookingStatus)}</span>
              <span>{statusLabel(result.paymentStatus)}</span>
            </div>
            <h3>{tourTitle}</h3>
            <p>
              {departureDate} · {packageName}
            </p>
            <p>
              {result.selectionSnapshot.adults} người lớn ·{" "}
              {result.selectionSnapshot.children} trẻ em ·{" "}
              {result.selectionSnapshot.infants} em bé
            </p>
            <p>
              Liên hệ: {result.contact.name[0]}*** ·{" "}
              {result.contact.phone.slice(0, 3)}****
              {result.contact.phone.slice(-3)}
            </p>
            <PriceBreakdown value={result.priceSnapshot as PriceQuote} />
            <p>Trả trước dự kiến: {money(result.priceSnapshot.payableNow)}</p>
            <p>Còn lại: {money(result.priceSnapshot.remaining)}</p>
            <div className="hint">
              <strong>Bước tiếp theo</strong>
              <p>
                Lưu mã yêu cầu để tra cứu trong phiên. Hướng dẫn chuyển khoản
                chỉ minh họa. Không chuyển tiền.
              </p>
            </div>
          </section>
          {link("/booking/lookup", "Tra cứu yêu cầu", "outline")}
        </>
      ) : (
        <div className="empty">
          <h1>Không tìm thấy yêu cầu trong phiên</h1>
          <p>Đơn demo mất sau khi tải lại.</p>
          {link("/tours", "Khám phá tour", "cta")}
        </div>
      )}
    </main>
  );
}
