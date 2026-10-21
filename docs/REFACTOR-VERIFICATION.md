# Kiểm chứng tái cấu trúc

Ngày chạy: 21/10/2026.

> Bản ghi lịch sử của lượt refactor đầu. Các phần dang dở và giới hạn browser dưới đây được cập nhật ở [kiểm chứng 8 tiêu chí ngày 22/10/2026](CRITERIA-VERIFICATION.md).

## Đã chạy

- Baseline trước sửa: `npm test` — 12/12 pass.
- Sau sửa: `npm test` — 23/23 pass. Bao gồm test query key, cache theo URL search, mutation invalidation đúng query quote, service tìm kiếm/lọc/phân trang, sort theo giá ngày được chọn, chuẩn hóa URL phân trang, phân luồng lỗi catalog và các regression nghiệp vụ cũ.
- `npm run lint` — pass.
- `npm run typecheck` — pass.
- `npm run build` — pass; Vite tạo bundle production.
- `npm run lint`, `npm run typecheck`, `npm test` — chạy lại sau vòng rà soát; tất cả pass, lint không còn warning.
- `npm install @tanstack/react-query` — cài TanStack Query 5; npm báo 1 vulnerability mức high trong dependency tree. Chưa chạy `npm audit fix`.

## Kiểm tra trình duyệt

Đã thử mở app dev server bằng Codex in-app browser, nhưng tab không thể kết nối tới localhost của workspace (`ERR_CONNECTION_TIMED_OUT`). Lệnh HTTP từ shell cũng bị sandbox chặn quyền socket; vì vậy chưa xác nhận UI sau tái cấu trúc bằng browser trong lượt này. Các screenshot responsive trong `docs/screenshots/` là bằng chứng từ lần kiểm tra trước khi tách module, không phải screenshot mới.

## Phạm vi tái cấu trúc hiện tại

- QueryClient/provider, router hook, tour query service/keys/hooks, booking quote query và create mutation đã tích hợp vào ứng dụng. Lỗi tải catalog chỉ chặn trang chủ/danh sách; trang checkout, kết quả, tra cứu và chính sách vẫn vào được. URL phân trang tự chuẩn hóa theo trang thực tế.
- Trang chủ, danh sách tour, contact form, tra cứu và kết quả đã tách thành module. `src/app/App.tsx` vẫn điều phối tour detail và checkout; có thể tiếp tục tách hai trang này thành page modules.
- Mock service vẫn chạy frontend-only; không có backend, tồn chỗ nguyên tử, hold, thanh toán hoặc tra cứu production.
