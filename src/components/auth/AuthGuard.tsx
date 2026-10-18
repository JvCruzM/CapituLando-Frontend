"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { apiRequest, type AuthenticatedUser } from "@/lib/api";

const AuthenticatedUserContext = createContext<AuthenticatedUser | null>(null);

export function useAuthenticatedUser() {
  return useContext(AuthenticatedUserContext);
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authenticatedUser, setAuthenticatedUser] =
    useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    let active = true;
    const token = window.sessionStorage.getItem("capitulando_access_token");

    if (!token) {
      router.replace("/login");
      return () => {
        active = false;
      };
    }

    apiRequest<AuthenticatedUser>("/auth/me")
      .then((user) => {
        if (active) setAuthenticatedUser(user);
      })
      .catch(() => {
        window.sessionStorage.removeItem("capitulando_access_token");
        window.sessionStorage.removeItem("capitulando_user");
        router.replace("/login");
      });

    return () => {
      active = false;
    };
  }, [router]);

  if (!authenticatedUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F0E8] p-6 text-[#4B2858]">
        Verificando sua sessão...
      </main>
    );
  }

  return (
    <AuthenticatedUserContext.Provider value={authenticatedUser}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
}
