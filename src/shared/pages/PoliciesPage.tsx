import type { ReactNode } from "react";
const section = (id: string, title: string, body: ReactNode) => (
  <section className="detail-section" id={id}>
    <h2>{title}</h2>
    {body}
  </section>
);
export default function PoliciesPage() {
  return (
    <main className="container narrow">
      <span className="demo">Chính sách demo</span>
      <h1>Rõ ràng trước mỗi chuyến đi</h1>
      {[
        [
          "Phạm vi minh họa",
          "Frontend MVP không nhận thanh toán, không giữ chỗ thật, không xác nhận vé.",
        ],
        [
          "Giá và phụ thu",
          "Giá bao gồm các khoản bắt buộc. Một người lớn không có trẻ em trả phụ thu phòng riêng kể cả đi cùng em bé. Voucher chỉ trừ tiền khách.",
        ],
        [
          "Độ tuổi và sức chứa",
          "Tuổi theo ngày khởi hành tại Asia/Ho_Chi_Minh. Dưới 4: em bé; 4 đến dưới 9: trẻ em; từ 9: người lớn. Người lớn và trẻ em chiếm 1 chỗ. Tối đa 10 khách, em bé không vượt số người lớn.",
        ],
        [
          "Hủy và đổi — demo",
          "Trước 7 ngày: hoàn 100%; 3–6 ngày: 50%; dưới 3 ngày: không hoàn. Chỉ minh họa, không phải cam kết kinh doanh.",
        ],
        [
          "Dữ liệu của bạn",
          "Draft không chứa liên hệ lưu trong sessionStorage 24 giờ. Đơn và liên hệ chỉ nằm trong bộ nhớ, mất sau khi tải lại.",
        ],
        [
          "Vận hành thật",
          "Cần backend tính lại giá, tồn chỗ nguyên tử, idempotency bền vững, bảo mật tra cứu và xác minh thanh toán.",
        ],
      ].map(([a, b]) => (
        <div key={a}>{section(a, a, <p>{b}</p>)}</div>
      ))}
    </main>
  );
}
