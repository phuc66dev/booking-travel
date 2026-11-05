import { Suspense, use, useState } from "react";
import { PageBoundary } from "./PageBoundary.tsx";

function ErrorTestContent({
  shouldThrow,
  onTrigger,
}: {
  shouldThrow: boolean;
  onTrigger: () => void;
}) {
  if (shouldThrow) throw new Error("Lỗi kiểm thử được tạo có chủ đích.");
  return (
    <button className="outline" type="button" onClick={onTrigger}>
      Gây lỗi kiểm thử
    </button>
  );
}

function DelayedContent({ result }: { result: Promise<string> }) {
  return <p role="status">{use(result)}</p>;
}

export function UiTestPanel({
  onTriggerPageError,
}: {
  onTriggerPageError: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [triggerError, setTriggerError] = useState(false);
  const [hasErrorBoundary, setHasErrorBoundary] = useState(true);
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);
  const [delayedResult, setDelayedResult] = useState<Promise<string> | null>(null);
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
    <button className="outline" type="button" onClick={onTriggerPageError}>
      Gây lỗi kiểm thử
    </button>
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
            <p>So sánh boundary cục bộ với boundary bao ngoài của trang.</p>
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
            {hasErrorBoundary ? (
              <PageBoundary
                key={`local-${errorBoundaryKey}`}
                fallback={
                  <div className="ui-test-error" role="alert">
                    <strong>Lỗi đã được boundary cục bộ chặn</strong>
                    <p>Trang và các vùng còn lại vẫn hoạt động.</p>
                    <button className="outline" type="button" onClick={resetErrorTest}>
                      Khôi phục vùng kiểm thử
                    </button>
                  </div>
                }
              >
                {errorTest}
              </PageBoundary>
            ) : (
              errorTest
            )}
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
                  {hasLocalSuspense
                    ? "Đang tải trong Suspense cục bộ…"
                    : "Đang tải ở Suspense bao ngoài (không có Suspense cục bộ)…"}
                  {!hasLocalSuspense && (
                    <button className="outline" type="button" onClick={() => setDelayedResult(null)}>
                      Đặt lại phép thử tải chậm
                    </button>
                  )}
                </div>
              }
            >
              {hasLocalSuspense ? (
                <Suspense
                  fallback={
                    <div className="ui-test-loading" role="status" aria-busy="true">
                      Đang tải trong Suspense cục bộ…
                    </div>
                  }
                >
                  {delayedResult ? (
                    <DelayedContent result={delayedResult} />
                  ) : (
                    <button className="outline" type="button" onClick={simulateDelay}>
                      Mô phỏng tải chậm
                    </button>
                  )}
                </Suspense>
              ) : delayedResult ? (
                <DelayedContent result={delayedResult} />
              ) : (
                <button className="outline" type="button" onClick={simulateDelay}>
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
