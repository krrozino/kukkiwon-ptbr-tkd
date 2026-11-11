import { test, expect } from '@playwright/test';

test('consulta todos os registros catalogados, filtra e abre fonte individual',async({page})=>{
  const backend:string[]=[];
  page.on('request',r=>{if(r.url().includes('supabase.co'))backend.push(r.url());});
  await page.goto('/acervo');
  await expect(page.getByRole('heading',{name:'Acervo de Técnicas',exact:true})).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('120 de 120 registros provisórios');
  await expect(page.getByRole('complementary',{name:'Apresentação do acervo'})).toContainText('Acervo referenciado');
  await page.getByRole('searchbox',{name:'Buscar no acervo'}).fill('Palgup-biteureo');
  await expect(page.getByRole('status')).toHaveText('1 de 120 registros provisórios');
  const entry=page.locator('#palgup-biteureo-kkeokgi');
  await expect(entry).toContainText('Região alvo:');
  await expect(entry).toContainText('PDF físico p. 43');
  await expect(entry.locator('a[href*="boardMedia/11621"]').first()).toHaveAttribute('rel','noopener noreferrer');
  await expect(entry).not.toContainText('Superfície usada:');
  await page.getByRole('button',{name:'Limpar filtros'}).click();
  await page.getByLabel('Região relacionada').selectOption('palgup');
  await expect(page.locator('#palgup-biteureo-kkeokgi')).toBeVisible();
  await expect(page.locator('#palgup-dollyeo-chigi')).toContainText('Superfície usada:');
  await page.getByRole('searchbox',{name:'Buscar no acervo'}).fill('zzzznaoexiste');
  await expect(page.getByText('Nenhum registro corresponde aos filtros.',{exact:false})).toBeVisible();
  expect(backend).toEqual([]);
});

test('relações reversas, teclado e layout escuro funcionam em desktop e celular',async({page})=>{
  await page.emulateMedia({colorScheme:'dark'});
  await page.goto('/acervo?regiao=palgup');
  await expect(page.getByLabel('Região relacionada')).toHaveValue('palgup');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.getByRole('searchbox',{name:'Buscar no acervo'}).fill('Palgup-biteureo');
  await expect(page.locator('#palgup-biteureo-kkeokgi')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('searchbox',{name:'Buscar no acervo'})).toHaveValue('Palgup-biteureo');
  await expect(page.locator('#palgup-biteureo-kkeokgi')).toBeVisible();
  const details=page.locator('#palgup-biteureo-kkeokgi summary');
  await details.focus();await page.keyboard.press('Enter');
  await expect(page.locator('#palgup-biteureo-kkeokgi details')).toHaveAttribute('open','');
  await expect(page.locator('#palgup-biteureo-kkeokgi details')).toContainText('Pronúncia em português');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
  await page.screenshot({path:'test-results/acervo-'+test.info().project.name+'.png',fullPage:true});
});

test('Voltar restaura os filtros depois de abrir uma âncora de ficha',async({page})=>{
  await page.goto('/acervo');
  await expect(page.getByRole('status')).toHaveText('120 de 120 registros provisórios');
  await page.locator('#ap-chagi h2 a').click();
  await expect(page).toHaveURL(/#ap-chagi$/);
  await page.getByRole('searchbox',{name:'Buscar no acervo'}).fill('Palgup-biteureo');
  await expect(page.getByRole('status')).toHaveText('1 de 120 registros provisórios');
  await page.goBack();
  await expect(page).toHaveURL(/\/acervo$/);
  await expect(page.getByRole('searchbox',{name:'Buscar no acervo'})).toHaveValue('');
  await expect(page.getByRole('status')).toHaveText('120 de 120 registros provisórios');
  await page.goForward();
  await expect(page.getByRole('searchbox',{name:'Buscar no acervo'})).toHaveValue('Palgup-biteureo');
  await expect(page.getByRole('status')).toHaveText('1 de 120 registros provisórios');
});
