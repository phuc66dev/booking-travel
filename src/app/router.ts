import { useSyncExternalStore } from "react";

export interface AppLocation {
  pathname: string;
  search: string;
}

export function parseLocation(href: string): AppLocation {
  const url = new URL(href, "http://mekong.local");
  return { pathname: url.pathname, search: url.search };
}

function getHref() {
  return typeof window === "undefined"
    ? "/"
    : `${window.location.pathname}${window.location.search}`;
}

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

export function navigateTo(url: string) {
  window.history.pushState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function replaceTo(url: string) {
  window.history.replaceState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
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
  const href = useSyncExternalStore(subscribe, getHref, () => "/");
  return { ...parseLocation(href), navigate: navigateTo, replace: replaceTo };
}
