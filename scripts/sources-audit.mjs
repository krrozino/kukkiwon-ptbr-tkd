/**
 * Inventário offline de fontes: valida somente metadados versionados.
 * Não faz HTTP, OCR, importação de técnicas, gravação no Supabase nem deploy.
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const sourceFile = new URL("../content/research/source-registry-2026-11-06.json", import.meta.url);
const allowedAuthorities = new Set(["official", "institutional_research", "third_party"]);
const allowedCategories = new Set(["technical_terminology", "techniques", "poomsae", "body_parts", "linguistic_glossary"]);
const allowedStrategies = new Set(["pdf_appendix_heading", "publication_attachment_page", "board_no_and_section", "board_no_and_page", "article_section", "heading_and_item_number", "heading_and_term"]);
const allowedReviewStates = new Set(["metadata_checked", "needs_review"]);
const allowedDomains = new Set(["research.kukkiwon.or.kr", "www.kukkiwon.or.kr", "kukkiwon.or.kr", "tkdhanra.com", "www.taekwondobrasil.com.br"]);

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const nonempty = value => typeof value === "string" && value.trim().length > 0;

export function validateSourceInventory(document) {
  assert(document !== null && typeof document === "object" && !Array.isArray(document), "Documento raiz inválido.");
  assert(document.schema_version === 1, "Versão de esquema não suportada.");
  assert(document.publish_to_site === false, "Inventário de pesquisa não pode marcar publicação pública.");
  assert(document.legal_policy === "link_and_metadata_only_until_permission_verified", "Política de direitos ausente.");
  assert(document.private_reference_images?.count === 6, "Esperadas seis imagens de referência no acervo privado.");
  assert(document.private_reference_images?.stored_separately === true &&
    document.private_reference_images?.publish_to_site === false, "Imagens não podem compor o build público.");
  assert(Array.isArray(document.sources) && document.sources.length > 0, "Inventário de fontes vazio.");
  const ids = new Set(), urls = new Set();
  const byAuthority = {};
  for (const source of document.sources) {
    assert(source && typeof source === "object" && !Array.isArray(source), "Fonte não é objeto.");
    assert(/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/.test(source.id), "ID de fonte inválido.");
    assert(!ids.has(source.id), "Fonte duplicada: " + source.id);
    ids.add(source.id);
    assert(nonempty(source.title) && nonempty(source.institution), "Instituição/título ausente: " + source.id);
    assert(allowedAuthorities.has(source.authority), "Autoridade inválida: " + source.id);
    assert(allowedCategories.has(source.category), "Categoria inválida: " + source.id);
    assert(allowedStrategies.has(source.locator_strategy), "Localizador não especificado: " + source.id);
    assert(allowedReviewStates.has(source.review_status), "Estado inválido: " + source.id);
    assert(source.rights === "link_and_metadata_only", "Direitos insuficientes: " + source.id);
    assert(source.retrieved_at === document.created_at, "Data de referência inconsistente: " + source.id);
    assert(source.year === null || (Number.isInteger(source.year) && source.year >= 1900 && source.year <= 2100), "Ano inválido: " + source.id);
    assert(nonempty(source.language) && nonempty(source.notes), "Idioma/notas ausentes: " + source.id);
    let target;
    try { target = new URL(source.url); } catch { throw new Error("URL inválida: " + source.id); }
    assert(target.protocol === "https:" && !target.username && !target.password && !target.hash, "URL insegura: " + source.id);
    assert(allowedDomains.has(target.hostname.toLowerCase()), "Domínio não autorizado: " + source.id);
    assert(!urls.has(target.href), "URL duplicada: " + source.id);
    urls.add(target.href);
    for (const dangerous of ["full_text", "page_html", "raw_document", "private_key", "api_token", "binary_image"])
      assert(!(dangerous in source), "Conteúdo indevido no inventário: " + source.id);
    byAuthority[source.authority] = (byAuthority[source.authority] || 0) + 1;
  }
  assert(ids.size === document.sources.length, "IDs não únicos.");
  return {count:ids.size, byAuthority, publicImages:0, networkRequests:0, remoteWrites:0};
}

export async function auditSourceInventory(file=sourceFile) {
  const content = await readFile(file, "utf8");
  return validateSourceInventory(JSON.parse(content));
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const invalid = process.argv.slice(2).filter(a => !["--offline", "--json", "--check"].includes(a));
  if (invalid.length) {
    console.error("Somente --offline, --check e --json são aceitos; este validador nunca acessa a rede.");
    process.exitCode = 2;
  } else {
    try {
      const summary = await auditSourceInventory();
      if (process.argv.includes("--json")) console.log(JSON.stringify({ok:true,...summary},null,2));
      else console.log(`PASS: ${summary.count} fontes catalogadas; somente metadados, nenhuma imagem pública, sem rede e sem escrita remota.`);
    } catch (error) {
      console.error("FAIL:", error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  }
}
