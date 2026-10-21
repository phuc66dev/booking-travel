# Prompt xây dựng website đặt tour du lịch

## Ghi chú nghiên cứu — đọc trước khi sao chép prompt

Trang tham khảo: https://tourbonphuong.com/tour-2-ngay-1-dem-my-tho-ben-tre-can-tho

Khảo sát ngày 17/10/2026, qua nội dung trang và trình duyệt trên máy tính. Những điểm đã quan sát: header hai tầng; nền trắng với xanh dương và cam; thư viện ảnh một ảnh lớn cạnh bốn ảnh nhỏ; khung đặt tour bên phải; chọn ngày, gói khách sạn, số khách; giá cập nhật; phần tổng quan, lịch trình, bảng giá, lịch khởi hành, điều kiện, đánh giá, FAQ và tour liên quan. Bước đặt tour có thông tin liên hệ, tỷ lệ thanh toán 50%/100%, mã giảm giá, chuyển khoản và bảng tổng tiền.

Chỉ mở biểu mẫu, không nhập thông tin cá nhân, tạo đơn hay thanh toán. Chưa kiểm chứng luồng sau khi gửi đơn, backend, cách giữ chỗ và giao diện mobile của website tham khảo. Các yêu cầu tương ứng bên dưới là thiết kế đề xuất.

Màu HEX, kích thước, thương hiệu mẫu và quy tắc nghiệp vụ dưới đây được chuẩn hóa cho sản phẩm mới; không phải số đo hay chính sách được sao chép nguyên bản. Nhãn tuổi tại bộ chọn khách của trang tham khảo chưa thống nhất với phần chính sách; prompt chủ động quy định lại ranh giới tuổi rõ ràng.

---

## BẮT ĐẦU PROMPT — sao chép từ đây

Bạn là Senior Product Designer kiêm Senior Frontend Engineer. Hãy xây dựng website đặt tour du lịch bằng tiếng Việt với giao diện hoàn chỉnh và các logic cơ bản có thể thao tác xuyên suốt.

Tham khảo cấu trúc thông tin và trải nghiệm tại:
https://tourbonphuong.com/tour-2-ngay-1-dem-my-tho-ben-tre-can-tho

Mục tiêu: khách tìm được tour phù hợp, hiểu lịch trình và chi phí, chọn chuyến khởi hành, chọn gói dịch vụ và số khách, nhập thông tin, kiểm tra đơn, tạo yêu cầu đặt tour và tra cứu trạng thái. Ưu tiên trang chi tiết tour và checkout. Không chỉ dựng landing page đẹp nhưng thiếu tương tác.

Website tham khảo chỉ định hướng bố cục và logic. Tạo thương hiệu độc lập tên “Mekong Journeys”. Viết nội dung mới. Không lấy logo, ảnh có bản quyền, thông tin doanh nghiệp, số tài khoản, chứng nhận hay đánh giá khách hàng của đơn vị tham khảo để nhận là của thương hiệu mới.

### 1. Phạm vi và mức độ hoàn thiện

Triển khai bản frontend MVP với dữ liệu giả lập qua service adapter; chưa kết nối thanh toán thật. Hiển thị dấu hiệu “Bản demo” tại màn hình giao dịch và các đánh giá mẫu. Không hiển thị lời khẳng định về mã hóa, chứng nhận hay giữ chỗ thật khi chưa có hệ thống tương ứng.

Các trang bắt buộc:
1. `/`: trang chủ giới thiệu và tìm tour.
2. `/tours`: danh sách, tìm kiếm, lọc và sắp xếp.
3. `/tours/[slug]`: chi tiết tour, là màn hình trọng tâm.
4. `/booking`: thông tin liên hệ và rà soát đơn.
5. `/booking/[bookingId]`: kết quả tạo yêu cầu và hướng dẫn thanh toán demo.
6. `/booking/lookup`: tra cứu đơn mẫu.
7. `/policies`: chính sách áp dụng cho bản demo, được dẫn từ checkout.

