import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { signToken } from "../../lib/jwt";
import { Errors } from "../../lib/httpError";
import { asyncHandler } from "../../middleware/errorHandler";
import { AuthedRequest, requireAuth } from "../../middleware/auth";
import { createCapitalVillage } from "../village/service";

export const authRouter = Router();

const usernameSchema = z
  .string()
  .min(3, "Kullanıcı adı en az 3 karakter olmalı")
  .max(20, "Kullanıcı adı en fazla 20 karakter olmalı")
  .regex(/^[a-zA-Z0-9_]+$/, "Kullanıcı adı sadece harf, rakam ve _ içerebilir");

const registerSchema = z.object({
  username: usernameSchema,
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

function serializePlayer(player: { id: string; username: string; email: string; level: number; xp: number; createdAt: Date }) {
  return {
    id: player.id,
    username: player.username,
    email: player.email,
    level: player.level,
    xp: player.xp,
    createdAt: player.createdAt,
  };
}

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);

    const existing = await prisma.player.findFirst({
      where: { OR: [{ username: body.username }, { email: body.email }] },
    });
    if (existing) {
      throw Errors.conflict(
        existing.username === body.username
          ? "Bu kullanıcı adı zaten kullanılıyor"
          : "Bu e-posta zaten kayıtlı"
      );
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const player = await prisma.player.create({
      data: { username: body.username, email: body.email, passwordHash },
    });

    await createCapitalVillage(player.id, `${body.username} Köyü`);

    const token = signToken({ playerId: player.id });
    res.status(201).json({ data: { token, player: serializePlayer(player) } });
  })
);

const loginSchema = z.object({
  identifier: z.string().min(1, "Kullanıcı adı veya e-posta gerekli"),
  password: z.string().min(1, "Şifre gerekli"),
});

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const player = await prisma.player.findFirst({
      where: { OR: [{ username: body.identifier }, { email: body.identifier }] },
    });
    if (!player) throw Errors.unauthorized("Kullanıcı adı/e-posta veya şifre hatalı");

    const valid = await bcrypt.compare(body.password, player.passwordHash);
    if (!valid) throw Errors.unauthorized("Kullanıcı adı/e-posta veya şifre hatalı");

    const token = signToken({ playerId: player.id });
    res.json({ data: { token, player: serializePlayer(player) } });
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const player = await prisma.player.findUnique({ where: { id: req.playerId } });
    if (!player) throw Errors.notFound("Oyuncu bulunamadı");
    res.json({ data: serializePlayer(player) });
  })
);
