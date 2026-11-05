"""Render exact source excerpts as PNG evidence and embed them in the report.

Requires Pillow. Run from any directory; source is read relative to this script.
Images are source renderings, not screenshots of an editor or runtime results.
"""
from pathlib import Path
import hashlib
import json
import re
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/evidence/source-code"
REPORT = ROOT / "docs/BAO-CAO-CHUNG-MINH-REACT-VITE-TANSTACK.md"
# criterion, slug, file, inclusive line ranges, explanation
SPECS = [
    (1, "rhf", "src/features/booking/components/ContactForm.tsx", [(1, 18), (23, 78)], "React Hook Form: useForm, resolver, register và lỗi field"),
    (1, "lifecycle", "src/components/TourGallery.tsx", [(93, 110)], "Effect mở dialog và cleanup khi Lightbox unmount"),
    (1, "contact-context", "src/features/booking/components/BookingContactProvider.tsx", None, "State và context chia sẻ contact trong cây React"),
    (2, "router-loader", "src/app/routes.tsx", [(135, 184)], "Route tree, validateSearch, loader và params có kiểu"),
    (2, "router-search", "src/features/tours/hooks/use-tour-search.ts", None, "Đọc search từ route và cập nhật URL bằng useNavigate"),
    (3, "typescript", "tsconfig.app.json", None, "Cấu hình strict, JSX và module resolution của TypeScript"),
    (3, "vite", "vite.config.ts", None, "Plugin React và manifest của Vite build"),
    (3, "router-types", "src/app/routes.tsx", [(244, 256)], "Đăng ký kiểu router qua TypeScript module augmentation"),
    (4, "memo", "src/features/booking/components/BookingSummary.tsx", [(1, 10), (31, 56), (170, 172)], "BookingSummaryView, Profiler wrapper và React.memo"),
    (4, "baseline", "src/features/booking/pages/CheckoutPage.tsx", [(12, 29)], "Cùng view: chọn baseline hoặc memo trong development"),
    (4, "profiler", "src/shared/lib/diagnostics.tsx", [(32, 58)], "React Profiler ghi commit và actualDuration"),
    (4, "identity-key", "src/features/tours/pages/TourDetailPage.tsx", [(25, 44)], "Key theo ID tour xác định identity của component nội dung"),
    (5, "hooks", "src/features/booking/hooks/use-checkout.ts", [(14, 45)], "useRef, useCallback, functional update và dependency của closure"),
    (5, "price-refetch", "src/features/booking/hooks/use-checkout.ts", [(53, 86)], "Custom hook refetch quote hiện tại và xử lý version giá"),
    (6, "draft-context", "src/features/booking/components/BookingDraftProvider.tsx", None, "Client state draft, cập nhật bất biến, persist và memo context value"),
    (6, "providers", "src/app/providers.tsx", None, "QueryClientProvider cùng hai React provider và cleanup subscription"),
    (7, "query-defaults", "src/app/query-client.ts", None, "Chính sách freshness, GC, retry và focus của QueryClient"),
    (7, "query-keys", "src/features/booking/api/booking-keys.ts", None, "Định danh quote cache chứa các lựa chọn ảnh hưởng báo giá"),
    (7, "query-options", "src/features/tours/api/tour-queries.ts", None, "queryOptions, useQuery, enabled và keepPreviousData"),
    (7, "invalidation", "src/features/booking/api/booking-mutations.ts", [(18, 47)], "Mutation thành công invalidates exact quote và không tự retry"),
    (8, "lazy-import", "src/app/routes.tsx", [(27, 55)], "Dynamic import qua React.lazy và nhánh devtools development"),
    (8, "suspense", "src/app/routes.tsx", [(104, 118)], "Suspense bọc Outlet và các thành phần kiểm thử DEV"),
    (8, "error-boundary", "src/shared/components/PageBoundary.tsx", None, "getDerivedStateFromError và fallback của React Error Boundary"),
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    font_path = Path("C:/Windows/Fonts/consola.ttf")
    if not font_path.exists():
        raise RuntimeError("Consolas font missing; configure an installed monospace font.")
    code_font = ImageFont.truetype(str(font_path), 23)
    small_font = ImageFont.truetype(str(font_path), 19)
    entries = []
    for criterion, slug, source, ranges, explanation in SPECS:
        raw = (ROOT / source).read_bytes()
        lines = raw.decode("utf-8-sig").splitlines()
        ranges = ranges or [(1, len(lines))]
        rows = []
        for i, (start, end) in enumerate(ranges):
            if not (1 <= start <= end <= len(lines)):
                raise ValueError(f"Invalid range {source}:{start}-{end} / {len(lines)}")
            if i:
                rows.append((None, f"[lines {ranges[i - 1][1] + 1}-{start - 1} omitted]"))
            rows.extend((n, lines[n - 1]) for n in range(start, end + 1))
        label = ", ".join(f"{a}-{b}" for a, b in ranges)
        digest = hashlib.sha256(raw).hexdigest()
        width = max(1320, int(max(code_font.getlength(s.expandtabs(4)) for _, s in rows)) + 160,
                    int(small_font.getlength(source)) + 100)
        height = 144 + len(rows) * 33 + 54
        im = Image.new("RGB", (width, height), "#ffffff")
        d = ImageDraw.Draw(im)
        d.rectangle((0, 0, width, 118), fill="#edf3f8")
        d.text((32, 18), f"CRITERION {criterion}  |  SOURCE CODE", font=small_font, fill="#075985")
        d.text((32, 49), source, font=code_font, fill="#0f172a")
        d.text((32, 86), f"Lines {label}  |  SHA-256 {digest[:16]}", font=small_font, fill="#475569")
        d.rectangle((0, 128, 96, height - 46), fill="#f8fafc")
        for i, (n, content) in enumerate(rows):
            y = 140 + i * 33
            if n is not None:
                d.text((80, y), str(n), anchor="ra", font=code_font, fill="#64748b")
            d.text((116, y), content.expandtabs(4), font=code_font,
                   fill="#0f172a" if n is not None else "#64748b")
        d.text((32, height - 34), "Exact source excerpt | gaps are explicitly marked | not a runtime result",
               font=small_font, fill="#475569")
        filename = f"criterion-{criterion}-{slug}.png"
        im.save(OUT / filename)
        entries.append(dict(criterion=criterion, image=filename, source=source,
                            ranges=ranges, sha256=digest, width=width, height=height,
                            caption=explanation))
    (OUT / "manifest.json").write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    text = REPORT.read_text(encoding="utf-8")
    text = re.sub(r"\n<!-- SOURCE-IMAGES-\d+ -->.*?<!-- /SOURCE-IMAGES-\d+ -->\n", "\n", text, flags=re.S)
    parts = re.split(r"(?=^## [1-8]\. )", text, flags=re.M)
    for idx in range(1, len(parts)):
        criterion = int(re.match(r"## (\d+)", parts[idx]).group(1))
        block = [f"\n<!-- SOURCE-IMAGES-{criterion} -->", "### Ảnh trích source chính xác", ""]
        for entry in entries:
            if entry["criterion"] != criterion:
                continue
            span = ", ".join(f"{a}–{b}" for a, b in entry["ranges"])
            block.extend([f"![{entry['caption']}](evidence/source-code/{entry['image']})", "",
                          f"*{entry['caption']}. Nguồn: `{entry['source']}`, dòng {span}.*", ""])
        block.extend([f"<!-- /SOURCE-IMAGES-{criterion} -->", ""])
        parts[idx] = parts[idx].replace("### Kết quả", "\n".join(block) + "\n### Kết quả", 1)
    text = "".join(parts)
    note = ("\nẢnh mã nguồn bên dưới được dựng trực tiếp từ file local, giữ nguyên nội dung và số dòng; "
            "không phải ảnh chụp trình soạn thảo hay kết quả chạy. Khoảng bỏ qua giữa các trích đoạn được đánh dấu rõ. "
            "Tên file, khoảng dòng và SHA-256 nằm trong ảnh và [manifest ảnh](evidence/source-code/manifest.json). "
            "Có thể tạo lại bằng `scripts/render-report-code.py` (cần Python và Pillow). Ảnh phản ánh source tại lúc tạo.\n")
    if "Ảnh mã nguồn bên dưới được dựng" not in text:
        text = text.replace("## Quy ước về bằng chứng", note + "\n## Quy ước về bằng chứng", 1)
    REPORT.write_text(text, encoding="utf-8")
    print(f"Created {len(entries)} PNG images; embedded images for all 8 criteria.")


if __name__ == "__main__":
    main()