Không tự mở rộng sang admin, CRM, ví, chương trình thành viên, mạng xã hội hoặc nhiều ngôn ngữ. Không yêu cầu đăng nhập để đặt tour.

Nếu dự án đã tồn tại, đọc cấu trúc và tái sử dụng convention trước khi sửa. Nếu bắt đầu mới, dùng Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui, lucide-react, React Hook Form và Zod. Dùng thư viện đang tương thích trong môi trường, không đoán phiên bản và không trộn cấu hình Tailwind v3 vào v4. Không thêm thư viện khi chức năng hiện có đủ đáp ứng.

### 2. Ngôn ngữ thiết kế bắt buộc

Cảm giác: rõ ràng, thân thiện, đáng tin cậy, giàu hình ảnh điểm đến. Nội dung dễ quét, giá dễ nhận biết, đặt tour dễ thao tác. Không dùng phong cách dashboard quản trị cho trang khách hàng.

#### Bảng màu cố định

| Token | HEX | Cách dùng |
|---|---|---|
| primary | #075985 | Điều hướng, link, thương hiệu |
| primary-hover | #0C4A6E | Hover của primary |
| primary-soft | #F0F9FF | Nền mục đang chọn |
| accent | #C2410C | CTA đặt tour, giá quan trọng |
| accent-hover | #9A3412 | Hover của CTA |
| accent-soft | #FFF7ED | Nền khung đặt tour và nhấn nhẹ |
| page | #FFFFFF | Nền chính |
| surface | #F8FAFC | Nền phụ |
| text | #0F172A | Chữ chính |
| muted | #475569 | Chữ phụ |
| border | #E2E8F0 | Viền |
| success | #15803D | Còn chỗ, kết quả hợp lệ |
| warning | #A16207 | Cảnh báo cần chú ý |
| error | #B91C1C | Lỗi, hết chỗ |

Định nghĩa token tập trung bằng CSS variables và ánh xạ vào theme. Không rải mã màu trực tiếp trong component. Nền trung tính chiếm phần lớn diện tích; cam dùng có chủ đích, không tô toàn bộ trang. Màu ngữ nghĩa chỉ phục vụ trạng thái, không làm màu trang trí mới.

Một hành động chính trên mỗi khối; CTA đặt tour dùng cùng kiểu cam đặc trên mọi màn hình. Hành động phụ dùng outline hoặc text. Không gradient trang trí, glassmorphism, neon, đổ bóng dày, hiệu ứng nhấp nháy hay thông báo khan hiếm ngẫu nhiên.

#### Typography và spacing

- Một font sans hỗ trợ tiếng Việt: Be Vietnam Pro, fallback system sans.
- Body 16px/26px, weight 400; label 14px/20px, weight 500.
- H1 desktop 32px/42px, mobile 26px/34px, weight 700.
- H2 24px/32px; H3 18px/28px, weight 600.
- Giá trọng tâm 28px/36px, weight 700; dùng tabular numerals ở bảng tiền.
- Chú thích tối thiểu 12px/18px; không dùng cỡ chữ này cho trường nhập hay nội dung chính.
- Khoảng cách theo thang 4, 8, 12, 16, 24, 32, 48, 64px.
- Bo góc input/button 10px; card 16px; badge dạng pill.
- Card padding desktop 24px, mobile 16px. Section gap desktop 48px, mobile 32px.
- Viền 1px. Chỉ dùng shadow nhẹ ở dropdown, modal và khung cần phân lớp.
- Input tối thiểu 48px; vùng chạm button/icon tối thiểu 44×44px.
- Cùng cấp thông tin phải cùng cỡ chữ, khoảng cách và màu trên toàn website.

### 3. Layout và responsive

Container tối đa 1280px, căn giữa; gutter desktop 32px, tablet 24px, mobile 16px. Không ép chiều rộng cố định gây tràn màn hình.

Breakpoint thống nhất:
- Mobile: dưới 768px.
- Tablet: 768–1023px.
- Desktop: từ 1024px.

