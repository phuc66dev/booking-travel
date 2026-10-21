# Báo cáo kỹ thuật — Mekong Journeys

Ngày hoàn thiện: 22/10/2026. Phạm vi: frontend MVP đặt tour, React 19 + TypeScript + Vite 8 + TanStack Query 5. Dữ liệu qua mock service adapter có Promise, delay và lỗi xác định; chưa kết nối HTTP/backend hoặc thanh toán thật.

**Trạng thái minh chứng:** các cơ chế và báo cáo đã được bổ sung; còn chờ chạy đầy đủ production với fixture HTTP 404 mới. Lần full cũ có một timeout tải chunk, còn 10 lượt kiểm tra lặp với fixture mới đã đạt. Lệnh chốt toàn bộ bị từ chối quyền thực thi. Xem [bảng kết quả và phần chưa chốt](CRITERIA-VERIFICATION.md); không coi đây là xác nhận mọi kiểm tra đều pass.

## Đối chiếu 8 tiêu chí

| Tiêu chí | Code minh họa | Minh chứng có thể tái hiện |
|---|---|---|
| 1. Component, props, state, vòng đời | `ContactForm`, `BookingSummary`, `BookingDraftProvider`, `TourGallery` | Nhập form, chọn chuyến/gói, mở/đóng dialog; test giữ contact khi sửa tour |
| 2. Routing và giao tiếp dữ liệu | `app/router.ts`, `use-tour-search.ts`, `tour-service.ts`, booking adapter | Browser Back/reload, query URL, lỗi/retry; E2E trực tiếp từng route |
| 3. TypeScript và Vite | `types.ts`, `tsconfig.app.json`, `package.json` | Strict typecheck, dev server, HMR test, build/preview |
| 4. Render, key, memo/callback | `BookingSummary.tsx`, `use-checkout.ts`, `TourCard.tsx` | Profiler trước/sau trong `evidence/render-profile.json` |
| 5. Rules of Hooks/custom hooks | `useCheckout`, `useBookingSelection`, `useTourSearch`, `useAppRouter` | ESLint Hooks; phân tích dependency/cleanup bên dưới |
| 6. Client/server state | Hai provider memory, query hooks và booking domain | Bảng phân loại dữ liệu; test sessionStorage không chứa contact |
| 7. TanStack Query | query keys/options, QueryClient, quote mutation | `evidence/query-cache-trace.json`, test freshness/GC/error |
| 8. Build/chunk | `React.lazy`, `Suspense`, Vite manifest, script analyze-build | `evidence/bundle-report.json`, production resource requests |

Đường dẫn code trong bảng tính từ thư mục `src/`. Bộ E2E nằm trong `e2e/booking.spec.ts`.

## 1. Kiến trúc React cơ bản

Ứng dụng chia `app` (routing/providers), `features/tours` (danh mục/chi tiết), `features/booking` (draft, form, giá, mutation), `shared` (UI/helper dùng chung) và `data` (seed demo). `App.tsx` chỉ chọn trang, bao Suspense/error boundary và ghép header/footer. Nội dung tour dài nằm trong `TourDetailPage`; luồng nhập đặt tour nằm trong `CheckoutPage` và `useCheckout`.

`ContactForm` là component hàm nhận `contact`, `errors`, `onChange`, `onBlur` từ cha. Props đi xuống; callback đưa sự kiện lên. Input nhận `value={contact[name]}` và gọi `onChange` để đổi state: đây là controlled input. React không tự gán lại object contact; callback dùng cập nhật bất biến `setContact(previous => ({...previous, [field]: value}))`, rồi React render UI theo state mới.

`TourGallery` giữ state chỉ dùng trong gallery như ảnh hiện tại. Draft cần qua nhiều trang nên đặt trong provider. Hai loại state có phạm vi khác nhau; không đẩy mọi state lên `App`.

Effect dùng khi đồng bộ với hệ thống ngoài React. Gallery gọi `showModal` khi mount và `close` khi cleanup; `SectionNav` observe các section rồi `disconnect`; `BookingCard` đăng ký resize/ResizeObserver rồi gỡ listener và observer. Effect lưu draft vào sessionStorage không cần một cleanup giả vì không tạo subscription. Dependency quyết định khi nào effect cần chạy lại.

