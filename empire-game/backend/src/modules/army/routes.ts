import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AuthedRequest, requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/errorHandler";
import { Errors } from "../../lib/httpError";
import { getUnitDef } from "../../data";
import { ensureOwnership, getPopulationCap, getPopulationUsed, loadVillage, serializeVillage } from "../village/service";

export const armyRouter = Router();
armyRouter.use(requireAuth);

const trainSchema = z.object({
  unitType: z.string(),
  count: z.number().int().min(1).max(200),
});

armyRouter.post(
  "/:id/army/train",
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = trainSchema.parse(req.body);
    const village = await loadVillage(req.params.id);
    ensureOwnership(village, req.playerId!);

    const unitDef = getUnitDef(body.unitType);
    if (!unitDef) throw Errors.badRequest("Geçersiz birim tipi");

    const trainingBuilding = village.buildings.find((b) => b.type === unitDef.trainedAt);
    if (!trainingBuilding || trainingBuilding.level < unitDef.requiresBuildingLevel) {
      throw Errors.badRequest(`${unitDef.name} için ${unitDef.trainedAt} seviye ${unitDef.requiresBuildingLevel} gerekli`);
    }

    let unit = village.units.find((u) => u.type === body.unitType);
    if (unit && unit.trainingCount > 0) {
      throw Errors.conflict("Bu birim zaten eğitiliyor, tamamlanmasını bekle");
    }

    const populationCap = getPopulationCap(village.buildings);
    const currentUsed = getPopulationUsed(village.buildings, village.units);
    if (currentUsed + body.count * unitDef.populationCost > populationCap) {
      throw Errors.badRequest("Nüfus kapasitesi yetersiz");
    }

    const totalCost = {
      gold: (unitDef.cost.gold ?? 0) * body.count,
      food: (unitDef.cost.food ?? 0) * body.count,
      wood: (unitDef.cost.wood ?? 0) * body.count,
    };
    if (totalCost.gold > village.gold || totalCost.food > village.food || totalCost.wood > village.wood) {
      throw Errors.badRequest("Yetersiz kaynak");
    }

    const now = new Date();
    const trainingEndsAt = new Date(now.getTime() + unitDef.trainSeconds * body.count * 1000);

    await prisma.$transaction([
      prisma.village.update({
        where: { id: village.id },
        data: {
          gold: village.gold - totalCost.gold,
          food: village.food - totalCost.food,
          wood: village.wood - totalCost.wood,
        },
      }),
      unit
        ? prisma.unit.update({
            where: { id: unit.id },
            data: { trainingCount: body.count, trainingEndsAt },
          })
        : prisma.unit.create({
            data: {
              villageId: village.id,
              type: body.unitType,
              count: 0,
              trainingCount: body.count,
              trainingEndsAt,
            },
          }),
    ]);

    const refreshed = await loadVillage(village.id);
    res.status(201).json({ data: serializeVillage(refreshed) });
  })
);

armyRouter.get(
  "/:id/army",
  asyncHandler(async (req: AuthedRequest, res) => {
    const village = await loadVillage(req.params.id);
    ensureOwnership(village, req.playerId!);
    res.json({ data: serializeVillage(village).units });
  })
);
