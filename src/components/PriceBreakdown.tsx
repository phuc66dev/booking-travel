import { money } from "../features/booking/domain/pricing.ts";
import type { quote } from "../features/booking/domain/pricing.ts";
export function PriceBreakdown({ value }: { value: ReturnType<typeof quote> }) {
  return (
    <div className="breakdown">
      <div>
        <span>Tiền hành khách</span>
        <span>{money(value.passengerSubtotal)}</span>
      </div>
      {value.supplements > 0 && (
        <>
          <div>
            <span>Phụ thu phòng riêng</span>
            <span>{money(value.supplements)}</span>
          </div>
          <small>
            Áp dụng cho 1 người lớn không có trẻ em, kể cả đi cùng em bé.
          </small>
        </>
      )}
      {value.discount > 0 && (
        <div className="green">
          <span>Ưu đãi MEKONG100</span>
          <span>−{money(value.discount)}</span>
        </div>
      )}
      <div className="total">
        <strong>Tổng cộng</strong>
        <strong>{money(value.total)}</strong>
      </div>
    </div>
  );
}
