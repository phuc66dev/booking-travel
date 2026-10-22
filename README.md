# Mekong Journeys

Frontend MVP đặt tour miền Tây bằng tiếng Việt. Giữ nền tảng React 19 + TypeScript + Vite 8 có sẵn trong repository; dùng CSS variables và component React thay vì chuyển sang Next.js hoặc cài thêm bộ UI không cần thiết.

## Chạy dự án

Yêu cầu Node.js 24 trở lên (test sử dụng TypeScript stripping tích hợp).

```sh
npm install
npm run dev
```

Mở http://localhost:5173. Xem bản production bằng `npm run build` rồi `npm run preview`.

```sh
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:e2e:production
```

Lần đầu chạy browser: `npx playwright install chromium`. Build trước khi chạy production E2E. `npm run build:report` tạo thống kê chunk/gzip; `npm run evidence:query` tạo trace cache/invalidation. Dùng `package-lock.json` với npm làm nguồn cài đặt tái lập.

Host production cần rewrite các URL ứng dụng về `index.html` vì dự án dùng SPA routing. Vite dev/preview có sẵn fallback này.

Khi chạy `npm run dev`, mở nút **Kiểm thử UI** ở góc dưới bên phải. Với Error Boundary, bật boundary cục bộ chỉ thay vùng test bị lỗi; tắt nó sẽ làm boundary cấp trang thay toàn bộ nội dung trang bằng fallback. Header/footer và bảng test vẫn còn để khôi phục. Với Suspense, bật/tắt boundary cục bộ để so sánh fallback ở vùng nhỏ với vùng lớn hơn; tải chậm 1,8 giây. Bảng test chỉ có trong development; không xuất hiện trong production. E2E bao phủ cả hai chế độ.

## Các trang

- `/`: giới thiệu, tìm tour, điểm đến, 6 tour nổi bật và quy trình đặt.
- `/tours`: tìm không phân biệt dấu/hoa thường, lọc AND, sort, phân trang, query URL, empty state; mobile có filter dialog.
- `/tours/my-tho-ben-tre-can-tho`: trang chi tiết trọng tâm. Các slug còn lại lấy trong `src/data/mock-tours.ts`.
- `/booking`: liên hệ, validation, voucher, trả trước 50%/100%, fixture lỗi và báo giá đổi.
- `/booking/:id`: kết quả chờ xác nhận/chưa thanh toán, thông tin che bớt và snapshot giá.
- `/booking/lookup`: tra cứu mã + điện thoại trong bộ nhớ phiên.
- `/policies`: chính sách demo và giới hạn dữ liệu.

## Cấu trúc

- `src/app/`: app shell, QueryClient/provider, client router và lazy routes; `App.tsx` chỉ ghép trang/layout.
- `src/data/mock-tours.ts`: seed tour, gói, giá và 48 chuyến khởi hành tương đối theo giờ Việt Nam.
- `src/features/tours/api/tour-service.ts`: mock service độc lập UI cho tìm kiếm, chi tiết và departures.
- `src/features/tours/api/tour-keys.ts`, `tour-queries.ts`: query keys chuẩn hóa và TanStack Query hooks/options cho danh sách, chi tiết và chuyến.
- `src/features/tours/pages/`: HomePage, TourListPage và TourDetailPage; mỗi route là một dynamic import.
- `src/features/booking/domain/`: hàm tính giá/voucher/passenger/cutoff và validation liên hệ.
- `src/features/booking/api/`: booking adapter, query quote, mutation tạo booking và query keys.
- `src/features/booking/components/`, `hooks/` và `pages/`: draft/contact providers, controlled form, memoized BookingSummary, hook checkout/selection, các trang checkout/lookup/result.
- `src/features/booking/types.ts`: kiểu Draft, Contact, Booking và trạng thái.
- `src/shared/lib/format.ts`: format tiền VND dùng chung.
- `src/shared/`: link, footer, SafeImage, AsyncState/error boundary, chính sách; diagnostics chỉ ghi ở development.
- `src/components/`: header, gallery/carousel/lightbox, mục lục, bảng tiền.
- `src/style.css`: design tokens, typography, layout, responsive và trạng thái.
- `tests/`: unit/integration tests bằng Node test runner; query cache dùng QueryClient trực tiếp, không cần DOM test framework.
- `docs/screenshots/`, `docs/responsive-checks.json`: bằng chứng kiểm tra trực tiếp bằng trình duyệt.
- `e2e/`: Playwright kiểm tra browser, responsive, keyboard, Profiler và HMR; `docs/evidence/` chứa dữ liệu/screenshot của lần hoàn thiện 8 tiêu chí.
- `ASSETS.md`: nguồn hình ảnh. Ảnh remote có fallback SVG tại local.

