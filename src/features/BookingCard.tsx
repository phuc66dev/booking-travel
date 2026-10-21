import { useEffect, useRef, useState } from "react";
import { packages, dateLabel, startingPrice } from "../data/mock-tours.ts";
import type { departures } from "../data/mock-tours.ts";
import { money, isOpen } from "./booking/domain/pricing.ts";
import type { quote } from "./booking/domain/pricing.ts";
import type { Draft } from "./booking/api/booking-service.ts";
import { getPrice } from "./booking/api/booking-service.ts";
import { PriceBreakdown } from "../components/PriceBreakdown";
type Departure = (typeof departures)[number];
interface Props {
  scope: string;
  draft: Draft;
  dep: Departure | undefined;
  deps: Departure[];
  price: ReturnType<typeof getPrice>;
  q: ReturnType<typeof quote>;
  reason: string;
  busy: boolean;
  update: (p: Partial<Draft>) => void;
  pick: (id: string) => void;
  next: () => void;
}
export function BookingCard({
  scope,
  draft,
  dep,
  deps,
  price,
  q,
  reason,
  busy,
  update,
  pick,
  next,
}: Props) {
  const card = useRef<HTMLElement>(null);
  const [tall, setTall] = useState(true);
  useEffect(() => {
    const measure = () =>
      setTall((card.current?.offsetHeight || 0) + 104 > innerHeight);
    const observer = new ResizeObserver(measure);
    if (card.current) observer.observe(card.current);
    addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      removeEventListener("resize", measure);
    };
  }, []);
  return (
    <aside
      ref={card}
      data-tall={tall}
      className="booking-card"
      id={"choose-" + scope}
    >
      <div className="card-price">
        <span className="eyebrow">CHUYẾN ĐI NHỎ, KỶ NIỆM LỚN</span>
        <p>Giá {dep && draft.packageId ? "người lớn" : "từ"}</p>
        <div>
          <strong>
            {money(
              dep && draft.packageId
                ? price.adultPrice
                : startingPrice(draft.tourId) || 1600000,
            )}
          </strong>
          <span> / khách</span>
        </div>
        <small>Giá demo đã gồm các khoản bắt buộc</small>
      </div>
      <div className="booking-body">
        <h3>▦ Chọn ngày khởi hành</h3>
        <div className="dates">
          {deps.slice(0, 3).map((d) => (
            <button
              key={d.id}
              className={draft.departureId === d.id ? "selected" : ""}
              disabled={!isOpen(d)}
              onClick={() => pick(d.id)}
            >
              <strong>
                {dateLabel(d.startAt).slice(0, 5)}{" "}
                {draft.departureId === d.id ? "✓" : ""}
              </strong>
              <small>
                {d.availableSeats ? `Còn ${d.availableSeats} chỗ` : "Hết chỗ"}
              </small>
            </button>
          ))}
        </div>
        <a className="text-link" href="#departures">
          Xem tất cả lịch khởi hành ↗
        </a>
        <h3>Chọn gói dịch vụ</h3>
        <div className="package-radio" role="group" aria-label="Gói khách sạn">
          {packages.map((p) => (
            <label
              key={p.id}
              className={draft.packageId === p.id ? "selected" : ""}
            >
              <input
                type="radio"
                name={"package-" + scope}
                disabled={!dep || dep.unavailablePackage === p.id}
                checked={draft.packageId === p.id}
                onChange={() => update({ packageId: p.id })}
              />
              <span>
                {p.name}
                <small>
                  {p.hotelStars === 3
                    ? "Tiện nghi vừa đủ"
                    : p.hotelStars === 4
                      ? "Nghỉ ngơi thoải mái"
                      : "Trải nghiệm cao cấp"}
                </small>
              </span>
              <strong>
                {money(getPrice({ ...draft, packageId: p.id }).adultPrice)}
              </strong>
            </label>
          ))}
        </div>
        <h3>Số lượng hành khách</h3>
        {(["adults", "children", "infants"] as const).map((k, i) => (
          <div className="passenger" key={k}>
            <span>
              <strong>{["Người lớn", "Trẻ em", "Em bé"][i]}</strong>
              <small>
                {["Từ 9 tuổi", "Từ 4 đến dưới 9 tuổi", "Dưới 4 tuổi"][i]} ·{" "}
                {money([price.adultPrice, price.childPrice, 0][i])}
              </small>
            </span>
            <div className="counter">
              <button
                aria-label={"Giảm " + ["người lớn", "trẻ em", "em bé"][i]}
                disabled={draft[k] <= (i === 0 ? 1 : 0)}
                onClick={() => update({ [k]: draft[k] - 1 })}
              >
                −
              </button>
              <span>{draft[k]}</span>
              <button
                aria-label={"Tăng " + ["người lớn", "trẻ em", "em bé"][i]}
                disabled={draft.adults + draft.children + draft.infants >= 10}
                onClick={() => update({ [k]: draft[k] + 1 })}
              >
                +
              </button>
            </div>
          </div>
        ))}
        <p className="tiny">
          Tự khai tuổi theo ngày đi. Người lớn và trẻ em chiếm 1 chỗ; em bé
          không chiếm chỗ.
        </p>
        {dep && draft.packageId ? (
          <PriceBreakdown value={q} />
        ) : (
          <p className="hint">Chọn chuyến và gói để xem tổng giá.</p>
        )}
        <button
          className="cta full"
          disabled={!!reason || busy}
          onClick={next}
          aria-describedby={"booking-reason-" + scope}
        >
          {busy ? "Đang kiểm tra…" : "Tiếp tục đặt tour"} →
        </button>
        {reason && (
          <p className="tiny" id={"booking-reason-" + scope}>
            {reason}
          </p>
        )}
        <p className="support">✓ Không cần tài khoản · Chưa thanh toán</p>
      </div>
    </aside>
  );
}
