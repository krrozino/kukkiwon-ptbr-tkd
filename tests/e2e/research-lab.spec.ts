import { test, expect } from "@playwright/test";

test("o laboratório não habilita importação no pacote público", async ({ page }) => {
  await page.goto("/pesquisa-local");
  await expect(page.getByRole("status")).toContainText("Disponível apenas no desenvolvimento local");
  await expect(page.getByLabel("Arquivo JSON de pesquisa")).toHaveCount(0);
  await expect(page.getByText("Nenhum aprovado")).toHaveCount(0);
});