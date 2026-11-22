import {test,expect} from "@playwright/test";

test("entrada comunitária apresenta funcionalidades reais sem anúncios de versão beta",async({page})=>{
  await page.goto("/");
  await expect(page.getByRole("heading",{name:"Conhecer faz parte do caminho."})).toBeVisible();
  await expect(page.getByRole("link",{name:"Acessar área do professor"})).toBeVisible();
  await expect(page.getByText("Currículos personalizados e recursos didáticos serão uma etapa posterior.")).toHaveCount(0);
  await expect(page.getByText("Pesquisa em andamento.")).toHaveCount(0);
  await page.getByRole("link",{name:"Minha graduação",exact:true}).click();
  await expect(page.getByRole("heading",{name:/Cada caminho tem/})).toBeVisible();
  await expect(page.getByText("Este currículo é demonstrativo.")).toHaveCount(0);
  await expect(page.getByRole("link",{name:"Acessar painel da escola"})).toBeVisible();
});

test("currículo local vazio não apresenta exigências fictícias ao visitante",async({page})=>{
  await page.goto("/curriculos");
  await page.getByRole("button",{name:"Montar currículo neste navegador"}).click();
  await expect(page.getByLabel("Conteúdo",{exact:true})).toHaveCount(0);
  await expect(page.getByLabel("Nome da graduação",{exact:true})).toHaveValue("Primeira graduação");
  await expect(page.getByLabel("Nome do currículo",{exact:true})).toHaveValue("Currículo da escola");
});
