import { describe, expect, it } from "vitest";
import { competitionReferences, martialFamilies, sparringSource } from "../src/data/kyorugi-guide";

describe("estudo do Kyorugi com proveniência", () => {
  it("liga as nove famílias do portal Kukkiwon a fonte individual distinta", () => {
    expect(martialFamilies).toHaveLength(9);
    expect(new Set(martialFamilies.map(f => f.boardNo)).size).toBe(9);
    expect(martialFamilies.every(f => Number.isSafeInteger(f.boardNo) && f.boardNo >= 1365 && f.boardNo <= 1373)).toBe(true);
    for (const family of martialFamilies) {
      expect(sparringSource(family.boardNo)).toBe(
        "https://www.kukkiwon.or.kr/eng/board/read?boardManagementNo=56&boardNo=" +
          family.boardNo + "&menuLevel=3&menuNo=73"
      );
      expect(family.name).toBeTruthy();
      expect(family.summary).toBeTruthy();
      expect(["hands", "feet", "head", "torso", "arms", "legs"]).toContain(family.atlas);
    }
  });

  it("diferencia regulamentos WT e CBTKD do catálogo marcial", () => {
    expect(competitionReferences.map(r => r.id)).toEqual(["wt", "cbtkd"]);
    expect(competitionReferences[0].source).toContain("taekwondo.dk");
    expect(competitionReferences[1].source).toContain("fpetkd.org");
    expect(competitionReferences[0].notice).toContain("2026");
    expect(competitionReferences[1].notice).toContain("2026");
  });
});
