# Kiểm chứng 8 tiêu chí — trạng thái bàn giao

Ngày: 22/10/2026. **Code và tài liệu cho 8 tiêu chí đã được bổ sung; vòng kiểm chứng production đầy đủ với fixture mới chưa chốt.** Không coi kết quả bên dưới là tất cả đều pass.

## Các kiểm tra đã chạy

| Kiểm tra | Kết quả thực tế |
|---|---|
| `npm test` | 31/31 unit/integration pass |
| `npm run lint` | Pass, không warning |
| `npm run typecheck` | Pass; strict source + unit test + E2E + Playwright config |
| `npm run build:report` | Pass; Vite 8.3.5, 7 route chunk |
| `npm run evidence:query` | Pass; catalog gọi 1 lần, quote gọi 2 lần sau invalidation |
| Lần chạy đầy đủ development | 19 pass, 1 skip, 0 fail |
| Lần chạy đầy đủ production gần nhất, trước khi đổi fixture | 17 pass, 2 skip, 1 timeout lúc tải checkout chunk |
| Production chạy lặp với fixture HTTP 404 mới | 10/10 lượt pass, gồm đặt thành công, validation/giữ contact, hết chỗ/network, đổi giá và sửa voucher/tỷ lệ khi chờ chấp nhận |
| Vòng đầy đủ development + production với fixture mới | Chưa chạy được: lệnh khởi chạy bị từ chối quyền thực thi (`rejected by user`) |
| `npm audit --json` sau bản vá Vite | 0 vulnerability theo registry tại thời điểm kiểm tra |
| `git diff --check` | Pass |

Skip có chủ đích: development bỏ kiểm tra request chunk production; production bỏ HMR và Profiler chỉ có ở development. Không bật retry để che test lỗi.

## Minh chứng đã lưu

- [Browser development](evidence/browser-results.json) và [browser production](evidence/browser-production-results.json). File production vẫn chứa 1 failure của vòng đầy đủ cũ; chưa được thay bằng báo cáo pass.
- [Profiler trước/sau](evidence/render-profile.json): cùng 18 ký tự; BookingSummary 18 → 0 commit cập nhật, ContactForm vẫn 18 commit ở bản tối ưu. Không suy ra toàn ứng dụng nhanh hơn theo cùng tỷ lệ.
- [HMR](evidence/hmr-check.json): UI đổi khi sửa component, input state vẫn giữ; source được phục hồi trong `finally` và kiểm tra lại heading.
- [Trace cache/invalidation](evidence/query-cache-trace.json): tìm kiếm tương đương dùng lại cache, mutation chỉ invalidates exact quote active. Unit test riêng kiểm tra freshness, stale refetch, GC và error/retry.
- [Bundle/gzip](evidence/bundle-report.json): JS entry + trang chủ 283.780 byte, gzip cộng theo file 90.768 byte. [Requests production](evidence/production-chunk-requests.json) xác nhận CheckoutPage chưa tải ở trang chủ và xuất hiện sau điều hướng.
- [Audit](evidence/npm-audit.json): đã cập nhật Vite từ 8.3.2 lên bản vá 8.3.5.
- 15 screenshot cho detail/listing/checkout tại 360, 390, 768, 1024, 1440px. Ví dụ [detail 390](evidence/detail-390.png), [listing 1440](evidence/listing-1440.png), [checkout 360](evidence/checkout-360.png). Browser đọc `scrollWidth` thực tế để kiểm tra tràn ngang và kiểm tra checkout không có thanh đáy che form.

## Lỗi tìm được và đã sửa

1. Lightbox để focus ra ngoài: thêm vòng Tab/Shift+Tab; Esc trả focus về nút mở.
2. Chấp nhận giá có thể ghi quote cũ vào key của voucher/tỷ lệ mới: giờ refetch quote cho lựa chọn hiện tại, kiểm tra version rồi chấp nhận; submit vẫn là thao tác riêng.
3. Fallback ảnh không reset khi đổi nguồn: key image theo src, regression kiểm tra ảnh lỗi liên tiếp.
4. Tour không tồn tại trả undefined làm TanStack báo query error: chuẩn hóa kết quả query thành null để hiển thị not-found.
5. Bộ lọc unmount trong lúc query mới pending: giữ previous data, có trạng thái cập nhật, không sửa URL theo page của placeholder.
6. H1 hero trang chủ ở ngoài main và điểm đến thiếu key: đưa nội dung chính vào một main, thêm Fragment key theo điểm đến.

Rà soát độc lập đã kiểm tra các bản sửa quote/fallback/not-found và không còn finding mức Important trong các bản sửa đó. Reviewer không chạy browser và không thay thế các kết quả thực tế trong bảng.

## Điều cần chốt tiếp

Hai vòng production với page-level abort đã ghi nhận request checkout/mutation chunk còn pending rồi timeout, không có lỗi JavaScript. Đã lưu trace nội bộ và đổi fixture tài nguyên ngoài sang context-level HTTP 404. Nhóm 10 lượt production với fixture mới đạt; chưa khẳng định nguyên nhân mọi timeout hoặc độ ổn định của toàn bộ suite với fixture mới.

Khi được phép mở server/Chromium, chạy:

```sh
npm run test:e2e
npm run test:e2e:production
node scripts/summarize-evidence.mjs
```

Build hiện tại đã có sẵn. Nếu sửa code ứng dụng trước khi chạy, dùng `npm run build:report` lại trước production E2E. Script tổng hợp có guard: hiện tại từ chối xuất summary pass vì raw production report còn 1 failure; không có file summary pass giả.

## Giới hạn phạm vi

Browser tests dùng HTTP 404 cho ảnh/font ngoài để kiểm tra local fallback ổn định; screenshot dùng placeholder/system font. Chưa xác nhận CDN, mọi trình duyệt/thiết bị hoặc WCAG đầy đủ.

Backend, hold/tồn chỗ nguyên tử, payment thật, idempotency bền vững và tra cứu bảo mật chưa triển khai theo phạm vi demo. Không tạo commit mới vì workspace có nhiều thay đổi chưa commit từ trước; cần review/stage chọn lọc trước khi tích hợp.

Báo cáo kỹ thuật và phân công 2 tiêu chí/người: [REPORT-REACT-VITE-TANSTACK.md](REPORT-REACT-VITE-TANSTACK.md).
