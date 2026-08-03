import { LevelDef } from "./types";

/**
 * Oyuncu seviye tablosu. `unlocksBuildings`/`unlocksUnits` sadece o
 * seviyede yeni açılan tipleri listeler (kümülatif olarak
 * `getUnlockedContent` ile toplanır). Yeni bir seviyeye yeni içerik
 * eklemek için ilgili satıra bir tip adı eklemek yeterlidir.
 */
export const LEVELS: LevelDef[] = [
  { level: 1, xpRequired: 0, unlocksBuildings: ["TOWN_HALL", "HOUSE", "GOLD_MINE", "FARM", "LUMBER_CAMP", "WAREHOUSE"], unlocksUnits: [], resourceCapBonus: 0 },
  { level: 2, xpRequired: 150, unlocksBuildings: ["WALL", "BARRACKS"], unlocksUnits: ["MILITIA"], resourceCapBonus: 200 },
  { level: 3, xpRequired: 400, unlocksBuildings: ["WATCH_TOWER"], unlocksUnits: [], resourceCapBonus: 200 },
  { level: 4, xpRequired: 800, unlocksBuildings: ["ARCHERY_RANGE"], unlocksUnits: ["ARCHER"], resourceCapBonus: 300 },
  { level: 5, xpRequired: 1400, unlocksBuildings: [], unlocksUnits: ["SWORDSMAN"], resourceCapBonus: 300 },
  { level: 6, xpRequired: 2200, unlocksBuildings: ["STABLE"], unlocksUnits: [], resourceCapBonus: 400 },
  { level: 7, xpRequired: 3300, unlocksBuildings: [], unlocksUnits: ["KNIGHT"], resourceCapBonus: 400 },
  { level: 8, xpRequired: 4700, unlocksBuildings: [], unlocksUnits: [], resourceCapBonus: 500 },
  { level: 9, xpRequired: 6500, unlocksBuildings: [], unlocksUnits: [], resourceCapBonus: 500 },
  { level: 10, xpRequired: 8800, unlocksBuildings: [], unlocksUnits: [], resourceCapBonus: 600 },
  { level: 11, xpRequired: 11700, unlocksBuildings: [], unlocksUnits: [], resourceCapBonus: 600 },
  { level: 12, xpRequired: 15300, unlocksBuildings: [], unlocksUnits: [], resourceCapBonus: 700 },
  { level: 13, xpRequired: 19700, unlocksBuildings: [], unlocksUnits: [], resourceCapBonus: 700 },
  { level: 14, xpRequired: 25000, unlocksBuildings: [], unlocksUnits: [], resourceCapBonus: 800 },
  { level: 15, xpRequired: 31400, unlocksBuildings: [], unlocksUnits: [], resourceCapBonus: 800 },
];

export function getLevelDef(level: number): LevelDef {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[LEVELS.length - 1];
}

/** Verilen XP'ye göre oyuncunun bulunması gereken seviyeyi hesaplar. */
export function levelForXp(xp: number): number {
  let current = LEVELS[0].level;
  for (const def of LEVELS) {
    if (xp >= def.xpRequired) current = def.level;
    else break;
  }
  return current;
}

export function xpToNextLevel(xp: number): { next: LevelDef | null; remaining: number } {
  const currentLevel = levelForXp(xp);
  const next = LEVELS.find((l) => l.level === currentLevel + 1) ?? null;
  return { next, remaining: next ? Math.max(0, next.xpRequired - xp) : 0 };
}