Header desktop gồm thanh tiện ích gọn và thanh navigation chính. Thanh tiện ích có tìm kiếm và tra cứu; navigation có logo, Trang chủ, Khám phá tour, Chính sách, nút xem tour. Mọi liên kết phải có đích hoạt động; không tạo menu trống. Trên mobile dùng menu drawer, tìm kiếm qua nút mở vùng tìm kiếm. Không giữ nguyên header desktop rồi thu nhỏ chữ.

Chỉ navigation chính sticky. Thanh điều hướng nội dung nằm dưới navigation khi cần; đặt offset bằng token chiều cao header, không chồng lên tiêu đề. Dùng scroll-margin-top cho các section. Xác định z-index theo lớp: nội dung < sticky < dropdown < backdrop < dialog; thông báo không che dialog.

Trang chi tiết desktop: breadcrumb và tiêu đề; tiếp theo grid `minmax(0, 1fr) 360px`, gap 32px. Cột trái là ảnh và nội dung; cột phải là BookingCard sticky với top offset đúng chiều cao navigation. BookingCard nằm trong vùng main và dừng trước footer. Ở viewport thấp, nếu card cao hơn vùng nhìn thì bỏ sticky để mọi trường vẫn truy cập được.

Tablet/mobile: một cột; ảnh → thông tin nhanh → khung chọn tour → nội dung chi tiết. Không ép khung 360px vào màn hình nhỏ. Mobile có thanh đáy chứa tổng giá và CTA; thêm padding-bottom cùng safe-area để không che nội dung. Ẩn thanh đáy khi mở dialog nhập liệu hoặc ở checkout để tránh hai CTA cạnh tranh. Nút hỗ trợ nổi, nếu có, phải nằm trên thanh đáy và không che trường nhập.

Không có horizontal overflow toàn trang tại 360, 390, 768, 1024, 1440px. Thành phần cuộn ngang hợp lệ như tabs phải có dấu hiệu cuộn và vẫn dùng được bằng bàn phím.

### 4. Màn hình cần xây dựng

#### Trang chủ

Hero ảnh du lịch có điểm nhấn, tiêu đề ngắn, mô tả tối đa hai dòng và form tìm kiếm gồm điểm đến, ngày đi, thời lượng. Không dùng hero toàn màn hình đẩy tìm kiếm xuống xa. Form chuyển sang `/tours` với query params. Có danh mục điểm đến, 6 tour nổi bật và khối giải thích quy trình đặt tour. Footer gồm thương hiệu, điều hướng và chính sách; thông tin liên hệ chưa cấu hình thì hiển thị trạng thái phù hợp, không dùng liên hệ thật của website tham khảo.

#### Danh sách tour

Desktop: bộ lọc trái 256px, kết quả phải 3 cột nếu đủ rộng; tablet 2 cột; mobile 1 cột và filter sheet. Bộ lọc gồm điểm đến, khoảng giá, thời lượng, ngày khởi hành. Có xóa từng bộ lọc và xóa tất cả. Sort: liên quan, giá tăng, giá giảm, ngày gần nhất.

Tìm kiếm tiếng Việt không phân biệt hoa thường và dấu. Lọc kết hợp theo AND; sau lọc mới sort, sau sort mới phân trang. Reset page về 1 khi đổi bộ lọc. Lưu tìm kiếm, filter, sort và page vào URL để tải lại hoặc Back vẫn đúng. Có empty state và nút xóa lọc.

TourCard dùng ảnh 4:3, tiêu đề tối đa hai dòng, thời lượng, điểm xuất phát, ngày gần nhất còn chỗ, giá từ và nút xem chi tiết. Dành chỗ nội dung thống nhất để hàng card thẳng nhau. “Giá từ” được tính từ chuyến/gói còn mở bán phù hợp, không lấy một số khác không thể đặt.

#### Chi tiết tour

