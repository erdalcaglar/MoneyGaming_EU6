import { prisma } from "../../lib/prisma";
import { MAP_BOUNDS, NPC_TIERS, tierForDistance } from "../../data";
import { getDefensePower } from "../village/service";

const NPC_NAME_POOL = [
  "Karataş", "Yeşilova", "Akköy", "Demirkale", "Gümüşdere", "Kızılhan",
  "Ejderköy", "Kartaltepe", "Bozdağ", "Alaçam", "Yıldıztepe", "Kurtdere",
  "Tunçkale", "Sisdağ", "Baharköy", "Çelikhisar", "Aslanova", "Boratepe",
];

function chebyshevDistance(x: number, y: number): number {
  return Math.max(Math.abs(x), Math.abs(y));
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

/**
 * Dünya haritasını NPC kampları/köyleriyle doldurur. Sunucu ilk kez
 * ayağa kalktığında bir kere çalıştırılır (bkz. `prisma/seed.ts`).
 * Var olan koordinatları atlar, bu yüzden tekrar çalıştırmak güvenlidir.
 */
export async function seedNpcVillages(): Promise<number> {
  let created = 0;
  const step = 3;
  for (let x = MAP_BOUNDS.min; x <= MAP_BOUNDS.max; x += step) {
    for (let y = MAP_BOUNDS.min; y <= MAP_BOUNDS.max; y += step) {
      const distance = chebyshevDistance(x, y);
      if (distance < 2) continue; // oyuncu başkentlerine yakın alanı boş bırak
      const seed = x * 7919 + y * 104729;
      if (Math.abs(seed) % 5 === 0) continue; // haritayı tamamen doldurma, biraz seyrek olsun

      const existing = await prisma.village.findUnique({ where: { x_y: { x, y } } });
      if (existing) continue;

      const tier = tierForDistance(distance);
      const name = `${pick(NPC_NAME_POOL, seed)} ${tier.name}`;
      const midGold = (tier.lootRange.gold[0] + tier.lootRange.gold[1]) / 2;
      const midFood = (tier.lootRange.food[0] + tier.lootRange.food[1]) / 2;
      const midWood = (tier.lootRange.wood[0] + tier.lootRange.wood[1]) / 2;

      const buildings: { type: string; level: number; slotX: number; slotY: number }[] = [];
      if (tier.wallLevel > 0) buildings.push({ type: "WALL", level: tier.wallLevel, slotX: 0, slotY: 0 });
      if (tier.towerLevel > 0) buildings.push({ type: "WATCH_TOWER", level: tier.towerLevel, slotX: 1, slotY: 0 });

      await prisma.village.create({
        data: {
          name,
          x,
          y,
          gold: midGold,
          food: midFood,
          wood: midWood,
          isNpc: true,
          npcTier: tier.tier,
          buildings: { create: buildings },
          units: {
            create: tier.garrison.map((g) => ({ type: g.unitType, count: g.count })),
          },
        },
      });
      created++;
    }
  }
  return created;
}

export interface WorldMapEntry {
  id: string;
  name: string;
  x: number;
  y: number;
  distance: number;
  isNpc: boolean;
  ownerId: string | null;
  npcTier: number | null;
  conquerable: boolean;
  estimatedDefense: number;
}

export async function getWorldMap(centerX: number, centerY: number, radius: number): Promise<WorldMapEntry[]> {
  const villages = await prisma.village.findMany({
    where: {
      x: { gte: centerX - radius, lte: centerX + radius },
      y: { gte: centerY - radius, lte: centerY + radius },
    },
    include: { buildings: true, units: true },
  });

  return villages
    .map((v) => {
      const tier = v.npcTier ? NPC_TIERS.find((t) => t.tier === v.npcTier) : undefined;
      return {
        id: v.id,
        name: v.name,
        x: v.x,
        y: v.y,
        distance: chebyshevDistance(v.x - centerX, v.y - centerY),
        isNpc: v.isNpc,
        ownerId: v.ownerId,
        npcTier: v.npcTier,
        conquerable: v.isNpc ? tier?.conquerable ?? false : false,
        estimatedDefense: getDefensePower(v.buildings, v.units),
      };
    })
    .sort((a, b) => a.distance - b.distance);
}
