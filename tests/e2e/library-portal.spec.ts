import { expect, test } from '@playwright/test';

test('Biblioteca apresenta as sete áreas e busca termos existentes', async ({page}) => {
  await page.goto('/biblioteca');
  await expect(page.getByRole('heading',{name:'Biblioteca Geral do Taekwondo'})).toBeVisible();
  const categories=page.getByRole('navigation',{name:'Categorias da Biblioteca Geral'});
  for(const slug of ['poomsae','matchuo-kyorugi','palgwae','iron','kibon-dongjak','balkisul','sonkisul']){
    await expect(categories.locator('a[href="/biblioteca/'+slug+'"]')).toBeVisible();
  }
  const query=page.getByRole('searchbox',{name:'Buscar na biblioteca'});
  await query.fill('손날');
  await expect(page.getByRole('article').filter({hasText:'Sonnal'}).first()).toBeVisible();
  await query.fill('sem correspondência 7354');
  await expect(page.getByRole('heading',{name:'Nenhum item encontrado'})).toBeVisible();
});

test('terminologia da mão tem ficha com Hangul e link seguro para o Atlas', async ({page}) => {
  await page.goto('/biblioteca/sonkisul/sonnal');
  await expect(page.getByRole('heading',{name:/Borda externa da mão/}).first()).toBeVisible();
  await expect(page.locator('[lang="ko"]').filter({hasText:'손날'}).first()).toBeVisible();
  await expect(page.locator('a[href="/atlas?region=sonnal&zoom=1"]').first()).toBeVisible();
  await expect(page.getByRole('heading',{name:'Fontes e referências'})).toBeVisible();
});

test('categorias sem sequências documentadas continuam acessíveis sem inventar movimentos', async ({page}) => {
  await page.goto('/biblioteca/matchuo-kyorugi');
  await expect(page.getByRole('heading',{name:/Matchuo Kyorugi/}).first()).toBeVisible();
  await expect(page.getByRole('heading',{name:'Nenhum item encontrado'})).toBeVisible();
  await page.goto('/biblioteca/palgwae');
  await expect(page.getByRole('heading',{name:/Palgwae/}).first()).toBeVisible();
  await expect(page.locator('a[href*="/biblioteca/palgwae/palgwae-il-jang"]')).toHaveCount(0);
});

test('Taegeuk 1 não publica sequência parcial de 5 passos', async ({page}) => {
  await page.goto('/biblioteca/poomsae/taegeuk-il-jang');
  await expect(page.getByRole('heading',{name:/Taegeuk 1 Jang/}).first()).toBeVisible();
  await expect(page.getByRole('heading',{name:'Sequência de Movimentos'})).toHaveCount(0);
  await expect(page.getByRole('heading',{name:'Fontes e referências'})).toBeVisible();
});
