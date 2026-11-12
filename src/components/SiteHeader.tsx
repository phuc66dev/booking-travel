import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { trapDialogFocus } from "../shared/lib/dialog-focus.ts";
import { z } from "zod";

const headerSearchSchema = z.object({ q: z.string().trim() });
type HeaderSearchData = z.infer<typeof headerSearchSchema>;
interface Props {
  path: string;
  go: (url: string) => void;
}
export function SiteHeader({ path, go }: Props) {
  const drawer = useRef<HTMLDialogElement>(null);
  const search = useRef<HTMLDialogElement>(null);
  const searchForm = useForm<HeaderSearchData>({
    resolver: zodResolver(headerSearchSchema),
    defaultValues: { q: "" },
  });
  const link = (url: string, text: React.ReactNode, cls = "") => (
    <a
      className={cls}
      href={url}
      onClick={(e) => {
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          drawer.current?.close();
          search.current?.close();
          go(url);
        }
      }}
    >
      {text}
    </a>
  );
  return (
    <>
      <div className="utility">
        <div className="container">
          <span>☀ Chậm một nhịp, thương miền Tây hơn.</span>
          <div>
            {link("/tours", "⌕ Tìm hành trình")}
            {link("/booking/lookup", "Tra cứu đặt tour")}
            <span className="demo">Bản demo</span>
          </div>
        </div>
      </div>
      <header>
        <div className="container nav">
          {link(
            "/",
            <>
              <span className="brand-icon">
                ☀<i>≈</i>
              </span>
              <span>
                mekong<small>J O U R N E Y S</small>
              </span>
            </>,
            "brand",
          )}
          <nav aria-label="Điều hướng chính">
            {link("/", "Trang chủ", path === "/" ? "active" : "")}
            {link(
              "/tours",
              "Khám phá tour",
              path.startsWith("/tours") ? "active" : "",
            )}
            {link(
              "/policies",
              "Chính sách",
              path === "/policies" ? "active" : "",
            )}
          </nav>
          {link("/tours", "Tìm chuyến đi của bạn ↗", "nav-cta")}
          <div className="mobile-header-actions">
            <button
              className="menu-btn"
              aria-label="Mở tìm kiếm"
              onClick={() => search.current?.showModal()}
            >
              ⌕
            </button>
            <button
              className="menu-btn"
              aria-label="Mở menu"
              onClick={() => drawer.current?.showModal()}
            >
              ☰
            </button>
          </div>
        </div>
      </header>
      <dialog
        ref={drawer}
        className="nav-drawer"
        aria-label="Menu điều hướng"
        onKeyDown={trapDialogFocus}
      >
        <button
          className="dialog-close"
          aria-label="Đóng menu"
          onClick={() => drawer.current?.close()}
        >
          ✕
        </button>
        <p className="eyebrow">ĐI CÙNG MEKONG</p>
        <nav>
          {link("/", "Trang chủ")}
          {link("/tours", "Khám phá tour")}
          {link("/policies", "Chính sách")}
          {link("/booking/lookup", "Tra cứu đặt tour")}
        </nav>
      </dialog>
      <dialog
        ref={search}
        className="search-dialog"
        aria-label="Tìm kiếm hành trình"
        onKeyDown={trapDialogFocus}
      >
        <button
          className="dialog-close"
          aria-label="Đóng tìm kiếm"
          onClick={() => search.current?.close()}
        >
          ✕
        </button>
        <h2>Bạn muốn đi đâu?</h2>
        <form
          onSubmit={(event) => {
            void searchForm.handleSubmit((data) => {
              search.current?.close();
              go("/tours?q=" + encodeURIComponent(data.q));
            })(event);
          }}
        >
          <label>
            Điểm đến
            <input
              {...searchForm.register("q")}
              placeholder="Bến Tre, Cần Thơ…"
              autoFocus
            />
          </label>
          <button className="cta full">Tìm hành trình →</button>
        </form>
      </dialog>
    </>
  );
}
