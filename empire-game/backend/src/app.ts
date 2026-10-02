import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/routes";
import { villageRouter } from "./modules/village/routes";
import { armyRouter } from "./modules/army/routes";
import { worldRouter } from "./modules/world/routes";
import { battleRouter } from "./modules/battle/routes";
import { leaderboardRouter } from "./modules/leaderboard/routes";
import { catalogRouter } from "./modules/catalog/routes";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  const api = express.Router();
  api.use("/auth", authRouter);
  api.use("/villages", villageRouter);
  api.use("/villages", armyRouter);
  api.use("/battle", battleRouter);
  api.use("/world", worldRouter);
  api.use("/leaderboard", leaderboardRouter);
  api.use("/catalog", catalogRouter);
  app.use("/api/v1", api);

  app.use(errorHandler);
  return app;
}
