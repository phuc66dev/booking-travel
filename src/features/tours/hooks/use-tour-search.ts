import { useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { changeTourSearch } from "../domain/search.ts";
import { toursRoute } from "../../../app/routes.tsx";
import type { TourFilterKey } from "../types.ts";

export function useTourSearch() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = toursRoute.useSearch();
  const searchStr = location.searchStr;
  const params = useMemo(() => new URLSearchParams(searchStr), [searchStr]);

  const filter = useCallback(
    (key: TourFilterKey, value: string) => {
      navigate({ href: changeTourSearch(searchStr, key, value) });
    },
    [searchStr, navigate],
  );

  const clear = useCallback(() => {
    navigate({ href: "/tours" });
  }, [navigate]);

  return {
    search: searchStr,
    params,
    queryParams,
    filter,
    clear,
  };
}
