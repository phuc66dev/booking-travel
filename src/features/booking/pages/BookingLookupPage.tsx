import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useState, type ReactNode } from "react";
import { useLookupBooking } from "../api/booking-mutations.ts";
import { navigateTo } from "../../../app/router.ts";
import { renderLink } from "../../../shared/lib/render-link.tsx";
import {
  bookingLookupSchema,
  type BookingLookupData,
} from "../../../schemas/bookingLookupSchema.ts";

export default function BookingLookupRoute() {
  const [notice, setNotice] = useState("");
  const mutation = useLookupBooking();
  const submit: SubmitHandler<BookingLookupData> = async (data) => {
    if (mutation.isPending) return;
    setNotice("");
    try {
      const booking = await mutation.mutateAsync(data);
      if (booking) navigateTo("/booking/" + booking.id);
      else setNotice("Không tìm thấy đơn phù hợp");
    } catch {
      setNotice("Chưa tra cứu được. Vui lòng thử lại.");
    }
  };
  return (
    <BookingLookupPage
      busy={mutation.isPending}
      notice={notice}
      onSubmit={submit}
      link={renderLink}
      onClearDemo={() => {
        sessionStorage.removeItem("mj-draft");
        location.reload();
      }}
    />
  );
}

interface BookingLookupPageProps {
  busy: boolean;
  notice: string;
  onSubmit: SubmitHandler<BookingLookupData>;
  onClearDemo: () => void;
  link: (url: string, label: ReactNode, className?: string) => ReactNode;
}

export function BookingLookupPage({
  busy,
  notice,
  onSubmit,
  onClearDemo,
  link,
}: BookingLookupPageProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingLookupData>({
    resolver: zodResolver(bookingLookupSchema),
    mode: "onBlur",
  });
  return (
    <main className="container narrow">
      <span className="eyebrow">THEO DÕI CHUYẾN ĐI</span>
      <h1>Tra cứu yêu cầu đặt tour</h1>
      <p>
        Tra cứu frontend chỉ minh họa trong phiên, chưa có bảo mật production.
        Đơn sẽ mất khi tải lại trang.
      </p>
      {notice && (
        <p className="submit-feedback" role="alert">
          {notice}
        </p>
      )}
      <form className="form-card" onSubmit={handleSubmit(onSubmit)} noValidate>
        <label>
          Mã yêu cầu
          <input
            {...register("code")}
            aria-invalid={!!errors.code}
            aria-describedby="lookup-code-error"
            placeholder="MJ-XXXXXXXX"
          />
          <span className="field-error" id="lookup-code-error">
            {errors.code?.message}
          </span>
        </label>
        <label>
          Số điện thoại
          <input
            {...register("phone")}
            type="tel"
            aria-invalid={!!errors.phone}
            aria-describedby="lookup-phone-error"
          />
          <span className="field-error" id="lookup-phone-error">
            {errors.phone?.message}
          </span>
        </label>
        <button className="cta full" disabled={busy}>
          {busy ? "Đang tra cứu…" : "Tra cứu yêu cầu"}
        </button>
      </form>
      {link("/tours", "Khám phá tour", "text-link")}
      <button className="text-button" onClick={onClearDemo}>
        Xóa dữ liệu demo của phiên
      </button>
    </main>
  );
}
