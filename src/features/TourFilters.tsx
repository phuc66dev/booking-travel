import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { trapDialogFocus } from "../shared/lib/dialog-focus.ts";
import type { TourFilterKey } from "./tours/types.ts";
import {
  tourFilterSchema,
  type TourFilterData,
} from "../schemas/tourSchema.ts";

interface Props {
  params: URLSearchParams;
  filter: (k: TourFilterKey, v: string) => void;
  clear: () => void;
}
export function TourFilters({ params, filter, clear }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { register, reset } = useForm<TourFilterData>({
    resolver: zodResolver(tourFilterSchema),
    defaultValues: getFilterValues(params),
  });
  useEffect(() => {
    reset(getFilterValues(params));
  }, [params, reset]);
  const registerFilter = (name: keyof TourFilterData) => {
    const field = register(name);
    return {
      ...field,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        void field.onChange(event);
        filter(name as TourFilterKey, event.target.value);
      },
    };
  };
  const fields = () => (
    <div className="filters">
      <h3>Lọc hành trình</h3>
      <label>
        Điểm đến
        <input
          {...registerFilter("q")}
          placeholder="Bến Tre, Cần Thơ…"
        />
      </label>
      <label>
        Thời lượng
        <select {...registerFilter("duration")}>
          <option value="">Tất cả</option>
          <option value="1">1 ngày</option>
          <option value="2">2 ngày 1 đêm</option>
        </select>
      </label>
      <label>
        Khoảng giá
        <select {...registerFilter("price")}>
          <option value="">Tất cả</option>
          <option value="1500000">Dưới 1.500.000 ₫</option>
          <option value="2000000">Dưới 2.000.000 ₫</option>
        </select>
      </label>
      <label>
        Ngày khởi hành
        <input
          {...registerFilter("date")}
          type="date"
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

function getFilterValues(params: URLSearchParams): TourFilterData {
  return {
    q: params.get("q") || "",
    duration: (params.get("duration") as TourFilterData["duration"]) || "",
    price: (params.get("price") as TourFilterData["price"]) || "",
    date: params.get("date") || "",
  };
}
