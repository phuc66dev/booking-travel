import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { navigateTo } from "../../../app/router.ts";
import {
  tourSearchSchema,
  type TourSearchData,
} from "../../../schemas/tourSchema.ts";

export function TourSearch({ search = "" }: { search?: string }) {
  const params = new URLSearchParams(search);
  const { register, handleSubmit } = useForm<TourSearchData>({
    resolver: zodResolver(tourSearchSchema),
    defaultValues: {
      q: params.get("q") || "",
      date: params.get("date") || "",
      duration: (params.get("duration") as TourSearchData["duration"]) || "",
    },
  });
  return (
    <form
      className="search-form"
      onSubmit={handleSubmit((data) => {
        const next = new URLSearchParams();
        for (const key of ["q", "date", "duration"]) {
          const value = data[key as keyof TourSearchData].trim();
          if (value) next.set(key, value);
        }
        navigateTo(`/tours${next.size ? `?${next}` : ""}`);
        window.scrollTo(0, 0);
      })}
    >
      <label>
        ⌖ Bạn muốn đi đâu?
        <input
          {...register("q")}
          placeholder="Khám phá miền Tây"
          defaultValue={params.get("q") || ""}
        />
      </label>
      <label>
        ▦ Ngày khởi hành
        <input
          {...register("date")}
          type="date"
          defaultValue={params.get("date") || ""}
        />
      </label>
      <label>
        ◷ Thời lượng
        <select {...register("duration")}>
          <option value="">Tất cả hành trình</option>
          <option value="1">1 ngày</option>
          <option value="2">2 ngày 1 đêm</option>
        </select>
      </label>
      <button className="cta">⌕ Tìm tour</button>
    </form>
  );
}
