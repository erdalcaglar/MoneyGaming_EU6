import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/errorHandler";
import { getLeaderboard } from "./service";

export const leaderboardRouter = Router();
leaderboardRouter.use(requireAuth);

const querySchema = z.object({ limit: z.coerce.number().int().min(1).max(200).default(50) });

leaderboardRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { limit } = querySchema.parse(req.query);
    const entries = await getLeaderboard(limit);
    res.json({ data: entries });
  })
);
