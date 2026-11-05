// Somente importado no build opt-in PUBLIC_CONTENT_REVIEW=true.
// Estes registros NÃO são publicados nem aprovados: existem como research/draft.
import firstBatch from "../../content/review/kukkiwon-2012-first20.json";
import expandedBatch from "../../content/review/kukkiwon-2012-expansion.json";
import sonnalBatch from "../../content/review/sprint02-sonnal-variants.json";
import type {
  BodyRegion,
  CatalogFacets,
  CatalogOptions,
  CatalogPage,
  RegionTerm,
  TechnicalTerm,
} from "./catalog-api";

type Link = {
  region_slug: string;
  relation_type: "surface" | "target" | "anatomy" | "movement";
  source_locator: string;
};
type ResearchRecord = {
  slug: string;
  category: string;
  romanization: string;
  hangul: string;
  translation_pt: string;
  definition_pt: string;
  editorial_status: string;
  source_locator: string;
  record_kind?: string;
  variant_of?: string;
  aliases?: Array<{ alias: string; alias_kind: string }>;
  anatomical_links?: Link[];
  atlas?: {
    area: string;
    view: "front" | "back" | "both";
    x: number | null;
    y: number | null;
  };
};
type Batch = {
  source: {
    institution: string;
    title: string;
    edition?: string;
    year: number;
    url: string;
  };
  records: ResearchRecord[];
};
type Entry = { term: ResearchRecord; source: Batch["source"] };

const batches: Batch[] = [
  firstBatch as unknown as Batch,
  expandedBatch as unknown as Batch,
  sonnalBatch as unknown as Batch,
];
const entries: Entry[] = batches.flatMap((b) =>
  b.records.map((term) => ({ term, source: b.source })),
);
const bySlug = new Map(entries.map((e) => [e.term.slug, e]));
if (
  entries.length !== 108 ||
  bySlug.size !== 108 ||
  entries.some((e) => e.term.editorial_status === "technical_reviewed")
) {
  throw new Error(
    "Pacote editorial inválido; a prévia não pode ser publicada.",
  );
}
const sortPt = (a: string, b: string) => a.localeCompare(b, "pt-BR");
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC")
    .toLowerCase()
    .replace(/[\s‐-–—_-]/g, "");
const asTerm = (entry: Entry): TechnicalTerm => ({
  id: entry.term.slug,
  slug: entry.term.slug,
  category: entry.term.category,
  romanization: entry.term.romanization,
  hangul: entry.term.hangul,
  translation_pt: entry.term.translation_pt,
  definition_pt: entry.term.definition_pt,
  pronunciation_pt: null,
  publication_status: "draft",
  record_kind:
    entry.term.record_kind ||
    (entry.term.category === "regiao-corporal" ? "surface" : "technique"),
  term_aliases: (entry.term.aliases || []).map((a) => ({
    alias: a.alias,
    alias_kind: a.alias_kind,
    is_official: false,
  })),
});
const regionRecords = entries.filter(
  (e) =>
    e.term.atlas ||
    (e.term.category === "regiao-corporal" &&
      ["batangson", "jumeok", "sonbadak", "sonnal", "sonnaldeung"].includes(
        e.term.slug,
      )),
);
const regions: BodyRegion[] = regionRecords.map(({ term }) => {
  const area = term.atlas?.area || "hands";
  return {
    id: term.slug,
    slug: term.slug,
    name_pt: term.translation_pt,
    region_group: ["arms", "legs"].includes(area) ? "torso" : area,
    atlas_area: area,
    detail_view: term.atlas?.view || null,
    detail_x: term.atlas?.x ?? null,
    detail_y: term.atlas?.y ?? null,
  };
});
const regionBySlug = new Map(regions.map((r) => [r.slug, r]));
function connections(term: ResearchRecord): Link[] {
  const links = [...(term.anatomical_links || [])];
  if (
    regionBySlug.has(term.slug) &&
    !links.some((link) => link.region_slug === term.slug)
  ) {
    links.push({
      region_slug: term.slug,
      relation_type: "surface",
      source_locator: term.source_locator,
    });
  }
  return links;
}
function hasRegion(term: ResearchRecord, slug: string) {
  return connections(term).some((link) => link.region_slug === slug);
}

