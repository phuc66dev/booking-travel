import { memo, useRef } from "react";
import { photos, dateLabel } from "../../../data/mock-tours.ts";
import { SafeImage } from "../../../shared/components/SafeImage.tsx";
import { PriceBreakdown } from "../../../components/PriceBreakdown.tsx";
import { AppLink } from "../../../shared/components/AppLink.tsx";
import { money } from "../../../shared/lib/format.ts";
import { profileView } from "../../../shared/lib/diagnostics.tsx";
import type { Tour, Departure } from "../../tours/types.ts";
import type { Draft, PriceQuote } from "../types.ts";
import type { PriceChangedError } from "../api/booking-service.ts";

interface Props {
  tour: Tour;
  draft: Draft;
  departure?: Departure;
  packageName: string;
  quote: PriceQuote;
  agree: boolean;
  agreeError?: string;
  busy: boolean;
  calculating: boolean;
  notice: string;
  voucherFeedback: string;
  priceReview: PriceChangedError | null;
  onAgree: (value: boolean) => void;
  onVoucher: (value: string) => void;
  onUpdate: (patch: Partial<Draft>) => void;
  onAcceptPrice: () => void;
}

// Export the same view for the development-only before/after Profiler experiment.
export function BookingSummaryView(props: Props) {
  const {
    tour,
    draft,
    departure,
    packageName,
    quote: q,
    agree,
    agreeError,
    busy,
    calculating,
    notice,
    voucherFeedback,
    priceReview,
    onAgree,
    onVoucher,
    onUpdate,
    onAcceptPrice,
  } = props;
  const voucher = useRef<HTMLInputElement>(null);
  return profileView(
    "BookingSummary",
    <aside
      className="form-card summary"
      aria-label="Tóm tắt đặt tour"
      aria-busy={calculating}
    >
      <h2>Chuyến đi của bạn</h2>
      <span className="sr-only" role="status">
        {calculating ? "Đang kiểm tra báo giá…" : ""}
      </span>
      <SafeImage src={photos[0].src} alt="Ảnh minh họa Việt Nam" />
      <h3>{tour.title}</h3>
      <p>
        {departure && dateLabel(departure.startAt)} · {packageName}
      </p>
      <p>
        {draft.adults} người lớn · {draft.children} trẻ em · {draft.infants} em
        bé
      </p>
      <p>06:45 · Điểm đón demo Quận 1, TP.HCM</p>
      <AppLink href={"/tours/" + tour.slug} className="text-link">
        Sửa lựa chọn ↗
      </AppLink>
      <div className="voucher">
        <label>
          Mã ưu đãi
          <input
            ref={voucher}
            key={draft.voucherCode}
            name="voucher"
            disabled={busy}
            aria-describedby="voucher-feedback"
            placeholder="MEKONG100"
            defaultValue={draft.voucherCode}
          />
        </label>
        <button
          className="outline"
          type="button"
          disabled={busy}
          onClick={() => onVoucher(voucher.current?.value || "")}
        >
          Áp dụng
        </button>
      </div>
      <p id="voucher-feedback" role="status" className="voucher-feedback">
        {voucherFeedback}
      </p>
      {draft.voucherCode && (
        <button
          type="button"
          disabled={busy}
          className="text-button"
          onClick={() => onUpdate({ voucherCode: "" })}
        >
          Gỡ mã {draft.voucherCode} ×
        </button>
      )}
      <PriceBreakdown value={q} />
      <div className="pay-now">
        <span>Trả trước dự kiến</span>
        <strong>{money(q.payableNow)}</strong>
      </div>
      <p>Còn lại: {money(q.remaining)}</p>
      <label className="agreement">
        <input
          id="agree"
          type="checkbox"
          checked={agree}
          disabled={busy}
          aria-invalid={!!agreeError}
          aria-describedby="agree-error"
          onChange={(event) => onAgree(event.target.checked)}
        />
        <span>
          Tôi đồng ý{" "}
          <a href="/policies" target="_blank" rel="noreferrer">
            chính sách demo ↗
          </a>{" "}
          và hiểu đây là yêu cầu minh họa.
        </span>
      </label>
      <span id="agree-error" className="field-error">
        {agreeError}
      </span>
      {priceReview && (
        <div className="price-review" role="alert">
          <h3>Báo giá vừa được cập nhật</h3>
          <p>
            Giá cũ: {money(priceReview.oldQuote.total)}
            <br />
            Giá mới: <strong>{money(priceReview.newQuote.total)}</strong>
          </p>
          <button
            type="button"
            className="outline full"
            disabled={busy}
            onClick={onAcceptPrice}
          >
            Chấp nhận báo giá mới
          </button>
        </div>
      )}
      {notice && (
        <p className="submit-feedback" role="status">
          {notice}
        </p>
      )}
      <button className="cta full" disabled={busy || !!priceReview}>
        {busy ? "Đang gửi…" : "Tạo yêu cầu đặt tour"} →
      </button>
      <small>Đơn mới: chờ xác nhận, chưa thanh toán.</small>
      <span className="sr-only" aria-live="polite">
        Tổng dự kiến {money(q.total)}
      </span>
    </aside>,
  );
}

export const BookingSummary = memo(BookingSummaryView);
