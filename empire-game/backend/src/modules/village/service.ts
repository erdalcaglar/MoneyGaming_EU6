import { Building, Unit, Village } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { getBuildingDef, getUnitDef, MAP_BOUNDS } from "../../data";
import { Errors } from "../../lib/httpError";

export const GRID_SIZE = 6;
export const POPULATION_BASE = 10;
export const STORAGE_BASE = 1000;

const STARTER_BUILDINGS: { type: string; slotX: number; slotY: number }[] = [
  { type: "TOWN_HALL", slotX: 2, slotY: 2 },
  { type: "HOUSE", slotX: 1, slotY: 2 },
  { type: "GOLD_MINE", slotX: 3, slotY: 2 },
  { type: "FARM", slotX: 2, slotY: 1 },
  { type: "LUMBER_CAMP", slotX: 2, slotY: 3 },
  { type: "WAREHOUSE", slotX: 1, slotY: 1 },
];

const STARTER_RESOURCES = { gold: 300, food: 200, wood: 200 };

export type VillageWithRelations = Village & { buildings: Building[]; units: Unit[] };

/** Boş (kullanılmayan) bir dünya koordinatı bulur; başkentten dışa doğru genişleyerek dener. */
export async function findFreeCoordinate(): Promise<{ x: number; y: number }> {
  for (let attempt = 0; attempt < 500; attempt++) {
    const radius = Math.min(MAP_BOUNDS.max, 3 + Math.floor(attempt / 10));
    const x = Math.floor(Math.random() * (radius * 2 + 1)) - radius;
    const y = Math.floor(Math.random() * (radius * 2 + 1)) - radius;
    const existing = await prisma.village.findUnique({ where: { x_y: { x, y } } });
    if (!existing) return { x, y };
  }
  throw Errors.conflict("Dünya haritasında boş yer bulunamadı, lütfen tekrar deneyin");
}

export async function createCapitalVillage(ownerId: string, villageName: string) {
  const { x, y } = await findFreeCoordinate();
  return prisma.village.create({
    data: {
      name: villageName,
      ownerId,
      isCapital: true,
      x,
      y,
      ...STARTER_RESOURCES,
      lastTick: new Date(),
      buildings: {
        create: STARTER_BUILDINGS.map((b) => ({ type: b.type, level: 1, slotX: b.slotX, slotY: b.slotY })),
      },
    },
    include: { buildings: true, units: true },
  });
}

export function getTownHallLevel(buildings: Building[]): number {
  return buildings.find((b) => b.type === "TOWN_HALL")?.level ?? 0;
}

export function getPopulationCap(buildings: Building[]): number {
  let cap = POPULATION_BASE;
  for (const b of buildings) {
    if (b.type !== "HOUSE") continue;
    const def = getBuildingDef("HOUSE");
    const levelDef = def?.levels.find((l) => l.level === b.level);
    if (levelDef) cap += levelDef.effectValue;
  }
  return Math.round(cap);
}

export function getPopulationUsed(buildings: Building[], units: Unit[]): number {
  const workers = buildings.reduce((sum, b) => sum + b.workersAssigned, 0);
  const army = units.reduce((sum, u) => {
    const def = getUnitDef(u.type);
    if (!def) return sum;
    return sum + (u.count + u.trainingCount) * def.populationCost;
  }, 0);
  return workers + army;
}

export function getStorageCap(buildings: Building[]): number {
  let cap = STORAGE_BASE;
  for (const b of buildings) {
    if (b.type !== "WAREHOUSE") continue;
    const def = getBuildingDef("WAREHOUSE");
    const levelDef = def?.levels.find((l) => l.level === b.level);
    if (levelDef) cap += levelDef.effectValue;
  }
  return Math.round(cap);
}

export function getDefensePower(buildings: Building[], units: Unit[]): number {
  let power = 0;
  for (const b of buildings) {
    if (b.type !== "WALL" && b.type !== "WATCH_TOWER") continue;
    const def = getBuildingDef(b.type);
    const levelDef = def?.levels.find((l) => l.level === b.level);
    if (levelDef) power += levelDef.effectValue;
  }
  for (const u of units) {
    const def = getUnitDef(u.type);
    if (def) power += u.count * def.defense;
  }
  return Math.round(power);
}

export function getAttackPower(units: { type: string; count: number }[]): number {
  return Math.round(
    units.reduce((sum, u) => {
      const def = getUnitDef(u.type);
      return sum + (def ? def.attack * u.count : 0);
    }, 0)
  );
}

