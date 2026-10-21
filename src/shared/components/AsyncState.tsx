export function AsyncState({
  error,
  retry,
  message = "Đang chuẩn bị hành trình…",
}: {
  error?: Error | null;
  retry?: () => void;
  message?: string;
}) {
  return (
    <main className="container catalog-loading" aria-busy={!error}>
      {error ? (
        <div className="empty" role="alert">
          <h1>Chưa tải được dữ liệu</h1>
          <p>{error.message}</p>
          {retry && (
            <button className="cta" onClick={retry}>
              Thử lại
            </button>
          )}
        </div>
      ) : (
        <>
          <span role="status">{message}</span>
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-image" />
        </>
      )}
    </main>
  );
}
