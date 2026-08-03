import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/errorHandler";
import { getWorldMap } from "./service";

export const worldRouter = Router();
worldRouter.use(requireAuth);

const querySchema = z.object({
  x: z.coerce.number().int(),
  y: z.coerce.number().int(),
  radius: z.coerce.number().int().min(1).max(20).default(6),
});

worldRouter.get(
  "/map",
  asyncHandler(async (req, res) => {
    const query = querySchema.parse(req.query);
    const entries = await getWorldMap(query.x, query.y, query.radius);
    res.json({ data: entries });
  })
);
