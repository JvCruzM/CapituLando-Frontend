export const runtime = "nodejs";
const respond = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(
  request: Request,
  context: { params: Promise<{ action: string }> },
) {
  const { action } = await context.params;
  if (!["verify-email", "reset-password"].includes(action))
    return respond({ message: "Operação não encontrada." }, 404);
  const configured = process.env.MOBILE_API_BASE_URL;
  if (!configured)
    return respond(
      {
        message:
          "A confirmação pelo aplicativo ainda não está configurada. Tente novamente mais tarde.",
      },
      503,
    );
  let url: URL;
  try {
    const base = new URL(configured);
    if (
      !["http:", "https:"].includes(base.protocol) ||
      base.username ||
      base.password
    )
      throw new Error();
    url = new URL("/api/auth/" + action, base);
  } catch {
    return respond(
      { message: "O serviço do aplicativo está indisponível." },
      503,
    );
  }
  let payload: { token: string; newPassword?: string };
  try {
    const text = await request.text();
    if (text.length > 4096)
      return respond(
        { message: "A solicitação excede o tamanho permitido." },
        413,
      );
    const data = JSON.parse(text);
    if (
      typeof data?.token !== "string" ||
      data.token.length < 20 ||
      data.token.length > 512
    )
      throw new Error();
    payload = { token: data.token };
    if (action === "reset-password") {
      if (
        typeof data.newPassword !== "string" ||
        data.newPassword.length < 6 ||
        new TextEncoder().encode(data.newPassword).length > 72
      )
        return respond(
          {
            message: "Use uma senha de pelo menos 6 caracteres e até 72 bytes.",
          },
          400,
        );
      payload.newPassword = data.newPassword;
    }
  } catch {
    return respond(
      {
        message:
          "O link está incompleto ou os dados são inválidos. Solicite um novo e-mail.",
      },
      400,
    );
  }
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(12000),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
      return respond(
        {
          message:
            data?.error?.message ||
            data?.message ||
            "Não foi possível concluir a operação.",
        },
        response.status,
      );
    if (!data || typeof data !== "object")
      return respond(
        {
          message:
            "O serviço do aplicativo devolveu uma resposta inválida. Tente novamente.",
        },
        503,
      );
    return respond({
      message:
        data?.message ||
        (action === "verify-email"
          ? "E-mail confirmado. Você já pode entrar no aplicativo."
          : "Senha redefinida. Entre no aplicativo com sua nova senha."),
    });
  } catch {
    return respond(
      {
        message:
          "Não foi possível conectar ao serviço do aplicativo. Tente novamente.",
      },
      503,
    );
  }
}
