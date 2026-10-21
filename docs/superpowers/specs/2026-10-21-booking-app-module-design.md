# Thiết kế module ứng dụng đặt tour Mekong Journeys

## Mục tiêu

Tổ chức lại frontend React 19 + Vite + TypeScript hiện tại thành các module kỹ thuật có ranh giới rõ, để bốn thành viên có thể triển khai song song và giải thích được React, Vite, TanStack Query, client state, server state, cache, mutation và kiểm thử.

## Bối cảnh và giới hạn

- Repo hiện dùng React 19, Vite 8 và TypeScript; giữ nguyên nền tảng này, không chuyển sang Next.js.
- Ứng dụng đặt tour và mock adapter đã tồn tại. Đây là tái cấu trúc có kiểm soát, phải giữ hành vi và nghiệp vụ hiện có.
- TanStack Query hiện chưa được dùng thực sự. Tích hợp nó cho dữ liệu bất đồng bộ thay vì chỉ thêm dependency.
- Không thêm backend, thanh toán thật, giữ chỗ thật hoặc tính năng ngoài phạm vi MVP.
- Không thay toàn bộ ứng dụng trong một component; chuyển từng phần theo module và tiếp tục chạy được sau từng bước tích hợp.

## Cấu trúc đích

```text
src/
  app/
    App.tsx
    router.tsx
    providers.tsx
    query-client.ts
  shared/
    components/
    lib/
      format.ts
      storage.ts
  features/
    tours/
      api/
        tour-service.ts
        tour-queries.ts
      components/
      pages/
      types.ts
    booking/
      api/
        booking-service.ts
        booking-queries.ts
        booking-mutations.ts
      components/
      domain/
        pricing.ts
        validation.ts
        booking-draft.ts
      pages/
      types.ts
  data/
    mock-tours.ts
    mock-bookings.ts
```

Thư mục được tạo dần trong lúc di chuyển code; không cần tạo file rỗng cho đủ sơ đồ. `App.tsx` chỉ ghép router và provider. `features/tours` sở hữu truy vấn/catalog UI; `features/booking` sở hữu quy tắc đặt tour và mutation; `shared` chỉ giữ UI/tiện ích dùng chung; `data` giữ seed demo. Service adapter là ranh giới cho phép thay nguồn mock bằng backend sau này.

## Quy ước dữ liệu và state

- **Server state:** danh sách tour, chi tiết tour, departures và quote bất đồng bộ do TanStack Query quản lý.
- **Client state:** booking draft, trạng thái mở drawer/dialog, nội dung form và lựa chọn UI do React state/context quản lý theo phạm vi cần thiết.
- Query keys được định nghĩa tập trung theo feature, ổn định và phân cấp theo tài nguyên/tham số. Search/filter/sort/page là tham số truy vấn; URL vẫn là nguồn khôi phục cho trạng thái tìm kiếm có thể chia sẻ.
- Query hooks gọi service adapter, không gọi `fetch` trực tiếp trong component hoặc `useEffect`.
- Tạo booking dùng `useMutation`; pending/error/success thể hiện trong UI. Thành công invalidate đúng các query bị ảnh hưởng; không thêm optimistic update nếu demo không thể rollback nghiệp vụ một cách chính xác.
- Giá và tổng tiền chỉ được tính bằng hàm domain dùng chung từ lựa chọn draft và bảng giá; không lưu bản sao tổng tiền trong nhiều state hoặc tin tổng tiền từ URL.
- Draft sessionStorage chỉ lưu lựa chọn không chứa liên hệ, có version và TTL như hành vi hiện tại.
- Mock adapter tiếp tục xác nhận lại giá, cutoff, số chỗ và voucher khi tạo đơn; giữ idempotency và trạng thái đơn demo.

## Giao diện module chính

- `tourService.searchTours(params): Promise<TourPage>`
- `tourService.getTour(slug): Promise<Tour | undefined>`
- `tourService.getDepartures(tourId): Promise<Departure[]>`
- `bookingService.getQuote(draft): Promise<PriceQuote>`
- `bookingService.createBooking(input): Promise<Booking>`
- `bookingService.lookupBooking(code, phone): Promise<Booking | undefined>`
- `tourKeys.list(params)`, `tourKeys.detail(slug)`, `tourKeys.departures(tourId)` là query keys ổn định.
- `bookingKeys.quote(draft)` là query key báo giá nếu quote cần tải bất đồng bộ; mutation tạo đơn dùng input đã validate và quote được xác nhận.

Tên type và chữ ký có thể điều chỉnh khi lập kế hoạch chi tiết, nhưng service phải độc lập UI và query hook phải là lớp gọi service.

## Phân chia module cho bốn thành viên

1. **App shell và routing:** providers, QueryClient, router, layout và shared components; tìm hiểu React component/props/composition, client routing, render, cleanup và Vite build.
2. **Tour data/query:** tour types, mock service, query keys/hooks và kết nối danh sách/chi tiết; tìm hiểu server state, query key, cache, `staleTime`/`gcTime`, loading/error/retry.
3. **Booking domain/mutation:** draft, pricing, validation, booking service, mutation, idempotency và cache invalidation; tìm hiểu mutation lifecycle, error handling và lúc nào invalidate/refetch.
4. **Booking UI/form/test:** checkout, kết quả, lookup, field validation, responsive/accessibility và luồng test; tìm hiểu form state, controlled input và kiểm thử giao diện/luồng.

Các module trao đổi qua types/service contracts; thành viên 2 không nhập logic giá vào query component, thành viên 3 không sửa UI tour, thành viên 4 không tự viết lại business rules. Mỗi thành viên ghi báo cáo kỹ thuật cho module mình phụ trách cùng file/commit và bằng chứng kiểm chứng.

## Di chuyển và tương thích

- Giữ route và hành vi người dùng hiện tại.
- Tách logic ra trước khi đổi cơ chế lấy dữ liệu; thay các call bất đồng bộ bằng query hooks từng feature.
- Chuyển route và page/component theo từng bước; xóa code cũ khỏi `App.tsx` sau khi hành vi tương ứng đã được chuyển.
- Giữ CSS, seed, quy tắc giá, test và tài liệu hiện có trừ khi cần sửa để tương thích.
- Không cài React Router hoặc thư viện UI mới nếu chức năng hiện tại đáp ứng yêu cầu; bổ sung TanStack Query là thay đổi dependency cần thiết.

## Kiểm chứng chấp nhận

- Query tour hiển thị loading/error/success và retry phù hợp; query key tách đúng tham số.
- Điều hướng lại tour có cache hợp lý; dữ liệu stale được làm mới theo cấu hình rõ ràng.
- Booking mutation chặn submit lặp, giữ dữ liệu form khi lỗi và invalidate dữ liệu liên quan khi thành công.
- Tất cả test nghiệp vụ hiện có tiếp tục pass; bổ sung test cho query state và cache invalidation/mutation.
- Các lệnh `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` chạy được.
- Giữ bằng chứng responsive hiện tại và kiểm tra lại các luồng chính sau chuyển đổi.

## Giới hạn ngoài phạm vi

Backend, tồn chỗ nguyên tử, giữ chỗ, idempotency bền vững, cổng thanh toán, đối soát, thông báo thật, bảo mật tra cứu production, React Compiler, profiler audit và bundle optimization chưa thuộc thiết kế này. Chỉ thêm các cơ chế nâng cao nếu tiêu chí môn học yêu cầu và có minh chứng phù hợp.
