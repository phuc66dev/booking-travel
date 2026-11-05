import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { contactSchema, type ContactFormData } from "../../../schemas/contactSchema.ts";
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
  const {
    register,
    formState: { errors: formErrors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      ...contact,
      agree: false,
    },
  });

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
              {...register(name, {
                onChange: (event) => onChange(name, event.target.value),
                onBlur: () => onBlur(name),
              })}
              id={name}
              maxLength={500}
              aria-invalid={!!(errors[name] || formErrors[name])}
              aria-describedby={`${name}-error`}
            />
          ) : (
            <input
              {...register(name, {
                onChange: (event) => onChange(name, event.target.value),
                onBlur: () => onBlur(name),
              })}
              id={name}
              type={type}
              aria-invalid={!!(errors[name] || formErrors[name])}
              aria-describedby={`${name}-error`}
            />
          )}
          <span className="field-error" id={`${name}-error`}>
            {errors[name] || formErrors[name]?.message}
          </span>
        </label>
      ))}
    </section>,
  );
}
