import { z } from "zod";

export const bookingLookupSchema = z.object({
  code: z.string().trim().min(1, "Vui lòng nhập mã yêu cầu."),
  phone: z.string().trim().min(1, "Vui lòng nhập số điện thoại."),
});

export type BookingLookupData = z.infer<typeof bookingLookupSchema>;