Theo thứ tự:
1. Breadcrumb, H1, thông tin đánh giá mẫu có nhãn demo nếu dùng dữ liệu mẫu.
2. Gallery desktop một ảnh lớn và bốn ảnh nhỏ, gap 8px; nút xem tất cả. Mobile dùng carousel có đếm ảnh, không tự chạy.
3. Thông tin nhanh: thời lượng, nơi khởi hành, phương tiện, giờ và điểm đón.
4. Thanh mục lục: Tổng quan, Lịch trình, Gói dịch vụ, Lịch khởi hành, Chính sách, Đánh giá, Hỏi đáp. Click cuộn đúng section; mục đang xem có trạng thái active.
5. Tổng quan ngắn và 4–6 điểm nổi bật.
6. Lịch trình theo ngày dạng accordion có mốc giờ, địa điểm, bữa ăn và chi phí tự túc. Không nhồi toàn bộ lịch trình vào một đoạn dài.
7. Ba gói khách sạn; mô tả khác biệt cụ thể, giá người lớn/trẻ em, phụ thu. Nút chọn gói đồng bộ BookingCard.
8. Lịch khởi hành có ngày, giá, số chỗ, trạng thái và chọn chuyến. Mobile chuyển bảng thành danh sách card.
9. Chính sách: bao gồm, không bao gồm, độ tuổi, phòng riêng, hủy/đổi. Nội dung hủy/đổi là cấu hình demo có nhãn rõ; không tự nhận là điều kiện kinh doanh thật.
10. Đánh giá mẫu và FAQ accordion.
11. Tour liên quan.

Gallery mở lightbox: nút đóng, ảnh trước/sau, thumbnail hoặc số thứ tự; Esc đóng; focus giữ trong dialog và trả về nút mở khi đóng. Ảnh dùng object-fit cover với vùng crop hợp lý; lightbox dùng contain. Có alt và fallback khi ảnh lỗi.

#### BookingCard

Thứ tự bắt buộc: giá từ → ngày khởi hành → gói dịch vụ → số khách → phụ thu nếu có → bảng giá tóm tắt → tổng → CTA → thông tin hỗ trợ.

Hiển thị ba ngày sắp tới có dữ liệu và nút mở lịch đầy đủ. Ngày được chọn có viền, nền và ký hiệu chọn. Gói dùng radio card có thể thao tác bằng bàn phím. Bộ chọn khách có nút tăng/giảm, số lượng, độ tuổi và đơn giá; không chỉ viết NL/TE/EB mà thiếu giải thích.

Trước khi chọn ngày/gói, hiển thị “Giá từ”, không trình bày như báo giá đã xác định. Có thể đặt mặc định 2 người lớn nhưng bắt buộc khách chủ động chọn chuyến và gói. CTA vô hiệu khi thiếu dữ liệu hoặc vượt chỗ, kèm lý do bằng chữ gần nút.

Mọi nút “Chọn gói”, “Chọn chuyến” trên trang phải cập nhật cùng booking draft; không có state riêng gây lệch giá. Nếu chọn chuyến mới khiến gói cũ không khả dụng, bỏ chọn gói, thông báo và yêu cầu chọn lại; không âm thầm đổi sang gói đắt hơn.

### 5. Quy tắc nghiệp vụ demo — phải nhất quán

Đây là chính sách riêng của bản demo, không phải bản sao chính sách website tham khảo:

