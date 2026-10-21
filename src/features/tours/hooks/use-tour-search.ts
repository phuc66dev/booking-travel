import { useMemo, useCallback } from "react";
import { useAppRouter } from "../../../app/router.ts";
import { parseTourSearch, changeTourSearch } from "../domain/search.ts";

export function useTourSearch() {
  const { search, navigate } = useAppRouter();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const queryParams = useMemo(() => parseTourSearch(search), [search]);
  const filter = useCallback(
    (key: string, value: string) =>
      navigate(changeTourSearch(search, key, value)),
    [search, navigate],
  );
  const clear = useCallback(() => navigate("/tours"), [navigate]);
  return { search, params, queryParams, filter, clear };
}
