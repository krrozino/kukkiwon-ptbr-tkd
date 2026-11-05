import { it, expect } from "vitest";
import {
  previewCatalogPage,
  previewTermDetails,
  previewRegions,
  previewRegionTerms,
} from "../src/lib/review-data";
it("a revisão reutiliza 105 rascunhos e três novos candidatos sem publicá-los", () => {
  const first = previewCatalogPage({ pageSize: 100 }),
    second = previewCatalogPage({ page: 2, pageSize: 100 });
  expect(first.total).toBe(108);
  expect(first.items.concat(second.items)).toHaveLength(108);
  expect(
    first.items
      .concat(second.items)
      .every((t) => t.publication_status === "draft"),
  ).toBe(true);
  expect(previewTermDetails("sonnal")?.sources[0].checked_at).toBeNull();
  expect(
    previewCatalogPage({ query: "앞차기" }).items.map((t) => t.slug),
  ).toContain("ap-chagi");
  expect(previewRegions("hands").some((r) => r.slug === "sonnal")).toBe(true);
  expect(
    previewRegionTerms("sonnal").some(
      (r) => r.technical_terms?.slug === "sonnal-an-makgi",
    ),
  ).toBe(true);
});
