import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { TermSource } from "../src/lib/catalog-api";
import AtlasSourceEvidence from "../src/components/atlas/AtlasSourceEvidence";

const official: TermSource = {
  checked_at: "2026-11-06T20:00:00Z",
  source_locator: "Applicable Parts of the Body, §2",
  content_sources: {
    institution: "Kukkiwon",
    title: "Taekwondo Technical Terminology",
    publication_year: 2012,
    edition: "2012",
    official_url: "https://research.kukkiwon.or.kr/homepage/boardMedia/11621",
  },
};
const view = (kind: "technical" | "illustrative", sources: TermSource[] = []) =>
  renderToStaticMarkup(createElement(AtlasSourceEvidence, { kind, sources }));

describe("atlas source attribution", () => {
  it("renders a checked primary source and its exact locator", () => {
    const html = view("technical", [official]);
    expect(html).toContain('href="https://research.kukkiwon.or.kr/homepage/boardMedia/11621"');
    expect(html).toContain("Applicable Parts of the Body, §2");
    expect(html).toContain("Taekwondo Technical Terminology");
    expect(html).toContain("Kukkiwon");
    expect(html).not.toContain("ainda não apresenta");
  });

  it("does not claim official endorsement for an illustrative region", () => {
    const html = view("illustrative", [official]);
    expect(html).toContain("Desenho esquemático do projeto");
    expect(html).toContain("não constitui nomenclatura oficial");
    expect(html).not.toContain("https://research.kukkiwon.or.kr/");
    expect(html).toContain('href="/fontes"');
  });

  it("silently suppresses unverified individual evidence in the visitor UI", () => {
    const html = view("technical", [{ ...official, checked_at: null }]);
    expect(html).toBe("");
    expect(html).not.toContain("Kukkiwon");
    expect(html).not.toContain("https://research.kukkiwon.or.kr");
  });

  it("rejects unsafe URLs even when the rest of the source looks checked", () => {
    const html = view("technical", [
      { ...official, content_sources: { ...official.content_sources!, official_url: "javascript:alert(1)" } },
    ]);
    expect(html).not.toContain('href="javascript:');
    expect(html).toBe("");
  });

  it("keeps two distinct sources for a multi-source record", () => {
    const second: TermSource = {
      ...official,
      source_locator: "Capítulo III, p. 14",
      content_sources: {
        institution: "Outra fonte",
        title: "Outro documento",
        publication_year: 2023,
        edition: "3",
        official_url: "https://example.org/source",
      },
    };
    const html = view("technical", [official, second]);
    expect(html).toContain("Applicable Parts of the Body, §2");
    expect(html).toContain("Capítulo III, p. 14");
    expect(html).toContain("https://example.org/source");
  });
});