export function previewCatalogPage(options: CatalogOptions = {}): CatalogPage {
  const {
    page = 1,
    pageSize = 24,
    query = "",
    category = "",
    region = "",
    family = "",
  } = options;
  const needle = normalize(query);
  const filtered = entries.filter(
    ({ term }) =>
      (!needle ||
        [
          term.romanization,
          term.hangul,
          term.translation_pt,
          ...(term.aliases || []).map((alias) => alias.alias),
        ].some((value) => normalize(value).includes(needle))) &&
      (!category || term.category === category) &&
      (!region || hasRegion(term, region)) &&
      (!family || term.variant_of === family),
  );
  const sorted = filtered.sort(
    (a, b) =>
      sortPt(a.term.romanization, b.term.romanization) ||
      sortPt(a.term.slug, b.term.slug),
  );
  const offset = (page - 1) * pageSize;
  return {
    items: sorted.slice(offset, offset + pageSize).map(asTerm),
    total: sorted.length,
  };
}
export function previewCatalogFacets(): CatalogFacets {
  return {
    categories: [...new Set(entries.map((e) => e.term.category))].sort(sortPt),
    regions: regions
      .map((r) => ({ slug: r.slug, name_pt: r.name_pt }))
      .sort((a, b) => sortPt(a.name_pt, b.name_pt)),
    families: entries
      .filter((e) => e.term.record_kind === "family")
      .map((e) => ({ slug: e.term.slug, romanization: e.term.romanization }))
      .sort((a, b) => sortPt(a.romanization, b.romanization)),
  };
}
export function previewRegions(area: string): BodyRegion[] {
  return regions
    .filter((r) => r.atlas_area === area)
    .sort((a, b) => sortPt(a.name_pt, b.name_pt));
}
export function previewRegion(slug: string): BodyRegion | null {
  return regionBySlug.get(slug) || null;
}
export function previewRegionTerms(slug: string): RegionTerm[] {
  const matched = entries.flatMap(({ term }) =>
    connections(term)
      .filter((link) => link.region_slug === slug)
      .map((link) => ({
        term_id: term.slug,
        usage_context: (link.relation_type === "anatomy"
          ? "other"
          : link.relation_type) as RegionTerm["usage_context"],
        anatomical_role: link.relation_type,
        technical_terms: {
          slug: term.slug,
          romanization: term.romanization,
          translation_pt: term.translation_pt,
        },
      })),
  );
  return matched.sort((a, b) =>
    sortPt(a.technical_terms!.romanization, b.technical_terms!.romanization),
  );
}
export function previewTermDetails(slug: string) {
  const found = bySlug.get(slug);
  if (!found) return null;
  const { term, source } = found;
  return {
    term: asTerm(found),
    sources: [
      {
        source_locator: term.source_locator,
        checked_at: null,
        content_sources: {
          institution: source.institution,
          title: source.title,
          edition: source.edition || null,
          publication_year: source.year,
          official_url: source.url,
        },
      },
    ],
    media: [] as Array<never>,
    regions: connections(term).map((link) => ({
      usage_context:
        link.relation_type === "anatomy" ? "other" : link.relation_type,
      body_regions: regionBySlug.get(link.region_slug) || null,
    })),
    relations: term.variant_of
      ? [
          {
            relation_kind: "variant_of",
            technical_terms: bySlug.has(term.variant_of)
              ? {
                  slug: term.variant_of,
                  romanization: bySlug.get(term.variant_of)!.term.romanization,
                }
              : null,
          },
        ]
      : [],
  };
}
export const previewCount = entries.length;
