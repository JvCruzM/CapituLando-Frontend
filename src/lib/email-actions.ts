import { apiRequest, type ApiMessage } from "./api";
export type EmailAction = "verify-email" | "reset-password";
export function mobileEmailLink(
  source: string | null,
  action: EmailAction,
  token?: string,
) {
  if (source !== "mobile") return null;
  if (!token) return "capitulando://entrar";
  return (
    "capitulando://" +
    (action === "verify-email" ? "confirmar-email" : "redefinir-senha") +
    "?token=" +
    encodeURIComponent(token)
  );
}
export async function completeEmailAction(
  source: string | null,
  action: EmailAction,
  data: { token: string; newPassword?: string },
): Promise<ApiMessage> {
  if (source && source !== "mobile")
    throw new Error(
      "A origem deste link não é reconhecida. Solicite um novo e-mail.",
    );
  if (source !== "mobile")
    return apiRequest<ApiMessage>("/auth/" + action, {
      method: "POST",
      body: JSON.stringify(data),
    });
  let response: Response;
  try {
    response = await fetch("/api/mobile-auth/" + action, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
      credentials: "omit",
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao serviço do aplicativo. Tente novamente.",
    );
  }
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(body?.message || "Não foi possível concluir a operação.");
  return body as ApiMessage;
}
