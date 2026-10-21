import { useEffect, useState, type ReactNode } from "react";
import {
  tours,
  packages,
  dateLabel,
  startingPrice,
} from "../../../data/mock-tours.ts";
import { money } from "../../../shared/lib/format.ts";
import { isOpen } from "../../booking/domain/pricing.ts";
import { getPrice } from "../../booking/api/booking-service.ts";
import { TourGallery } from "../../../components/TourGallery.tsx";
import { SectionNav } from "../../../components/SectionNav.tsx";
import { BookingCard } from "../../BookingCard.tsx";
import { TourCard } from "../components/TourCard.tsx";
import { useBookingDraft } from "../../booking/hooks/draft-context.ts";
import { useBookingSelection } from "../../booking/hooks/use-booking-selection.ts";
import { useTour } from "../api/tour-queries.ts";
import { AsyncState } from "../../../shared/components/AsyncState.tsx";
import { renderLink as link } from "../../../shared/lib/render-link.tsx";
import { navigateTo } from "../../../app/router.ts";
import type { Tour } from "../types.ts";

const section = (id: string, title: string, body: ReactNode) => (
  <section className="detail-section" id={id}>
    <h2>{title}</h2>
    {body}
  </section>
);

export default function TourDetailPage({ slug }: { slug: string }) {
  const query = useTour(slug);
  if (query.isPending || query.isError)
    return (
      <AsyncState error={query.error} retry={() => void query.refetch()} />
    );
  if (!query.data)
    return (
      <main className="container empty">
        <h1>Không tìm thấy tour</h1>
        {link("/tours", "Khám phá tour", "cta")}
      </main>
    );
  return <TourDetailContent key={query.data.id} tour={query.data} />;
}

