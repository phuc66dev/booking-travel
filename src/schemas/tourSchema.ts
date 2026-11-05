import { z } from "zod";

export const tourSearchSchema = z.object({
  q: z.string().trim(),
  date: z.string(),
  duration: z.enum(["", "1", "2"]),
});

export const tourFilterSchema = z.object({
  q: z.string(),
  duration: z.enum(["", "1", "2"]),
  price: z.enum(["", "1500000", "2000000"]),
  date: z.string(),
});

export const voucherSchema = z.object({
  voucher: z.string().trim().max(30, "Mã ưu đãi không hợp lệ."),
});

export type TourSearchData = z.infer<typeof tourSearchSchema>;
export type TourFilterData = z.infer<typeof tourFilterSchema>;
export type VoucherData = z.infer<typeof voucherSchema>;
