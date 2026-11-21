import { test, expect } from "@playwright/test";

test("Kyorugi apresenta famílias, contexto e fonte específica", async ({ page }) => {
  await page.goto("/kyorugi");
  await expect(page.getByRole("heading", { name: "Kyorugi: pratique e estude com fontes" })).toBeVisible();
  await expect(page.locator(".ky-families article")).toHaveCount(9);
  await expect(page.getByRole("heading", { name: "Combate combinado", exact: true })).toBeVisible();
  await expect(page.getByText("Matchwo Gyeorugi", {exact: false})).toBeVisible();
  await expect(page.getByText("Não existem sequências de combate combinado aprovadas", {exact:false})).toBeVisible();
  await expect(page.getByRole("link", {name:"Ler fonte Kukkiwon: Chagi"})).toHaveAttribute("href", /boardNo=1368/);
  await expect(page.locator('a[href="/atlas?region=feet&zoom=1"]')).toBeVisible();
  await expect(page.getByRole("heading", {name:"World Taekwondo"})).toBeVisible();
  await expect(page.getByRole("heading", {name:"CBTKD — Brasil"})).toBeVisible();
  await expect(page.locator('a[href*="fpetkd.org"]')).toHaveAttribute("target", "_blank");
});

test("navegação para Kyorugi e catálogo de Poomsae de Dan sem movimentos fictícios", async ({ page }) => {
  await page.goto("/");
  await page.locator('a[href="/kyorugi"]').first().click();
  await expect(page).toHaveURL(/\/kyorugi$/);
  await page.goto("/poomsae");
  await expect(page.getByRole("heading", {name:"Conheça os oito Taegeuk"})).toBeVisible();
  await expect(page.getByRole("heading", {name:"Conheça as formas de Koryo a Ilyeo"})).toBeVisible();
  const dan=page.getByRole("region", {name:"Poomsae de graduação Dan"});
  await expect(dan.getByRole("link", {name:"Conferir nome e contexto na Kukkiwon"})).toHaveCount(9);
  await expect(dan.getByRole("heading", {name:"Koryo", exact:true})).toBeVisible();
  await expect(dan.getByRole("heading", {name:"Ilyeo", exact:true})).toBeVisible();
  await expect(page.getByText("As sequências detalhadas aparecerão após conferência das fontes e aprovação editorial de cada movimento.")).toBeVisible();
});

test("Palgwae permanece separado dos Taegeuk e Matchuo Kyorugi organiza intervalos da escola", async ({ page }) => {
  await page.goto("/biblioteca/palgwae");
  await expect(page.getByRole("complementary", { name: "Escopo histórico da coleção Palgwae" })).toBeVisible();
  await expect(page.locator(".library-results a")).toHaveCount(9);
  await page.getByRole("link", { name: "Palgwae 1 Jang", exact: true }).click();
  await expect(page.locator('main [lang="ko"]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Comparar com Taegeuk 1 Jang/ }).first()).toBeVisible();

  await page.goto("/biblioteca/matchuo-kyorugi");
  await expect(page.locator(".library-results a")).toHaveCount(6);
  const organizer = page.getByRole("region", { name: "Organizador de sequências da sua escola" });
  await organizer.getByRole("button", { name: "Preencher Sebon 1 a 5" }).click();
  await organizer.getByRole("button", { name: "Registrar intervalo no caderno" }).click();
  await expect(organizer.getByText("Sebon #1")).toBeVisible();
  await expect(organizer.getByText("Sebon #5")).toBeVisible();
  await organizer.getByRole("button", { name: "Em treino" }).first().click();
  await expect(organizer.getByRole("button", { name: "Revisado" }).first()).toBeVisible();
  await page.reload();
  await expect(organizer.getByRole("button", { name: "Revisado" }).first()).toBeVisible();
});

