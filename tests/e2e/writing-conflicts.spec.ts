import { test, expect, type Page } from "@playwright/test";
const initial = {
  projectId: "book",
  chapterId: "chapter",
  chapterRevision: 0,
  type: "chapter",
  title: "Capítulo",
  content: "<p>Minha recuperação</p>",
};
async function setup(
  page: Page,
  withLocal = true,
  chapterContent = "<p>Capítulo já salvo</p>",
) {
  const user = {
    id: "mock-writer",
    email: "writer@example.test",
    emailVerified: true,
    username: "writer",
    displayName: "Autor",
  };
  const chapter = {
    id: "chapter",
    storyId: "book",
    orderIndex: 1,
    title: "Capítulo",
    content: chapterContent,
    wordCount: 4,
    status: "IN_REVIEW",
    revision: 2,
    updatedAt: "2026-11-24",
  };
  const documents: Record<string, { revision: number; value: unknown }> =
    Object.fromEntries(
      [
        "goals",
        "ideas",
        "concepts",
        "events",
        "profile",
        "settings",
        "writing",
      ].map((section) => [
        section,
        {
          revision: 0,
          value: ["profile", "settings", "writing"].includes(section) ? {} : [],
        },
      ]),
    );
  documents.writing = {
    revision: 4,
    value: {
      ...initial,
      chapterRevision: 1,
      content: "<p>Recuperação remota</p>",
    },
  };
  let writes = 0,
    saves = 0;
  await page.addInitScript(
    ({ initial, withLocal }) => {
      sessionStorage.setItem("capitulando_access_token", "local-test-token");
      if (withLocal)
        localStorage.setItem(
          "capitulando:mock-writer:writing",
          JSON.stringify(initial),
        );
    },
    { initial, withLocal },
  );
  await page.route("http://127.0.0.1:8081/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    let body: unknown = [];
    let status = 200;
    if (request.method() === "OPTIONS") {
      await route.fulfill({
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "*",
        },
      });
      return;
    }
    if (path === "/auth/me") body = user;
    else if (path === "/workspace") body = documents;
    else if (path.startsWith("/workspace/")) {
      const section = path.split("/").at(-1)!;
      if (request.method() === "PUT") {
        writes++;
        const data = request.postDataJSON();
        if (data.revision !== documents[section].revision) {
          status = 409;
          body = { message: "Dados alterados em outra sessão" };
        } else {
          documents[section] = {
            revision: data.revision + 1,
            value: data.value,
          };
          body = documents[section];
        }
      } else body = documents[section];
    } else if (path === "/stories")
      body = [
        {
          id: "book",
          title: "Livro",
          status: "DRAFT",
          genre: "Fantasia",
          progressPercentage: 0,
        },
      ];
    else if (path === "/stories/book/chapters") body = [chapter];
    else if (path === "/stories/book/chapters/chapter") {
      if (request.method() === "PUT") {
        saves++;
        const data = request.postDataJSON();
        if (data.revision !== chapter.revision) {
          status = 409;
          body = { message: "Capítulo alterado em outra sessão" };
        } else {
          Object.assign(chapter, data, { revision: chapter.revision + 1 });
          body = chapter;
        }
      } else body = chapter;
    }
    await route.fulfill({
      status,
      json: body,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
    });
  });
  await page.goto("/home");
  await page
    .getByRole("button", { name: "Espaço de Escrita", exact: true })
    .click();
  await expect(page.locator("[contenteditable]")).toBeVisible();
  return {
    documents,
    chapter,
    get writes() {
      return writes;
    },
    get saves() {
      return saves;
    },
  };
}
for (const choice of [
  "Manter meu texto",
  "Usar recuperação da outra sessão",
  "Mesclar recuperações",
])
  test(
    "recuperação inicial: " + choice + " resolve sem segundo menu",
    async ({ page }) => {
      const server = await setup(page);
      await expect(
        page.getByRole("heading", {
          name: "Recuperação alterada em outra sessão",
        }),
      ).toBeVisible();
      expect(server.writes).toBe(0);
      await page.getByRole("button", { name: choice, exact: true }).click();
      await expect(
        page.getByRole("heading", {
          name: "Recuperação alterada em outra sessão",
        }),
      ).toHaveCount(0);
      await page
        .getByRole("button", { name: "Atualizar", exact: true })
        .click();
      await expect.poll(() => server.saves).toBe(1);
      await expect(
        page.getByRole("button", { name: "Carregar versão atual do capítulo" }),
      ).toHaveCount(0);
      expect(server.chapter.revision).toBe(3);
      if (choice !== "Usar recuperação da outra sessão")
        expect(server.chapter.content).toContain("Minha recuperação");
      if (choice !== "Manter meu texto")
        expect(server.chapter.content).toContain("Recuperação remota");
    },
  );
test("conflito durante a digitação pausa as tentativas automáticas", async ({
  page,
}) => {
  const server = await setup(page, false);
  server.documents.writing.revision++;
  await page.locator("[contenteditable]").fill("Minha edição nova");
  await expect(
    page.getByRole("heading", { name: "Recuperação alterada em outra sessão" }),
  ).toBeVisible();
  const writes = server.writes;
  await page.locator("[contenteditable]").fill("Minha edição preservada");
  await page.waitForTimeout(600);
  expect(server.writes).toBe(writes);
  await page
    .getByRole("button", { name: "Manter meu texto", exact: true })
    .click();
  await page.getByRole("button", { name: "Atualizar", exact: true }).click();
  await expect.poll(() => server.saves).toBe(1);
  expect(server.chapter.content).toContain("Minha edição preservada");
});

