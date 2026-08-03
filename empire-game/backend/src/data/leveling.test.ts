import { describe, expect, it } from "vitest";
import { levelForXp, xpToNextLevel, LEVELS } from "./leveling";

describe("levelForXp", () => {
  it("0 xp ile seviye 1 döner", () => {
    expect(levelForXp(0)).toBe(1);
  });

  it("tam eşik xp'sinde bir üst seviyeye geçer", () => {
    const level2Threshold = LEVELS.find((l) => l.level === 2)!.xpRequired;
    expect(levelForXp(level2Threshold)).toBe(2);
    expect(levelForXp(level2Threshold - 1)).toBe(1);
  });

  it("tanımlı en yüksek seviyeyi asla aşmaz", () => {
    expect(levelForXp(10_000_000)).toBe(LEVELS[LEVELS.length - 1].level);
  });
});

describe("xpToNextLevel", () => {
  it("bir sonraki seviyeye kalan xp'yi doğru hesaplar", () => {
    const { next, remaining } = xpToNextLevel(0);
    expect(next?.level).toBe(2);
    expect(remaining).toBe(LEVELS.find((l) => l.level === 2)!.xpRequired);
  });

  it("son seviyedeyken sonraki seviye null döner", () => {
    const maxXp = LEVELS[LEVELS.length - 1].xpRequired;
    const { next, remaining } = xpToNextLevel(maxXp + 100000);
    expect(next).toBeNull();
    expect(remaining).toBe(0);
  });
});
