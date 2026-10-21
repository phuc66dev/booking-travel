import type { AnchorHTMLAttributes } from "react";
import { navigateTo } from "../../app/router.ts";

export function AppLink({
  href = "/",
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (
          !event.defaultPrevented &&
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey &&
          !props.target
        ) {
          event.preventDefault();
          navigateTo(href);
          window.scrollTo(0, 0);
        }
      }}
    />
  );
}
