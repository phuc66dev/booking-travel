import { useState, type FormEvent, type ReactNode } from "react";
import { useLookupBooking } from "../api/booking-mutations.ts";
import { navigateTo } from "../../../app/router.ts";
import { renderLink } from "../../../shared/lib/render-link.tsx";

export default function BookingLookupRoute() {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [notice, setNotice] = useState("");
  const mutation = useLookupBooking();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) return;
    setNotice("");
    try {
      const booking = await mutation.mutateAsync({ code, phone });
      if (booking) navigateTo("/booking/" + booking.id);
      else setNotice("Không tìm thấy đơn phù hợp");
    } catch {
      setNotice("Chưa tra cứu được. Vui lòng thử lại.");
    }
  }
  return (
    <BookingLookupPage
      code={code}
      phone={phone}
      busy={mutation.isPending}
      notice={notice}
      onCodeChange={setCode}
      onPhoneChange={setPhone}
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
  code: string;
  phone: string;
  busy: boolean;
  notice: string;
  onCodeChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClearDemo: () => void;
  link: (url: string, label: ReactNode, className?: string) => ReactNode;
}

export function BookingLookupPage({
  code,
  phone,
  busy,
  notice,
  onCodeChange,
  onPhoneChange,
  onSubmit,
  onClearDemo,
  link,
}: BookingLookupPageProps) {
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
      <form className="form-card" onSubmit={onSubmit}>
        <label>
          Mã yêu cầu
          <input
            required
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
            placeholder="MJ-XXXXXXXX"
          />
        </label>
        <label>
          Số điện thoại
          <input
            type="tel"
            required
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
          />
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