- Tuổi tính theo ngày khởi hành theo múi giờ Asia/Ho_Chi_Minh.
- Em bé: từ 0 đến dưới 4 tuổi; trẻ em: từ 4 đến dưới 9 tuổi; người lớn: từ 9 tuổi.
- Không để tuổi 3 hoặc 9 rơi vào khoảng trống hay hai nhóm cùng lúc.
- Bản MVP chọn số lượng theo nhóm tuổi, chưa bắt buộc nhập danh sách giấy tờ hành khách. Hiển thị rõ người đặt tự khai nhóm tuổi theo ngày đi. Không giả vờ đã xác thực tuổi bằng ngày sinh.
- Tối thiểu 1 người lớn; mọi số lượng là số nguyên không âm; tối đa 10 hành khách cho một đơn demo.
- Em bé tối đa bằng số người lớn; nếu vượt, chặn và giải thích.
- Trong demo, người lớn và trẻ em mỗi người chiếm một chỗ, em bé không chiếm chỗ; hiển thị rõ quy tắc này cạnh bộ chọn.
- Sức chứa dùng chung theo departure, không nhân ba sức chứa vì có ba gói khách sạn.
- Không tự động đổi trẻ em thành giá người lớn theo tỷ lệ đi kèm. Nếu tương lai có chính sách đó, phải đưa thành cấu hình mới cùng mô tả và cách tính thống nhất.
- Ngày đi phải còn mở bán, chưa qua booking cutoff và chưa hết chỗ. Demo chỉ tạo ngày từ ngày mai trở đi; không hardcode các ngày khảo sát đã có thể hết hạn.
- Thay đổi ngày, gói hay số khách phải cập nhật giá và kiểm tra điều kiện ngay.
- Hiển thị “còn X chỗ” từ dữ liệu; không random và không thêm countdown tạo áp lực giả.

### 6. Giá và phụ thu

Giá phụ thuộc `departureId + packageId + nhóm khách`. Tất cả tiền lưu bằng số nguyên VND. Không parse ngược chuỗi đã format để tính toán. Format bằng Intl.NumberFormat với locale vi-VN; chỉ xuất một ký hiệu tiền tệ.

Dữ liệu tour chính: Mỹ Tho – Bến Tre – Cần Thơ, 2 ngày 1 đêm, xuất phát TP.HCM. Giá cơ sở demo:

| Gói | Người lớn | Trẻ em | Em bé | Phụ thu phòng riêng/đơn |
|---|---:|---:|---:|---:|
| Khách sạn 3 sao | 1.600.000 | 1.200.000 | 0 | 300.000 |
| Khách sạn 4 sao | 1.950.000 | 1.462.500 | 0 | 550.000 |
| Khách sạn 5 sao | 2.350.000 | 1.762.500 | 0 | 850.000 |

Giá demo đã bao gồm các khoản bắt buộc trong cấu hình; không tự thêm VAT hoặc phí cổng thanh toán. Ngày cao điểm có thể có bảng giá riêng nhưng phải hiển thị trước khi chọn.

Phụ thu phòng riêng trong MVP: bắt buộc khi chỉ có một người lớn và không có trẻ em, kể cả đi cùng em bé; các nhóm còn lại mặc định ở ghép theo bố trí demo, không tự suy luận phụ thu từ số lẻ. Hiển thị điều kiện cạnh khoản phí. Chưa triển khai bộ máy xếp phòng phức tạp.

Công thức duy nhất dùng chung các màn hình:
- passengerSubtotal = adults × adultPrice + children × childPrice + infants × infantPrice.
- subtotal = passengerSubtotal + singleRoomSupplement.
- discount = min(voucherDiscount, passengerSubtotal).
- total = max(0, subtotal − discount).
- payableNow = deposit50 ? ceil(total × 0.5) : total.
- remaining = total − payableNow.

Voucher demo chỉ áp dụng cho tiền khách, không trừ phụ thu. Mỗi đơn tối đa một mã, không cộng dồn. Có mã hợp lệ `MEKONG100` giảm 100.000đ khi tiền khách từ 3.000.000đ, thời hạn tạo động trong seed; có mã hết hạn và mã không đủ điều kiện để kiểm tra. Trim và chuẩn hóa mã trước kiểm tra. Có nút gỡ mã. Khi thay đổi lựa chọn làm mã mất điều kiện, gỡ mã kèm thông báo rõ và tính lại ngay.

Ví dụ bắt buộc đúng:
- 2 người lớn, gói 3 sao, không mã: 3.200.000đ.
- Cấu hình trên + MEKONG100: 3.100.000đ; trả trước 50%: 1.550.000đ; còn lại 1.550.000đ.
- 1 người lớn, gói 3 sao: 1.900.000đ vì phụ thu 300.000đ.
- 2 người lớn + 1 trẻ em, gói 4 sao: 5.362.500đ trước giảm giá.
- Đoàn 2 người lớn + 1 trẻ em cần 3 chỗ; không cho đặt khi chỉ còn 2 chỗ.

