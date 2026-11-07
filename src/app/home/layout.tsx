import type { ReactNode } from "react";
import { WorkspaceProvider } from "@/components/dashboard/WorkspaceProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function HomeLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <AuthGuard>
      <WorkspaceProvider>{children}</WorkspaceProvider>
    </AuthGuard>
  );
}