/**
 * Son tick'ten bu yana geçen süreye göre kaynak üretimini hesaplayıp
 * kaynaklara ekler (depo tavanına kadar). Bina yükseltmesi/asker eğitimi
 * süresi dolmuşsa da tamamlar (lazy finalization — arkaplanda cron
 * gerektirmez).
 */
export interface WorkableBuildingLike {
  type: string;
  level: number;
  workersAssigned: number;
}

/**
 * Saf fonksiyon: verilen bina listesi ve geçen süreye göre üretilen
 * kaynak miktarını hesaplar. DB'ye dokunmaz, birim testlerinde
 * doğrudan çağrılabilir.
 */
export function computeProduction(
  buildings: WorkableBuildingLike[],
  elapsedHours: number
): { gold: number; food: number; wood: number } {
  const gain = { gold: 0, food: 0, wood: 0 };
  if (elapsedHours <= 0) return gain;
  for (const b of buildings) {
    if (b.workersAssigned <= 0) continue;
    const def = getBuildingDef(b.type);
    if (!def?.producesResource || !def.workable) continue;
    const levelDef = def.levels.find((l) => l.level === b.level);
    if (!levelDef) continue;
    const produced = levelDef.effectValue * b.workersAssigned * elapsedHours;
    gain[def.producesResource] += produced;
  }
  return gain;
}

export async function applyPendingProgress(village: VillageWithRelations): Promise<VillageWithRelations> {
  const now = new Date();
  const elapsedHours = Math.max(0, (now.getTime() - village.lastTick.getTime()) / 3_600_000);

  const storageCap = getStorageCap(village.buildings);
  const gain = computeProduction(village.buildings, elapsedHours);
  const gold = Math.min(storageCap, village.gold + gain.gold);
  const food = Math.min(storageCap, village.food + gain.food);
  const wood = Math.min(storageCap, village.wood + gain.wood);

  const buildingUpdates: { id: string; level: number }[] = [];
  for (const b of village.buildings) {
    if (b.upgradeEndsAt && b.upgradeEndsAt <= now) {
      buildingUpdates.push({ id: b.id, level: b.level + 1 });
    }
  }

  const unitUpdates: { id: string; count: number }[] = [];
  for (const u of village.units) {
    if (u.trainingEndsAt && u.trainingEndsAt <= now && u.trainingCount > 0) {
      unitUpdates.push({ id: u.id, count: u.count + u.trainingCount });
    }
  }

  await prisma.$transaction([
    prisma.village.update({
      where: { id: village.id },
      data: { gold, food, wood, lastTick: now },
    }),
    ...buildingUpdates.map((u) =>
      prisma.building.update({ where: { id: u.id }, data: { level: u.level, upgradeEndsAt: null } })
    ),
    ...unitUpdates.map((u) =>
      prisma.unit.update({ where: { id: u.id }, data: { count: u.count, trainingCount: 0, trainingEndsAt: null } })
    ),
  ]);

  const refreshed = await prisma.village.findUniqueOrThrow({
    where: { id: village.id },
    include: { buildings: true, units: true },
  });
  return refreshed;
}

export async function loadVillage(villageId: string): Promise<VillageWithRelations> {
  const village = await prisma.village.findUnique({
    where: { id: villageId },
    include: { buildings: true, units: true },
  });
  if (!village) throw Errors.notFound("Köy bulunamadı");
  return applyPendingProgress(village);
}

export function ensureOwnership(village: Village, playerId: string) {
  if (village.ownerId !== playerId) throw Errors.forbidden("Bu köy sana ait değil");
}

export function serializeVillage(village: VillageWithRelations) {
  const populationCap = getPopulationCap(village.buildings);
  const populationUsed = getPopulationUsed(village.buildings, village.units);
  const storageCap = getStorageCap(village.buildings);
  return {
    id: village.id,
    name: village.name,
    ownerId: village.ownerId,
    isCapital: village.isCapital,
    x: village.x,
    y: village.y,
    resources: { gold: village.gold, food: village.food, wood: village.wood },
    storageCap,
    population: { used: populationUsed, cap: populationCap },
    defensePower: getDefensePower(village.buildings, village.units),
    townHallLevel: getTownHallLevel(village.buildings),
    buildings: village.buildings.map((b) => ({
      id: b.id,
      type: b.type,
      level: b.level,
      workersAssigned: b.workersAssigned,
      slotX: b.slotX,
      slotY: b.slotY,
      upgradeEndsAt: b.upgradeEndsAt,
    })),
    units: village.units.map((u) => ({
      id: u.id,
      type: u.type,
      count: u.count,
      trainingCount: u.trainingCount,
      trainingEndsAt: u.trainingEndsAt,
    })),
  };
}
