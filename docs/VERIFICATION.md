# Kiểm chứng — 17/10/2026

## Lệnh thực thi

- `npm test`: **12 test pass**, 0 fail.
- `npm run lint`: exit 0.
- `npm run typecheck`: exit 0.
- `npm run build`: exit 0; Vite xuất bundle production vào `dist/`.

Tests dùng Node test runner. Bao gồm các ví dụ tính giá bắt buộc, phụ thu phòng riêng, voucher hợp lệ/hết hạn/không đủ điều kiện, nhóm khách/sức chứa, cutoff, tất cả nhãn trạng thái, liên hệ tiếng Việt/+84/email tùy chọn, idempotency đồng thời, không chấp nhận payload đã sửa với key cũ, lỗi xác định, giá đổi cần chấp nhận version, fixture thanh toán, draft sai/hết hạn/không đủ chỗ, chuẩn hóa tiếng Việt và ID chuyến chứa ngày cố định.

## Kiểm tra trực tiếp bằng trình duyệt

Đã mở app Vite trong trình duyệt và thao tác UI thật bằng browser automation. Không dùng API của website tham khảo.

1. Chọn 2 người lớn + gói 3 sao: **3.200.000 ₫**.
2. Nhập ` mekong100 `: **3.100.000 ₫**; chọn 50%: **1.550.000 ₫**, còn lại **1.550.000 ₫**.
3. Submit form trống: lỗi cạnh họ tên/điện thoại/chính sách, focus trường đầu.
4. Dùng họ tên demo tiếng Việt, số giả lập `+84 901 234 567`, để email trống: gửi được; số được chuẩn hóa.
5. Fixture hết chỗ: chặn tạo đơn, hiển thị lý do, giữ form.
6. Fixture lỗi mạng: chặn, giữ form, có thể chọn bình thường và gửi lại.
7. Fixture giá đổi: **3.100.000 → 3.300.000 ₫**, nút gửi bị khóa; chấp nhận rồi gửi lại tạo snapshot mới **3.300.000 ₫**, trả trước **1.650.000 ₫**.
8. Thành công: mã đơn mới, **Chờ xác nhận / Chưa thanh toán**, thông tin che bớt; không tuyên bố giữ chỗ.
9. Tra cứu bằng mã và điện thoại đúng trả lại đơn trong phiên.
10. Gói 5 sao → chuyến thứ hai: gỡ gói, thông báo, radio gói 5 sao disabled.
11. Chuyến còn 2 chỗ + 2 người lớn + 1 trẻ em: CTA disabled, thông báo cần 3 chỗ.
12. Tour A → tour B → Back: quay về A với lựa chọn không bị lẫn chuyến của B; CTA yêu cầu chọn lại.
13. Kết quả → Back → sửa tên → gửi lại: sinh mã mới, thông tin đã sửa không bị bỏ qua.
14. Mobile tour Vĩnh Long chưa chọn ngày/gói hiển thị đúng **850.000 ₫**.
15. Menu và lightbox mobile: mở được; Esc đóng; lightbox trả focus về nút ảnh mở ban đầu. Native dialog giữ focus trong modal.
16. Bộ lọc mobile: tìm `CAN THO` + 2 ngày cho đúng 2 kết quả; sort tăng hiển thị **1.450.000 → 1.600.000 ₫**; URL chứa query tương ứng.

## Responsive

Đã chụp screenshot trang chủ, danh sách, chi tiết, checkout, kết quả, tra cứu và chính sách ở **360, 390, 768, 1024, 1440px**. Đo DOM không có horizontal overflow. Bản đo các trang tại `responsive-checks.json`; ảnh tại `screenshots/`.

Ảnh đại diện:

- `screenshots/detail-1440.png`
- `screenshots/detail-360.png`
- `screenshots/home-1440.png`
- `screenshots/tours-360.png`
- `screenshots/checkout-768.png`
- `screenshots/result-360.png`
- `screenshots/price-change.png`
- `screenshots/mobile-filter.png`

Đã rà soát độc lập code và sửa các lỗi quan trọng về Back giữa hai tour, ID chuyến qua ngày, key tạo đơn, nhóm radio và giá mobile. Reviewer kiểm tra lại các sửa đổi; tests và browser checks do agent chính chạy.

## Giới hạn kiểm chứng

- Các luồng UI trên đã chạy trực tiếp; chưa đóng gói thành bộ Playwright E2E chạy bằng một lệnh trong repo. Unit/integration tests có thể chạy lại bằng `npm test`.
- Chưa audit WCAG toàn diện, screen reader, Safari/Firefox hay thiết bị di động thật.
- Chưa có backend, thanh toán/giữ chỗ/đối soát thật, thông báo email/SMS hoặc bảo mật tra cứu production.
- Ảnh/font remote phụ thuộc mạng; có fallback SVG và system font.
- Dữ liệu đơn chỉ trong bộ nhớ và mất sau reload là hành vi demo có ghi rõ, không phải lưu trữ production.
