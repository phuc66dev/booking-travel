import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { restoreDraft } from "../api/booking-service.ts";
import { draftForTour, transitionDraft } from "../domain/booking-draft.ts";
import { DraftContext } from "../hooks/draft-context.ts";
import type { Draft } from "../types.ts";

export function BookingDraftProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => ({
    draft: restoreDraft(),
    notice: "",
  }));
  const update = useCallback((patch: Partial<Draft>) => {
    setState((previous) => transitionDraft(previous.draft, patch));
  }, []);
  const selectTour = useCallback((tourId: string) => {
    setState((previous) => {
      const draft = draftForTour(previous.draft, tourId);
      return draft === previous.draft ? previous : { draft, notice: "" };
    });
  }, []);
  const clearNotice = useCallback(
    () => setState((previous) => ({ ...previous, notice: "" })),
    [],
  );
  useEffect(() => {
    sessionStorage.setItem(
      "mj-draft",
      JSON.stringify({ version: 1, savedAt: Date.now(), draft: state.draft }),
    );
  }, [state.draft]);
  const value = useMemo(
    () => ({ ...state, update, selectTour, clearNotice }),
    [state, update, selectTour, clearNotice],
  );
  return <DraftContext value={value}>{children}</DraftContext>;
}
