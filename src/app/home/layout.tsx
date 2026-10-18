import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function HomeLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <AuthGuard>{children}</AuthGuard>;
}
