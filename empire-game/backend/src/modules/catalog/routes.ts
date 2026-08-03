import { Router } from "express";
import { BUILDINGS, LEVELS, RESOURCES, UNITS } from "../../data";

export const catalogRouter = Router();

// Herkese açık — kayıt olmadan önce bile istemci içerik kataloğunu
// gösterebilsin diye auth gerektirmez.
catalogRouter.get("/", (_req, res) => {
  res.json({ data: { resources: RESOURCES, buildings: BUILDINGS, units: UNITS, leveling: LEVELS } });
});
