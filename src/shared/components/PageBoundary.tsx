import { Component, type ReactNode } from "react";

export class PageBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <main className="container empty" role="alert">
        <h1>Trang chưa tải được</h1>
        <p>Vui lòng tải lại để lấy phiên bản ứng dụng mới nhất.</p>
        <button className="cta" onClick={() => location.reload()}>
          Tải lại trang
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
