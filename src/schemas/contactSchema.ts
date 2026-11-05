import { z } from "zod";
import { normalizePhone } from "../features/booking/domain/validation.ts";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Họ tên cần từ 2–100 ký tự.")
    .max(100, "Họ tên cần từ 2–100 ký tự."),

  phone: z
    .string()
    .transform((value) => normalizePhone(value))
    .refine(
      (value) => /^0[35789]\d{8}$/.test(value),
      "Nhập số di động Việt Nam hợp lệ.",
    ),

  email: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Email chưa đúng định dạng.",
    ),

  note: z.string().max(500, "Ghi chú tối đa 500 ký tự."),

  agree: z.boolean().refine((value) => value, {
    message: "Vui lòng đồng ý chính sách demo.",
  }),
});

export type ContactFormData = z.input<typeof contactSchema>;
export type ContactValidatedData = z.output<typeof contactSchema>;
