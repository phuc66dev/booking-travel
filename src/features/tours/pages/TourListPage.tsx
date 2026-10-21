import { useCallback, useEffect, type ReactNode } from "react";
import { TourFilters } from "../../TourFilters.tsx";
import type { Tour } from "../types.ts";
import { useTourSearch } from "../hooks/use-tour-search.ts";
import { useTours } from "../api/tour-queries.ts";
import { normalizePageSearch, replaceTo } from "../../../app/router.ts";
import { TourCard } from "../components/TourCard.tsx";
import { TourSearch } from "../components/TourSearch.tsx";
import { AsyncState } from "../../../shared/components/AsyncState.tsx";

export default function TourListRoute() {
  const { search, params, queryParams, filter, clear } = useTourSearch();
  const query = useTours(queryParams);
  const page = query.data?.page;
  const date = queryParams.departureDate;
  const renderCard = useCallback(
    (tour: Tour, index: number) => (
      <TourCard
        key={tour.id}
        tour={tour}
        imageIndex={index}
        dateFilter={date}
      />
    ),
    [date],
  );
  useEffect(() => {
    if (page === undefined || query.isPlaceholderData) return;
    const normalized = normalizePageSearch(search, page);
    if (normalized !== null)
      replaceTo(`/tours${normalized ? `?${normalized}` : ""}`);
  }, [page, search, query.isPlaceholderData]);
  if (query.isPending || query.isError)
    return (
      <AsyncState
        error={query.error}
        retry={() =>
          queryParams.fixture ? filter("demo", "") : void query.refetch()
        }
      />
    );
  return (
    <>
      <span className="sr-only" role="status">
        {query.isFetching ? "Đang cập nhật kết quả…" : ""}
      </span>
      <TourListPage
        params={params}
        tours={query.data.items}
        total={query.data.total}
        page={query.data.page}
        pageSize={query.data.pageSize}
        filter={filter}
        clear={clear}
        searchForm={<TourSearch key={search} search={search} />}
        renderCard={renderCard}
      />
    </>
  );
}

interface TourListPageProps {
  params: URLSearchParams;
  tours: Tour[];
  total: number;
  page: number;
  pageSize: number;
  filter: (key: string, value: string) => void;
  clear: () => void;
  searchForm: ReactNode;
  renderCard: (tour: Tour, index: number) => ReactNode;
}

export function TourListPage({
  params,
  tours,
  total,
  page,
  pageSize,
  filter,
  clear,
  searchForm,
  renderCard,
}: TourListPageProps) {
  const pageCount = Math.ceil(total / pageSize);

  return (
    <main className="container listing">
      <span className="eyebrow">ĐI TÌM NHỮNG ĐIỀU BÌNH DỊ</span>
      <h1>Khám phá hành trình</h1>
      {searchForm}
      <div className="listing-layout">
        <TourFilters params={params} filter={filter} clear={clear} />
        <div>
          <div className="results-head">
            <p>
              <strong>{total}</strong> hành trình dành cho bạn
            </p>
            <select
              aria-label="Sắp xếp"
              onChange={(event) => filter("sort", event.target.value)}
              value={params.get("sort") || ""}
            >
              <option value="">Liên quan nhất</option>
              <option value="asc">Giá tăng dần</option>
              <option value="desc">Giá giảm dần</option>
              <option value="nearest">Ngày gần nhất</option>
            </select>
          </div>
          <div className="chips">
            {[...params.entries()]
              .filter(
                ([key, value]) => value && !["sort", "page"].includes(key),
              )
              .map(([key, value]) => (
                <button key={key} onClick={() => filter(key, "")}>
                  {value} ×
                </button>
              ))}
          </div>
          {tours.length ? (
            <>
              <div className="tour-grid listing-grid">
                {tours.map((tour, index) => renderCard(tour, index))}
              </div>
              <div className="pagination">
                {Array.from({ length: pageCount }, (_, index) => (
                  <button
                    key={index}
                    className={page === index + 1 ? "selected" : ""}
                    aria-current={page === index + 1 ? "page" : undefined}
                    onClick={() => filter("page", String(index + 1))}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="empty">
              <h2>Chưa tìm thấy chuyến đi phù hợp</h2>
              <button className="outline" onClick={clear}>
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
