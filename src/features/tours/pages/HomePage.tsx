import { Fragment, type ReactNode } from "react";
import { SafeImage } from "../../../shared/components/SafeImage.tsx";
import type { Tour } from "../types.ts";
import { photos } from "../../../data/mock-tours.ts";
import { useTours } from "../api/tour-queries.ts";
import { TourSearch } from "../components/TourSearch.tsx";
import { TourCard } from "../components/TourCard.tsx";
import { AsyncState } from "../../../shared/components/AsyncState.tsx";
import { renderLink } from "../../../shared/lib/render-link.tsx";

const renderCard = (tour: Tour, index: number) => (
  <TourCard key={tour.id} tour={tour} imageIndex={index} />
);

export default function HomeRoute() {
  const query = useTours({ pageSize: 6 });
  if (query.isPending || query.isError)
    return (
      <AsyncState error={query.error} retry={() => void query.refetch()} />
    );
  return (
    <HomePage
      photos={photos}
      tours={query.data.items}
      searchForm={<TourSearch />}
      link={renderLink}
      renderCard={renderCard}
    />
  );
}

interface TourPhoto {
  src: string;
  alt: string;
}

interface HomePageProps {
  photos: TourPhoto[];
  tours: Tour[];
  searchForm: ReactNode;
  link: (url: string, label: ReactNode, className?: string) => ReactNode;
  renderCard: (tour: Tour, index: number) => ReactNode;
}

export function HomePage({
  photos,
  tours,
  searchForm,
  link,
  renderCard,
}: HomePageProps) {
  const destinations = ["Bến Tre", "Cần Thơ", "Châu Đốc", "Cà Mau"];
  const steps = [
    "Tìm hành trình bạn yêu",
    "Chọn ngày và gói phù hợp",
    "Gửi yêu cầu, chờ xác nhận",
  ];
  const descriptions = [
    "Khám phá những trải nghiệm gần gũi.",
    "Xem đầy đủ chi phí trước khi tiếp tục.",
    "Theo dõi bằng mã đơn và số điện thoại.",
  ];

  return (
    <main>
      <section className="home-hero">
        <SafeImage src={photos[0].src} alt="Thiên nhiên Việt Nam" />
        <div className="container hero-content">
          <span className="eyebrow">ĐI ĐỂ CẢM, Ở ĐỂ THƯƠNG</span>
          <h1>
            Miền Tây, những chuyến đi
            <br />
            đong đầy thương nhớ.
          </h1>
          <p>
            Qua những dòng sông, về những miệt vườn.
            <br />
            Chạm vào nhịp sống bình dị của phương Nam.
          </p>
        </div>
      </section>
      <div className="container search-wrap">{searchForm}</div>
      <div className="container home-main">
        <div className="section-title">
          <div>
            <span className="eyebrow">MỖI CHUYẾN ĐI, MỘT CÂU CHUYỆN</span>
            <h2>Hẹn nhau ở miền Tây</h2>
          </div>
          {link("/tours", "Khám phá tất cả ↗", "text-link")}
        </div>
        <div className="destination-row">
          {destinations.map((destination, index) => (
            <Fragment key={destination}>
              {link(
                "/tours?q=" + encodeURIComponent(destination),
                <>
                  <SafeImage
                    src={photos[(index + 1) % photos.length].src}
                    alt={`Ảnh minh họa ${destination}`}
                  />
                  <span>
                    {destination}
                    <small>Khám phá hành trình ↗</small>
                  </span>
                </>,
                "destination",
              )}
            </Fragment>
          ))}
        </div>
        <div className="section-title">
          <div>
            <span className="eyebrow">NHỮNG HÀNH TRÌNH ĐƯỢC YÊU THÍCH</span>
            <h2>Một chút rong ruổi, thật nhiều niềm vui</h2>
          </div>
        </div>
        <div className="tour-grid">
          {tours.slice(0, 6).map((tour, index) => renderCard(tour, index))}
        </div>
        <section className="how">
          <span className="eyebrow">LÊN ĐƯỜNG THẬT DỄ</span>
          <h2>Chuyến đi bắt đầu từ đây</h2>
          <div>
            {steps.map((step, index) => (
              <article key={step}>
                <b>0{index + 1}</b>
                <h3>{step}</h3>
                <p>{descriptions[index]}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
