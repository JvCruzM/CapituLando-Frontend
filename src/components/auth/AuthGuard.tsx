"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest, type AuthenticatedUser } from "@/lib/api";
const AuthenticatedUserContext = createContext<AuthenticatedUser | null>(null);
export function useAuthenticatedUser() {
  return useContext(AuthenticatedUserContext);
}
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authenticatedUser, setAuthenticatedUser] =
    useState<AuthenticatedUser | null>(null);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
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
      .catch((reason) => {
        if (!active) return;
        if (!(reason instanceof ApiError) || reason.status !== 401) {
          setError(
            reason instanceof Error ? reason.message : "Falha na conexão.",
          );
          return;
        }
        window.sessionStorage.removeItem("capitulando_access_token");
        window.sessionStorage.removeItem("capitulando_user");
        router.replace("/login");
      });
    return () => {
      active = false;
    };
  }, [router]);
  useEffect(() => {
    const onExpired = () => setExpired(true);
    window.addEventListener("capitulando:session-expired", onExpired);
    return () =>
      window.removeEventListener("capitulando:session-expired", onExpired);
  }, []);
  if (!authenticatedUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F0E8] p-6 text-[#4B2858]">
        {error ? (
          <div role="alert">
            {error}{" "}
            <button onClick={() => window.location.reload()}>
              Tentar novamente
            </button>
          </div>
        ) : (
          "Verificando sua sessão..."
        )}
      </main>
    );
  }
  return (
    <AuthenticatedUserContext.Provider value={authenticatedUser}>
      {expired && (
        <div role="alert" className="bg-amber-100 text-amber-950 p-4">
          Sua sessão expirou. As alterações pendentes ficam na recuperação desta
          conta.
          <button
            className="underline ml-2 font-bold"
            onClick={() => router.push("/login")}
          >
            Entrar novamente
          </button>
        </div>
      )}
      {children}
    </AuthenticatedUserContext.Provider>
  );
}
