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

test("seleção do atlas continua destacada no tema escuro", async ({ page }) => {
  await page.emulateMedia({colorScheme: "dark"});
  await page.goto("/atlas");
  const frente = page.getByRole("button", {name: "Vista anterior"});
  const costas = page.getByRole("button", {name: "Vista posterior"});
  await expect(frente).toHaveAttribute("aria-pressed", "true");
  const first = await frente.evaluate(el => getComputedStyle(el).backgroundColor);
  const unselected = await costas.evaluate(el => getComputedStyle(el).backgroundColor);
  expect(first).not.toBe(unselected);
  await costas.click();
  await expect(costas).toHaveAttribute("aria-pressed", "true");
  await expect(frente).toHaveAttribute("aria-pressed", "false");
  const after = await costas.evaluate(el => getComputedStyle(el).backgroundColor);
  expect(after).toBe(first);
});

test("categorias selecionadas e botões mantêm contraste WCAG AA e distinção visual nos dois temas (#79)", async ({ page }) => {
  await page.route("**/rest/v1/**", route => route.fulfill({ json: [] }));
  for (const theme of ["dark", "light"] as const) {
    await page.emulateMedia({ colorScheme: theme });
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/biblioteca/poomsae");
      const active = page.locator(".collection-nav a[aria-current='page']");
      const inactive = page.locator(".collection-nav a:not([aria-current='page'])").first();
      await expect(active).toHaveText("Poomsae");
      await expect(inactive).toBeVisible();

      const metrics = await page.evaluate(() => {
        function parse(str: string) {
          const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          return m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
        }
        function lum([r, g, b]: number[]) {
          const [rs, gs, bs] = [r, g, b].map(v => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }
        function ratio(el: Element) {
          const s = getComputedStyle(el);
          const l1 = lum(parse(s.color));
          const l2 = lum(parse(s.backgroundColor));
          return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        }
        const act = document.querySelector(".collection-nav a[aria-current='page']")!;
        const inact = document.querySelector(".collection-nav a:not([aria-current='page'])")!;
        const actStyle = getComputedStyle(act);
        const inactStyle = getComputedStyle(inact);
        return {
          activeContrast: ratio(act),
          inactiveContrast: ratio(inact),
          activeWeight: Number(actStyle.fontWeight),
          inactiveWeight: Number(inactStyle.fontWeight),
          activeDecoration: actStyle.textDecorationLine,
          inactiveDecoration: inactStyle.textDecorationLine,
        };
      });

      expect(metrics.activeContrast).toBeGreaterThanOrEqual(4.5);
      expect(metrics.inactiveContrast).toBeGreaterThanOrEqual(4.5);
      expect(metrics.activeWeight).toBeGreaterThan(metrics.inactiveWeight);
      expect(metrics.activeDecoration).toContain("underline");
      expect(metrics.inactiveDecoration).not.toContain("underline");

      await active.hover();
      const hoverContrast = await active.evaluate(el => {
        const parse = (str: string) => (str.match(/\d+/g) || [0, 0, 0]).slice(0, 3).map(Number);
        const lum = (rgb: number[]) => {
          const [r, g, b] = rgb.map(v => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        const s = getComputedStyle(el);
        const l1 = lum(parse(s.color));
        const l2 = lum(parse(s.backgroundColor));
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      });
      expect(hoverContrast).toBeGreaterThanOrEqual(4.5);
    }
  }
});
