import type { ReactNode } from "react";
import { AppLink } from "../components/AppLink.tsx";
export const renderLink = (url: string, label: ReactNode, className = "") => (
  <AppLink href={url} className={className}>
    {label}
  </AppLink>
);
