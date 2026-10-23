import { useLocation, useNavigate } from "@tanstack/react-router";
import { router } from "./routes.tsx";

export interface AppLocation {
  pathname: string;
  search: string;
}

export function parseLocation(href: string): AppLocation {
  const url = new URL(href, "http://mekong.local");
  return { pathname: url.pathname, search: url.search };
}

export function navigateTo(url: string) {
  router.navigate({ href: url });
}

export function replaceTo(url: string) {
  router.navigate({ href: url, replace: true });
}

export function normalizePageSearch(
  search: string,
  page: number,
): string | null {
  const params = new URLSearchParams(search);
  const before = params.toString();
  if (page <= 1) params.delete("page");
  else params.set("page", String(page));
  const after = params.toString();
  return before === after ? null : after;
}

export function useAppRouter() {
  const location = useLocation();
  const navigate = useNavigate();
  return {
    pathname: location.pathname,
    search: location.searchStr,
    navigate: (url: string) => navigate({ href: url }),
    replace: (url: string) => navigate({ href: url, replace: true }),
  };
}
