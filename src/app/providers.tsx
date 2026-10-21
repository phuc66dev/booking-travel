import { useEffect, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./query-client";
import { BookingDraftProvider } from "../features/booking/components/BookingDraftProvider.tsx";
import { recordQuery } from "../shared/lib/diagnostics.tsx";
import { BookingContactProvider } from "../features/booking/components/BookingContactProvider.tsx";

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    return queryClient.getQueryCache().subscribe((event) => {
      const { query } = event;
      recordQuery({
        key: query.queryHash,
        event: event.type,
        status: query.state.status,
        fetchStatus: query.state.fetchStatus,
        invalidated: query.state.isInvalidated,
        at: Date.now(),
      });
    });
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <BookingDraftProvider>
        <BookingContactProvider>{children}</BookingContactProvider>
      </BookingDraftProvider>
    </QueryClientProvider>
  );
}
