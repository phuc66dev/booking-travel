import { navigateTo } from "../../../app/router.ts";

export function TourSearch({ search = "" }: { search?: string }) {
  const params = new URLSearchParams(search);
  return (
    <form
      className="search-form"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const next = new URLSearchParams();
        for (const key of ["q", "date", "duration"]) {
          const value = String(data.get(key) || "").trim();
          if (value) next.set(key, value);
        }
        navigateTo(`/tours${next.size ? `?${next}` : ""}`);
        window.scrollTo(0, 0);
      }}
    >
      <label>
        ⌖ Bạn muốn đi đâu?
        <input
          name="q"
          placeholder="Khám phá miền Tây"
          defaultValue={params.get("q") || ""}
        />
      </label>
      <label>
        ▦ Ngày khởi hành
        <input
          name="date"
          type="date"
          defaultValue={params.get("date") || ""}
        />
      </label>
      <label>
        ◷ Thời lượng
        <select name="duration" defaultValue={params.get("duration") || ""}>
          <option value="">Tất cả hành trình</option>
          <option value="1">1 ngày</option>
          <option value="2">2 ngày 1 đêm</option>
        </select>
      </label>
      <button className="cta">⌕ Tìm tour</button>
    </form>
  );
}
