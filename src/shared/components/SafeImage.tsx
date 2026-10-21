import type { ImgHTMLAttributes } from "react";

export function SafeImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      key={props.src}
      {...props}
      onError={(event) => {
        // Stop retrying if the fallback itself is unavailable.
        if (event.currentTarget.dataset.fallback) return;
        event.currentTarget.dataset.fallback = "true";
        event.currentTarget.src = "/image-placeholder.svg";
        event.currentTarget.alt = "Ảnh minh họa đang cập nhật";
      }}
    />
  );
}
