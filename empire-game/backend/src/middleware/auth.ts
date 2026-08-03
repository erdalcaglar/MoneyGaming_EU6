import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt";
import { Errors } from "../lib/httpError";

export interface AuthedRequest extends Request {
  playerId?: string;
}

export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(Errors.unauthorized("Token gerekli"));
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyToken(token);
    req.playerId = payload.playerId;
    next();
  } catch {
    next(Errors.unauthorized("Geçersiz veya süresi dolmuş token"));
  }
}
