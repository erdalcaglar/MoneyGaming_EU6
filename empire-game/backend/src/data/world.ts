/**
 * Dünya haritası NPC kamp/köy kademeleri. Mesafeye/oyuncu seviyesine
 * göre daha güçlü hedefler üretmek için kullanılır. Yeni bir kademe
 * eklemek için diziye bir `NpcTierDef` eklemek yeterlidir.
 */
export interface NpcTierDef {
  tier: number;
  name: string;
  /** Bu kademenin belirdiği minimum mesafe (başkentten kare uzaklık) */
  minDistance: number;
  garrison: { unitType: string; count: number }[];
  wallLevel: number;
  towerLevel: number;
  lootRange: { gold: [number, number]; food: [number, number]; wood: [number, number] };
  /** true ise kazanınca fethedilip oyuncunun imparatorluğuna eklenebilir */
  conquerable: boolean;
}

export const NPC_TIERS: NpcTierDef[] = [
  {
    tier: 1,
    name: "Haydut Kampı",
    minDistance: 0,
    garrison: [{ unitType: "MILITIA", count: 3 }],
    wallLevel: 0,
    towerLevel: 0,
    lootRange: { gold: [40, 120], food: [20, 60], wood: [20, 60] },
    conquerable: false,
  },
  {
    tier: 2,
    name: "Küçük Köy",
    minDistance: 4,
    garrison: [
      { unitType: "MILITIA", count: 5 },
      { unitType: "ARCHER", count: 2 },
    ],
    wallLevel: 1,
    towerLevel: 0,
    lootRange: { gold: [150, 350], food: [100, 250], wood: [100, 250] },
    conquerable: true,
  },
  {
    tier: 3,
    name: "Güçlendirilmiş Köy",
    minDistance: 9,
    garrison: [
      { unitType: "SWORDSMAN", count: 6 },
      { unitType: "ARCHER", count: 5 },
    ],
    wallLevel: 3,
    towerLevel: 2,
    lootRange: { gold: [400, 800], food: [250, 550], wood: [250, 550] },
    conquerable: true,
  },
  {
    tier: 4,
    name: "Baron Kalesi",
    minDistance: 16,
    garrison: [
      { unitType: "SWORDSMAN", count: 12 },
      { unitType: "ARCHER", count: 10 },
      { unitType: "KNIGHT", count: 4 },
    ],
    wallLevel: 5,
    towerLevel: 4,
    lootRange: { gold: [900, 1800], food: [600, 1200], wood: [600, 1200] },
    conquerable: true,
  },
  {
    tier: 5,
    name: "Kral Kalesi",
    minDistance: 25,
    garrison: [
      { unitType: "SWORDSMAN", count: 20 },
      { unitType: "ARCHER", count: 18 },
      { unitType: "KNIGHT", count: 10 },
    ],
    wallLevel: 8,
    towerLevel: 7,
    lootRange: { gold: [2000, 4000], food: [1400, 2600], wood: [1400, 2600] },
    conquerable: true,
  },
];

export function tierForDistance(distance: number): NpcTierDef {
  let chosen = NPC_TIERS[0];
  for (const tier of NPC_TIERS) {
    if (distance >= tier.minDistance) chosen = tier;
  }
  return chosen;
}

export const MAP_BOUNDS = { min: -60, max: 60 };
