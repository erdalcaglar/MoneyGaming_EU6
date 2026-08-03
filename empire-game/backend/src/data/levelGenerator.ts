import { BuildingLevelDef, ResourceCost } from "./types";

/**
 * Bina seviye tablolarını elle tek tek yazmak yerine üstel büyüme
 * formülüyle üretir. Yeni bir üst seviye eklemek istendiğinde
 * `maxLevel` değerini artırmak yeterlidir — maliyet/süre/etki otomatik
 * ölçeklenir. Dengeleme sonradan bu fonksiyonun parametrelerinden
 * yapılabilir.
 */
export function generateLevels(opts: {
  maxLevel: number;
  baseCost: ResourceCost;
  costGrowth: number;
  baseBuildSeconds: number;
  buildSecondsGrowth: number;
  baseEffect: number;
  effectGrowth: number;
  townHallGate: (level: number) => number;
}): BuildingLevelDef[] {
  const levels: BuildingLevelDef[] = [];
  for (let level = 1; level <= opts.maxLevel; level++) {
    const growth = Math.pow(opts.costGrowth, level - 1);
    const cost: ResourceCost = {};
    if (opts.baseCost.gold !== undefined) cost.gold = Math.round(opts.baseCost.gold * growth);
    if (opts.baseCost.food !== undefined) cost.food = Math.round(opts.baseCost.food * growth);
    if (opts.baseCost.wood !== undefined) cost.wood = Math.round(opts.baseCost.wood * growth);

    levels.push({
      level,
      cost,
      buildSeconds: Math.round(
        opts.baseBuildSeconds * Math.pow(opts.buildSecondsGrowth, level - 1)
      ),
      effectValue: Math.round(
        opts.baseEffect * Math.pow(opts.effectGrowth, level - 1) * 100
      ) / 100,
      requiresTownHallLevel: opts.townHallGate(level),
    });
  }
  return levels;
}
