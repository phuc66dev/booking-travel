import { useRef } from "react";
import { trapDialogFocus } from "../shared/lib/dialog-focus.ts";
interface Props {
  path: string;
  go: (url: string) => void;
}
export function SiteHeader({ path, go }: Props) {
  const drawer = useRef<HTMLDialogElement>(null);
  const search = useRef<HTMLDialogElement>(null);
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
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            search.current?.close();
            go("/tours?q=" + encodeURIComponent(String(data.get("q") || "")));
          }}
        >
          <label>
            Điểm đến
            <input name="q" placeholder="Bến Tre, Cần Thơ…" autoFocus />
          </label>
          <button className="cta full">Tìm hành trình →</button>
        </form>
      </dialog>
    </>
  );
}
