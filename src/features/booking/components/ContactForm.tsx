import type { Contact } from "../types.ts";
import { profileView } from "../../../shared/lib/diagnostics.tsx";

type ContactField = keyof Contact;

interface ContactFormProps {
  contact: Contact;
  errors: Record<string, string>;
  onChange: (field: ContactField, value: string) => void;
  onBlur: (field: ContactField) => void;
}

const fields: { name: ContactField; label: string; type: string }[] = [
  { name: "name", label: "Họ và tên *", type: "text" },
  { name: "phone", label: "Số điện thoại *", type: "tel" },
  { name: "email", label: "Email (không bắt buộc)", type: "email" },
  { name: "note", label: "Ghi chú (không bắt buộc)", type: "text" },
];

export function ContactForm({
  contact,
  errors,
  onChange,
  onBlur,
}: ContactFormProps) {
  return profileView(
    "ContactForm",
    <section className="form-card">
      <h2>Thông tin người đặt</h2>
      <p>Thông tin liên hệ chỉ giữ trong bộ nhớ phiên đang mở.</p>
      {fields.map(({ name, label, type }) => (
        <label key={name}>
          {label}
          {name === "note" ? (
            <textarea
              id={name}
              maxLength={500}
              value={contact[name]}
              aria-invalid={!!errors[name]}
              aria-describedby={`${name}-error`}
              onBlur={() => onBlur(name)}
              onChange={(event) => onChange(name, event.target.value)}
            />
          ) : (
            <input
              id={name}
              type={type}
              value={contact[name]}
              aria-invalid={!!errors[name]}
              aria-describedby={`${name}-error`}
              onBlur={() => onBlur(name)}
              onChange={(event) => onChange(name, event.target.value)}
            />
          )}
          <span className="field-error" id={`${name}-error`}>
            {errors[name]}
          </span>
        </label>
      ))}
    </section>,
  );
}
