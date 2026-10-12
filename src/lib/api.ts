const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
).replace(/\/+$/, "");

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

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  if (typeof window !== "undefined") {
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
    throw new Error(message);
  }

  return responseBody as T;
}
