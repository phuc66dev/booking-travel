import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { bookingKeys } from "./booking-keys.ts";
import { adapter } from "./booking-service.ts";
import type { Booking, Contact, Draft } from "../types.ts";

export interface CreateBookingInput {
  draft: Draft;
  contact: Contact;
  idempotencyKey: string;
  fixture: string;
  acceptedQuoteVersion?: string;
}

export function bookingMutationOptions(
  client: QueryClient,
): UseMutationOptions<Booking, Error, CreateBookingInput> {
  return {
    mutationFn: (input: CreateBookingInput) =>
      adapter.createBooking(
        input.draft,
        input.contact,
        input.idempotencyKey,
        input.fixture,
        input.acceptedQuoteVersion,
      ),
    retry: false,
    onSuccess: async (_booking, input) => {
      await client.invalidateQueries({
        queryKey: bookingKeys.quote(input.draft),
        exact: true,
      });
    },
  };
}

export function useCreateBooking() {
  const client = useQueryClient();
  return useMutation(bookingMutationOptions(client));
}

export function useLookupBooking() {
  return useMutation({
    mutationFn: ({ code, phone }: { code: string; phone: string }) =>
      adapter.lookupBooking(code, phone),
    retry: false,
  });
}
