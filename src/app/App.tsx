import { lazy, Suspense, use, useCallback, useState } from "react";
import { useAppRouter } from "./router.ts";
import { SiteHeader } from "../components/SiteHeader.tsx";
import { SiteFooter } from "../shared/components/SiteFooter.tsx";
import { AsyncState } from "../shared/components/AsyncState.tsx";
import { PageBoundary } from "../shared/components/PageBoundary.tsx";
import { AppLink } from "../shared/components/AppLink.tsx";
import "../style.css";

const HomePage = lazy(() => import("../features/tours/pages/HomePage.tsx"));
const TourListPage = lazy(
  () => import("../features/tours/pages/TourListPage.tsx"),
);
const TourDetailPage = lazy(
  () => import("../features/tours/pages/TourDetailPage.tsx"),
);
const CheckoutPage = lazy(
  () => import("../features/booking/pages/CheckoutPage.tsx"),
);
const BookingLookupPage = lazy(
  () => import("../features/booking/pages/BookingLookupPage.tsx"),
);
const BookingResultPage = lazy(
  () => import("../features/booking/pages/BookingResultPage.tsx"),
);
const PoliciesPage = lazy(() => import("../shared/pages/PoliciesPage.tsx"));

function SimulatedRenderError(): never {
  throw new Error("Lỗi kiểm thử được tạo có chủ đích.");
}

function DelayedContent({ result }: { result: Promise<string> }) {
  return <p role="status">{use(result)}</p>;
}

function UiTestPanel() {
  const [open, setOpen] = useState(false);
  const [triggerError, setTriggerError] = useState(false);
  const [boundaryKey, setBoundaryKey] = useState(0);
  const [delayedResult, setDelayedResult] = useState<Promise<string> | null>(
    null,
  );

  function simulateDelay() {
    setDelayedResult(
      new Promise((resolve) => {
        window.setTimeout(
          () => resolve("Suspense đã tải xong nội dung kiểm thử."),
          1800,
        );
      }),
    );
  }

  function resetErrorTest() {
    setTriggerError(false);
    setBoundaryKey((key) => key + 1);
  }

  return (
    <aside className="ui-test-panel">
      <button
        className="ui-test-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="ui-test-panel-content"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Đóng kiểm thử" : "Kiểm thử UI"}
      </button>
      {open && (
        <div className="ui-test-content" id="ui-test-panel-content">
          <h2>Kiểm thử Error Boundary và Suspense</h2>
          <section>
            <h3>Error Boundary</h3>
            <p>
              Tạo lỗi render trong vùng riêng. Boundary chặn lỗi tại đây; trang
              và điều hướng vẫn dùng được.
            </p>
            <PageBoundary
              key={boundaryKey}
              fallback={
                <div className="ui-test-error" role="alert">
                  <strong>Lỗi đã được boundary chặn</strong>
                  <p>Phần còn lại của ứng dụng vẫn hoạt động.</p>
                  <button
                    className="outline"
                    type="button"
                    onClick={resetErrorTest}
                  >
                    Khôi phục vùng kiểm thử
                  </button>
                </div>
              }
            >
              {triggerError ? (
                <SimulatedRenderError />
              ) : (
                <button
                  className="outline"
                  type="button"
                  onClick={() => setTriggerError(true)}
                >
                  Gây lỗi kiểm thử
                </button>
              )}
            </PageBoundary>
          </section>
          <section>
            <h3>Suspense</h3>
            <p>
              Nội dung demo chờ 1,8 giây; fallback xuất hiện trong lúc chờ.
            </p>
            <Suspense
              fallback={
                <div className="ui-test-loading" role="status" aria-busy="true">
                  Đang tải nội dung kiểm thử…
                </div>
              }
            >
              {delayedResult ? (
                <DelayedContent result={delayedResult} />
              ) : (
                <button
                  className="outline"
                  type="button"
                  onClick={simulateDelay}
                >
                  Mô phỏng tải chậm
                </button>
              )}
            </Suspense>
            {delayedResult && (
              <button
                className="text-link ui-test-reset"
                type="button"
                onClick={() => setDelayedResult(null)}
              >
                Đặt lại kiểm thử tải chậm
              </button>
            )}
          </section>
        </div>
      )}
    </aside>
  );
}

export default function App() {
  const { pathname, navigate } = useAppRouter();
  const go = useCallback(
    (url: string) => {
      navigate(url);
      window.scrollTo(0, 0);
    },
    [navigate],
  );
  const page =
    pathname === "/" ? (
      <HomePage />
    ) : pathname === "/tours" ? (
      <TourListPage />
    ) : pathname.startsWith("/tours/") ? (
      <TourDetailPage slug={pathname.slice("/tours/".length)} />
    ) : pathname === "/booking" ? (
      <CheckoutPage />
    ) : pathname === "/booking/lookup" ? (
      <BookingLookupPage />
    ) : pathname.startsWith("/booking/") ? (
      <BookingResultPage bookingId={pathname.slice("/booking/".length)} />
    ) : pathname === "/policies" ? (
      <PoliciesPage />
    ) : (
      <main className="container empty">
        <h1>Trang này chưa có</h1>
        <AppLink href="/tours" className="cta">
          Khám phá tour
        </AppLink>
      </main>
    );
  return (
    <>
      <SiteHeader path={pathname} go={go} />
      <PageBoundary key={pathname}>
        <Suspense fallback={<AsyncState />}>{page}</Suspense>
      </PageBoundary>
      <SiteFooter />
      {import.meta.env.DEV && <UiTestPanel />}
    </>
  );
}
