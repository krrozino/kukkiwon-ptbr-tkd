import { test, expect } from "@playwright/test";

test("tema do sistema é respeitado e pode ser alterado com botão acessível", async ({ page }) => {
  await page.emulateMedia({colorScheme: "dark"});
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const toggle = page.getByRole("button", { name: "Ativar tema claro" });
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Ativar tema escuro" })).toHaveAttribute("aria-pressed", "false");
});

test("preferência é mantida entre páginas e após recarregar", async ({ page }) => {
  await page.emulateMedia({colorScheme: "light"});
  await page.goto("/");
  await page.getByRole("button", { name: "Ativar tema escuro" }).click();
  await page.goto("/atlas");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => localStorage.getItem("taekwondo-theme"))).toBe("dark");
  expect(await page.locator("meta[name=theme-color]").getAttribute("content")).toBe("#111c29");
});

test("modo automático acompanha mudança de preferência quando não existe escolha salva", async ({ page }) => {
  await page.emulateMedia({colorScheme: "light"});
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({colorScheme: "dark"});
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("tema escuro mantém texto, cards e campos legíveis sem rolagem horizontal", async ({ page }) => {
  await page.setViewportSize({width: 375, height: 812});
  await page.emulateMedia({colorScheme: "dark"});
  await page.goto("/atlas");
  const read = await page.evaluate(() => ({
    body: getComputedStyle(document.body).color,
    background: getComputedStyle(document.body).backgroundColor,
    panel: getComputedStyle(document.querySelector(".card")!).backgroundColor,
    pageWidth: document.documentElement.scrollWidth,
    windowWidth: innerWidth,
  }));
  expect(read.body).toBe("rgb(233, 242, 245)");
  expect(read.background).toBe("rgb(17, 28, 41)");
  expect(read.panel).toBe("rgb(28, 44, 60)");
  expect(read.pageWidth).toBeLessThanOrEqual(read.windowWidth);
  await expect(page.getByRole("button", { name: "Ativar tema claro" })).toBeVisible();
});
