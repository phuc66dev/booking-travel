import { createContext, useContext } from "react";
import type { Draft } from "../types.ts";

export interface DraftContextValue {
  draft: Draft;
  notice: string;
  update: (patch: Partial<Draft>) => void;
  selectTour: (tourId: string) => void;
  clearNotice: () => void;
}

export const DraftContext = createContext<DraftContextValue | null>(null);

export function useBookingDraft() {
  const context = useContext(DraftContext);
  if (!context)
    throw new Error("useBookingDraft cần nằm trong BookingDraftProvider");
  return context;
}
