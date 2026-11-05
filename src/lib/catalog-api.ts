export type TermAlias = {
  alias: string;
  alias_kind: string;
  is_official: boolean;
};
export type TechnicalTerm = {
  id: string;
  slug: string;
  category: string;
  hangul: string | null;
  romanization: string;
  translation_pt: string | null;
  pronunciation_pt: string | null;
  definition_pt: string | null;
  publication_status: "published" | "draft";
  record_kind?: string;
  pronunciation_status?: "unverified" | "provisional" | "verified";
  pronunciation_notes?: string | null;
  pronunciation_audio_url?: string | null;
  pronunciation_audio_kind?: "human" | "synthetic" | null;
  term_aliases?: TermAlias[];
};
export type TermSource = {
  source_locator: string;
  checked_at: string | null;
  content_sources: {
    institution: string;
    title: string;
    edition: string | null;
    publication_year: number | null;
    official_url: string;
  } | null;
};
export type TermMedia = {
  id: string;
  media_kind: "image" | "video" | "audio";
  media_url: string;
  caption_pt: string | null;
  creator?: string | null;
  license_name?: string | null;
  rights_evidence_url?: string | null;
};
export type BodyRegion = {
  id: string;
  slug: string;
  region_group: string;
  atlas_area: string;
  name_pt: string;
  detail_view: "front" | "back" | "both" | null;
  detail_x: number | null;
  detail_y: number | null;
};
export type RegionTerm = {
  term_id: string;
  usage_context: "surface" | "target" | "movement" | "other";
  anatomical_role: "surface" | "target" | "movement" | "anatomy" | null;
  technical_terms: {
    slug: string;
    romanization: string;
    translation_pt: string | null;
  } | null;
};
export type CatalogPage = { items: TechnicalTerm[]; total: number };
export type CatalogOptions = {
  query?: string;
  category?: string;
  region?: string;
  family?: string;
  page?: number;
  pageSize?: number;
};
export type CatalogFacets = {
  categories: string[];
  regions: { slug: string; name_pt: string }[];
  families: { slug: string; romanization: string }[];
};
type Configuration = { url: string; key: string };
const termFields =
  "id,slug,category,hangul,romanization,translation_pt,pronunciation_pt,definition_pt,publication_status,record_kind,term_aliases(alias,alias_kind,is_official)" +
  (import.meta.env.PUBLIC_SPRINT02_SCHEMA === "true"
    ? ",pronunciation_status,pronunciation_notes,pronunciation_audio_url,pronunciation_audio_kind"
    : "");
export const isReviewMode = import.meta.env.PUBLIC_CONTENT_REVIEW === "true";
const regionFields =
  "id,slug,region_group,atlas_area,name_pt,detail_view,detail_x,detail_y";
const validSlug = (s: string) =>
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s) && s.length <= 120;
const isObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const nullableText = (v: unknown) => v === null || typeof v === "string";
const namedSlug = (v: unknown, label: string) =>
  isObject(v) &&
  typeof v.slug === "string" &&
  validSlug(v.slug) &&
  typeof v[label] === "string";
