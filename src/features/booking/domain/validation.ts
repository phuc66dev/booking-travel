import type { Contact } from "../types.ts";

export const normalizePhone = (value: string) =>
  value.replace(/[\s().-]/g, "").replace(/^\+84/, "0");

export function contactErrors(contact: Contact, agree: boolean) {
  return {
    name:
      contact.name.trim().length < 2 || contact.name.trim().length > 100
        ? "Họ tên cần từ 2–100 ký tự."
        : "",
    phone: !/^0[35789]\d{8}$/.test(normalizePhone(contact.phone))
      ? "Nhập số di động Việt Nam hợp lệ."
      : "",
    email:
      contact.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())
        ? "Email chưa đúng định dạng."
        : "",
    note: contact.note.length > 500 ? "Ghi chú tối đa 500 ký tự." : "",
    agree: !agree ? "Vui lòng đồng ý chính sách demo." : "",
  };
}
