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

function ErrorTestContent({
  shouldThrow,
  onTrigger,
}: {
  shouldThrow: boolean;
  onTrigger: () => void;
}) {
  if (shouldThrow) {
    throw new Error("Lỗi kiểm thử được tạo có chủ đích.");
  }
  return (
    <button className="outline" type="button" onClick={onTrigger}>
      Gây lỗi kiểm thử
    </button>
  );
}

function DelayedContent({ result }: { result: Promise<string> }) {
  return <p role="status">{use(result)}</p>;
}

function UiTestPanel({
  onTriggerPageError,
}: {
  onTriggerPageError: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [triggerError, setTriggerError] = useState(false);
  const [hasErrorBoundary, setHasErrorBoundary] = useState(true);
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);
  const [delayedResult, setDelayedResult] = useState<Promise<string> | null>(
    null,
  );
  const [hasLocalSuspense, setHasLocalSuspense] = useState(true);

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
    setErrorBoundaryKey((key) => key + 1);
  }

  const errorTest = hasErrorBoundary ? (
    <ErrorTestContent
      shouldThrow={triggerError}
      onTrigger={() => setTriggerError(true)}
    />
  ) : (
    <button
      className="outline"
      type="button"
      onClick={onTriggerPageError}
    >
      Gây lỗi kiểm thử
    </button>
  );
  const errorTestWithOptionalBoundary = hasErrorBoundary ? (
    <PageBoundary
      key={`local-${errorBoundaryKey}`}
      fallback={
        <div className="ui-test-error" role="alert">
          <strong>Lỗi đã được boundary cục bộ chặn</strong>
          <p>Trang và các vùng còn lại vẫn hoạt động.</p>
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
      {errorTest}
    </PageBoundary>
  ) : (
    errorTest
  );

  const suspenseTest = delayedResult ? (
    <DelayedContent result={delayedResult} />
  ) : (
    <button
      className="outline"
      type="button"
      onClick={simulateDelay}
    >
      Mô phỏng tải chậm
    </button>
  );
  const suspenseTestWithOptionalBoundary = hasLocalSuspense ? (
    <Suspense
      fallback={
        <div className="ui-test-loading" role="status" aria-busy="true">
          Đang tải trong Suspense cục bộ…
        </div>
      }
    >
      {suspenseTest}
    </Suspense>
  ) : (
    suspenseTest
  );

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
              So sánh boundary cục bộ với boundary bao ngoài của trang.
            </p>
            <button
              className="outline ui-test-mode"
              type="button"
              aria-pressed={hasErrorBoundary}
              onClick={() => {
                resetErrorTest();
                setHasErrorBoundary((value) => !value);
              }}
            >
              Boundary cục bộ: {hasErrorBoundary ? "Có" : "Không"}
            </button>
            {errorTestWithOptionalBoundary}
          </section>
          <section>
            <h3>Suspense</h3>
            <p>
              So sánh fallback cục bộ với fallback bao ngoài khi nội dung chờ
              1,8 giây.
            </p>
            <button
              className="outline ui-test-mode"
              type="button"
              aria-pressed={hasLocalSuspense}
              onClick={() => {
                setDelayedResult(null);
                setHasLocalSuspense((value) => !value);
              }}
            >
              Suspense cục bộ: {hasLocalSuspense ? "Có" : "Không"}
            </button>
            <Suspense
              fallback={
                <div className="ui-test-loading" role="status" aria-busy="true">
                  Đang tải ở Suspense bao ngoài (không có Suspense cục bộ)…
                  <button
                    className="outline"
                    type="button"
                    onClick={() => setDelayedResult(null)}
                  >
                    Đặt lại phép thử tải chậm
                  </button>
                </div>
              }
            >
              {suspenseTestWithOptionalBoundary}
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
  const [pageTestError, setPageTestError] = useState(false);
  const [pageBoundaryKey, setPageBoundaryKey] = useState(0);
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
  const pageContent = pageTestError ? (
    <SimulatedPageError />
  ) : (
    page
  );
  return (
    <>
      <SiteHeader path={pathname} go={go} />
      <PageBoundary
        key={`${pathname}-${pageBoundaryKey}`}
        fallback={
          pageTestError ? (
            <main className="container empty ui-test-page-fallback" role="alert">
              <h1>Boundary của trang đã bắt lỗi</h1>
              <p>
                Không có boundary cục bộ nên toàn bộ nội dung trang đã được
                thay bằng giao diện dự phòng. Header, footer và bảng kiểm thử
                vẫn hoạt động.
              </p>
              <button
                className="cta"
                type="button"
                onClick={() => {
                  setPageTestError(false);
                  setPageBoundaryKey((key) => key + 1);
                }}
              >
                Khôi phục trang
              </button>
            </main>
          ) : undefined
        }
      >
        <Suspense fallback={<AsyncState />}>{pageContent}</Suspense>
      </PageBoundary>
      <SiteFooter />
      {import.meta.env.DEV && (
        <UiTestPanel onTriggerPageError={() => setPageTestError(true)} />
      )}
    </>
  );
}

function SimulatedPageError(): never {
  throw new Error("Lỗi kiểm thử được tạo có chủ đích.");
}