### 7. Checkout và kết quả

Checkout có stepper: Chọn tour → Thông tin đặt tour → Kết quả. Không đánh dấu thanh toán hoàn tất chỉ vì đã tạo yêu cầu.

Desktop hai cột: form trái, summary phải; mobile một cột, summary trước nút gửi. Nội dung gồm:
- Tour, ngày đi, gói, số khách, giờ/điểm đón và nút sửa lựa chọn.
- Họ tên bắt buộc, số điện thoại bắt buộc, email tùy chọn, ghi chú tùy chọn.
- Họ tên trim, dài 2–100 ký tự và hỗ trợ tiếng Việt.
- Điện thoại chấp nhận số di động Việt Nam dạng 0 hoặc +84, chuẩn hóa khoảng trắng; dùng quy tắc định dạng tập trung, không giả vờ xác minh sở hữu số.
- Email trống được chấp nhận; khi có nhập phải đúng định dạng.
- Ghi chú tối đa 500 ký tự.
- Chọn trả trước 50% hoặc 100%; mặc định 100%.
- Phương thức chuyển khoản demo; không dùng tài khoản hay QR chuyển tiền thật. Có thể hiển thị khối hướng dẫn minh họa ghi rõ không chuyển tiền.
- Voucher, các dòng tiền, tổng giá trị đơn, trả ngay và còn lại.
- Checkbox đồng ý chính sách, mặc định chưa chọn; link chính sách đọc được mà không mất form.

Validation tại field sau blur và khi submit. Lỗi bằng tiếng Việt, nằm sát trường và liên kết bằng aria-describedby. Khi submit lỗi, focus tới lỗi đầu tiên. Không giới hạn họ tên thành ASCII và không bắt người Việt bỏ dấu.

Khi xác nhận, gọi mock service để kiểm tra lại giá, cutoff, số chỗ và voucher. Chặn gửi lặp bằng trạng thái submitting; dùng idempotency key ở adapter để hai lần gọi cùng yêu cầu trả cùng booking. Nếu giá thay đổi, hiển thị giá cũ/mới, yêu cầu người dùng chấp nhận trước khi tạo đơn; không tự động submit lại.

Tách hai trạng thái:
- BookingStatus: pending_confirmation, confirmed, cancelled.
- PaymentStatus: unpaid, partially_paid, paid, failed.

Tạo đơn thành công bắt đầu ở pending_confirmation + unpaid. Kết quả có mã đơn, bản chụp chi tiết giá lúc tạo, thông tin liên hệ đã che bớt, hướng dẫn bước tiếp theo và nhãn demo. Không dùng câu “Thanh toán thành công” hoặc “Vé đã được xác nhận” ở trạng thái này. Không tuyên bố giữ chỗ nếu demo chưa triển khai hold.

Có trang demo riêng hoặc test fixture để mô phỏng nhận thanh toán, không cho nút “Tôi đã chuyển khoản” tự chuyển đơn thành paid. Phiên bản production sau này phải xác minh qua backend/đối soát.

Tra cứu demo bằng mã đơn + số điện thoại khớp bản ghi trong phiên. Sai tổ hợp thì thông báo chung “Không tìm thấy đơn phù hợp”. Không liệt kê toàn bộ đơn. Nêu rõ tra cứu frontend chỉ minh họa trong phiên và chưa có bảo mật tra cứu production.

### 8. Dữ liệu, state và kiến trúc tối thiểu

Tách feature `tours` và `booking`, UI dùng chung, mock data và service adapter. Không viết tất cả trang và business logic trong một component.

