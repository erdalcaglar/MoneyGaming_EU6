import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AuthedRequest, requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/errorHandler";
import { Errors } from "../../lib/httpError";
import { NPC_TIERS } from "../../data";
import {
  ensureOwnership,
  getAttackPower,
  getDefensePower,
  getStorageCap,
  loadVillage,
  serializeVillage,
} from "../village/service";
import { applyLossRate, isDecisiveVictory, resolveBattle } from "./combat";
import { levelForXp } from "../../data/leveling";

export const battleRouter = Router();
battleRouter.use(requireAuth);

const attackSchema = z.object({
  attackerVillageId: z.string(),
  targetVillageId: z.string(),
  units: z.record(z.string(), z.number().int().min(0)),
});

battleRouter.post(
  "/attack",
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = attackSchema.parse(req.body);
    if (body.attackerVillageId === body.targetVillageId) {
      throw Errors.badRequest("Kendi köyüne saldıramazsın");
    }

    const attacker = await loadVillage(body.attackerVillageId);
    ensureOwnership(attacker, req.playerId!);

    const target = await loadVillage(body.targetVillageId);
    if (target.ownerId === req.playerId) throw Errors.badRequest("Kendi köyüne saldıramazsın");

    const sentUnits = Object.entries(body.units).filter(([, count]) => count > 0);
    if (sentUnits.length === 0) throw Errors.badRequest("En az bir birim göndermelisin");

    for (const [type, count] of sentUnits) {
      const owned = attacker.units.find((u) => u.type === type)?.count ?? 0;
      if (count > owned) throw Errors.badRequest(`Yeterli ${type} yok`);
    }

    const attackPower = getAttackPower(sentUnits.map(([type, count]) => ({ type, count })));
    if (attackPower <= 0) throw Errors.badRequest("Gönderilen birimlerin saldırı gücü yok");
    const defensePower = getDefensePower(target.buildings, target.units);

    const outcome = resolveBattle(attackPower, defensePower);

    const targetTier = target.npcTier ? NPC_TIERS.find((t) => t.tier === target.npcTier) : undefined;
    const conquerable = target.isNpc && (targetTier?.conquerable ?? false);
    const conquered = outcome.win && isDecisiveVictory(outcome) && conquerable;

    const attackerStorageCap = getStorageCap(attacker.buildings);
    const lootGold = outcome.win ? Math.round(target.gold * outcome.lootPercent) : 0;
    const lootFood = outcome.win ? Math.round(target.food * outcome.lootPercent) : 0;
    const lootWood = outcome.win ? Math.round(target.wood * outcome.lootPercent) : 0;

    const attackerUnitUpdates = sentUnits.map(([type, sentCount]) => {
      const unit = attacker.units.find((u) => u.type === type)!;
      const surviving = applyLossRate(sentCount, outcome.attackerLossRate);
      return { id: unit.id, newCount: unit.count - sentCount + surviving };
    });

    const targetUnitUpdates = target.units.map((u) => ({
      id: u.id,
      newCount: applyLossRate(u.count, outcome.defenderLossRate),
    }));

    const player = await prisma.player.findUniqueOrThrow({ where: { id: req.playerId! } });
    const newXp = player.xp + outcome.xpGained;
    const newLevel = levelForXp(newXp);

    const ops: Prisma.PrismaPromise<unknown>[] = [
      prisma.village.update({
        where: { id: attacker.id },
        data: {
          gold: Math.min(attackerStorageCap, attacker.gold + lootGold),
          food: Math.min(attackerStorageCap, attacker.food + lootFood),
          wood: Math.min(attackerStorageCap, attacker.wood + lootWood),
        },
      }),
      prisma.village.update({
        where: { id: target.id },
        data: {
          gold: Math.max(0, target.gold - lootGold),
          food: Math.max(0, target.food - lootFood),
          wood: Math.max(0, target.wood - lootWood),
        },
      }),
      ...attackerUnitUpdates.map((u) =>
        prisma.unit.update({ where: { id: u.id }, data: { count: u.newCount } })
      ),
      ...targetUnitUpdates.map((u) =>
        prisma.unit.update({ where: { id: u.id }, data: { count: u.newCount } })
      ),
      prisma.player.update({ where: { id: player.id }, data: { xp: newXp, level: newLevel } }),
      prisma.battleLog.create({
        data: {
          attackerId: player.id,
          attackerVillageId: attacker.id,
          defenderVillageId: target.id,
          result: outcome.win ? "WIN" : "LOSS",
          lootGold,
          lootFood,
          lootWood,
          xpGained: outcome.xpGained,
          conquered,
        },
      }),
    ];

    if (conquered) {
      ops.push(
        prisma.village.update({
          where: { id: target.id },
          data: { ownerId: player.id, isNpc: false, npcTier: null },
        })
      );
      const hasTownHall = target.buildings.some((b) => b.type === "TOWN_HALL");
      if (!hasTownHall) {
        ops.push(
          prisma.building.create({
            data: { villageId: target.id, type: "TOWN_HALL", level: 1, slotX: 2, slotY: 2 },
          })
        );
      }
    }

    await prisma.$transaction(ops);

    const refreshedAttacker = await loadVillage(attacker.id);
    res.json({
      data: {
        result: outcome.win ? "WIN" : "LOSS",
        ratio: outcome.ratio,
        loot: { gold: lootGold, food: lootFood, wood: lootWood },
        xpGained: outcome.xpGained,
        conquered,
        newLevel,
        attackerVillage: serializeVillage(refreshedAttacker),
      },
    });
  })
);

battleRouter.get(
  "/log",
  asyncHandler(async (req: AuthedRequest, res) => {
    const logs = await prisma.battleLog.findMany({
      where: { attackerId: req.playerId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ data: logs });
  })
);
