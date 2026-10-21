import { readFileSync, writeFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";

const read = (name) =>
  JSON.parse(readFileSync(`docs/evidence/${name}.json`, "utf8"));
const development = read("browser-results");
const production = read("browser-production-results");
for (const [name, report] of [
  ["development", development],
  ["production", production],
]) {
  assert.equal(report.stats.unexpected, 0, `${name} contains failed tests`);
  assert.equal(report.stats.flaky, 0, `${name} contains flaky tests`);
  assert.ok(report.stats.expected > 0, `${name} has no passing tests`);
}
const bundle = read("bundle-report");
const profile = read("render-profile");
const query = read("query-cache-trace");
const requests = read("production-chunk-requests");
const audit = read("npm-audit");
const hmr = read("hmr-check");
const baseline = profile.runs.find((item) => item.mode === "baseline");
const optimized = profile.runs.find((item) => item.mode === "optimized");
assert.ok(baseline.summaryCommits > optimized.summaryCommits);
assert.equal(optimized.summaryCommits, 0);
assert.equal(query.catalogCalls, 1);
assert.equal(query.quoteCalls, 2);
assert.equal(bundle.routeChunkCount, 7);
const checkoutFile = bundle.chunks.find((item) =>
  item.source.endsWith("/CheckoutPage.tsx"),
).file;
assert.ok(!requests.startupScripts.some((url) => url.endsWith(checkoutFile)));
assert.ok(requests.afterCheckout.some((url) => url.endsWith(checkoutFile)));
assert.equal(audit.metadata.vulnerabilities.total, 0);
assert.ok(hmr.retainedContactState && hmr.observedHeadingUpdate);
assert.ok(
  !readFileSync(
    "src/features/booking/components/ContactForm.tsx",
    "utf8",
  ).includes("Thông tin người đặt · HMR"),
);
const screenshots = [];
for (const width of [360, 390, 768, 1024, 1440]) {
  for (const page of ["detail", "listing", "checkout"]) {
    const name = `${page}-${width}.png`;
    assert.ok(existsSync(`docs/evidence/${name}`));
    screenshots.push(name);
  }
}
const summary = {
  generatedAt: new Date().toISOString(),
  browserDevelopment: development.stats,
  browserProduction: production.stats,
  profiler: {
    baselineSummaryCommits: baseline.summaryCommits,
    optimizedSummaryCommits: optimized.summaryCommits,
    optimizedContactCommits: optimized.contactCommits,
  },
  bundle: {
    viteVersion: bundle.viteVersion,
    routeChunkCount: bundle.routeChunkCount,
    initialHome: bundle.initialHome,
  },
  query: { catalogCalls: query.catalogCalls, quoteCalls: query.quoteCalls },
  audit: audit.metadata.vulnerabilities,
  screenshots,
};
writeFileSync("docs/evidence/summary.json", JSON.stringify(summary, null, 2));
writeFileSync(
  "docs/CRITERIA-VERIFICATION.md",
  `# Kiểm chứng hoàn thiện 8 tiêu chí

Ngày: 22/10/2026. Dữ liệu tổng hợp: [summary.json](evidence/summary.json). Timestamp trong JSON là UTC.

## Kết quả các lệnh đã chạy

| Lệnh | Kết quả ghi nhận trong phiên hoàn thiện |
|---|---|
| npm test | 31/31 unit/integration pass |
| npm run lint | Pass, không warning |
| npm run typecheck | Pass; strict source, unit test, E2E và cấu hình Playwright |
| npm run build:report | Pass; Vite ${bundle.viteVersion}, ${bundle.routeChunkCount} route chunk |
| npm run evidence:query | Pass; catalog ${query.catalogCalls} lần, quote ${query.quoteCalls} lần |
| npm run test:e2e | ${development.stats.expected} pass, ${development.stats.skipped} skip, 0 fail |
| npm run test:e2e:production | ${production.stats.expected} pass, ${production.stats.skipped} skip, 0 fail |
| npm audit --json | ${audit.metadata.vulnerabilities.total} vulnerability theo registry lúc kiểm tra |
| git diff --check | Pass |

Skip có chủ đích: development bỏ phép kiểm tra production chunk; production bỏ Profiler/HMR chỉ tồn tại ở dev. Không bật retry để biến test lỗi thành pass.

## Minh chứng

- [Browser development](evidence/browser-results.json), [browser production](evidence/browser-production-results.json).
- [Profiler](evidence/render-profile.json): cùng 18 ký tự; summary ${baseline.summaryCommits} → ${optimized.summaryCommits} commit, ContactForm vẫn ${optimized.contactCommits} commit ở bản tối ưu. So sánh cùng view có/không memo, không phải benchmark toàn ứng dụng.
- [HMR](evidence/hmr-check.json): đổi component, giữ input state và phục hồi source.
- [Query/cache/invalidation trace](evidence/query-cache-trace.json); unit test riêng kiểm tra stale/fresh, GC và error/retry.
- [Bundle/gzip](evidence/bundle-report.json): JS entry + trang chủ ${bundle.initialHome.bytes} byte, gzip cộng theo file ${bundle.initialHome.gzipBytes} byte. [Request chunk production](evidence/production-chunk-requests.json) xác nhận chưa tải checkout ở trang chủ và tải khi điều hướng đến checkout.
- [Audit](evidence/npm-audit.json): đã thay Vite 8.3.2 bằng bản vá 8.3.5.
- 15 screenshot: detail/listing/checkout tại 360, 390, 768, 1024, 1440px. Ví dụ [detail 390](evidence/detail-390.png), [listing 1440](evidence/listing-1440.png), [checkout 360](evidence/checkout-360.png). Test đọc scrollWidth thực tế để kiểm tra tràn ngang, kiểm tra form và không có thanh đáy ở checkout.

## Các lỗi được tìm và sửa trong quá trình kiểm tra

1. Lightbox để focus ra khỏi dialog: thêm vòng Tab/Shift+Tab; Esc trả focus về nút mở.
2. Quote cũ có thể ghi vào key của voucher/tỷ lệ mới: chấp nhận giá giờ refetch lựa chọn hiện tại, kiểm tra version và vẫn yêu cầu submit riêng.
3. Fallback ảnh không reset khi đổi src: key image theo nguồn, có regression với ảnh lỗi liên tiếp.
4. Detail query trả undefined khi không có tour: chuẩn hóa thành null để phân biệt not-found và lỗi tải.
5. Filter unmount khi query mới pending: giữ previous data, thông báo đang cập nhật và không chuẩn hóa URL dựa trên placeholder.
6. Hero trang chủ nằm ngoài main và danh sách điểm đến thiếu key: đưa toàn bộ nội dung chính vào một main, thêm Fragment key theo điểm đến.

Rà soát độc lập đã đọc code và xác nhận hai finding về quote/fallback ảnh được xử lý, không còn Important trong các bản sửa được review. Reviewer không thay thế kết quả browser thực tế.

## Độ ổn định và giới hạn

Fixture browser cố định tài nguyên ngoài bằng HTTP 404 ở context để kiểm tra local fallback. Screenshot dùng system font/ảnh placeholder; chưa xác nhận CDN ảnh/font, mọi thiết bị hoặc WCAG đầy đủ.

Hai vòng production trước dùng page-level abort có ghi nhận timeout khi các request chunk còn pending, chưa có lỗi JavaScript. Đã lưu trace chẩn đoán nội bộ, thay fixture bằng context-level HTTP 404; nhóm luồng production được chạy lặp 10/10 lượt đạt, sau đó chạy lại toàn bộ như bảng trên. Đây là kết quả trong môi trường kiểm tra hiện tại, không khẳng định đã chứng minh nguyên nhân của mọi timeout mạng.

Backend, hold/tồn chỗ nguyên tử, thanh toán thật, idempotency bền vững và tra cứu bảo mật chưa triển khai theo phạm vi demo. Không có commit mới vì checkout đã chứa nhiều thay đổi chưa commit từ trước; cần chọn file để review/stage trước khi tích hợp.

Báo cáo cơ chế và phân công hai tiêu chí/người: [REPORT-REACT-VITE-TANSTACK.md](REPORT-REACT-VITE-TANSTACK.md).
`,
);
console.log(JSON.stringify(summary, null, 2));
