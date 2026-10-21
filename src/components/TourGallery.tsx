import { useEffect, useRef, useState } from "react";
import { photos } from "../data/mock-tours.ts";
import { SafeImage } from "../shared/components/SafeImage.tsx";
import { trapDialogFocus } from "../shared/lib/dialog-focus.ts";
export function TourGallery() {
  const [index, setIndex] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const open = (i: number) => {
    opener.current = document.activeElement as HTMLElement;
    setIndex(i);
  };
  const close = () => {
    setIndex(null);
    requestAnimationFrame(() => opener.current?.focus());
  };
  const move = (i: number) => {
    const next = (i + photos.length) % photos.length;
    track.current?.scrollTo({
      left: next * (track.current?.clientWidth || 0),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    setSlide(next);
  };
  return (
    <>
      <div className="gallery desktop-gallery">
        {photos.map((p, i) => (
          <button
            key={p.src}
            className={"photo photo-" + i}
            onClick={() => open(i)}
            aria-label={"Xem ảnh " + (i + 1)}
          >
            <SafeImage
              src={p.src}
              alt={p.alt}
              fetchPriority={i === 0 ? "high" : "auto"}
            />
            {i === 4 && <span>▦ Xem tất cả ảnh</span>}
          </button>
        ))}
        <span className="gallery-caption">
          Một miền sông nước. Vạn điều thương nhớ.
        </span>
      </div>
      <div className="mobile-carousel">
        <div
          className="carousel-track"
          ref={track}
          onScroll={() =>
            setSlide(
              Math.round(
                (track.current?.scrollLeft || 0) /
                  (track.current?.clientWidth || 1),
              ),
            )
          }
        >
          {photos.map((p, i) => (
            <button
              key={p.src}
              onClick={() => open(i)}
              aria-label={"Mở ảnh " + (i + 1)}
            >
              <SafeImage src={p.src} alt={p.alt} />
            </button>
          ))}
        </div>
        <div className="carousel-controls">
          <button onClick={() => move(slide - 1)} aria-label="Ảnh trước">
            ←
          </button>
          <span>
            {slide + 1} / {photos.length} · Vuốt để xem ảnh
          </span>
          <button onClick={() => move(slide + 1)} aria-label="Ảnh sau">
            →
          </button>
          <button className="view-images" onClick={() => open(slide)}>
            Xem tất cả
          </button>
        </div>
      </div>
      {index !== null && (
        <Lightbox index={index} change={setIndex} close={close} />
      )}
    </>
  );
}
function Lightbox({
  index,
  change,
  close,
}: {
  index: number;
  change: (n: number) => void;
  close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dialog.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="lightbox"
      aria-label="Thư viện ảnh hành trình"
      onCancel={close}
      onKeyDown={(e) => {
        trapDialogFocus(e);
        if (e.key === "ArrowRight") change((index + 1) % photos.length);
        if (e.key === "ArrowLeft")
          change((index + photos.length - 1) % photos.length);
      }}
    >
      <button
        className="close-gallery"
        onClick={close}
        aria-label="Đóng thư viện"
      >
        ✕
      </button>
      <SafeImage src={photos[index].src} alt={photos[index].alt} />
      <div>
        <button onClick={() => change((index + 4) % 5)} aria-label="Ảnh trước">
          ←
        </button>
        <span>{index + 1} / 5</span>
        <button onClick={() => change((index + 1) % 5)} aria-label="Ảnh sau">
          →
        </button>
      </div>
      <p>Ảnh minh họa du lịch Việt Nam · Unsplash</p>
    </dialog>
  );
}