## Chia module cho nhóm

| Thành viên | Module chính | Nội dung kỹ thuật cần trình bày |
|---|---|---|
| 1 | Component và render (tiêu chí 1, 4) | Component/props, controlled form, lifecycle; memo/key/useCallback và Profiler trước/sau. |
| 2 | Routing và custom hooks (tiêu chí 2, 5) | History API, URL state, service contract, Rules of Hooks/dependencies, Back/reload/error/retry. |
| 3 | State và TanStack Query (tiêu chí 6, 7) | Client/server state, pricing, query key/cache/stale/GC, mutation/idempotency/revalidation/invalidation. |
| 4 | TypeScript và Vite (tiêu chí 3, 8) | Strict TS, HMR, lazy routes, manifest/bundle, production E2E và bằng chứng responsive. |

Trước khi chia việc, chốt types/service signatures trong `features/*/api` với cả nhóm. Mỗi người ghi file/commit, cơ chế dùng, lệnh/test đã chạy và giới hạn vào báo cáo.

## Dữ liệu và thử nghiệm

Tour chính có giá 3/4/5 sao lần lượt 1.600.000/1.950.000/2.350.000 ₫ mỗi người lớn. Trẻ em tính theo bảng cấu hình; em bé 0 ₫. Phụ thu phòng riêng chỉ khi 1 người lớn không có trẻ em. Sức chứa chung theo chuyến; em bé không chiếm chỗ. Giới hạn 10 khách, ít nhất 1 người lớn.

Mỗi tour có chuyến còn 18, 8, 2, 0, 12, 16 chỗ; chuyến thứ hai không bán gói 5 sao; chuyến thứ năm có phụ thu cao điểm được hiển thị trước. Ngày được tạo từ ngày mai theo Asia/Ho_Chi_Minh khi tải ứng dụng.

- `MEKONG100`: giảm 100.000 ₫ tiền khách khi từ 3.000.000 ₫; hạn seed sau 30 ngày.
- `HETHAN`: mã đã hết hạn.
- `CHUADU`: mã không đủ ngưỡng điều kiện với các đơn demo thông thường.
- Checkout → “Tình huống kiểm thử”: bình thường, hết chỗ, giá thay đổi, lỗi kết nối.
- Giá đổi: hiển thị cũ/mới, khóa gửi, yêu cầu chấp nhận và bấm gửi lại. Giá mới là dữ liệu adapter, không lấy từ URL.
- `adapter.simulatePayment(id, status)` chỉ dùng làm test fixture. Không có nút “Tôi đã chuyển khoản” tự đánh dấu đã trả.

Draft chỉ lưu lựa chọn và ID, không lưu contact. Đơn và contact nằm trong bộ nhớ; tải lại sẽ mất đơn. Tra cứu minh họa trong phiên đang mở; có nút xóa dữ liệu demo. Không có hold nên tạo yêu cầu không trừ tồn chỗ và không tuyên bố giữ chỗ.

## Kiểm chứng

Xem [báo cáo đầy đủ 8 tiêu chí](docs/REPORT-REACT-VITE-TANSTACK.md) và [kiểm chứng hoàn thiện](docs/CRITERIA-VERIFICATION.md). `docs/VERIFICATION.md` và `docs/REFACTOR-VERIFICATION.md` giữ kết quả các lượt trước. Browser tests dùng ảnh fallback/system font để kết quả ổn định; không đồng nghĩa với chứng nhận WCAG hay kiểm thử mọi trình duyệt.

## Tích hợp chưa có

Backend thực; tồn chỗ nguyên tử/hold; idempotency bền vững; cổng thanh toán và đối soát; thông báo email/SMS; dịch vụ hỗ trợ; bảo mật tra cứu production. Không dùng bản demo để nhận tiền. Font tải từ Google Fonts và ảnh tải từ Unsplash; cần mạng để dùng bản ảnh/font gốc (có system-font và fallback ảnh local).
