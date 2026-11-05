import { test, expect, type BrowserContext } from "@playwright/test";

const schoolId = "33333333-3333-4333-8333-333333333333";
const curriculumId = "44444444-4444-4444-8444-444444444444";
const mediaId = "55555555-5555-4555-8555-555555555555";
const termId = "66666666-6666-4666-8666-666666666666";
const user = { id: "11111111-1111-4111-8111-111111111111", aud: "authenticated", role: "authenticated", email: "professor@example.test" };
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aO1sAAAAASUVORK5CYII=", "base64");

// External service doubles: real components and supabase-js HTTP requests.
// Actual PostgreSQL RLS is independently tested in school-images.test.mjs.
function fixture({ failMedia = false } = {}) {
  let schools: any[] = [], curricula: any[] = [], terms: any[] = [], media: any[] = [];
  let version = 0, uploads = 0, deletes = 0;
  const authCalls: string[] = [];
  const session = () => ({ access_token: `e30.${Buffer.from(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now()/1000)+3600 })).toString("base64url")}.test`, refresh_token: "test-refresh", expires_in: 3600, token_type: "bearer", user });
  async function connect(context: BrowserContext) {
    await context.route("https://acbostnsohltuaegfkwl.supabase.co/**", async route => {
      const req = route.request(), url = new URL(req.url()), method = req.method();
      if (url.pathname.includes("/auth/v1/")) {
        const action = url.pathname.split("/").pop()!;
        authCalls.push(action);
        if (url.searchParams.get("grant_type") === "refresh_token") authCalls.push("refresh_token");
        if (action === "signup") return route.fulfill({ json: { user, session: null } });
        if (action === "token") return route.fulfill({ json: session() });
        if (action === "user") return route.fulfill({ json: user });
        return route.fulfill({ json: {} });
      }
      if (url.pathname.includes("/storage/v1/")) {
        if (method === "DELETE") { deletes++; return route.fulfill({ json: [] }); }
        if (method === "POST") { uploads++; return route.fulfill({ json: { Key: url.pathname.split("/object/")[1] } }); }
        return route.fulfill({ contentType: "image/png", body: png });
      }
      const table = url.pathname.split("/").pop();
      if (table === "search_catalog") return route.fulfill({ json: { items: [], total: 0 } });
      const rows = table === "schools" ? schools : table === "school_curricula" ? curricula : table === "school_terms" ? terms : media;
      const owner = (req.headers()["authorization"] || "").includes(".test");
      let result = rows;
      const id = url.searchParams.get("id")?.replace("eq.", "");
      if (method === "POST") {
        if (table === "school_media" && failMedia) return route.fulfill({ status: 500, json: { code: "XX000", message: "Falha de cadastro simulada" } });
        const body = req.postDataJSON();
        const row = { ...body, id: table === "schools" ? schoolId : table === "school_curricula" ? curriculumId : table === "school_terms" ? termId : mediaId, visibility: body.visibility || "private", updated_at: "v" + ++version };
        rows.push(row); result = [row];
      } else if (method === "PATCH") {
        const row = rows.find(r => r.id === id);
        if (row) Object.assign(row, req.postDataJSON(), { updated_at: "v" + ++version });
        result = row ? [row] : [];
      } else if (!owner) result = rows.filter(r => table === "schools" || r.visibility === "public");
      if (id) result = result.filter(r => r.id === id);
      const object = req.headers()["accept"]?.includes("application/vnd.pgrst.object+json");
      return route.fulfill({ json: object ? result[0] || null : result });
    });
  }
  return { connect, authCalls, session, get uploads() { return uploads; }, get deletes() { return deletes; } };
}