function assertTerm(v: unknown): asserts v is TechnicalTerm {
  if (
    !isObject(v) ||
    v.publication_status !== "published" ||
    !["id", "slug", "category", "romanization"].every(
      (k) => typeof v[k] === "string",
    ) ||
    !validSlug(v.slug as string) ||
    !["hangul", "translation_pt", "pronunciation_pt", "definition_pt"].every(
      (k) => nullableText(v[k]),
    ) ||
    (v.term_aliases !== undefined &&
      (!Array.isArray(v.term_aliases) ||
        !v.term_aliases.every(
          (a) =>
            isObject(a) &&
            typeof a.alias === "string" &&
            typeof a.alias_kind === "string" &&
            typeof a.is_official === "boolean",
        )))
  ) {
    throw new Error("Resposta inválida do catálogo.");
  }
}
function assertRegion(v: unknown): asserts v is BodyRegion {
  if (
    !namedSlug(v, "name_pt") ||
    !isObject(v) ||
    typeof v.id !== "string" ||
    typeof v.region_group !== "string" ||
    !["hands", "feet", "head", "torso", "arms", "legs"].includes(
      v.atlas_area as string,
    ) ||
    ![null, "front", "back", "both"].includes(v.detail_view as null | string) ||
    !["detail_x", "detail_y"].every(
      (k) =>
        v[k] === null ||
        (typeof v[k] === "number" &&
          Number.isFinite(v[k]) &&
          v[k] >= 5 &&
          v[k] <= 98),
    )
  ) {
    throw new Error("Resposta inválida do atlas.");
  }
}
function configuration(): Configuration {
  return {
    url: import.meta.env.PUBLIC_SUPABASE_URL || "",
    key: import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
  };
}
export function createCatalogClient(config: Configuration) {
  let root: URL;
  try {
    root = new URL(config.url);
  } catch {
    throw new Error("Configuração pública do catálogo ausente.");
  }
  if (
    root.protocol !== "https:" ||
    root.username ||
    root.password ||
    root.search ||
    root.hash ||
    !root.hostname.endsWith(".supabase.co") ||
    !config.key ||
    config.key.includes("SUBSTITUA") ||
    config.key.startsWith("sb_secret_") ||
    root.hostname.includes("seu-projeto")
  ) {
    throw new Error("Configuração pública do catálogo inválida.");
  }
  if (!config.key.startsWith("sb_publishable_")) {
    try {
      const payload = JSON.parse(
        atob(config.key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      if (payload.role !== "anon") throw new Error();
    } catch {
      throw new Error("Use somente uma chave pública publishable/anon.");
    }
  }
  return {
    async request<T>(
      path: string,
      params: URLSearchParams,
      signal?: AbortSignal,
      body?: unknown,
    ): Promise<T> {
      const target = new URL("/rest/v1/" + path, root);
      target.search = params.toString();
      const response = await fetch(target.toString(), {
        method: body === undefined ? "GET" : "POST",
        headers: {
          apikey: config.key,
          Accept: "application/json",
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal,
        cache: "no-store",
      });
      if (!response.ok)
        throw new Error(
          "Não foi possível acessar o catálogo (" + response.status + ").",
        );
      return response.json() as Promise<T>;
    },
  };
}
export function isCatalogConfigured() {
  if (isReviewMode) return true;
  try {
    createCatalogClient(configuration());
    return true;
  } catch {
    return false;
  }
}
export function fetchPublic<T>(
  table: string,
  params: URLSearchParams,
  signal?: AbortSignal,
): Promise<T> {
  return createCatalogClient(configuration()).request<T>(table, params, signal);
}
async function allPages<T>(
  table: string,
  params: URLSearchParams,
  signal?: AbortSignal,
): Promise<T[]> {
  const rows: T[] = [];
  for (let offset = 0; ; offset += 100) {
    params.set("limit", "100");
    params.set("offset", String(offset));
    const page = await fetchPublic<T[]>(table, params, signal);
    if (!Array.isArray(page)) throw new Error("Resposta inválida do catálogo.");
    if (
      page.length &&
      offset &&
      JSON.stringify(page) === JSON.stringify(rows.slice(-page.length))
    )
      throw new Error("A API não respeitou a paginação.");
    rows.push(...page);
    if (page.length < 100) return rows;
  }
}
export async function fetchCatalogPage(
  options: CatalogOptions = {},
  signal?: AbortSignal,
): Promise<CatalogPage> {
  if (isReviewMode)
    return (await import("./review-data")).previewCatalogPage(options);
  const { page = 1, pageSize = 24 } = options;
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100 ||
    !Number.isSafeInteger((page - 1) * pageSize)
  )
    throw new Error("Página inválida.");
  if ((options.query?.length || 0) > 200)
    throw new Error("Busca limitada a 200 caracteres.");
  for (const value of [options.region, options.family])
    if (value && !validSlug(value)) throw new Error("Filtro inválido.");
  const result = await createCatalogClient(configuration()).request<unknown>(
    "rpc/search_catalog",
    new URLSearchParams(),
    signal,
    {
      search_query: options.query || "",
      category_filter: options.category || null,
      region_filter: options.region || null,
      family_filter: options.family || null,
      page_size: pageSize,
      page_offset: (page - 1) * pageSize,
    },
  );
  if (
    !isObject(result) ||
    !Array.isArray(result.items) ||
    !Number.isSafeInteger(result.total) ||
    (result.total as number) < 0 ||
    result.items.length > pageSize
  )
    throw new Error("Resposta inválida do catálogo.");
  result.items.forEach(assertTerm);
  return result as CatalogPage;
}
export async function fetchCatalogFacets(
  signal?: AbortSignal,
): Promise<CatalogFacets> {
  if (isReviewMode)
    return (await import("./review-data")).previewCatalogFacets();
  const result = await createCatalogClient(
    configuration(),
  ).request<CatalogFacets>(
    "rpc/catalog_facets",
    new URLSearchParams(),
    signal,
    {},
  );
  if (
    !result ||
    !Array.isArray(result.categories) ||
    !result.categories.every((v) => typeof v === "string") ||
    !Array.isArray(result.regions) ||
    !result.regions.every((v) => namedSlug(v, "name_pt")) ||
    !Array.isArray(result.families) ||
    !result.families.every((v) => namedSlug(v, "romanization"))
  )
    throw new Error("Resposta inválida dos filtros.");
  return result;
}
export async function fetchRegions(
  group: string,
  signal?: AbortSignal,
): Promise<BodyRegion[]> {
  if (isReviewMode)
    return (await import("./review-data")).previewRegions(group);
  if (!["hands", "feet", "head", "torso", "arms", "legs"].includes(group))
    throw new Error("Área inválida.");
  const regions = await allPages<BodyRegion>(
    "body_regions",
    new URLSearchParams({
      select: regionFields,
      atlas_area: "eq." + group,
      publication_status: "eq.published",
      order: "name_pt.asc,slug.asc",
    }),
    signal,
  );
  regions.forEach(assertRegion);
  return regions;
}
export async function fetchRegion(
  slug: string,
  signal?: AbortSignal,
): Promise<BodyRegion | null> {
  if (isReviewMode) return (await import("./review-data")).previewRegion(slug);
  if (!validSlug(slug)) return null;
  const result = await fetchPublic<BodyRegion[]>(
    "body_regions",
    new URLSearchParams({
      select: regionFields,
      slug: "eq." + slug,
      publication_status: "eq.published",
      limit: "1",
    }),
    signal,
  );
  if (!Array.isArray(result)) throw new Error("Resposta inválida do atlas.");
  result.forEach(assertRegion);
  return result[0] || null;
}
export async function fetchRegionTerms(regionId: string, signal?: AbortSignal) {
  if (isReviewMode)
    return (await import("./review-data")).previewRegionTerms(regionId);
  return allPages<RegionTerm>(
    "body_region_terms",
    new URLSearchParams({
      select:
        "term_id,usage_context,anatomical_role,technical_terms(slug,romanization,translation_pt)",
      region_id: "eq." + regionId,
      order: "term_id.asc,usage_context.asc",
    }),
    signal,
  );
}
export async function fetchTermDetails(slug: string, signal?: AbortSignal) {
  if (isReviewMode)
    return (await import("./review-data")).previewTermDetails(slug);
  if (!validSlug(slug)) return null;
  const records = await fetchPublic<TechnicalTerm[]>(
    "technical_terms",
    new URLSearchParams({
      select: termFields,
      publication_status: "eq.published",
      slug: "eq." + slug,
      limit: "1",
    }),
    signal,
  );
  if (!Array.isArray(records)) throw new Error("Resposta inválida da ficha.");
  if (!records.length) return null;
  const term = records[0];
  assertTerm(term);
  const [sources, media, regions, relations] = await Promise.all([
    allPages<TermSource>(
      "term_sources",
      new URLSearchParams({
        select:
          "source_locator,checked_at,content_sources(institution,title,edition,publication_year,official_url)",
        term_id: "eq." + term.id,
        order: "source_id.asc,source_locator.asc",
      }),
      signal,
    ),
    allPages<TermMedia>(
      "term_media",
      new URLSearchParams({
        select:
          "id,media_kind,media_url,caption_pt,creator,license_name,rights_evidence_url",
        term_id: "eq." + term.id,
        publication_status: "eq.published",
        order: "id.asc",
      }),
      signal,
    ),
    allPages<{ usage_context: string; body_regions: BodyRegion | null }>(
      "body_region_terms",
      new URLSearchParams({
        select: "usage_context,body_regions(" + regionFields + ")",
        term_id: "eq." + term.id,
        order: "region_id.asc,usage_context.asc",
      }),
      signal,
    ),
    allPages<{
      relation_kind: string;
      technical_terms: { slug: string; romanization: string } | null;
    }>(
      "term_relations",
      new URLSearchParams({
        select:
          "relation_kind,technical_terms!term_relations_related_term_id_fkey(slug,romanization)",
        term_id: "eq." + term.id,
        publication_status: "eq.published",
        order: "related_term_id.asc,relation_kind.asc",
      }),
      signal,
    ),
  ]);
  return { term, sources, media, regions, relations };
}
