import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { Contact } from "../types.ts";

export const ContactContext = createContext<{
  contact: Contact;
  setContact: Dispatch<SetStateAction<Contact>>;
  agree: boolean;
  setAgree: Dispatch<SetStateAction<boolean>>;
} | null>(null);

export function useContactSession() {
  const context = useContext(ContactContext);
  if (!context)
    throw new Error("useContactSession cần nằm trong BookingContactProvider");
  return context;
}