test("auth: cadastro, reenvio e recuperação não dependem de informar a senha atual", async ({ page, context }) => {
  const api = fixture(); await api.connect(context);
  await page.goto("/escolas#error=access_denied&error_code=otp_expired");
  await expect(page.getByRole("status")).toContainText("expirou");
  await page.getByLabel("Email", { exact: true }).fill(user.email);
  await page.getByLabel("Senha", { exact: true }).fill("senha-apenas-no-teste");
  await page.getByRole("button", { name: "Criar conta de responsável" }).click();
  await expect(page.getByRole("status")).toContainText("confirmar");
  await page.getByRole("button", { name: "Reenviar confirmação" }).click();
  await expect.poll(() => api.authCalls.includes("resend")).toBe(true);
  await page.getByRole("button", { name: "Esqueci minha senha" }).click();
  await expect.poll(() => api.authCalls.includes("recover")).toBe(true);
  await expect(page.getByRole("status")).toContainText("recuperação");
});

test("professor salva, recarrega, vincula imagem e técnica própria, compartilha e revoga para aluno sem sessão", async ({ page, context, browser }) => {
  const api = fixture(); await api.connect(context);
  await page.goto("/escolas");
  await page.getByLabel("Email", { exact: true }).fill(user.email);
  await page.getByLabel("Senha", { exact: true }).fill("senha-apenas-no-teste");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.getByLabel("Nome da escola", { exact: true }).fill("Escola Piloto");
  await page.getByLabel("Identificador da escola").fill("escola-piloto");
  await page.getByRole("button", { name: "Criar escola", exact: true }).click();
  await expect(page.getByLabel("Nome do currículo", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Salvar currículo na escola" }).click();
  await expect(page.getByRole("status")).toContainText("privado");
  await page.reload();
  await expect(page.getByText("Responsável conectado:")).toBeVisible();
  await page.getByRole("button", { name: "Escola Piloto", exact: true }).click();
  await page.getByLabel("Abrir currículo salvo").selectOption(curriculumId);
  await expect(page.getByLabel("Conteúdo", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Adicionar conteúdo", exact: true }).first().click();
  await page.getByLabel("Conteúdo", { exact: true }).first().fill("Prática inicial da escola");

  await page.getByText("Técnicas próprias da escola", { exact: true }).click();
  await page.getByLabel("Nome da técnica própria").fill("Base adaptada da escola");
  await page.getByLabel("Descrição da escola", { exact: true }).fill("Execução adaptada pelo professor.");
  await page.getByRole("button", { name: "Adicionar técnica própria" }).click();
  await expect(page.getByText("Base adaptada da escola", { exact: true }).first()).toBeVisible();
  await page.getByRole("checkbox", { name: "Permitir consulta pública desta técnica própria" }).check();
  await page.getByLabel("Técnica da biblioteca da escola").first().selectOption(termId);

  await page.getByText("Demonstrações em vídeo e imagem", { exact: true }).click();
  await page.getByLabel("Origem da demonstração").selectOption("upload");
  await page.getByLabel("Arquivo de imagem").setInputFiles({ name: "base.png", mimeType: "image/png", buffer: png });
  await page.getByLabel("Título da demonstração").fill("Imagem autorizada");
  await page.getByLabel("Autor ou demonstrador").fill("Professor");
  await page.getByLabel("Licença ou condições de uso").fill("CC BY 4.0");
  await page.getByLabel("Permissão de uso e referência da autorização").fill("Desenho próprio sem pessoas");
  await page.getByRole("checkbox", { name: "Tenho permissão" }).check();
  await page.getByRole("checkbox", { name: "Registrei consentimento" }).check();
  await page.getByLabel("Visibilidade da demonstração").selectOption("public");
  await page.getByRole("button", { name: "Salvar demonstração", exact: true }).click();
  await expect.poll(() => api.uploads).toBe(1);
  await expect(page.getByLabel("Demonstração da escola").first().getByRole("option", { name: /Imagem autorizada/ })).toBeAttached();
  await page.getByLabel("Demonstração da escola").first().selectOption(mediaId);
  await page.getByRole("checkbox", { name: "Permitir link público para este currículo" }).check();
  await page.getByRole("button", { name: "Salvar currículo na escola" }).click();
  await expect(page.getByRole("status")).toContainText("compartilhamento ativado");
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("denied"); } } }));
  await page.getByRole("button", { name: "Copiar link", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("selecione");
  const link = await page.getByLabel("Link da última versão salva").inputValue();

  const student = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await api.connect(student);
  try {
    const phone = await student.newPage();
    await phone.goto(link);
    await expect(phone.getByRole("heading", { name: "Currículo da escola" })).toBeVisible();
    await expect(phone.getByText("Execução adaptada pelo professor.", { exact: true })).toBeVisible();
    await phone.getByRole("button", { name: "Carregar demonstração" }).click();
    await expect(phone.getByRole("img", { name: "Imagem autorizada" })).toBeVisible();
    expect(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByLabel("Nome do currículo", { exact: true }).fill("Alteração ainda não salva");
    await page.getByRole("button", { name: "Revogar compartilhamento", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("revogado");
    await expect(page.getByLabel("Nome do currículo", { exact: true })).toHaveValue("Alteração ainda não salva");
    await phone.reload();
    await expect(phone.getByRole("status")).toContainText("privado");
    await page.getByRole("button", { name: "Sair", exact: true }).click();
    await expect(page.getByRole("button", { name: "Entrar", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally { await student.close(); }
});

test("recuperação: retorno do email permite definir e confirmar nova senha", async ({ page, context }) => {
  const api = fixture(); await api.connect(context);
  await page.goto("/escolas#access_token=e30.e30.test&refresh_token=test-refresh&expires_in=3600&token_type=bearer&type=recovery");
  await page.getByLabel("Nova senha", { exact: true }).fill("nova-senha-de-teste");
  await page.getByLabel("Confirmar nova senha", { exact: true }).fill("nova-senha-de-teste");
  await page.getByRole("button", { name: "Salvar nova senha", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Senha atualizada");
  expect(page.url()).not.toContain("access_token");
});

test("sessão expirada é renovada e mantém o professor conectado após recarregar", async ({ page, context }) => {
  const api = fixture(); await api.connect(context);
  await context.addInitScript(session => {
    localStorage.setItem("sb-acbostnsohltuaegfkwl-auth-token", JSON.stringify(session));
  }, { ...api.session(), expires_at: Math.floor(Date.now()/1000)-120 });
  await page.goto("/escolas");
  await expect(page.getByText("Responsável conectado:")).toBeVisible();
  await expect.poll(() => api.authCalls.includes("refresh_token")).toBe(true);
});

test("upload rejeita arquivo inválido e limpa arquivo privado se os metadados não forem salvos", async ({ page, context }) => {
  const api = fixture({ failMedia: true }); await api.connect(context);
  await page.goto("/escolas");
  await page.getByLabel("Email", { exact: true }).fill(user.email);
  await page.getByLabel("Senha", { exact: true }).fill("senha-apenas-no-teste");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.getByLabel("Nome da escola", { exact: true }).fill("Escola Piloto");
  await page.getByLabel("Identificador da escola").fill("escola-piloto");
  await page.getByRole("button", { name: "Criar escola", exact: true }).click();
  await page.getByText("Demonstrações em vídeo e imagem", { exact: true }).click();
  await page.getByLabel("Origem da demonstração").selectOption("upload");
  await page.getByLabel("Título da demonstração").fill("Teste de falha");
  await page.getByLabel("Autor ou demonstrador").fill("Professor");
  await page.getByLabel("Licença ou condições de uso").fill("Material próprio");
  await page.getByLabel("Permissão de uso e referência da autorização").fill("Sem pessoas retratadas");
  await page.getByRole("checkbox", { name: "Tenho permissão" }).check();
  await page.getByRole("checkbox", { name: "Registrei consentimento" }).check();
  await page.getByLabel("Arquivo de imagem").setInputFiles({ name: "falsa.png", mimeType: "image/png", buffer: Buffer.from("<html>") });
  await page.getByRole("button", { name: "Salvar demonstração", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("válida");
  expect(api.uploads).toBe(0);
  await page.getByLabel("Arquivo de imagem").setInputFiles({ name: "base.png", mimeType: "image/png", buffer: png });
  await page.getByRole("button", { name: "Salvar demonstração", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Falha de cadastro simulada");
  expect(api.uploads).toBe(1);
  expect(api.deletes).toBe(1);
});
