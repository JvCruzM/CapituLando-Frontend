import {
  test,
  expect,
  type Page,
  type APIRequestContext,
} from "@playwright/test";
import { textContrastIssues } from "../support/contrast";
const api = "http://127.0.0.1:8081";
const password = "Password123!";
async function confirmation(request: APIRequestContext, email: string) {
  let token = "";
  await expect
    .poll(async () => {
      const messages: string[] = await (
        await request.get("http://127.0.0.1:1025")
      ).json();
      const raw =
        messages.filter((message) => message.includes(email)).at(-1) || "";
      const decoded = raw
        .replace(/=\r?\n/g, "")
        .replace(/=([0-9A-F]{2})/g, (_, hex) =>
          String.fromCharCode(parseInt(hex, 16)),
        );
      token = decoded.match(/token=([A-Za-z0-9_-]+)/)?.[1] || "";
      return token;
    })
    .not.toBe("");
  return token;
}
async function account(request: APIRequestContext) {
  const name = `writer-${crypto.randomUUID()}`;
  const email = `${name}@example.com`;
  expect(
    (
      await request.post(`${api}/auth/register`, {
        data: { username: name, email, password },
      })
    ).status(),
  ).toBe(202);
  const token = await confirmation(request, email);
  expect(
    (await request.post(`${api}/auth/verify-email`, { data: { token } })).ok(),
  ).toBeTruthy();
  return email;
}
async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByText("Boas-vindas,", { exact: false })).toBeVisible();
}
test("cadastro, confirmação, escrita, recuperação, metas, preferências e backup", async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const name = `writer-${crypto.randomUUID()}`,
    email = `${name}@example.com`;
  await page.goto("/cadastro");
  await page.getByLabel("Nome de usuário").fill(name);
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByLabel("Confirmar senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Criar conta", exact: true }).click();
  await expect(page.getByText(/Cadastro iniciado/)).toBeVisible();
  const token = await confirmation(request, email);
  await page.goto(`/confirmar-email?token=${token}`);
  await page
    .getByRole("button", { name: "Confirmar e-mail", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("confirmado");
  await login(page, email);
  await page
    .getByRole("button", { name: "Espaço de Escrita", exact: true })
    .click();
  await page.locator("select").first().selectOption("new");
  await page.getByPlaceholder("Ex: Crónicas").fill("Livro de teste");
  await page.getByRole("button", { name: "Criar", exact: true }).click();
  const editor = page.locator("[contenteditable=true]");
  await editor.fill("Texto de recuperação");
  await page
    .getByRole("button", { name: "Metas & Desafios", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Espaço de Escrita", exact: true })
    .click();
  await expect(editor).toContainText("Texto de recuperação");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Atualizado!", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Metas & Desafios", exact: true })
    .click();
  await page.getByRole("button", { name: "Nova Meta", exact: true }).click();
  await page
    .getByPlaceholder("Ex: Escrever o Primeiro Capítulo")
    .fill("Meta persistida");
  await page.getByRole("button", { name: "Salvar Meta", exact: true }).click();
  await expect(
    page.getByText("Dados sincronizados", { exact: true }),
  ).toHaveText("Dados sincronizados");
  await page.reload();
  await page
    .getByRole("button", { name: "Metas & Desafios", exact: true })
    .click();
  await expect(
    page.getByText("Meta persistida", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Configurações", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Tema", exact: true })
    .selectOption("dark");
  await page
    .getByRole("button", { name: "Salvar configurações", exact: true })
    .click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar backup completo" }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const backup = JSON.parse(Buffer.concat(chunks).toString());
  expect(backup.records.Story).toHaveLength(1);
  expect(backup.records.Chapter).toHaveLength(1);
  expect(backup.workspace.goals.value[0].title).toBe("Meta persistida");
  await page.screenshot({
    path: "test-results/workspace-dark.png",
    fullPage: true,
  });
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByLabel("Restaurar backup", { exact: true }).setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await expect(page.getByText("Boas-vindas,", { exact: false })).toBeVisible();
  await page
    .getByRole("button", { name: "Projetos / Livros", exact: true })
    .click();
  await expect(page.getByText("Livro de teste", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Metas & Desafios", exact: true })
    .click();
  await expect(
    page.getByText("Meta persistida", { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("trocar de conta isola dados e não herda armazenamento antigo", async ({
  page,
  request,
}) => {
  const first = await account(request);
  const second = await account(request);
  await login(page, first);
  await page
    .getByRole("button", { name: "Metas & Desafios", exact: true })
    .click();
  await page.getByRole("button", { name: "Nova Meta", exact: true }).click();
  await page
    .getByPlaceholder("Ex: Escrever o Primeiro Capítulo")
    .fill("Segredo da primeira conta");
  await page.getByRole("button", { name: "Salvar Meta", exact: true }).click();
  await expect(
    page.getByText("Dados sincronizados", { exact: true }),
  ).toHaveText("Dados sincronizados");
  await page
    .getByRole("button", { name: "Sair / Trocar de Conta", exact: true })
    .click();
  await login(page, second);
  await page
    .getByRole("button", { name: "Metas & Desafios", exact: true })
    .click();
  await expect(
    page.getByText("Segredo da primeira conta", { exact: true }),
  ).toHaveCount(0);
});

test("ideias, universo, timeline, perfil e relacionamentos persistem após recarregar", async ({
  page,
  request,
}) => {
  const email = await account(request);
  const auth = await (
    await request.post(`${api}/auth/login`, { data: { email, password } })
  ).json();
  const headers = { Authorization: `Bearer ${auth.accessToken}` };
  const story = await (
    await request.post(`${api}/stories`, {
      headers,
      data: { title: "Universo integrado" },
    })
  ).json();
  await login(page, email);
  await page
    .getByRole("button", { name: "Bloco de Ideias", exact: true })
    .click();
  await expect(page.locator("main select").first()).toHaveValue(story.id);
  await page.getByRole("button", { name: "Nova Ideia", exact: true }).click();
  await page
    .getByPlaceholder("Escreva o seu pensamento...")
    .fill("Uma ideia persistida");
  await page
    .getByRole("button", { name: "Guardar Ideia", exact: true })
    .click();
  await expect(
    page.getByText("Dados sincronizados", { exact: true }),
  ).toHaveText("Dados sincronizados");
  await page
    .getByRole("button", { name: "Universo / Mundo", exact: true })
    .click();
  await expect(page.locator("main select").first()).toHaveValue(story.id);
  await page
    .getByRole("button", { name: "Nova anotação", exact: true })
    .click();
  await page.getByLabel("Nome", { exact: true }).fill("Cidade persistida");
  await page.locator("form textarea").fill("A cidade da história");
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(
    page.getByText("Dados sincronizados", { exact: true }),
  ).toHaveText("Dados sincronizados");
  await page
    .getByRole("button", { name: "Timeline / Idade", exact: true })
    .click();
  await expect(page.locator("main select").first()).toHaveValue(story.id);
  await page.getByRole("button", { name: "Novo Evento", exact: true }).click();
  await page
    .getByLabel("Título do Evento", { exact: true })
    .fill("Evento persistido");
  await page
    .getByPlaceholder("Escreva os detalhes do acontecimento...")
    .fill("Detalhes do encontro");
  await page
    .getByRole("button", { name: "Salvar Evento", exact: true })
    .click();
  await expect(
    page.getByText("Dados sincronizados", { exact: true }),
  ).toHaveText("Dados sincronizados");
  await page
    .getByRole("button", { name: "Perfil do Autor", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Editar Perfil", exact: true })
    .click();
  await page
    .getByLabel("Nome Completo / Autor", { exact: true })
    .fill("Autora Persistida");
  await page
    .getByRole("button", { name: "Salvar Perfil", exact: true })
    .click();
  await expect(
    page.getByText("Dados sincronizados", { exact: true }),
  ).toHaveText("Dados sincronizados");
  await page.getByRole("button", { name: "Personagens", exact: true }).click();
  await expect(page.locator("main select").first()).toHaveValue(story.id);
  for (const name of ["Ana", "Bia"]) {
    await page
      .getByRole("button", { name: "Criar Ficha", exact: true })
      .click();
    await page.getByPlaceholder("Nome", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  }
  await page.getByRole("button", { name: /^Relacionamentos/ }).click();
  await page
    .getByRole("button", { name: "Adicionar Relacionamento", exact: true })
    .click();
  await page
    .getByPlaceholder("Tipo de Ligação", { exact: true })
    .fill("Amigas");
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.getByText("Amigas", { exact: true })).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Boas-vindas, Autora Persistida!", { exact: true }),
  ).toBeVisible();
  for (const [section, text] of [
    ["Bloco de Ideias", "Uma ideia persistida"],
    ["Universo / Mundo", "Cidade persistida"],
    ["Timeline / Idade", "Evento persistido"],
    ["Personagens", "Amigas"],
  ]) {
    await page.getByRole("button", { name: section, exact: true }).click();
    if (section === "Personagens")
      await page.getByRole("button", { name: /^Relacionamentos/ }).click();
    await expect(
      page
        .locator("main")
        .getByText(text, { exact: section !== "Bloco de Ideias" }),
    ).toBeVisible();
  }
  const backup = await (await request.get(`${api}/backup`, { headers })).json();
  expect(backup.workspace.ideas.value[0].projectId).toBe(story.id);
  expect(backup.workspace.concepts.value).toHaveLength(1);
  expect(backup.workspace.events.value).toHaveLength(1);
  expect(backup.records.Character).toHaveLength(2);
  expect(backup.records.CharacterRelationship).toHaveLength(1);
});

test("editar capítulo mantém formatação e publicar atualiza o progresso", async ({
  page,
  request,
}) => {
  const email = await account(request);
  const auth = await (
    await request.post(`${api}/auth/login`, { data: { email, password } })
  ).json();
  const headers = { Authorization: `Bearer ${auth.accessToken}` };
  const story = await (
    await request.post(`${api}/stories`, {
      headers,
      data: { title: "Livro formatado" },
    })
  ).json();
  const chapter = await (
    await request.post(`${api}/stories/${story.id}/chapters`, {
      headers,
      data: {
        title: "Formatado",
        content: "<p><b>Texto forte</b></p><p>Outro parágrafo</p>",
        status: "IN_REVIEW",
      },
    })
  ).json();
  await login(page, email);
  await page
    .getByRole("button", { name: "Projetos / Livros", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Ler Formatado", exact: true })
    .click();
  await expect(page.locator("main b")).toHaveText("Texto forte");
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Conteúdo", exact: true }).locator("b"),
  ).toHaveText("Texto forte");
  await page.getByLabel("Título", { exact: true }).fill("Formatado revisto");
  await page
    .getByRole("combobox", { name: "Status do capítulo", exact: true })
    .selectOption("PUBLISHED");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page
      .getByRole("heading", { name: "Formatado revisto", exact: true })
      .last(),
  ).toBeVisible();
  const saved = await (
    await request.get(`${api}/stories/${story.id}/chapters/${chapter.id}`, {
      headers,
    })
  ).json();
  expect(saved.content).toContain("<b>Texto forte</b>");
  expect(saved.status).toBe("PUBLISHED");
  expect(
    (
      await (
        await request.get(`${api}/stories/${story.id}`, { headers })
      ).json()
    ).progressPercentage,
  ).toBe(100);
});

test("conflito entre sessões preserva a recuperação até a escolha do usuário", async ({
  page,
  request,
}) => {
  const email = await account(request);
  const auth = await (
    await request.post(`${api}/auth/login`, { data: { email, password } })
  ).json();
  const headers = { Authorization: `Bearer ${auth.accessToken}` };
  await login(page, email);
  expect(
    (
      await request.put(`${api}/workspace/goals`, {
        headers,
        data: { revision: 0, value: [] },
      })
    ).ok(),
  ).toBeTruthy();
  await page
    .getByRole("button", { name: "Metas & Desafios", exact: true })
    .click();
  await page.getByRole("button", { name: "Nova Meta", exact: true }).click();
  await page
    .getByPlaceholder("Ex: Escrever o Primeiro Capítulo")
    .fill("Alteração em conflito");
  await page.getByRole("button", { name: "Salvar Meta", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "outra sessão" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      (id) =>
        JSON.parse(localStorage.getItem(`capitulando:${id}:outbox`) || "{}")
          .goals.value[0].title,
      auth.user.id,
    ),
  ).toBe("Alteração em conflito");
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Usar dados do servidor", exact: true })
    .click();
  await expect(
    page.getByText("Alteração em conflito", { exact: true }),
  ).toHaveCount(0);
});

test("backup inclui texto ainda não salvo como capítulo", async ({
  page,
  request,
}) => {
  const email = await account(request);
  const auth = await (
    await request.post(`${api}/auth/login`, { data: { email, password } })
  ).json();
  await request.post(`${api}/stories`, {
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    data: { title: "Livro com recuperação" },
  });
  await login(page, email);
  await page
    .getByRole("button", { name: "Espaço de Escrita", exact: true })
    .click();
  await page
    .locator("[contenteditable=true]")
    .fill("Texto que ainda não virou capítulo");
  await page
    .getByRole("button", { name: "Configurações", exact: true })
    .click();
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar backup completo" }).click();
  const stream = await (await event).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const backup = JSON.parse(Buffer.concat(chunks).toString());
  expect(backup.records.Chapter).toHaveLength(0);
  expect(backup.workspace.writing.value.content).toContain(
    "Texto que ainda não virou capítulo",
  );
});

test("login padronizado, contagens independentes e enquadramento dos personagens", async ({
  page,
  request,
}) => {
  const email = await account(request);
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /Reenviar/ })).toHaveCount(0);
  const eye = page.getByRole("button", { name: "Mostrar senha", exact: true });
  await expect(eye.locator("svg")).toHaveCount(1);
  await eye.click();
  await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page
    .getByRole("button", { name: "Ocultar senha", exact: true })
    .click();
  await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute(
    "type",
    "password",
  );
  const auth = await (
    await request.post(`${api}/auth/login`, { data: { email, password } })
  ).json();
  const headers = { Authorization: `Bearer ${auth.accessToken}` };
  const stories = [];
  for (const [title, status] of [
    ["Só capítulos", "IN_REVIEW"],
    ["Só rascunhos", "DRAFT"],
    ["Livro vazio", ""],
  ]) {
    const response = await request.post(`${api}/stories`, {
      headers,
      data: { title },
    });
    expect(response.ok()).toBeTruthy();
    const story = await response.json();
    stories.push(story);
    if (status)
      expect(
        (
          await request.post(`${api}/stories/${story.id}/chapters`, {
            headers,
            data: { title: `Texto ${title}`, content: "Conteúdo", status },
          })
        ).ok(),
      ).toBeTruthy();
  }
  const portraits = [];
  const image =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
  for (const [name, imageFit, imagePosition] of [
    ["Ana retrato", "contain", "top"],
    ["Bia retrato", "cover", "bottom"],
  ]) {
    const response = await request.post(`${api}/characters`, {
      headers,
      data: {
        story: { id: stories[0].id },
        name,
        characterImage: image,
        imageFit,
        imagePosition,
      },
    });
    expect(response.ok()).toBeTruthy();
    portraits.push(await response.json());
  }
  expect(
    (
      await request.post(
        `${api}/stories/${stories[0].id}/character-relationships`,
        {
          headers,
          data: {
            sourceCharacterId: portraits[0].id,
            targetCharacterId: portraits[1].id,
            type: "Amizade",
            description: "Retratos padronizados",
            level: 1,
          },
        },
      )
    ).ok(),
  ).toBeTruthy();
  await login(page, email);
  await expect(page.locator('[role="status"].sr-only')).toHaveClass("sr-only");
  expect(
    await page
      .locator('[role="status"].sr-only')
      .evaluate((el) => el.getBoundingClientRect().height),
  ).toBeLessThanOrEqual(1);
  await page
    .getByRole("button", { name: "Projetos / Livros", exact: true })
    .click();
  for (const [title, chapters, drafts] of [
    ["Só capítulos", 1, 0],
    ["Só rascunhos", 0, 1],
    ["Livro vazio", 0, 0],
  ]) {
    const card = page
      .getByRole("heading", { name: String(title), exact: true })
      .locator("../../..");
    await expect(
      card.getByRole("button", {
        name: `Capítulos (${chapters})`,
        exact: true,
      }),
    ).toBeVisible();
    await card
      .getByRole("button", { name: `Rascunhos (${drafts})`, exact: true })
      .click();
    await expect(
      card.getByRole("button", {
        name: `Capítulos (${chapters})`,
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      card.getByRole("button", { name: `Rascunhos (${drafts})`, exact: true }),
    ).toBeVisible();
  }
  await page.getByRole("button", { name: "Personagens", exact: true }).click();
  await page.locator("main select").first().selectOption(stories[0].id);
  for (const [name, fit, position] of [
    ["Ana retrato", "contain", "50% 0%"],
    ["Bia retrato", "cover", "50% 100%"],
  ]) {
    await expect(page.getByRole("img", { name, exact: true })).toHaveCSS(
      "object-fit",
      fit,
    );
    await expect(page.getByRole("img", { name, exact: true })).toHaveCSS(
      "object-position",
      position,
    );
  }
  await page.getByRole("button", { name: /^Relacionamentos/ }).click();
  for (const [name, fit, position] of [
    ["Ana retrato", "contain", "50% 0%"],
    ["Bia retrato", "cover", "50% 100%"],
  ]) {
    const portrait = page.getByRole("img", { name, exact: true });
    await expect(portrait).toHaveCSS("object-fit", fit);
    await expect(portrait).toHaveCSS("object-position", position);
    await expect(portrait.locator("..")).toHaveCSS("aspect-ratio", "3 / 4");
  }
  await page.screenshot({
    path: "test-results/relationships-standardized.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Configurações", exact: true })
    .click();
  await page.screenshot({
    path: "test-results/settings-light.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page
      .locator("main")
      .evaluate((el) => el.getBoundingClientRect().width),
  ).toBeGreaterThanOrEqual(380);
  await expect(
    page.getByRole("button", { name: "Abrir menu", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Abrir menu", exact: true }).click();
  await page
    .getByRole("button", { name: "Configurações", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Abrir menu", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/settings-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
});

test("resposta atrasada não restaura revisão antiga ao salvar rascunho e trocar para capítulo", async ({
  page,
  request,
}) => {
  const email = await account(request);
  const auth = await (
    await request.post(`${api}/auth/login`, { data: { email, password } })
  ).json();
  const headers = { Authorization: `Bearer ${auth.accessToken}` };
  const story = await (
    await request.post(`${api}/stories`, {
      headers,
      data: { title: "Livro da sincronização" },
    })
  ).json();
  await login(page, email);
  await page
    .getByRole("button", { name: "Espaço de Escrita", exact: true })
    .click();
  await expect(page.locator("main select").first()).toHaveValue(story.id);
  let release!: () => void;
  let captured!: () => void;
  let delivered!: () => void;
  const delivery = new Promise<void>((resolve) => {
    delivered = resolve;
  });
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const ready = new Promise<void>((resolve) => {
    captured = resolve;
  });
  let intercept = true;
  await page.route(`${api}/workspace`, async (route) => {
    if (route.request().method() !== "GET" || !intercept) {
      await route.continue();
      return;
    }
    intercept = false;
    const response = await route.fetch();
    const body = await response.text();
    captured();
    await held;
    await route.fulfill({ response, body });
    delivered();
  });
  const conflicts: string[] = [];
  page.on("response", (response) => {
    if (response.status() === 409) conflicts.push(response.url());
  });
  await page.evaluate(() =>
    window.dispatchEvent(new Event("capitulando:data-changed")),
  );
  await ready;
  await page.getByRole("button", { name: "Rascunho", exact: true }).click();
  await page.locator("[contenteditable=true]").fill("Rascunho sem conflito");
  await expect
    .poll(
      async () =>
        (await (await request.get(`${api}/workspace`, { headers })).json())
          .writing.value.content,
    )
    .toContain("Rascunho sem conflito");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Atualizado!", exact: true }),
  ).toBeVisible();
  await expect
    .poll(
      async () =>
        (await (await request.get(`${api}/workspace`, { headers })).json())
          .writing.value,
    )
    .toEqual({});
  release();
  await delivery;
  await page.unroute(`${api}/workspace`);
  await page.getByRole("button", { name: "Capítulo", exact: true }).click();
  await page.locator("[contenteditable=true]").fill("Capítulo após rascunho");
  await expect
    .poll(
      async () =>
        (await (await request.get(`${api}/workspace`, { headers })).json())
          .writing.value.content,
    )
    .toContain("Capítulo após rascunho");
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: /outra sessão|Não foi possível/ }),
  ).toHaveCount(0);
  expect(conflicts).toEqual([]);
});

test("conflito real permite manter a cópia local e voltar a sincronizar", async ({
  page,
  request,
}) => {
  const email = await account(request);
  const auth = await (
    await request.post(`${api}/auth/login`, { data: { email, password } })
  ).json();
  const headers = { Authorization: `Bearer ${auth.accessToken}` };
  await login(page, email);
  expect(
    (
      await request.put(`${api}/workspace/goals`, {
        headers,
        data: { revision: 0, value: [] },
      })
    ).ok(),
  ).toBeTruthy();
  await page
    .getByRole("button", { name: "Metas & Desafios", exact: true })
    .click();
  await page.getByRole("button", { name: "Nova Meta", exact: true }).click();
  await page
    .getByPlaceholder("Ex: Escrever o Primeiro Capítulo")
    .fill("Minha meta recuperada");
  await page.getByRole("button", { name: "Salvar Meta", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "outra sessão" }),
  ).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Manter minha cópia", exact: true })
    .click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: /outra sessão|Não foi possível/ }),
  ).toHaveCount(0);
  await expect
    .poll(
      async () =>
        (await (await request.get(`${api}/workspace`, { headers })).json())
          .goals.value[0]?.title,
    )
    .toBe("Minha meta recuperada");
  await page.reload();
  await page
    .getByRole("button", { name: "Metas & Desafios", exact: true })
    .click();
  await expect(
    page.getByText("Minha meta recuperada", { exact: true }),
  ).toBeVisible();
});

test("home pública apresenta o produto na raiz e funciona no celular", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Toda história merece",
  );
  await page
    .getByRole("link", { name: "Conhecer o espaço", exact: true })
    .click();
  await expect(page).toHaveURL(/#recursos$/);
  await page
    .getByText("Preciso ter um livro começado?", { exact: true })
    .click();
  await expect(page.getByText(/Você pode começar por uma ideia/)).toBeVisible();
  expect(await textContrastIssues(page)).toEqual([]);
  await page.screenshot({
    path: "test-results/landing-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("combobox", { name: "Tema de aparência", exact: true })
    .selectOption("dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
  expect(await textContrastIssues(page)).toEqual([]);
  await page.screenshot({
    path: "test-results/landing-dark.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "test-results/landing-mobile.png",
    fullPage: true,
  });
  await page
    .getByRole("link", { name: "Começar minha história", exact: true })
    .click();
  await expect(page).toHaveURL(/\/cadastro$/);
  await page.goto("/");
  await page.getByRole("link", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("recuperação antiga e opções de seleção seguem o tema", async ({
  page,
  request,
}) => {
  const email = await account(request);
  const auth = await (
    await request.post(`${api}/auth/login`, { data: { email, password } })
  ).json();
  const headers = { Authorization: `Bearer ${auth.accessToken}` };
  const story = await (
    await request.post(`${api}/stories`, {
      headers,
      data: { title: "História para revisar" },
    })
  ).json();
  expect(
    (
      await request.post(`${api}/characters`, {
        headers,
        data: { story: { id: story.id }, name: "Clara", role: "Protagonista" },
      })
    ).ok(),
  ).toBeTruthy();
  expect(
    (
      await request.post(`${api}/stories/${story.id}/chapters`, {
        headers,
        data: {
          title: "Primeira página",
          content: "Texto de leitura",
          status: "IN_REVIEW",
        },
      })
    ).ok(),
  ).toBeTruthy();
  for (const [section, value] of [
    [
      "goals",
      [
        {
          id: "goal",
          title: "Escrever dez páginas",
          current: 1,
          target: 10,
          unit: "páginas",
          completed: false,
        },
      ],
    ],
    [
      "ideas",
      [
        {
          id: "idea",
          projectId: story.id,
          content: "Uma ideia para continuar",
          category: "Enredo",
          createdAt: new Date().toISOString(),
        },
      ],
    ],
    [
      "concepts",
      [
        {
          id: "place",
          projectId: story.id,
          title: "Cidade das histórias",
          description: "Uma cidade imaginária",
          category: "Local",
          notes: "Lembrar dos detalhes",
          region: "Norte",
        },
      ],
    ],
    [
      "events",
      [
        {
          id: "event",
          projectId: story.id,
          title: "A chegada",
          yearOrDate: "2026",
          description: "O primeiro encontro",
          characters: "Clara",
        },
      ],
    ],
  ])
    expect(
      (
        await request.put(`${api}/workspace/${section}`, {
          headers,
          data: { revision: 0, value },
        })
      ).ok(),
    ).toBeTruthy();
  await page.addInitScript(() =>
    localStorage.setItem("capitulando_goals", "[]"),
  );
  await login(page, email);
  await page.addStyleTag({
    content:
      "*, *::before, *::after { transition: none !important; animation: none !important; }",
  });
  for (const theme of ["light", "dark"]) {
    await page
      .getByRole("button", { name: "Configurações", exact: true })
      .click();
    await page
      .getByRole("combobox", { name: "Tema", exact: true })
      .selectOption(theme);
    await page
      .getByRole("button", { name: "Salvar configurações", exact: true })
      .click();
    await expect(
      page.getByText("Configurações salvas e sincronizadas.", { exact: true }),
    ).toBeVisible();
    const recovery = page
      .getByRole("heading", {
        name: "Recuperar dados da versão antiga",
        exact: true,
      })
      .locator("..");
    await expect(recovery).toHaveClass(/rounded-3xl/);
    await page.screenshot({
      path: `test-results/settings-recovery-${theme}.png`,
      fullPage: true,
    });
    for (const section of [
      "Painel Principal",
      "Projetos / Livros",
      "Personagens",
      "Timeline / Idade",
      "Universo / Mundo",
      "Espaço de Escrita",
      "Metas & Desafios",
      "Bloco de Ideias",
      "Perfil do Autor",
      "Configurações",
    ]) {
      await page.getByRole("button", { name: section, exact: true }).click();
      expect
        .soft(await textContrastIssues(page), `${theme}: ${section}`)
        .toEqual([]);
      if (section === "Projetos / Livros") {
        await page
          .getByRole("button", {
            name: "Editar História para revisar",
            exact: true,
          })
          .click();
        expect
          .soft(await textContrastIssues(page), `${theme}: editar livro`)
          .toEqual([]);
        await expect(
          page.getByRole("combobox", { name: "Status do livro", exact: true }),
        ).toHaveCSS(
          "background-color",
          theme === "dark" ? "rgb(34, 26, 43)" : "rgb(255, 253, 249)",
        );
        await page
          .getByRole("button", { name: "Cancelar", exact: true })
          .click();
      }
      if (section === "Personagens") {
        await page
          .getByRole("button", { name: "Criar Ficha", exact: true })
          .click();
        expect
          .soft(await textContrastIssues(page), `${theme}: criar ficha`)
          .toEqual([]);
        await page
          .getByRole("button", { name: "Cancelar", exact: true })
          .click();
      }
      const colors = await page
        .locator("main select, main select option")
        .evaluateAll((elements) =>
          elements.map((element) => ({
            color: getComputedStyle(element).color,
            background: getComputedStyle(element).backgroundColor,
          })),
        );
      for (const color of colors) {
        expect(color.color).toBe(
          theme === "dark" ? "rgb(245, 237, 243)" : "rgb(60, 38, 57)",
        );
        expect(color.background).toBe(
          theme === "dark" ? "rgb(34, 26, 43)" : "rgb(255, 253, 249)",
        );
      }
    }
  }
});

test("logo, favicon e temas das páginas públicas persistem durante a navegação", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydrat|didn.t match/i.test(message.text())
    )
      errors.push(message.text());
  });
  await page.goto("/");
  const logo = page.locator("header img").first();
  await expect(logo).toHaveAttribute("src", /capitulando-logo/);
  await expect
    .poll(() =>
      logo.evaluate((element) => (element as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  const icon = page.locator('link[rel="icon"]').first();
  await expect(icon).toHaveAttribute("href", /\/favicon\.ico/);
  const iconResponse = await request.get((await icon.getAttribute("href"))!);
  expect(iconResponse.ok()).toBeTruthy();
  expect((await iconResponse.body()).subarray(0, 4)).toEqual(
    Buffer.from([0, 0, 1, 0]),
  );
  const theme = page.getByRole("combobox", {
    name: "Tema de aparência",
    exact: true,
  });
  await theme.selectOption("dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("link", { name: "Entrar", exact: true }).click();
  await expect(theme).toHaveValue("dark");
  for (const route of [
    "/",
    "/login",
    "/cadastro",
    "/recuperar-senha",
    "/confirmar-email",
    "/redefinir-senha",
  ]) {
    await page.goto(route);
    await expect(theme).toHaveValue("dark");
    for (const mode of ["light", "dark"]) {
      await theme.selectOption(mode);
      await expect(page.locator("html")).toHaveClass(
        mode === "dark" ? /dark/ : /^$/,
      );
      expect(await textContrastIssues(page), `${route}: ${mode}`).toEqual([]);
      if (route === "/")
        await expect(page.locator("main").locator("..")).toHaveCSS(
          "background-color",
          mode === "dark" ? "rgb(18, 14, 23)" : "rgb(243, 204, 222)",
        );
    }
    await page.reload();
    await expect(theme).toHaveValue("dark");
    await expect(page.locator("html")).toHaveClass(/dark/);
  }
  await page.goto("/login");
  await page.screenshot({
    path: "test-results/login-branded-dark.png",
    fullPage: true,
  });
  await theme.selectOption("light");
  await page.screenshot({
    path: "test-results/login-branded-light.png",
    fullPage: true,
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await theme.selectOption("system");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(logo).toBeVisible();
  await expect(theme).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "test-results/landing-branded-mobile.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("tema público respeita a preferência da conta ao entrar e mantém a escolha ao sair", async ({
  page,
  request,
}) => {
  const email = await account(request);
  const auth = await (
    await request.post(`${api}/auth/login`, { data: { email, password } })
  ).json();
  expect(
    (
      await request.put(`${api}/workspace/settings`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        data: { revision: 0, value: { themeMode: "dark" } },
      })
    ).ok(),
  ).toBeTruthy();
  await page.goto("/login");
  await page
    .getByRole("combobox", { name: "Tema de aparência", exact: true })
    .selectOption("light");
  await login(page, email);
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page
    .getByRole("button", { name: "Configurações", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Tema", exact: true })
    .selectOption("light");
  await page
    .getByRole("button", { name: "Salvar configurações", exact: true })
    .click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await expect(
    page.getByText("Configurações salvas e sincronizadas.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Sair / Trocar de Conta", exact: true })
    .click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("combobox", { name: "Tema de aparência", exact: true }),
  ).toHaveValue("light");
  await page
    .getByRole("combobox", { name: "Tema de aparência", exact: true })
    .selectOption("dark");
  await login(page, email);
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("enciclopédia do mundo integra cadastros, vínculos, timeline, backup e isolamento", async ({
  page,
  request,
}) => {
  test.setTimeout(180_000);
  page.setDefaultTimeout(15_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const email = await account(request);
  const auth = await (
    await request.post(`${api}/auth/login`, { data: { email, password } })
  ).json();
  const headers = { Authorization: `Bearer ${auth.accessToken}` };
  const story = await (
    await request.post(`${api}/stories`, {
      headers,
      data: { title: "Mundo de Aurora" },
    })
  ).json();
  const otherStory = await (
    await request.post(`${api}/stories`, {
      headers,
      data: { title: "Outro universo" },
    })
  ).json();
  const chapter = await (
    await request.post(`${api}/stories/${story.id}/chapters`, {
      headers,
      data: { title: "A primeira viagem", status: "IN_REVIEW" },
    })
  ).json();
  expect(
    (
      await request.post(`${api}/races`, {
        headers,
        data: { name: "Raça de outro livro", story: { id: otherStory.id } },
      })
    ).ok(),
  ).toBeTruthy();
  expect(
    (
      await request.put(`${api}/workspace/concepts`, {
        headers,
        data: {
          revision: 0,
          value: [
            {
              id: "old-note",
              projectId: story.id,
              title: "Nota antiga",
              category: "Lore / História",
              description: "Continua disponível",
            },
          ],
        },
      })
    ).ok(),
  ).toBeTruthy();
  await login(page, email);
  async function universe(tab: string) {
    await page
      .getByRole("button", { name: "Universo / Mundo", exact: true })
      .click();
    await page
      .getByRole("combobox", { name: "Livro do universo", exact: true })
      .selectOption({ label: "Mundo de Aurora" });
    await page.getByRole("tab", { name: tab, exact: true }).click();
  }
  async function create(
    action: string,
    fields: Record<string, string>,
    selections: Record<string, string> = {},
  ) {
    await expect(
      page.getByRole("button", { name: action, exact: true }),
    ).toBeEnabled();
    await page.getByRole("button", { name: action, exact: true }).click();
    const modal = page.getByRole("dialog", { name: action, exact: true });
    for (const [label, value] of Object.entries(fields))
      await modal.getByLabel(label).fill(value);
    for (const [label, value] of Object.entries(selections))
      await modal.getByLabel(label).selectOption({ label: value });
    await modal
      .getByRole("button", { name: "Salvar registro", exact: true })
      .click();
    await expect(modal).not.toBeVisible();
  }
  await universe("Anotações");
  await expect(
    page.getByRole("heading", { name: "Nota antiga", exact: true }),
  ).toBeVisible();
  await universe("Raças");
  await create("Nova raça", {
    Nome: "Elfos de Aurora",
    Descrição: "Habitantes da floresta",
    Cultura: "Tradição oral",
    Habitat: "Florestas",
  });
  await expect(
    page.getByRole("heading", { name: "Elfos de Aurora", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Editar Elfos de Aurora", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Editar raça", exact: true })
    .getByLabel("Cultura")
    .fill("Tradição oral e música");
  await page
    .getByRole("button", { name: "Salvar registro", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Personagens", exact: true }).click();
  await page.locator("main select").first().selectOption(story.id);
  await page.getByRole("button", { name: "Criar Ficha", exact: true }).click();
  await page.getByPlaceholder("Nome", { exact: true }).fill("Clara");
  await expect(
    page
      .getByLabel("Raça")
      .locator("option", { hasText: "Raça de outro livro" }),
  ).toHaveCount(0);
  await page.getByLabel("Raça").selectOption({ label: "Elfos de Aurora" });
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(
    page.getByText("Raça: Elfos de Aurora", { exact: true }),
  ).toBeVisible();
  await universe("Criaturas");
  await create(
    "Nova criatura",
    { Nome: "Guardião", Comportamento: "Protege o bosque" },
    { Raça: "Elfos de Aurora" },
  );
  await page
    .getByRole("button", { name: "Editar Guardião", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Editar criatura", exact: true })
    .getByLabel("Raça")
    .selectOption("");
  await page
    .getByRole("button", { name: "Salvar registro", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const creatures = await (
    await request.get(`${api}/creatures`, { headers })
  ).json();
  expect(
    creatures.find((row: { name: string }) => row.name === "Guardião").race,
  ).toBeNull();
  await universe("Itens");
  await create("Novo item", {
    Nome: "Mapa antigo",
    Tipo: "Artefato",
    Origem: "Biblioteca de Aurora",
  });
  await universe("Locais");
  await create("Novo local", { Nome: "Reino de Aurora", Clima: "Temperado" });
  await create(
    "Novo local",
    { Nome: "Cidade das folhas", Região: "Norte" },
    { "Local ao qual pertence": "Reino de Aurora" },
  );
  await page
    .getByRole("button", { name: "Editar Reino de Aurora", exact: true })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByLabel("Local ao qual pertence")
      .locator("option", { hasText: "Cidade das folhas" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await universe("Organizações");
  await create(
    "Nova organização",
    { Nome: "Guardiões do bosque", Tipo: "Ordem" },
    { Sede: "Cidade das folhas" },
  );
  await page
    .getByRole("button", {
      name: "Ver detalhes de Guardiões do bosque",
      exact: true,
    })
    .click();
  await create(
    "Adicionar membro",
    {
      "Papel na organização": "Exploradora",
      "Data ou época de entrada": "Ano 12",
    },
    { Personagem: "Clara" },
  );
  await expect(
    page
      .getByRole("dialog", { name: "Guardiões do bosque", exact: true })
      .getByRole("heading", { name: "Clara", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Fechar", exact: true }).click();
  await universe("Regras e lore");
  await create("Nova regra", {
    Título: "Magia das folhas",
    Categoria: "Regra de Magia",
    Descrição: "A magia nasce da memória das árvores.",
  });
  await page
    .getByRole("button", { name: "Timeline / Idade", exact: true })
    .click();
  await page.locator("main select").first().selectOption(story.id);
  await page
    .getByRole("tab", { name: "Eventos vinculados", exact: true })
    .click();
  await create(
    "Novo evento vinculado",
    {
      Título: "A chegada de Clara",
      "Data ou época": "Ano 12",
      "Ordem na cronologia": "1",
    },
    {
      "Local do evento": "Cidade das folhas",
      "Capítulo relacionado": "A primeira viagem",
    },
  );
  await page
    .getByRole("button", {
      name: "Ver detalhes de A chegada de Clara",
      exact: true,
    })
    .click();
  await create("Adicionar participante", {}, { Personagem: "Clara" });
  await expect(
    page
      .getByRole("dialog", { name: "A chegada de Clara", exact: true })
      .getByRole("heading", { name: "Clara", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Fechar", exact: true }).click();
  await page.reload();
  await universe("Raças");
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Excluir Elfos de Aurora", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "vínculo em uso" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Elfos de Aurora", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Livro do universo", exact: true })
    .selectOption(otherStory.id);
  await expect(
    page.getByRole("heading", { name: "Raça de outro livro", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Elfos de Aurora", exact: true }),
  ).toHaveCount(0);
  const backup = await (await request.get(`${api}/backup`, { headers })).json();
  for (const kind of [
    "Race",
    "Creature",
    "Item",
    "Location",
    "Organization",
    "WorldRule",
    "Event",
    "CharacterOrganization",
    "EventCharacter",
  ])
    expect(backup.records[kind].length).toBeGreaterThan(0);
  expect(backup.records.Event[0].chapter.id).toBe(chapter.id);
  expect(
    (await request.post(`${api}/backup`, { headers, data: backup })).ok(),
  ).toBeTruthy();
  await page.reload();
  await universe("Organizações");
  await page
    .getByRole("button", {
      name: "Ver detalhes de Guardiões do bosque",
      exact: true,
    })
    .click();
  await expect(
    page
      .getByRole("dialog", { name: "Guardiões do bosque", exact: true })
      .getByRole("heading", { name: "Clara", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Fechar", exact: true }).click();
  await universe("Itens");
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Excluir Mapa antigo", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Mapa antigo", exact: true }),
  ).toHaveCount(0);
  const otherEmail = await account(request);
  const otherAuth = await (
    await request.post(`${api}/auth/login`, {
      data: { email: otherEmail, password },
    })
  ).json();
  expect(
    await (
      await request.get(`${api}/races`, {
        headers: { Authorization: `Bearer ${otherAuth.accessToken}` },
      })
    ).json(),
  ).toEqual([]);
  await universe("Raças");
  await page.screenshot({
    path: "test-results/universe-catalog-light.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Configurações", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Tema", exact: true })
    .selectOption("dark");
  await page
    .getByRole("button", { name: "Salvar configurações", exact: true })
    .click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.addStyleTag({
    content: "* { transition: none !important; animation: none !important; }",
  });
  await universe("Raças");
  for (const tab of [
    "Raças",
    "Criaturas",
    "Itens",
    "Locais",
    "Organizações",
    "Regras e lore",
  ]) {
    await page.getByRole("tab", { name: tab, exact: true }).click();
    expect(await textContrastIssues(page), `Catálogo: ${tab}`).toEqual([]);
  }
  await page.getByRole("tab", { name: "Raças", exact: true }).click();
  await page.screenshot({
    path: "test-results/universe-catalog-dark.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/universe-catalog-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
});
