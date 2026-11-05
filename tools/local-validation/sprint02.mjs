import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { writeFileSync, readFileSync, statSync } from "node:fs";
import { join, resolve, extname, sep } from "node:path";
import { createServer } from "node:http";
import { chromium } from "@playwright/test";
import { startLocalRuntime, root, command } from "./runtime.mjs";
const runtime = await startLocalRuntime();
let browser, server;
const checks = [];
const userId = "11111111-1111-4111-8111-111111111111",
  otherId = "22222222-2222-4222-8222-222222222222";
const token = (sub, role = sub ? "authenticated" : "anon") => {
  const raw = [
    { alg: "HS256", typ: "JWT" },
    { sub, role, exp: Math.floor(Date.now() / 1000) + 3600 },
  ]
    .map((v) => Buffer.from(JSON.stringify(v)).toString("base64url"))
    .join(".");
  return (
    raw +
    "." +
    createHmac("sha256", runtime.secret).update(raw).digest("base64url")
  );
};
const jwt = token(userId),
  otherJwt = token(otherId),
  anonJwt = token(null);
const request = async (path, { method = "GET", body, auth = jwt } = {}) => {
  const r = await fetch(runtime.apiUrl + path, {
    method,
    headers: {
      Authorization: "Bearer " + auth,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: r.status, data: await r.json() };
};
try {
  await runtime.client.query("insert into auth.users(id) values($1),($2)", [
    userId,
    otherId,
  ]);
  await runtime.startApi();
  const s = await request("/schools?select=id,name,slug", {
    method: "POST",
    body: { name: "Escola QA Sprint 02", slug: "escola-qa-sprint02" },
  });
  assert.equal(s.status, 201);
  const school = s.data[0];
  const c = await request(
    "/school_curricula?select=id,title,content,visibility,updated_at",
    {
      method: "POST",
      body: {
        school_id: school.id,
        title: "Currículo privado QA",
        content: {
          title: "Currículo privado QA",
          description: "Teste local",
          grades: [],
        },
      },
    },
  );
  assert.equal(c.status, 201);
  const curriculum = c.data[0];
  assert.deepEqual(
    (await request("/school_curricula?select=title", { auth: otherJwt })).data,
    [],
  );
  assert.deepEqual(
    (
      await request("/school_curricula?id=eq." + curriculum.id, {
        method: "PATCH",
        auth: otherJwt,
        body: { title: "Ataque" },
      })
    ).data,
    [],
  );
  assert.ok(
    (
      await request("/school_curricula", {
        method: "POST",
        auth: otherJwt,
        body: {
          school_id: school.id,
          owner_user_id: userId,
          title: "Ataque",
          content: {},
        },
      })
    ).status >= 400,
  );
  assert.deepEqual(
    (await request("/school_curricula?select=title", { auth: anonJwt })).data,
    [],
  );
  checks.push("REST: criação privada e isolamento entre duas escolas/contas");
  const media = await request("/school_media?select=id", {
    method: "POST",
    body: {
      school_id: school.id,
      title: "Privado QA",
      media_kind: "video",
      media_url: "https://example.org/private.mp4",
      creator: "Professor QA",
      permission_note: "Evidência privada QA",
      rights_confirmed: true,
      consent_confirmed: true,
    },
  });
  assert.equal(media.status, 201);
  await request("/school_curricula?id=eq." + curriculum.id, {
    method: "PATCH",
    body: { visibility: "public" },
  });
  assert.equal(
    (await request("/school_curricula?select=title", { auth: anonJwt })).data
      .length,
    1,
  );
  assert.equal(
    (await request("/schools?select=id,name,slug", { auth: anonJwt })).data[0]
      .name,
    school.name,
  );
  assert.deepEqual(
    (
      await request("/school_media?select=id,title,media_url", {
        auth: anonJwt,
      })
    ).data,
    [],
  );
  assert.ok(
    (await request("/schools?select=owner_user_id", { auth: anonJwt }))
      .status >= 400,
  );
  assert.ok(
    (await request("/school_media?select=permission_note", { auth: anonJwt }))
      .status >= 400,
  );
  checks.push(
    "REST: currículo compartilhado não expõe conta ou autorização de imagem",
  );
  await request("/school_curricula?id=eq." + curriculum.id, {
    method: "PATCH",
    body: { visibility: "private" },
  });
  assert.deepEqual(
    (await request("/school_curricula?select=title", { auth: anonJwt })).data,
    [],
  );
  checks.push("REST: revogar compartilhamento remove leitura anônima");
  const siteRoot = resolve(runtime.runDir, "site");
  await command(
    process.execPath,
    [
      join(root, "node_modules/astro/bin/astro.mjs"),
      "build",
      "--outDir",
      siteRoot,
    ],
    {
      stdio: "ignore",
      env: {
        ...process.env,
        PUBLIC_SUPABASE_URL: "https://acbostnsohltuaegfkwl.supabase.co",
        PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_local_test",
        PUBLIC_CONTENT_REVIEW: "false",
        PUBLIC_SPRINT02_SCHEMA: "true",
      },
    },
  );
  server = createServer((req, res) => {
    try {
      let file = resolve(
        siteRoot,
        "." + decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname),
      );
      if (file !== siteRoot && !file.startsWith(siteRoot + sep))
        throw new Error();
      if (statSync(file).isDirectory()) file = join(file, "index.html");
      const types = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
      };
      res.writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
      });
      res.end(readFileSync(file));
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const base = "http://127.0.0.1:" + server.address().port;
  browser = await chromium.launch();
  const fixtureUser = {
    id: userId,
    aud: "authenticated",
    role: "authenticated",
    email: "qa@example.org",
    email_confirmed_at: new Date().toISOString(),
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    created_at: new Date().toISOString(),
  };
  const attach = async (context) =>
    context.route(
      "https://acbostnsohltuaegfkwl.supabase.co/**",
      async (route) => {
        const r = route.request(),
          url = new URL(r.url());
        if (url.pathname.startsWith("/auth/v1/"))
          return route.fulfill({
            json: url.pathname.includes("/token")
              ? {
                  access_token: jwt,
                  token_type: "bearer",
                  expires_in: 3600,
                  refresh_token: "local-test-only",
                  user: fixtureUser,
                }
              : fixtureUser,
          });
        const headers = r.headers();
        const { authorization, ...forwarded } = headers;
        const response = await fetch(
          runtime.apiUrl + url.pathname.replace("/rest/v1", "") + url.search,
          {
            method: r.method(),
            headers: {
              ...forwarded,
              host: new URL(runtime.apiUrl).host,
              Authorization: authorization || "Bearer " + anonJwt,
            },
            ...(r.postData() ? { body: r.postData() } : {}),
          },
        );
        await route.fulfill({
          status: response.status,
          headers: { "content-type": "application/json" },
          body: await response.text(),
        });
      },
    );
  const context = await browser.newContext();
  await attach(context);
  const page = await context.newPage();
  page.on("pageerror", (e) => process.stderr.write("PAGE " + e.message + "\n"));
  page.on("response", (r) => {
    if (r.url().includes("supabase.co") && r.status() >= 400)
      process.stderr.write(
        "HTTP " + r.status() + " " + new URL(r.url()).pathname + "\n",
      );
  });
  await page.goto(base + "/escolas");
  await page.getByLabel("Email", { exact: true }).fill("qa@example.org");
  await page.getByLabel("Senha", { exact: true }).fill("local-test-password");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  const browserSchoolName = "Escola criada no navegador";
  await page
    .getByLabel("Nome da escola", { exact: true })
    .fill(browserSchoolName);
  await page
    .getByLabel("Identificador da escola", { exact: true })
    .fill("escola-criada-browser");
  await page.getByRole("button", { name: "Criar escola", exact: true }).click();
  await page
    .getByRole("heading", { name: browserSchoolName, exact: true })
    .waitFor();
  await page
    .getByText("Demonstrações em vídeo e imagem", { exact: true })
    .click();
  await page
    .getByLabel("Título da demonstração", { exact: true })
    .fill("Demonstração QA autorizada");
  await page
    .getByLabel("Autor ou demonstrador", { exact: true })
    .fill("Professor QA");
  await page
    .getByLabel("URL da mídia", { exact: true })
    .fill("https://example.org/qa.mp4");
  await page
    .getByLabel("Permissão de uso e referência da autorização", { exact: true })
    .fill("Evidência que não pode aparecer publicamente");
  await page
    .getByLabel("Visibilidade da demonstração", { exact: true })
    .selectOption("public");
  await page
    .getByLabel("Tenho permissão para usar e compartilhar esta mídia.", {
      exact: true,
    })
    .check();
  await page.getByLabel(/Registrei consentimento de todas/).check();
  await page
    .getByRole("button", { name: "Salvar demonstração", exact: true })
    .click();
  await page
    .getByText(
      "Demonstração vinculada. A visibilidade escolhida foi preservada.",
      { exact: true },
    )
    .waitFor();
  const newMedia = (
    await runtime.client.query(
      "select id from school_media where title='Demonstração QA autorizada'",
    )
  ).rows[0];
  await page
    .getByLabel("Demonstração da escola", { exact: true })
    .first()
    .selectOption(newMedia.id);
  await page
    .getByLabel("Nome do currículo", { exact: true })
    .fill("Currículo criado no navegador");
  await page.getByLabel("Permitir link público para este currículo").check();
  await page
    .getByRole("button", { name: "Salvar currículo na escola", exact: true })
    .click();
  const share = page.getByLabel("Link da última versão salva");
  await share.waitFor();
  const link = await share.inputValue();
  assert.ok(link.includes("/curriculo?id="));
  checks.push(
    "Navegador → SDK Auth (identidade local simulada) → PostgREST/PostgreSQL: criar e compartilhar currículo",
  );
  const student = await browser.newContext({
    viewport: { width: 393, height: 851 },
    isMobile: true,
    hasTouch: true,
  });
  await attach(student);
  const studentPage = await student.newPage();
  await studentPage.goto(link);
  await studentPage
    .getByRole("heading", {
      name: "Currículo criado no navegador",
      exact: true,
    })
    .waitFor();
  await studentPage.getByText(browserSchoolName, { exact: true }).waitFor();
  await studentPage
    .getByText("Demonstração QA autorizada", { exact: true })
    .waitFor();
  assert.equal(
    await studentPage
      .getByText("Evidência que não pode aparecer publicamente", {
        exact: true,
      })
      .count(),
    0,
  );
  assert.equal(
    await studentPage.getByText("qa@example.org", { exact: false }).count(),
    0,
  );
  await studentPage.screenshot({
    path: join(root, "test-results/previews/sprint02-shared-mobile.png"),
    fullPage: true,
  });
  checks.push(
    "Segundo navegador sem sessão: currículo público legível no celular, sem dados de conta",
  );
  const id = new URL(link).searchParams.get("id");
  await request("/school_curricula?id=eq." + id, {
    method: "PATCH",
    body: { visibility: "private" },
  });
  await studentPage.reload();
  await studentPage
    .getByText("Currículo privado, removido ou não compartilhado.", {
      exact: true,
    })
    .waitFor();
  checks.push("Navegador anônimo perde acesso após revogação");
  await context.close();
  await student.close();
  writeFileSync(
    join(root, ".local-validation/sprint02.json"),
    JSON.stringify(
      {
        checks,
        postgres: runtime.version,
        postgrest: runtime.postgrestVersion,
        auth: "simulated identity; real SDK and local REST/RLS",
        remoteWrites: 0,
      },
      null,
      2,
    ),
  );
  for (const c of checks) process.stdout.write("OK " + c + "\n");
} finally {
  await browser?.close();
  if (server) await new Promise((done) => server.close(done));
  await runtime.stop();
}
