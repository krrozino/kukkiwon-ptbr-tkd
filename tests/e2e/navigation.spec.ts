import {test,expect} from '@playwright/test';

test('navegação cabe na largura física da tela e permite acessar escolas',async({page})=>{
  await page.goto('/');
  const viewport=page.viewportSize()!;
  // Mobile browsers can expand innerWidth to hide layout overflow.
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  await page.getByRole('link',{name:'Escolas',exact:true}).click();
  await expect(page.getByLabel('Email',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Entrar',exact:true})).toBeVisible();
});
