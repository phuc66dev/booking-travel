import { useMemo, useState, type ReactNode } from "react";
import { ContactContext } from "../hooks/contact-context.ts";
import type { Contact } from "../types.ts";

export function BookingContactProvider({ children }: { children: ReactNode }) {
  const [contact, setContact] = useState<Contact>({
    name: "",
    phone: "",
    email: "",
    note: "",
  });
  const [agree, setAgree] = useState(false);
  const value = useMemo(
    () => ({ contact, setContact, agree, setAgree }),
    [contact, agree],
  );
  return <ContactContext value={value}>{children}</ContactContext>;
}
