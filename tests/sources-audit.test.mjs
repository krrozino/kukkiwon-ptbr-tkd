import {readFileSync} from "node:fs";
import {describe,it,expect} from "vitest";
import {auditSourceInventory,validateSourceInventory} from "../scripts/sources-audit.mjs";

const fixture=JSON.parse(readFileSync(new URL("../content/research/source-registry-2026-11-06.json",import.meta.url),"utf8"));
const clone=()=>structuredClone(fixture);

describe("source registry: pesquisa sem publicação",()=>{
  it("aceita fontes reais e exige pesquisa estritamente offline",async()=>{
    const audit=await auditSourceInventory();
    expect(audit.count).toBe(8);
    expect(audit.publicImages).toBe(0);
    expect(audit.networkRequests).toBe(0);
    expect(audit.remoteWrites).toBe(0);
    expect(audit.byAuthority.official).toBeGreaterThanOrEqual(4);
  });
  it("nunca confunde imagens privadas com licenças de redistribuição",()=>{
    const data=clone();data.private_reference_images.publish_to_site=true;
    expect(()=>validateSourceInventory(data)).toThrow(/Imagens não podem compor o build público/);
  });
  it("recusa publicação automática das fontes",()=>{
    const data=clone();data.publish_to_site=true;
    expect(()=>validateSourceInventory(data)).toThrow(/não pode marcar publicação pública/);
  });
  it("recusa fonte sem política de direitos, duplicidade e host inesperado",()=>{
    const noRights=clone();noRights.sources[0].rights="copy_licensed";
    expect(()=>validateSourceInventory(noRights)).toThrow(/Direitos insuficientes/);
    const duplicate=clone();duplicate.sources[1].id=duplicate.sources[0].id;
    expect(()=>validateSourceInventory(duplicate)).toThrow(/duplicada/);
    const hostile=clone();hostile.sources[0].url="https://malicioso.invalid/colecao";
    expect(()=>validateSourceInventory(hostile)).toThrow(/Domínio não autorizado/);
    const secret=clone();secret.sources[0].api_token="do-not-store";
    expect(()=>validateSourceInventory(secret)).toThrow(/Conteúdo indevido/);
  });
  it("recusa URLs de autenticação, HTTP sem TLS e locadores ausentes",()=>{
    const badAuth=clone();badAuth.sources[0].url="https://example:password@research.kukkiwon.or.kr/doc";
    expect(()=>validateSourceInventory(badAuth)).toThrow(/URL insegura/);
    const badProto=clone();badProto.sources[0].url="http://research.kukkiwon.or.kr/doc";
    expect(()=>validateSourceInventory(badProto)).toThrow(/URL insegura/);
    const noLocator=clone();noLocator.sources[0].locator_strategy="";
    expect(()=>validateSourceInventory(noLocator)).toThrow(/Localizador/);
  });
});
