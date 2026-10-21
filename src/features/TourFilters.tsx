import { useRef } from "react";
import { trapDialogFocus } from "../shared/lib/dialog-focus.ts";
interface Props {
  params: URLSearchParams;
  filter: (k: string, v: string) => void;
  clear: () => void;
}
export function TourFilters({ params, filter, clear }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const fields = () => (
    <div className="filters">
      <h3>Lọc hành trình</h3>
      <label>
        Điểm đến
        <input
          value={params.get("q") || ""}
          onChange={(e) => filter("q", e.target.value)}
          placeholder="Bến Tre, Cần Thơ…"
        />
      </label>
      <label>
        Thời lượng
        <select
          value={params.get("duration") || ""}
          onChange={(e) => filter("duration", e.target.value)}
        >
          <option value="">Tất cả</option>
          <option value="1">1 ngày</option>
          <option value="2">2 ngày 1 đêm</option>
        </select>
      </label>
      <label>
        Khoảng giá
        <select
          value={params.get("price") || ""}
          onChange={(e) => filter("price", e.target.value)}
        >
          <option value="">Tất cả</option>
          <option value="1500000">Dưới 1.500.000 ₫</option>
          <option value="2000000">Dưới 2.000.000 ₫</option>
        </select>
      </label>
      <label>
        Ngày khởi hành
        <input
          type="date"
          value={params.get("date") || ""}
          onChange={(e) => filter("date", e.target.value)}
        />
      </label>
      <button type="button" className="outline full" onClick={clear}>
        Xóa tất cả
      </button>
    </div>
  );
  return (
    <>
      <aside className="filters-desktop">{fields()}</aside>
      <div className="filters-mobile">
        <button
          className="outline full"
          onClick={() => dialog.current?.showModal()}
        >
          ☷ Lọc hành trình
        </button>
      </div>
      <dialog
        className="filter-dialog"
        ref={dialog}
        aria-label="Lọc hành trình"
        onKeyDown={trapDialogFocus}
      >
        <button
          className="dialog-close"
          aria-label="Đóng bộ lọc"
          onClick={() => dialog.current?.close()}
        >
          ✕
        </button>
        {fields()}
        <button className="cta full" onClick={() => dialog.current?.close()}>
          Xem kết quả →
        </button>
      </dialog>
    </>
  );
}