function TourDetailContent({ tour }: { tour: Tour }) {
  const { selectTour } = useBookingDraft();
  const selection = useBookingSelection();
  const {
    draft,
    dep,
    deps,
    price,
    q,
    reason,
    update,
    pick,
    quoteQuery,
    departuresQuery,
  } = selection;
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    selectTour(tour.id);
  }, [selectTour, tour.id]);
  async function next() {
    if (reason || busy) return;
    setBusy(true);
    try {
      const verified = await quoteQuery.refetch();
      if (verified.isError) throw verified.error;
      navigateTo("/booking");
      window.scrollTo(0, 0);
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const bookingCard = (scope: string) => (
    <BookingCard
      {...{
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
      }}
    />
  );
  if (
    draft.tourId !== tour.id ||
    departuresQuery.isPending ||
    departuresQuery.isError
  )
    return (
      <AsyncState
        error={departuresQuery.error}
        retry={() => void departuresQuery.refetch()}
      />
    );
  return (
    <>
      {(notice || selection.notice) && (
        <div className="container notice" role="alert">
          {notice || selection.notice}
        </div>
      )}
      <main className="container detail">
        <div className="breadcrumb">
          {link("/", "Trang chủ")}
          <span>›</span>
          {link("/tours", "Tour miền Tây")}
          <span>›</span>
          <span>{tour.title}</span>
        </div>
        <div className="title-row">
          <div>
            <span className="eyebrow">MIỀN TÂY SÔNG NƯỚC</span>
            <h1>{tour.title}</h1>
            <div className="title-meta">
              <span className="stars">★★★★★</span>
              <strong>4.9</strong>
              <span>(12 đánh giá mẫu · Demo)</span>
              <i>·</i>
              <span>⌖ Khởi hành từ TP.HCM</span>
            </div>
          </div>
          <span className="tour-code">MÃ TOUR: MJ-001</span>
        </div>
        <div className="detail-layout">
          <div className="detail-content">
            <TourGallery />
            <div className="quick-facts">
              {[
                [
                  "◷",
                  "Thời lượng",
                  `${tour.durationDays} ngày ${tour.durationDays > 1 ? "1 đêm" : ""}`,
                ],
                ["⌖", "Khởi hành", "TP. Hồ Chí Minh"],
                ["♧", "Phương tiện", "Ô tô & thuyền"],
                ["▦", "Lịch khởi hành", "Nhiều ngày mỗi tuần"],
              ].map(([icon, label, value]) => (
                <div key={label}>
                  <b>{icon}</b>
                  <span>
                    <small>{label}</small>
                    <strong>{value}</strong>
                  </span>
                </div>
              ))}
            </div>
            <div className="pickup">
              ⌖{" "}
              <span>
                <strong>Điểm đón demo:</strong> 06:45 · Trung tâm Quận 1,
                TP.HCM. Chi tiết trao đổi khi xác nhận.
              </span>
            </div>
            <div className="mobile-booking">{bookingCard("mobile")}</div>
            <SectionNav />
            {section(
              "overview",
              "Về miền sông nước, tìm chút bình yên",
              <>
                <span className="eyebrow">CÓ GÌ CHỜ BẠN?</span>
                <p>
                  Rời phố thị một nhịp, theo dòng sông Tiền đến với những cù lao
                  xanh mát. Hành trình đưa bạn qua vườn cây, làng nghề và những
                  câu chuyện đời thường rất đỗi miền Tây.
                </p>
                <p>
                  Không vội vã, không xa cách. Chỉ có tiếng mái chèo khua, mùi
                  kẹo dừa mới nấu và nụ cười hiền của người bản xứ.
                </p>
                <div className="highlights">
                  {tour.highlights.map((s) => (
                    <div key={s}>
                      <span>✓</span>
                      {s}
                    </div>
                  ))}
                </div>
              </>,
            )}
            {section(
              "itinerary",
              tour.durationDays === 1
                ? "Một ngày, thật nhiều trải nghiệm"
                : "Hai ngày, thật nhiều trải nghiệm",
              <>
                {tour.itinerary.slice(0, tour.durationDays).map((s, i) => (
                  <details className="itinerary" open={i === 0} key={s}>
                    <summary>
                      <span className="day">0{i + 1}</span>
                      <span>
                        <small>NGÀY {i + 1}</small>
                        <strong>{s}</strong>
                      </span>
                      <b>⌄</b>
                    </summary>
                    <div className="timeline">
                      {(i === 0
                        ? [
                            [
                              "06:45",
                              "Khởi hành từ TP.HCM",
                              "Gặp hướng dẫn viên. Bữa sáng tự túc.",
                            ],
                            [
                              "09:30",
                              "Chạm nhịp sống miệt vườn",
                              "Đi xuồng dưới tán dừa, ghé làng nghề kẹo dừa.",
                            ],
                            [
                              "12:00",
                              "Bữa trưa đậm vị phương Nam",
                              "Bữa trưa địa phương trong gói. Đồ uống tự túc.",
                            ],
                            [
                              "17:00",
                              "Chiều thảnh thơi ở Cần Thơ",
                              "Nhận phòng, ăn tối trong gói, tự do dạo bến Ninh Kiều.",
                            ],
                          ]
                        : [
                            [
                              "05:30",
                              "Bình minh trên chợ nổi",
                              "Tham quan Cái Răng. Cà phê trên thuyền tự túc.",
                            ],
                            [
                              "09:00",
                              "Vườn xanh và bữa trưa",
                              "Ăn sáng, dạo vườn, ăn trưa trong gói.",
                            ],
                            [
                              "17:30",
                              "Trở về TP.HCM",
                              "Giờ về dự kiến tùy giao thông.",
                            ],
                          ]
                      ).map(([time, title, desc]) => (
                        <div key={time}>
                          <time>{time}</time>
                          <div>
                            <strong>{title}</strong>
                            <p>{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </>,
            )}
            {section(
              "packages",
              "Chọn cách nghỉ ngơi của bạn",
              <div className="service-grid">
                {packages.map((p) => (
                  <article
                    className={draft.packageId === p.id ? "selected" : ""}
                    key={p.id}
                  >
                    <span className="stars">{"★".repeat(p.hotelStars)}</span>
                    <h3>{p.name}</h3>
                    <p>{p.features}</p>
                    <strong className="orange">
                      {money(
                        getPrice({
                          ...draft,
                          tourId: tour.id,
                          packageId: p.id,
                        }).adultPrice,
                      )}
                    </strong>
                    <small>
                      Trẻ em:{" "}
                      {money(
                        getPrice({
                          ...draft,
                          tourId: tour.id,
                          packageId: p.id,
                        }).childPrice,
                      )}
                    </small>
                    <small>Phòng riêng: +{money(p.singleRoomSupplement)}</small>
                    <button
                      className="outline full"
                      disabled={!dep || dep.unavailablePackage === p.id}
                      onClick={() => update({ packageId: p.id })}
                    >
                      {draft.packageId === p.id ? "✓ Đã chọn" : "Chọn gói"}
                    </button>
                  </article>
                ))}
              </div>,
            )}
            {section(
              "departures",
              "Một ngày đẹp để lên đường",
              <>
                <p>Giá người lớn gói 3 sao. Ngày cao điểm có bảng giá riêng.</p>
                <div className="departure-list">
                  {deps.map((d) => (
                    <div key={d.id}>
                      <strong>{dateLabel(d.startAt)}</strong>
                      <span className={d.availableSeats ? "green" : "muted"}>
                        {d.availableSeats
                          ? `Còn ${d.availableSeats} chỗ`
                          : "Hết chỗ"}
                      </span>
                      <strong>
                        {money(
                          getPrice({
                            ...draft,
                            departureId: d.id,
                            packageId: "p3",
                          }).adultPrice,
                        )}
                      </strong>
                      <button
                        className="outline"
                        disabled={!isOpen(d)}
                        onClick={() => pick(d.id)}
                      >
                        {draft.departureId === d.id
                          ? "✓ Đã chọn"
                          : "Chọn chuyến"}
                      </button>
                    </div>
                  ))}
                </div>
              </>,
            )}
            {section(
              "policies",
              "Những điều bạn cần biết",
              <>
                <span className="demo">Chính sách bản demo</span>
                <div className="policy-grid">
                  <div>
                    <h3>Giá tour bao gồm</h3>
                    <p>
                      Xe, thuyền, khách sạn theo gói, hướng dẫn viên, các bữa ăn
                      ghi trong lịch trình.
                    </p>
                    <h3>Chưa bao gồm</h3>
                    <p>Chi tiêu cá nhân, đồ uống và hoạt động ghi tự túc.</p>
                  </div>
                  <div>
                    <h3>Độ tuổi & phòng nghỉ</h3>
                    <p>
                      Người lớn từ 9 tuổi; trẻ em từ 4 đến dưới 9; em bé dưới 4.
                      Một người lớn không có trẻ em chịu phụ thu phòng riêng.
                    </p>
                    <h3>Hủy và đổi — demo</h3>
                    <p>
                      Trước 7 ngày: hoàn 100%; 3–6 ngày: 50%; dưới 3 ngày: không
                      hoàn. Chỉ minh họa.
                    </p>
                  </div>
                </div>
                {link("/policies", "Đọc chính sách demo ↗", "text-link")}
              </>,
            )}
            {section(
              "reviews",
              "Một vài cảm nhận mẫu",
              <>
                <p>Minh họa giao diện · Chưa xác thực.</p>
                <div className="review">
                  <span className="avatar">LA</span>
                  <div>
                    <strong>
                      Lan Anh <span className="demo">Mẫu demo</span>
                    </strong>
                    <p className="stars">★★★★★</p>
                    <p>
                      Thích nhất lúc ngồi xuồng giữa bóng dừa. Lịch trình vừa đủ
                      để cả nhà tận hưởng.
                    </p>
                  </div>
                </div>
              </>,
            )}
            {section(
              "faq",
              "Bạn hỏi, Mekong trả lời",
              <>
                {[
                  [
                    "Có thể đi cùng trẻ nhỏ không?",
                    "Có. Chọn nhóm tuổi theo ngày đi; em bé tối đa bằng người lớn và không chiếm chỗ.",
                  ],
                  [
                    "Có cần thanh toán ngay không?",
                    "Đây là bản demo. Không chuyển tiền. Gửi yêu cầu chưa giữ chỗ hay xác nhận vé.",
                  ],
                  [
                    "Tôi có thể sửa ngày đi không?",
                    "Bạn có thể sửa lựa chọn trước khi gửi yêu cầu. Giá cập nhật theo chuyến và gói.",
                  ],
                ].map(([a, b]) => (
                  <details className="faq" key={a}>
                    <summary>
                      {a}
                      <span>+</span>
                    </summary>
                    <p>{b}</p>
                  </details>
                ))}
              </>,
            )}
          </div>
          <div className="desktop-booking">{bookingCard("desktop")}</div>
        </div>
        <div className="section-title related">
          <div>
            <span className="eyebrow">THÊM CHUYẾN ĐI, THÊM KỶ NIỆM</span>
            <h2>Có thể bạn cũng thích</h2>
          </div>
          {link("/tours", "Xem tất cả ↗", "text-link")}
        </div>
        <div className="tour-grid">
          {tours
            .filter((t) => t.id !== tour.id)
            .slice(0, 3)
            .map((item, index) => (
              <TourCard key={item.id} tour={item} imageIndex={index} />
            ))}
        </div>
        <div className="mobile-bottom">
          <span>
            <small>{draft.packageId && dep ? "Tổng dự kiến" : "Giá từ"}</small>
            <strong>
              {money(
                draft.packageId && dep
                  ? q.total
                  : startingPrice(tour.id) || 1600000,
              )}
            </strong>
          </span>
          <a href="#choose-mobile" className="cta">
            Chọn chuyến đi →
          </a>
        </div>
      </main>
      <div className="sr-only" aria-live="polite">
        {dep && draft.packageId ? "Tổng dự kiến " + money(q.total) : ""}
      </div>
    </>
  );
}
