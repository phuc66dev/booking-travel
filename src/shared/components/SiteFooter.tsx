import { renderLink as link } from "../lib/render-link.tsx";
export function SiteFooter() {
  return (
    <footer>
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            mekong journeys<span>NHỮNG HÀNH TRÌNH ĐONG ĐẦY</span>
          </div>
          <p>
            Khám phá vẻ đẹp bình dị
            <br />
            và lòng hiếu khách của miền Tây.
          </p>
        </div>
        <div>
          <h3>Đi cùng Mekong</h3>
          {link("/", "Trang chủ")}
          {link("/tours", "Khám phá tour")}
          {link("/booking/lookup", "Tra cứu đặt tour")}
        </div>
        <div>
          <h3>Thông tin hữu ích</h3>
          {link("/policies", "Chính sách demo")}
          <p>Liên hệ: chưa cấu hình</p>
          <p>Ảnh minh họa: Unsplash</p>
        </div>
        <div>
          <span className="footer-sun">☀</span>
          <h3>Đi chậm. Cảm nhận sâu.</h3>
          <p>
            Mang về những kỷ niệm,
            <br />
            để lại dấu chân nhẹ nhàng.
          </p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Mekong Journeys</span>
        <span>Frontend demo · Không nhận thanh toán</span>
      </div>
    </footer>
  );
}
