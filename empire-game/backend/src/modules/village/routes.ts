import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AuthedRequest, requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/errorHandler";
import { Errors } from "../../lib/httpError";
import { getBuildingDef } from "../../data";
import {
  GRID_SIZE,
  ensureOwnership,
  getPopulationCap,
  getPopulationUsed,
  getTownHallLevel,
  loadVillage,
  serializeVillage,
} from "./service";

export const villageRouter = Router();
villageRouter.use(requireAuth);

villageRouter.get(
  "/me",
  asyncHandler(async (req: AuthedRequest, res) => {
    const villages = await prisma.village.findMany({ where: { ownerId: req.playerId } });
    const full = await Promise.all(villages.map((v) => loadVillage(v.id)));
    res.json({ data: full.map(serializeVillage) });
  })
);

villageRouter.get(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const village = await loadVillage(req.params.id);
    if (village.ownerId) ensureOwnership(village, req.playerId!);
    res.json({ data: serializeVillage(village) });
  })
);

villageRouter.post(
  "/:id/collect",
  asyncHandler(async (req: AuthedRequest, res) => {
    const village = await loadVillage(req.params.id);
    ensureOwnership(village, req.playerId!);
    res.json({ data: serializeVillage(village) });
  })
);

const placeBuildingSchema = z.object({
  type: z.string(),
  slotX: z.number().int().min(0).max(GRID_SIZE - 1),
  slotY: z.number().int().min(0).max(GRID_SIZE - 1),
});

villageRouter.post(
  "/:id/buildings",
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = placeBuildingSchema.parse(req.body);
    const village = await loadVillage(req.params.id);
    ensureOwnership(village, req.playerId!);

    const def = getBuildingDef(body.type);
    if (!def) throw Errors.badRequest("Geçersiz bina tipi");
    const levelOneDef = def.levels.find((l) => l.level === 1);
    if (!levelOneDef) throw Errors.badRequest("Bina kataloğu hatalı");

    if (def.category === "HEADQUARTERS") {
      throw Errors.badRequest("Kale zaten mevcut, sadece yükseltilebilir");
    }

    const townHallLevel = getTownHallLevel(village.buildings);
    if (levelOneDef.requiresTownHallLevel > townHallLevel) {
      throw Errors.badRequest(`Bu bina için Kale seviye ${levelOneDef.requiresTownHallLevel} gerekli`);
    }

    const slotTaken = village.buildings.some((b) => b.slotX === body.slotX && b.slotY === body.slotY);
    if (slotTaken) throw Errors.conflict("Bu alan dolu");

    const cost = levelOneDef.cost;
    if (
      (cost.gold ?? 0) > village.gold ||
      (cost.food ?? 0) > village.food ||
      (cost.wood ?? 0) > village.wood
    ) {
      throw Errors.badRequest("Yetersiz kaynak");
    }

    const now = new Date();
    await prisma.$transaction([
      prisma.village.update({
        where: { id: village.id },
        data: {
          gold: village.gold - (cost.gold ?? 0),
          food: village.food - (cost.food ?? 0),
          wood: village.wood - (cost.wood ?? 0),
        },
      }),
      prisma.building.create({
        data: {
          villageId: village.id,
          type: body.type,
          // 0 = henüz inşaatı bitmemiş temel; zamanlayıcı dolunca
          // (applyPendingProgress) seviye 1'e yükselir. Bu sayede
          // yükseltme mantığıyla (level + 1) aynı kod yolunu paylaşır.
          level: 0,
          slotX: body.slotX,
          slotY: body.slotY,
          upgradeEndsAt: new Date(now.getTime() + levelOneDef.buildSeconds * 1000),
        },
      }),
    ]);

    const refreshed = await loadVillage(village.id);
    res.status(201).json({ data: serializeVillage(refreshed) });
  })
);

villageRouter.post(
  "/:id/buildings/:buildingId/upgrade",
  asyncHandler(async (req: AuthedRequest, res) => {
    const village = await loadVillage(req.params.id);
    ensureOwnership(village, req.playerId!);

    const building = village.buildings.find((b) => b.id === req.params.buildingId);
    if (!building) throw Errors.notFound("Bina bulunamadı");
    if (building.upgradeEndsAt) throw Errors.conflict("Bina zaten yükseltiliyor");

    const def = getBuildingDef(building.type);
    if (!def) throw Errors.badRequest("Bina kataloğu hatalı");
    const nextLevelDef = def.levels.find((l) => l.level === building.level + 1);
    if (!nextLevelDef) throw Errors.badRequest("Bu bina maksimum seviyede");

    const townHallLevel = getTownHallLevel(village.buildings);
    const effectiveTownHallLevel = building.type === "TOWN_HALL" ? Infinity : townHallLevel;
    if (nextLevelDef.requiresTownHallLevel > effectiveTownHallLevel) {
      throw Errors.badRequest(`Bu seviye için Kale seviye ${nextLevelDef.requiresTownHallLevel} gerekli`);
    }

    const cost = nextLevelDef.cost;
    if (
      (cost.gold ?? 0) > village.gold ||
      (cost.food ?? 0) > village.food ||
      (cost.wood ?? 0) > village.wood
    ) {
      throw Errors.badRequest("Yetersiz kaynak");
    }

    const now = new Date();
    await prisma.$transaction([
      prisma.village.update({
        where: { id: village.id },
        data: {
          gold: village.gold - (cost.gold ?? 0),
          food: village.food - (cost.food ?? 0),
          wood: village.wood - (cost.wood ?? 0),
        },
      }),
      prisma.building.update({
        where: { id: building.id },
        data: { upgradeEndsAt: new Date(now.getTime() + nextLevelDef.buildSeconds * 1000) },
      }),
    ]);

    const refreshed = await loadVillage(village.id);
    res.json({ data: serializeVillage(refreshed) });
  })
);

const workersSchema = z.object({ count: z.number().int().min(0) });

villageRouter.post(
  "/:id/buildings/:buildingId/workers",
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = workersSchema.parse(req.body);
    const village = await loadVillage(req.params.id);
    ensureOwnership(village, req.playerId!);

    const building = village.buildings.find((b) => b.id === req.params.buildingId);
    if (!building) throw Errors.notFound("Bina bulunamadı");

    const def = getBuildingDef(building.type);
    if (!def?.workable) throw Errors.badRequest("Bu binaya işçi atanamaz");
    if (body.count > def.maxWorkers) throw Errors.badRequest(`En fazla ${def.maxWorkers} işçi atanabilir`);

    const populationCap = getPopulationCap(village.buildings);
    const currentUsed = getPopulationUsed(village.buildings, village.units);
    const delta = body.count - building.workersAssigned;
    if (delta > 0 && currentUsed + delta > populationCap) {
      throw Errors.badRequest("Nüfus kapasitesi yetersiz");
    }

    await prisma.building.update({ where: { id: building.id }, data: { workersAssigned: body.count } });
    const refreshed = await loadVillage(village.id);
    res.json({ data: serializeVillage(refreshed) });
  })
);