test("recuperação pendente permanece acessível ao navegar para outra seção", async ({
  page,
}) => {
  await setup(page);
  await expect(
    page.getByRole("heading", { name: "Recuperação alterada em outra sessão" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Bloco de Ideias", exact: true })
    .click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Há uma recuperação de escrita pendente" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Espaço de Escrita", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Recuperação alterada em outra sessão" }),
  ).toBeVisible();
});

test("recuperação limpa não abre menu de texto vazio antes do conflito do capítulo", async ({
  page,
}) => {
  const server = await setup(page, false);
  server.documents.writing = {
    revision: server.documents.writing.revision + 1,
    value: {},
  };
  await page.locator("[contenteditable]").fill("Edição sobre capítulo antigo");
  await expect.poll(() => server.writes).toBeGreaterThanOrEqual(2);
  await expect(
    page.getByRole("heading", { name: "Recuperação alterada em outra sessão" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Atualizar", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Carregar versão atual do capítulo",
      exact: true,
    }),
  ).toBeVisible();
});

test("títulos H1 e H2 recebidos do mobile mantêm hierarquia visual e HTML ao salvar no web", async ({
  page,
}) => {
  const html =
    "<h1>Título principal</h1><h2>Subtítulo</h2><p>Texto do capítulo</p>";
  const server = await setup(page, false, html);
  page.on("dialog", (dialog) => dialog.accept());
  await page
    .locator("select")
    .filter({ has: page.locator('option[value="chapter"]') })
    .selectOption("chapter");
  const editor = page.locator("[contenteditable]");
  await expect(editor.locator("h1")).toHaveText("Título principal");
  await expect(editor.locator("h2")).toHaveText("Subtítulo");
  const dimensions = await editor.evaluate((element) => {
    const style = (selector: string) =>
      getComputedStyle(element.querySelector(selector)!);
    return {
      h1: parseFloat(style("h1").fontSize),
      h2: parseFloat(style("h2").fontSize),
      body: parseFloat(style("p").fontSize),
      weight: style("h1").fontWeight,
    };
  });
  expect(dimensions.h1).toBeGreaterThan(dimensions.h2);
  expect(dimensions.h2).toBeGreaterThan(dimensions.body);
  expect(Number(dimensions.weight)).toBeGreaterThanOrEqual(700);
  await page.getByRole("button", { name: "Atualizar", exact: true }).click();
  await expect.poll(() => server.saves).toBe(1);
  expect(server.chapter.content).toBe(html);
});

test("listas têm marcadores e repetir H1/H2 mantém títulos dentro dos itens sem aninhamento", async ({
  page,
}) => {
  const server = await setup(page, false);
  page.on("dialog", (dialog) => dialog.accept());
  await page
    .locator("select")
    .filter({ has: page.locator('option[value="chapter"]') })
    .selectOption("chapter");
  const editor = page.locator("[contenteditable]");
  await editor.fill("Primeiro");
  await editor.press("End");
  await editor.press("Enter");
  await page.keyboard.insertText("Segundo");
  await editor.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
  });
  await page.getByRole("button", { name: "Lista", exact: true }).click();
  await expect(editor.locator("li")).toHaveCount(2);
  await expect(editor.locator("ul")).toHaveCSS("list-style-type", "disc");
  await expect(editor.locator("li").first()).toHaveCSS("display", "list-item");
  await editor
    .locator("li")
    .first()
    .evaluate((item) => {
      const range = document.createRange();
      range.selectNodeContents(item.querySelector("p") || item);
      const selection = getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);
    });
  for (let i = 0; i < 12; i++)
    await page.getByRole("button", { name: "Título H1", exact: true }).click();
  await expect(editor.locator("li > h1")).toHaveCount(1);
  await expect(
    editor.locator("h1 h1,h1 h2,h2 h1,h2 h2,h1 ul,h2 ul"),
  ).toHaveCount(0);
  for (let i = 0; i < 12; i++)
    await page.getByRole("button", { name: "Título H2", exact: true }).click();
  await expect(editor.locator("li > h2")).toHaveCount(1);
  await expect(
    editor.locator("h1 h1,h1 h2,h2 h1,h2 h2,h1 ul,h2 ul"),
  ).toHaveCount(0);
  await expect(editor.locator("li")).toHaveCount(2);
  await expect(editor).toContainText("Primeiro");
  await expect(editor).toContainText("Segundo");
  const ratio = await editor.evaluate(
    (element) =>
      parseFloat(getComputedStyle(element.querySelector("h2")!).fontSize) /
      parseFloat(getComputedStyle(element).fontSize),
  );
  expect(ratio).toBeCloseTo(1.5);
  await page.getByRole("button", { name: "Atualizar", exact: true }).click();
  await expect.poll(() => server.saves).toBe(1);
  expect(server.chapter.content).toContain("<li><h2>Primeiro</h2></li>");
  expect(server.chapter.content).toContain("Segundo");
});
