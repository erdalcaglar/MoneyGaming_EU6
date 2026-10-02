import { PrismaClient } from "@prisma/client";

// Tek örnek (singleton) — dev'de hot-reload sırasında bağlantı
// çoğalmasını önler.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