Các entity tối thiểu:
- Tour: id, slug, title, destinations, departureLocation, durationDays, images, highlights, itinerary, policies.
- TourPackage: id, tourId, name, hotelStars, features, singleRoomSupplement.
- Departure: id, tourId, startAt, bookingCutoffAt, availableSeats, status.
- DeparturePackagePrice: departureId, packageId, adultPrice, childPrice, infantPrice, available.
- BookingDraft: tourId, departureId, packageId, adults, children, infants, voucherCode, paymentRatio.
- PriceQuote: lineItems, passengerSubtotal, supplements, discount, total, payableNow, remaining, quoteVersion.
- Booking: id, bookingCode, contact, selectionSnapshot, priceSnapshot, bookingStatus, paymentStatus, createdAt.

Component đề xuất: SiteHeader, TourSearch, TourFilters, TourCard, TourGallery, TourQuickFacts, SectionNav, ItineraryAccordion, PackageSelector, DeparturePicker, PassengerSelector, BookingCard, PriceBreakdown, ContactForm, BookingSummary, BookingResult, BookingLookup.

Chỉ giữ ID và lựa chọn trong booking draft; tổng tiền tính qua một hàm quote dùng chung. Không copy subtotal sang nhiều state rồi đồng bộ bằng nhiều useEffect. Không lưu tổng tiền từ URL như giá đáng tin cậy. Query params chỉ chứa dữ liệu tìm kiếm hoặc ID công khai, không chứa contact.

Mock adapter có searchTours, getTour, getDepartures, getQuote, createBooking, lookupBooking. Có delay vừa phải và các tình huống lỗi có thể chọn qua fixture xác định, không lỗi ngẫu nhiên. Không gọi API của website tham khảo.

Seed ít nhất 8 tour, mỗi tour có ảnh, lịch trình và chuyến sắp tới; tour chính có 3 gói, ngày còn chỗ, ít chỗ, hết chỗ, gói không bán và ngày có giá khác. Tạo ngày tương đối theo đồng hồ tại Asia/Ho_Chi_Minh. Đánh giá mẫu không được gắn nhãn “đã xác thực”.

Persist draft không chứa thông tin liên hệ vào sessionStorage, có schema version và thời hạn 24 giờ. Khi restore, xác thực lại departure, giá và số chỗ. Contact mặc định chỉ ở memory. Nếu cần tra cứu sau reload trong demo, cho phép rõ ràng lưu đơn vào sessionStorage của phiên, ghi chú giới hạn và có nút xóa dữ liệu demo. Không lưu thông tin thẻ, CCCD hay hồ sơ nhạy cảm.

Frontend validation không thay thế backend. Khi kết nối production, adapter phải được thay bằng backend tính giá lại, kiểm tra tồn chỗ nguyên tử, idempotency bền vững và xác minh thanh toán. Bản MVP không cần tự xây đầy đủ các hệ thống đó nhưng không được giả định đã có.

### 9. Trạng thái UI và accessibility

Mọi phần có dữ liệu async phải có loading, success, empty, error và retry phù hợp. Skeleton giữ kích thước gần với nội dung cuối để hạn chế nhảy layout. Không hiển thị tổng tiền 0đ trong lúc đang tính nếu gây hiểu nhầm là miễn phí.

Button có default, hover, focus-visible, active, disabled, loading. Trạng thái selected và lỗi phải có dấu hiệu khác ngoài màu. Không dùng toast làm nơi duy nhất thông báo lỗi quan trọng. Thay đổi tổng tiền thông báo qua aria-live polite, không giành focus.

Dùng semantic HTML; một H1 mỗi trang; label luôn hiển thị; radio/checkbox dùng đúng vai trò. Dropdown, calendar, gallery và drawer dùng được bằng bàn phím. Modal có tên, focus trap, Esc và trả focus. Không đặt button trong link hay lồng phần tử tương tác.

Mục tiêu WCAG 2.2 AA: chữ thường tương phản ít nhất 4.5:1, chữ lớn 3:1; focus và biên điều khiển có tương phản rõ. Tôn trọng prefers-reduced-motion. Animation 150–200ms cho tương tác nhỏ; không animate layout booking gây khó thao tác.

