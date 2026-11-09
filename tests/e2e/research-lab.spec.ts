import { test, expect } from "@playwright/test";

test("o laboratório não habilita importação no pacote público", async ({ page }) => {
  await page.goto("/pesquisa-local");
  await expect(page.getByRole("status")).toContainText("Disponível apenas no desenvolvimento local");
  await expect(page.getByLabel("Arquivo JSON de pesquisa")).toHaveCount(0);
  await expect(page.getByText("Nenhum aprovado")).toHaveCount(0);
});

test("a consulta documental da mão não é distribuída no pacote público", async ({ page }) => {
  await page.goto('/atlas-mao-local');
  await expect(page.getByRole('status')).toContainText('Disponível apenas no desenvolvimento local');
  await expect(page.getByLabel('Buscar documentação da mão')).toHaveCount(0);
  await expect(page.locator('[data-evidence-key], [data-region-documentation]')).toHaveCount(0);
  await expect(page.locator('astro-island[component-url*="HandAtlasWorkbench"]')).toHaveCount(0);
  await expect(page.getByText('손날', { exact: true })).toHaveCount(0);
});
