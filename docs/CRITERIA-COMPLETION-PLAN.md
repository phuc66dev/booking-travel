# Hoàn thiện 8 tiêu chí React + Vite + TanStack Query

Phạm vi tiếp nối thiết kế/kế hoạch module đã được duyệt. Giữ SPA, thiết kế và nghiệp vụ demo; API dùng Promise mock adapter, không yêu cầu backend thật.

1. Tách tour detail, checkout, kết quả, tra cứu, chính sách khỏi App. Provider giữ draft lựa chọn; contact ở context memory riêng để giữ form khi qua trang sửa tour.
2. Custom hook quản lý draft/quote, URL search và checkout; domain transition độc lập React, test thay chuyến/gói/voucher.
3. Memo hóa BookingSummary với props và callbacks ổn định; React Profiler đo baseline và bản tối ưu trên cùng thao tác nhập form. Không thêm memo tùy tiện.
4. Lazy route + Suspense/error boundary, build manifest và script tổng hợp kích thước chunk/gzip; test tải production route.
5. Kiểm tra unit/integration, browser flows, Back/refresh, lỗi/retry, cache và invalidation, responsive 360/390/768/1024/1440, keyboard dialog.
6. Viết báo cáo 8 tiêu chí bằng code thật, trace và số liệu; chia đều 2 tiêu chí/người, mỗi người có nhiệm vụ code/minh chứng.

Mọi số liệu được ghi từ lần chạy thực tế; phần nào không chạy được phải ghi giới hạn. Không tuyên bố “hoàn hảo” hay sẵn sàng production.

## Trạng thái thực hiện

- Các mục 1–4 đã có code và minh chứng riêng; mục 6 đã có báo cáo/đầu việc cho 4 thành viên.
- Mục 5: unit 31/31, lint/typecheck/build đạt; full dev 19 pass/1 skip. Full production cũ còn 1 timeout tải chunk; fixture mới đạt 10/10 lượt kiểm tra lặp.
- Vòng full cuối với fixture mới chưa chạy: công cụ từ chối quyền khởi chạy server/Chromium. Không đánh dấu kiểm chứng production hoàn tất.
- Chi tiết: `docs/CRITERIA-VERIFICATION.md`.