Ảnh đầu trang được ưu tiên tải hợp lý, ảnh dưới fold lazy-load, có kích thước/aspect-ratio để tránh CLS. Không hotlink ảnh của website tham khảo. Dùng asset có quyền sử dụng, nguồn được ghi nhận; nếu chưa có ảnh, dùng placeholder đúng tỷ lệ và đánh dấu cần thay, không để ảnh vỡ.

### 10. Tiêu chí nghiệm thu — tất cả là điều kiện bắt buộc

Kiểm tra trực tiếp các viewport 360, 390, 768, 1024, 1440px bằng screenshot hoặc browser có sẵn. Không chỉ suy luận từ CSS.

Thiết kế đạt khi:
- Đúng token màu, font, spacing và kiểu CTA đã quy định.
- Desktop thể hiện rõ cột nội dung và khung đặt tour; mobile tổ chức lại thành một cột.
- Không tràn ngang, không cắt giá/label, không che field và không có sticky chồng nhau.
- Ảnh cân đối, tiêu đề card thẳng hàng, đoạn văn đọc được, footer không bị card đè.
- Mọi nút/menu có hành vi cụ thể; không có `href="#"` hoặc hành động rỗng.

Nghiệp vụ đạt khi:
- Chọn ngày/gói/khách từ mọi vị trí cho cùng một bảng giá.
- Các ví dụ tính tiền ở mục 6 đều đúng.
- Chặn số âm, thiếu người lớn, quá 10 khách, quá chỗ và ngày ngừng bán.
- Gói không khả dụng không thể chọn; thay đổi lựa chọn không âm thầm đổi giá trị khách chưa xác nhận.
- Voucher đúng/sai/hết hạn/không đủ mức đều có phản hồi; thay đổi đơn làm mất điều kiện được xử lý.
- Form lỗi có thông báo và giữ dữ liệu đã nhập; Back sửa tour không mất lựa chọn hợp lệ.
- Double click submit không tạo hai đơn.
- Có thể mô phỏng giá đổi, hết chỗ và lỗi mạng trước khi tạo đơn; khách có hướng khắc phục.
- Đơn mới là chờ xác nhận và chưa thanh toán; tra cứu trả đúng trạng thái.
- Reload draft hết hạn hoặc chứa ID sai được phục hồi an toàn.

Viết unit test cho hàm tính giá, validate passenger, điều kiện voucher, cutoff và mapping trạng thái. Có kiểm thử xuyên suốt một luồng đặt tour thành công và một luồng hết chỗ/giá thay đổi nếu môi trường hỗ trợ. Chạy lint, typecheck, build và các test phù hợp với dự án. Báo rõ lệnh nào đã chạy, kết quả và phần chưa kiểm chứng; không tuyên bố đã test khi chưa chạy.

### 11. Quy trình và đầu ra

Trước khi viết code, tóm tắt ngắn sitemap, bố cục trang chi tiết, token màu, quy tắc giá và giả định. Nếu yêu cầu môi trường mâu thuẫn, báo đúng điểm cần giải quyết; không tự ý bỏ yêu cầu.

Ưu tiên thực hiện theo thứ tự: design tokens và UI primitives → chi tiết tour và booking draft → checkout/kết quả → danh sách và tìm kiếm → trang chủ/tra cứu → kiểm tra responsive và nghiệp vụ. Dùng cùng hệ thống component để mọi trang đồng nhất.

Đầu ra cần có mã nguồn chạy được, hướng dẫn chạy ngắn, mô tả cấu trúc, dữ liệu demo, các tương tác đã hoạt động và bằng chứng kiểm tra. Liệt kê riêng tích hợp còn thiếu như backend thật, giữ chỗ, cổng thanh toán và thông báo. Không đánh đồng việc dựng xong giao diện với hệ thống sẵn sàng nhận tiền.

Nếu buộc phải rút gọn vì giới hạn môi trường, giữ nguyên chất lượng trang chi tiết, bảng tính giá và luồng đặt tour trước; báo rõ phần chưa thực hiện. Không cắt bỏ validation, responsive hoặc trạng thái lỗi để đổi lấy thêm section trang trí.

## KẾT THÚC PROMPT