`StrictMode` trong `main.tsx` có thể chạy thêm chu kỳ setup–cleanup ở development để tìm cleanup thiếu. Không suy ra số lần render production từ log development. Xem [React useEffect](https://react.dev/reference/react/useEffect) và [StrictMode](https://react.dev/reference/react/StrictMode).

## 2. Điều hướng và giao tiếp dữ liệu

Router SPA giữ pathname/search bằng `useSyncExternalStore`. Hàm subscribe nghe `popstate` và trả hàm gỡ listener; getSnapshot đọc URL hiện tại. Navigation dùng `pushState`, chuẩn hóa page dùng `replaceState`; cả hai phát thông báo cho store. `AppLink` tôn trọng Ctrl/Meta/Shift/Alt và target để vẫn mở link theo hành vi trình duyệt.

`useTourSearch` parse URL thành bộ lọc typed. Tìm kiếm/filter/sort/page được giữ trong URL, thay filter reset page về 1. Parse bỏ số âm, Infinity và số không hợp lệ. Bộ E2E kiểm tra Back, reload và page vượt phạm vi. Host production phải rewrite route về `index.html`.

Luồng đọc dữ liệu:

```text
URL → useTourSearch → useTours → queryKey/queryFn
    → tourService.searchTours → dữ liệu/error → component
```

Service thực hiện normalize tiếng Việt, lọc AND, sort theo giá của ngày đang chọn, rồi phân trang. Component không tự `fetch` trong effect. Query phân biệt pending, error, empty và success; có nút retry. `keepPreviousData` giữ bộ lọc và kết quả cũ khi query mới chạy, kèm thông báo cập nhật. Dữ liệu placeholder không được dùng để chuẩn hóa page trước khi kết quả mới về, tránh ghi đè URL bằng page cũ.

Đây là API contract giả lập, không phải request HTTP hay bằng chứng đã có server. Khi thay adapter bằng backend, UI và query keys có thể giữ giao diện hiện tại; backend phải tính giá/kiểm tra sức chứa lại.

## 3. TypeScript và hệ sinh thái Vite

TypeScript mô tả `Draft`, `Contact`, `Booking`, trạng thái booking/payment và `TourSearchParams`. `strict: true`, `noUnusedLocals`, `noUnusedParameters` giúp phát hiện lỗi tại thời điểm phát triển. Type không tồn tại như một lớp xác thực dữ liệu runtime: JSON từ storage vẫn cần validate, dữ liệu đặt tour vẫn được adapter kiểm tra lại.

| Lệnh | Mục đích |
|---|---|
| `npm ci` | Cài đúng dependency trong `package-lock.json` |
| `npm run dev` | Dev server và HMR |
| `npm run typecheck` | Kiểm tra kiểu bằng TypeScript |
| `npm run lint` | ESLint, Rules of Hooks và dependency của effect |
| `npm test` | Unit/integration Node test runner |
| `npm run test:e2e` | Luồng UI trên Chromium với dev server |
| `npm run build:report` | Typecheck, build và ghi thống kê chunk/gzip |
| `npm run preview` | Xem nội dung build; không phải production server để triển khai lâu dài |
| `npm run test:e2e:production` | Kiểm tra trên Vite preview của build đã tạo |
| `npm run evidence:query` | Tạo trace cache/invalidation từ QueryClient thật |

Yêu cầu Node 24+ cho test TypeScript stripping; lần đầu chạy browser dùng `npx playwright install chromium`. E2E HMR thay tạm tiêu đề trong `ContactForm`, xác nhận UI cập nhật và state tên vẫn giữ nguyên, rồi phục hồi file trong `finally`. Kết quả lưu ở `evidence/hmr-check.json`. Không chạy bộ E2E song song với chỉnh sửa file ContactForm.

## 4. Render, re-render, key và tối ưu

Khi nhập họ tên, ContactContext cập nhật; `CheckoutPage` đang subscribe context nên render lại và truyền contact mới vào `ContactForm`. Các callback trong `useCheckout` dùng `useCallback`; lựa chọn, quote và dữ liệu tour không đổi. `BookingSummary` được bọc `memo`, nên có thể bỏ lần render do contact thay đổi vì props của summary vẫn giữ cùng giá trị/tham chiếu.

Khi đổi tỷ lệ thanh toán, draft và query key thay đổi, summary phải render lại để hiển thị số tiền mới. `memo` không chặn cập nhật state/context bên trong component, cũng không làm component không bao giờ render. `useCallback` giữ tham chiếu hàm, không tự ngăn cha render; cần một consumer có lý do so sánh tham chiếu, như child dùng `memo`. `useMemo` giữ object context, bộ lọc URL và quote dự phòng ổn định theo dependency. Chức năng phải vẫn đúng nếu bỏ các cache tối ưu này. Xem [React memo](https://react.dev/reference/react/memo), [useMemo](https://react.dev/reference/react/useMemo).

| Thay đổi | Các phần chịu ảnh hưởng trực tiếp |
|---|---|
| Nhập contact | ContactProvider, CheckoutPage đang đọc context và ContactForm; Summary bỏ render nếu các props riêng không đổi |
| Đổi khách/ngày/gói/tỷ lệ trả | DraftProvider và component đọc draft; quote key đổi; Summary cập nhật theo lựa chọn/quote |
| Đổi ảnh đang xem | TourGallery/Lightbox có state ảnh; không cập nhật draft hoặc quote |
| Đổi URL filter/page | Các subscriber của router gồm App và useTourSearch; route/catalog cập nhật. Shell có thể render lại; không tuyên bố đã loại mọi render không cần thiết |

Các danh sách tour, departure và package dùng ID làm `key` để React nhận biết cùng item khi lọc/sort. Key không phải prop bình thường và không ngăn render. Trang kết quả phân trang dùng số trang làm key vì dãy trang không phải danh sách item có state đổi thứ tự. `TourDetailContent` dùng tour ID làm key để reset UI cục bộ khi chuyển sang một tour khác.

Thí nghiệm Profiler trong development: bản baseline và bản tối ưu sử dụng cùng view, dữ liệu và 18 ký tự nhập. Baseline bỏ wrapper `memo`; bản tối ưu giữ wrapper. Đếm commit sau khi query hoàn tất, tránh trộn loading vào phép đo.

| Thành phần | Baseline | Có memo và props ổn định |
|---|---:|---:|
| ContactForm | 18 commit cập nhật | 18 commit cập nhật |
| BookingSummary | 18 commit cập nhật | 0 commit cập nhật |

Đây là phép đo riêng một thao tác trên một máy, không phải kết luận toàn bộ ứng dụng nhanh hơn theo cùng tỷ lệ. Thời gian `actualDuration` và các sample gốc nằm trong `evidence/render-profile.json`. Truy cập `/booking?profile=baseline` chỉ bật đối chứng khi DEV; production không ghi Profiler diagnostics.

## 5. Rules of Hooks và custom hooks

Hook gọi ở cấp đầu component/custom hook, không đặt trong loop, event handler hoặc sau conditional return. Điều kiện tải dữ liệu đưa vào `enabled`, giữ thứ tự gọi hook ổn định. ESlint kiểm tra `rules-of-hooks` và `exhaustive-deps`; lint đạt không thay thế kiểm tra hành vi.

Custom hook chính `useCheckout` gộp các phần của một quy trình checkout: lấy draft/quote từ `useBookingSelection`, contact từ memory context, quản lý lỗi form/fixture/price review, tạo mutation và xử lý submit. Hook trả dữ liệu cùng hành động cho page; không trả JSX.

`onContactChange` dùng functional state update nên không đóng trên contact cũ. `onContactBlur` phụ thuộc contact/agree hiện tại để validation dùng đúng dữ liệu. `applyVoucher` phụ thuộc tiền khách và update draft. `acceptPrice` refetch quote cho lựa chọn hiện tại rồi lưu version người dùng đã chấp nhận; không chép quote cũ vào key mới nếu khách đã đổi voucher hoặc tỷ lệ trả. Nếu version lại đổi, yêu cầu xem/chấp nhận tiếp. Thao tác này chưa gửi đơn; submit tiếp theo vẫn gọi adapter kiểm tra lại.

Idempotency key được tạo một lần khi vào checkout; `inFlight` ref chặn hai event sát nhau trước khi React kịp cập nhật trạng thái pending. Adapter vẫn có idempotency để bảo vệ trường hợp gọi đồng thời; không dùng riêng button disabled làm đảm bảo duy nhất. Lỗi không xóa contact; focus chuyển tới trường lỗi đầu tiên.

`useBookingSelection` kết hợp draft, query departure/quote và quy tắc passenger/cutoff; `useTourSearch` đồng bộ URL; `useAppRouter` kết nối React với browser History. Hook chia sẻ logic; state chỉ chia sẻ vì các component cùng đọc provider hoặc cùng query key, không phải vì tên hook giống nhau.

## 6. Client State và Server State

| Dữ liệu | Loại | Nơi lưu và lý do |
|---|---|---|
| Ngày/gói đã chọn, số khách, voucher, tỷ lệ trả | Client state | DraftContext; đây là ý định chưa xác nhận của khách |
| Contact và checkbox đồng ý | Client state | ContactContext trong memory, giữ khi sửa tour; không persist contact |
| Lỗi field, fixture, modal đang mở, ảnh active | Client/UI state | State tại hook/component sở hữu tương tác |
| Query tìm kiếm, sort, page | URL state | Reload, chia sẻ link và Back/Forward phải phục hồi được |
| Danh sách tour, departure, quote đã xác thực | Server state mô phỏng | TanStack Query quản lý request, trạng thái và cache của adapter |
| Booking và snapshot giá khi tạo | Server state mô phỏng | Adapter giữ bản ghi trong memory; kết quả/tra cứu đọc lại bản ghi |
| Tổng tiền dự phòng | Dữ liệu suy ra | Tính bằng hàm quote, không sao chép thành nhiều state tổng tiền |

Một draft có ID departure không có nghĩa chuyến vẫn còn chỗ. Draft trong sessionStorage có schema version, TTL 24 giờ; restore validate ID, cutoff và sức chứa. Quote cache có thể cũ, nên submit luôn revalidate. Không giữ quote/contact như dữ liệu tin cậy trong URL hoặc storage. Test UI xác nhận dữ liệu contact không xuất hiện trong `mj-draft`.

Không chọn Redux/Zustand chỉ để thêm thư viện: draft/contact có phạm vi chia sẻ nhỏ nên Context đáp ứng; server state có vòng đời fetch/cache riêng nên dùng TanStack Query.

## 7. Cơ chế TanStack Query

`tourKeys.list(params)` chứa tìm kiếm đã normalize, filter, sort, page và pageSize; detail theo slug; departures theo tour ID. Quote key chứa tour/departure/package, số khách, voucher chuẩn hóa và tỷ lệ thanh toán. Đổi dữ liệu ảnh hưởng kết quả phải đổi key. `queryFn` trả Promise dữ liệu hoặc throw lỗi; không biến lỗi mạng thành mảng rỗng.

| Query | staleTime | gcTime | Chính sách riêng |
|---|---:|---:|---|
| Danh sách tour | 60 giây | 5 phút | retry tối đa 1 lần, giữ placeholder khi đổi bộ lọc |
| Chi tiết tour | 5 phút | 5 phút | Không query khi thiếu slug |
| Departure | 30 giây | 5 phút | Theo tour ID |
| Quote | 15 giây | 5 phút | Thiếu departure/package thì disabled; không retry |
| Booking result | 0 | 5 phút | Kiểm tra lại khi mount, không retry |

`staleTime` là thời gian coi dữ liệu còn fresh, không phải lịch tự gọi API mỗi N giây. `gcTime` tính khi query không còn observer; dữ liệu stale có thể còn trong cache. Query active không bị xóa chỉ vì đã qua gcTime. Dự án tắt refetch khi focus cửa sổ; các sự kiện khác và invalidation vẫn có cơ chế riêng. Query disabled có thể `status=pending` nhưng `fetchStatus=idle`; không đồng nghĩa đang có request. Xem [TanStack Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults).

Khi createBooking thành công, mutation dùng `invalidateQueries({queryKey: bookingKeys.quote(input.draft), exact:true})`. Active quote bị đánh dấu invalidated và được refetch; inactive quote chỉ bị đánh dấu stale theo chính sách mặc định. Mutation không retry tự động. Adapter demo không giữ/trừ chỗ nên không invalidates catalog/departure như thể tồn kho đã đổi; production có inventory mutation phải bổ sung invalidation phù hợp.

Trace thực tế: hai lần tìm `CAN THO`/`cần thơ` chuẩn hóa dùng 1 lần gọi catalog; quote active gọi 1 lần ban đầu và 1 lần sau mutation. Catalog vẫn chỉ 1 lần. File `evidence/query-cache-trace.json` có từng sự kiện/status/fetchStatus/invalidated, không ghi contact. Unit test riêng chứng minh fresh cache, stale refetch, GC và error/retry.

## 8. Build production và tối ưu Vite

| Development | Production |
|---|---|
| Dev server phục vụ source module đã transform theo yêu cầu | `tsc -b` kiểm tra kiểu, sau đó Vite tạo asset deploy |
| Native ESM/module graph và HMR/Fast Refresh | Bundle, tree shaking, minify, tên file hash và dynamic chunks |
| Diagnostics Profiler/QueryCache dành cho nhóm | Các nhánh diagnostics DEV không chạy |
| Tối ưu vòng sửa–xem | Tối ưu tài nguyên trình duyệt tải khi dùng ứng dụng |

Vite không tự thực hiện typecheck chỉ vì source là TypeScript; script build của nhóm gọi `tsc` trước. Dự án hiện dùng Vite **8.3.5** với toolchain Rolldown/Oxc, không mô tả theo pipeline esbuild/Rollup của các phiên bản cũ. Tham khảo [Vite 8](https://vite.dev/blog/announcing-vite8) và [Why Vite 8](https://v8.vite.dev/guide/why).

App khai báo 7 trang bằng `React.lazy(() => import(...))` ở module scope, bao trong Suspense và error boundary. Dynamic import tạo ranh giới chunk; phần dùng chung được bundler chia sẻ. Không ép thủ công mọi thư viện thành vendor chunk vì chưa có số liệu cho thấy cần thiết.

Build sau thay đổi tạo **7 route chunk**. Theo manifest, tổng JS entry + các dependency cần cho trang chủ là **283.780 byte**, gzip theo từng file **90.768 byte**. Build trước có một bundle chính khoảng **314.260 byte**, gzip **98.040 byte**. Dung lượng JS tải ban đầu trang chủ giảm khoảng **9,70%** thô và **7,42%** gzip; số baseline làm tròn từ log cũ. Đây là so sánh trước/sau cả lượt refactor và cập nhật bản vá Vite, không phải thí nghiệm cô lập duy nhất lazy import. Không suy ra thời gian tải giảm đúng tỷ lệ này, và chia chunk có thể tăng tổng overhead của toàn ứng dụng.

`scripts/analyze-build.mjs` đọc manifest, cộng dependency tĩnh duy nhất để tránh đếm trùng. File `evidence/bundle-report.json` là nguồn số liệu. Browser production kiểm tra danh sách resource thật: trang chủ tải HomePage chunk, chưa tải CheckoutPage; sau chuyển đến checkout mới thấy chunk đó. File `evidence/production-chunk-requests.json` lưu bằng chứng. Hash/kích thước có thể đổi ở lần build sau.

## Phân chia đóng góp kỹ thuật cho 4 thành viên

Đây là phạm vi mỗi người cần tự đọc, chạy, giải thích và ghi nhận thay đổi thực tế; không coi bảng là bằng chứng mỗi người đã tự viết code.

| Thành viên | Tiêu chí phụ trách | Nhiệm vụ kỹ thuật và đầu ra báo cáo |
|---|---|---|
| 1 | 1 và 4 | Component/props, controlled form, lifecycle cleanup; giải thích memo/key và tái chạy Profiler; nộp sơ đồ render, số liệu trước/sau và nhận xét |
| 2 | 2 và 5 | Router/URL, service adapter và custom hook; kiểm tra Back/reload/error/retry; phân tích dependency, stale closure và cleanup; nộp trace luồng dữ liệu |
| 3 | 6 và 7 | Bảng client/server state, pricing, quote/create mutation, cache/stale/GC/invalidation; chạy unit và query-evidence; nộp snapshot/trace và giải thích revalidation |
| 4 | 3 và 8 | Strict TS, Vite/HMR, lazy route/build manifest; chạy production E2E và responsive; nộp bundle report, Network evidence và screenshot |

Mỗi người cung cấp file/commit thực tế, kịch bản demo và câu trả lời tự kiểm. Nhóm trưởng tổng hợp, xử lý xung đột và rà tính nhất quán giữa code, báo cáo, demo.

## Giới hạn của minh chứng

Browser tests chạy Chromium headless ở 360/390/768/1024/1440px. Để kết quả ổn định và kiểm tra ảnh lỗi, bộ test chủ động chặn ảnh Unsplash/font ngoài; screenshot dùng fallback local/system font. Đây là kiểm chứng bố cục và tương tác trong điều kiện đó, không xác nhận chất lượng ảnh từ CDN, mọi thiết bị hoặc chứng nhận WCAG.

Backend thật, tồn chỗ nguyên tử, hold, đối soát thanh toán, idempotency bền vững và tra cứu bảo mật chưa thuộc bản demo. Đơn mới vẫn pending_confirmation + unpaid. Không dùng kết quả kiểm tra frontend để tuyên bố hệ thống đã sẵn sàng nhận tiền.
