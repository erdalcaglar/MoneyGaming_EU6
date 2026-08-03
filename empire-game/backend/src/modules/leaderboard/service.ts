import { prisma } from "../../lib/prisma";

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  level: number;
  xp: number;
  villageCount: number;
  score: number;
}

/**
 * "Zafer Puanı" — harcanamayan, sadece imparatorluk gücünü yansıtan
 * bir skor. Seviye, XP, sahip olunan köy sayısı (fetih bonusu) ve
 * toplam bina seviyesine göre hesaplanır.
 */
export async function getLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
  const players = await prisma.player.findMany({
    include: { villages: { include: { buildings: true } } },
  });

  const entries = players.map((p) => {
    const villageCount = p.villages.length;
    const buildingLevelSum = p.villages.reduce(
      (sum, v) => sum + v.buildings.reduce((s, b) => s + b.level, 0),
      0
    );
    const conquestBonus = Math.max(0, villageCount - 1) * 1000;
    const score = p.level * 1000 + p.xp + buildingLevelSum * 20 + conquestBonus;
    return {
      playerId: p.id,
      username: p.username,
      level: p.level,
      xp: p.xp,
      villageCount,
      score,
    };
  });

  return entries
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}
