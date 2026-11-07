const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
).replace(/\/+$/, "");
const PUBLIC_AUTH_PATHS = new Set([
  "/auth/register",
  "/auth/verify-email",
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
]);
export interface ApiMessage {
  message: string;
}
export interface AuthenticatedUser {
  id: string;
  email: string;
  emailVerified: boolean;
  username: string;
  displayName: string;
}
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: AuthenticatedUser;
}
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");
  const requestPath = path.split("?", 1)[0];
  const isPublicAuthRequest = PUBLIC_AUTH_PATHS.has(requestPath);
  if (typeof window !== "undefined" && !isPublicAuthRequest) {
    const token = window.sessionStorage.getItem("capitulando_access_token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new Error(
      "Não foi possível conectar à API. Confira se o backend está em execução.",
    );
  }
  const responseText = await response.text();
  let responseBody: unknown = null;
  if (responseText) {
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = null;
    }
  }
  if (!response.ok) {
    const message =
      typeof responseBody === "object" &&
      responseBody !== null &&
      "message" in responseBody
        ? String((responseBody as { message: unknown }).message)
        : `A solicitação falhou (${response.status}).`;
    if (
      response.status === 401 &&
      !isPublicAuthRequest &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(new Event("capitulando:session-expired"));
    }
    throw new ApiError(
      response.status === 401 && !isPublicAuthRequest
        ? "Sua sessão expirou. Entre novamente; sua cópia de recuperação foi preservada."
        : message,
      response.status,
    );
  }
  if (
    typeof window !== "undefined" &&
    options.method &&
    !["GET", "HEAD"].includes(options.method) &&
    !path.startsWith("/workspace") &&
    !path.startsWith("/auth")
  )
    window.dispatchEvent(new Event("capitulando:data-changed"));
  return responseBody as T;
}
