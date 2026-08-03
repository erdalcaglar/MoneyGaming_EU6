import { UnitDef } from "./types";

/**
 * Birim kataloğu — tek gerçek kaynak. Yeni birim eklemek için bu diziye
 * bir `UnitDef` eklemek yeterlidir.
 */
export const UNITS: UnitDef[] = [
  {
    type: "MILITIA",
    name: "Milis",
    description: "Ucuz, hızlı yetişen temel piyade.",
    trainedAt: "BARRACKS",
    requiresBuildingLevel: 1,
    cost: { gold: 30, food: 10 },
    trainSeconds: 20,
    attack: 4,
    defense: 3,
    populationCost: 1,
    colorKey: "militia",
  },
  {
    type: "SWORDSMAN",
    name: "Kılıçlı Savaşçı",
    description: "Dengeli saldırı/savunma değerlerine sahip piyade.",
    trainedAt: "BARRACKS",
    requiresBuildingLevel: 3,
    cost: { gold: 60, food: 20 },
    trainSeconds: 45,
    attack: 8,
    defense: 6,
    populationCost: 1,
    colorKey: "swordsman",
  },
  {
    type: "ARCHER",
    name: "Okçu",
    description: "Uzun menzilli, savunmadan çok saldırıda güçlü.",
    trainedAt: "ARCHERY_RANGE",
    requiresBuildingLevel: 1,
    cost: { gold: 55, wood: 25 },
    trainSeconds: 40,
    attack: 9,
    defense: 3,
    populationCost: 1,
    colorKey: "archer",
  },
  {
    type: "KNIGHT",
    name: "Şövalye",
    description: "Ağır süvari — yüksek saldırı, pahalı ve yavaş eğitilir.",
    trainedAt: "STABLE",
    requiresBuildingLevel: 1,
    cost: { gold: 140, food: 50 },
    trainSeconds: 90,
    attack: 18,
    defense: 10,
    populationCost: 2,
    colorKey: "knight",
  },
];

export function getUnitDef(type: string): UnitDef | undefined {
  return UNITS.find((u) => u.type === type);
}
