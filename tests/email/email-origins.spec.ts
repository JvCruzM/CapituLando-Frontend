import { test, expect } from "@playwright/test";
const token = "email-fixture-token-1234567890";
test.beforeEach(async ({ request }) => {
  await request.get("http://127.0.0.1:4327/_test/reset");
});
test("link mobile confirma pela API Express sem usar Spring e orienta voltar manualmente ao Expo Go", async ({
  page,
  request,
}) => {
  let springCalls = 0;
  await page.route("http://127.0.0.1:4328/**", (route) => {
    springCalls++;
    return route.abort();
  });
  await page.goto("/confirmar-email?source=mobile&token=" + token);
  await expect(
    page.locator('a[href^="capitulando:"],a[href^="exp:"],a[href^="exps:"]'),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Abrir no aplicativo" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Confirmar e-mail", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "E-mail confirmado no aplicativo.",
  );
  const calls = await (
    await request.get("http://127.0.0.1:4327/_test/calls")
  ).json();
  expect(calls).toEqual([
    {
      path: "/api/auth/verify-email",
      body: { token },
      authorization: null,
      cookie: null,
    },
  ]);
  expect(springCalls).toBe(0);
  await expect(
    page.getByText(
      "Você já pode fechar esta aba e voltar ao Expo Go para entrar na sua conta.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Voltar ao aplicativo" }),
  ).toHaveCount(0);
  await page.reload();
  await page
    .getByRole("button", { name: "Confirmar e-mail", exact: true })
    .click();
  await expect(page.locator('main [role="alert"]')).toContainText(
    "expirou ou já foi utilizado",
  );
  expect(springCalls).toBe(0);
});
test("redefinição mobile usa Express e informa reutilização do token", async ({
  page,
  request,
}) => {
  await page.goto("/redefinir-senha?source=mobile&token=" + token);
  await expect(
    page.locator('a[href^="capitulando:"],a[href^="exp:"],a[href^="exps:"]'),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Abrir no aplicativo" }),
  ).toHaveCount(0);
  await page.getByLabel("Nova senha", { exact: true }).fill("SenhaTeste123!");
  await page.getByLabel("Confirmar nova senha").fill("SenhaTeste123!");
  await page
    .getByRole("button", { name: "Redefinir senha", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "Senha redefinida no aplicativo.",
  );
  await expect(
    page.getByText(
      "Você já pode fechar esta aba e voltar ao Expo Go para entrar com a nova senha.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Voltar ao aplicativo" }),
  ).toHaveCount(0);
  const calls = await (
    await request.get("http://127.0.0.1:4327/_test/calls")
  ).json();
  expect(calls[0].body).toEqual({ token, newPassword: "SenhaTeste123!" });
  await page.reload();
  await page.getByLabel("Nova senha", { exact: true }).fill("OutraSenha123!");
  await page.getByLabel("Confirmar nova senha").fill("OutraSenha123!");
  await page
    .getByRole("button", { name: "Redefinir senha", exact: true })
    .click();
  await expect(page.locator('main [role="alert"]')).toContainText(
    "expirou ou já foi utilizado",
  );
});
for (const action of ["verify-email", "reset-password"])
  test(
    "link web continua na API Spring: " + action,
    async ({ page, request }) => {
      let received: unknown;
      await page.route(
        "http://127.0.0.1:4328/auth/" + action,
        async (route) => {
          received = route.request().postDataJSON();
          await route.fulfill({
            json: { message: "Concluído no web" },
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "*",
            },
          });
        },
      );
      await page.goto(
        (action === "verify-email" ? "/confirmar-email" : "/redefinir-senha") +
          "?token=" +
          token,
      );
      if (action === "reset-password") {
        await page
          .getByLabel("Nova senha", { exact: true })
          .fill("SenhaTeste123!");
        await page.getByLabel("Confirmar nova senha").fill("SenhaTeste123!");
      }
      await page
        .getByRole("button", {
          name:
            action === "verify-email" ? "Confirmar e-mail" : "Redefinir senha",
          exact: true,
        })
        .click();
      await expect(page.getByRole("status")).toHaveText("Concluído no web");
      expect(received).toEqual(
        action === "verify-email"
          ? { token }
          : { token, newPassword: "SenhaTeste123!" },
      );
      expect(
        await (await request.get("http://127.0.0.1:4327/_test/calls")).json(),
      ).toEqual([]);
      await expect(
        page.getByRole("link", { name: "Abrir no aplicativo" }),
      ).toHaveCount(0);
    },
  );
test("origem inválida não tenta nenhuma API", async ({ page, request }) => {
  await page.goto("/confirmar-email?source=desconhecida&token=" + token);
  await page
    .getByRole("button", { name: "Confirmar e-mail", exact: true })
    .click();
  await expect(page.locator('main [role="alert"]')).toContainText(
    "origem deste link não é reconhecida",
  );
  expect(
    await (await request.get("http://127.0.0.1:4327/_test/calls")).json(),
  ).toEqual([]);
});
test("encaminhamento permite somente confirmação e redefinição, valida entrada e não encaminha credenciais", async ({
  request,
}) => {
  expect(
    (
      await request.post("/api/mobile-auth/register", { data: { token } })
    ).status(),
  ).toBe(404);
  expect(
    (
      await request.post("/api/mobile-auth/verify-email", {
        data: { token: "curto" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/mobile-auth/reset-password", {
        data: { token, newPassword: "curta" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/mobile-auth/verify-email", {
        data: { token, extra: "x".repeat(5000) },
      })
    ).status(),
  ).toBe(413);
  expect(
    (
      await request.post("/api/mobile-auth/verify-email", {
        data: { token, apiURL: "https://invalid.test" },
        headers: {
          Authorization: "Bearer unrelated",
          Cookie: "unrelated=value",
        },
      })
    ).status(),
  ).toBe(200);
  const calls = await (
    await request.get("http://127.0.0.1:4327/_test/calls")
  ).json();
  expect(calls).toEqual([
    {
      path: "/api/auth/verify-email",
      body: { token },
      authorization: null,
      cookie: null,
    },
  ]);
});

for (const [token, message] of [
  ["service-offline-fixture-123456", "Serviço temporariamente indisponível."],
  ["invalid-response-fixture-123456", "resposta inválida"],
])
  test(
    "falha da API mobile não confirma a conta nem tenta o Spring: " + token,
    async ({ page }) => {
      let springCalls = 0;
      await page.route("http://127.0.0.1:4328/**", (route) => {
        springCalls++;
        return route.abort();
      });
      await page.goto("/confirmar-email?source=mobile&token=" + token);
      await page
        .getByRole("button", { name: "Confirmar e-mail", exact: true })
        .click();
      await expect(page.locator('main [role="alert"]')).toContainText(message);
      await expect(page.locator('main [role="status"]')).toHaveCount(0);
      expect(springCalls).toBe(0);
    },
  );
