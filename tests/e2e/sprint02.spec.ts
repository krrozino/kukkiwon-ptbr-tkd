import { test, expect } from "@playwright/test";
test('currículo: controles aguardam hidratação antes de aceitar interação',async({page})=>{
 let release!:()=>void;const held=new Promise<void>(done=>{release=done;});
 await page.route('**/CurriculumApp.*.js',async route=>{await held;await route.continue();});
 try{await page.goto('/curriculos',{waitUntil:'domcontentloaded'});await expect(page.getByRole('button',{name:'Montar currículo neste navegador',exact:true})).toBeDisabled();}
 finally{release();}
 const edit=page.getByRole('button',{name:'Montar currículo neste navegador',exact:true});await expect(edit).toBeEnabled();await edit.click();await expect(page.getByLabel('Nome do currículo',{exact:true})).toBeVisible();
});
const term = {
  id: "sonnal",
  slug: "sonnal",
  category: "regiao-corporal",
  hangul: "손날",
  romanization: "Sonnal",
  translation_pt: "Borda externa da mão",
  pronunciation_pt: null,
  definition_pt: "Superfície junto ao dedo mínimo.",
  publication_status: "published",
  record_kind: "surface",
  term_aliases: [],
};
const region = {
  id: "sonnal",
  slug: "sonnal",
  region_group: "hands",
  atlas_area: "hands",
  name_pt: term.translation_pt,
  detail_view: "both",
  detail_x: 68,
  detail_y: 68,
};
test("atlas v2: recorte Sonnal, cascata e ficha na mesma tela", async ({
  page,
  isMobile,
}) => {
  await page.route("**/rest/v1/**", async (route) => {
    const table = new URL(route.request().url()).pathname.split("/").pop();
    let data: unknown = [];
    if (table === "body_regions") data = [region];
    if (table === "body_region_terms")
      data = [
        {
          term_id: term.id,
          usage_context: "surface",
          anatomical_role: "surface",
          technical_terms: term,
        },
        {term_id:'related',usage_context:'surface',anatomical_role:'surface',technical_terms:{...term,slug:'sonnal-an-makgi',romanization:'Sonnal-an-makgi'}},
      ];
    if (table === "technical_terms") data = [new URL(route.request().url()).searchParams.get('slug')==='eq.sonnal-an-makgi'?{...term,slug:'sonnal-an-makgi',romanization:'Sonnal-an-makgi'}:term];
    if (table === "term_sources")
      data = [
        {
          source_locator: "Superfícies > Sonnal",
          checked_at: null,
          content_sources: {
            institution: "Fixture",
            title: "Documento de teste",
            official_url: "https://example.org/source",
          },
        },
      ];
    await route.fulfill({ json: data });
  });
  await page.goto("/atlas?region=hands&zoom=1");
  const cutout = page.locator('svg [data-region="sonnal"]');
  await expect(cutout.locator("path")).toHaveCount(1);
  await expect(cutout.locator("text,circle")).toHaveCount(0);
  if (!isMobile) {
    await cutout.hover();
    await expect(page.getByRole("tooltip")).toContainText("Sonnal");
  }
  if (isMobile) await cutout.tap();
  else await cutout.click();
  await expect(cutout).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("region", { name: "Ficha contextual" }),
  ).toContainText("손날");
  await expect(
    page.getByRole("region", { name: "Ficha contextual" }),
  ).toContainText("Pronúncia didática");
  await expect(page).toHaveURL(/\/atlas\?/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(cutout).toBeVisible();
  await page.screenshot({
    path:
      "test-results/previews/sprint02-atlas-" +
      (isMobile ? "mobile" : "desktop") +
      ".png",
    fullPage: true,
  });
  await page.getByRole('button',{name:'Ver aqui: Sonnal-an-makgi',exact:true}).click();
  await expect(page.getByRole('region',{name:'Ficha contextual'}).getByRole('heading',{name:'Sonnal-an-makgi',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Pés',exact:true}).click();await page.goBack();
  await expect(page.getByRole('region',{name:'Ficha contextual'}).getByRole('heading',{name:'Sonnal',exact:true})).toBeVisible();
});
test("estudos: pasta, checklist, anotação e técnica contextual sobrevivem ao recarregamento", async ({
  page,
  isMobile,
}) => {
  await page.route("**/rest/v1/**", async (route) => {
    const table = new URL(route.request().url()).pathname.split("/").pop();
    let data: unknown = [];
    if (table === "search_catalog") data = { items: [term], total: 1 };
    if (table === "technical_terms") data = [term];
    await route.fulfill({ json: data });
  });
  await page.goto("/estudos");
  await page.getByLabel("Nova pasta", { exact: true }).fill("Chutes");
  await page.getByRole("button", { name: "Criar pasta", exact: true }).click();
  await page.getByRole("button", { name: "Chutes", exact: true }).click();
  await page.getByLabel("Nova subpasta", { exact: true }).fill("Básicos");
  await page.getByRole("button", { name: "Criar pasta", exact: true }).click();
  await page.getByRole("button", { name: "↳ Básicos", exact: true }).click();
  await page.getByLabel("Buscar técnica para inserir").first().fill("Sonnal");
  await page.getByRole("button", { name: /Sonnal · Borda externa/ }).click();
  await page.getByRole("checkbox", { name: "Pendente", exact: true }).check();
  await page
    .getByRole("button", { name: "Nova anotação", exact: true })
    .click();
  await page.getByLabel("Título da anotação").fill("Revisar a mão");
  await page.getByLabel("Texto da anotação").fill("Estudar com o professor:");
  await page
    .locator(".note-editor")
    .getByLabel("Buscar técnica para inserir")
    .fill("Sonnal");
  await page.getByRole("button", { name: /Sonnal · Borda externa/ }).click();
  await page
    .getByRole("button", { name: "Salvar anotação", exact: true })
    .click();
  await page
    .locator(".notes-list")
    .getByRole("button", { name: "Sonnal ↗", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Ficha contextual" }),
  ).toContainText("손날");
  await page.reload();
  await page.getByRole("button", { name: "↳ Básicos", exact: true }).click();
  await expect(
    page.getByRole("checkbox", { name: "Estudado", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("button", { name: "Revisar a mão", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path:
      "test-results/previews/sprint02-studies-" +
      (isMobile ? "mobile" : "desktop") +
      ".png",
    fullPage: true,
  });
});
test("currículo: editor ordena graduações, salva localmente e mantém checklist do aluno", async ({
  page,
  isMobile,
}) => {
  await page.goto("/curriculos");
  await page.getByRole("checkbox").first().check();
  await page.reload();
  await expect(page.getByRole("checkbox").first()).toBeChecked();
  await page
    .getByRole("button", { name: "Modo professor · editar exemplo" })
    .click();
  await page
    .getByLabel("Nome do currículo", { exact: true })
    .fill("Plano da escola");
  await page
    .getByRole("button", { name: "Adicionar graduação", exact: true })
    .click();
  const grade = page.locator(".grade-editor").last();
  await grade
    .getByLabel("Nome da graduação", { exact: true })
    .fill("Segunda etapa");
  await grade
    .getByRole("button", { name: "Adicionar conteúdo", exact: true })
    .click();
  await grade
    .getByLabel("Conteúdo", { exact: true })
    .fill("Revisão com o professor");
  await page
    .getByRole("button", { name: "Salvar rascunho local", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Plano da escola", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Segunda etapa", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Revisão com o professor", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path:
      "test-results/previews/sprint02-curriculum-" +
      (isMobile ? "mobile" : "desktop") +
      ".png",
    fullPage: true,
  });
});
