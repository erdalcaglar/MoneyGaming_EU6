/**
 * Saf savaş çözümleme mantığı — DB'ye dokunmaz, birim testlerinde
 * doğrudan çağrılabilir. `docs/GAME_DESIGN.md` bölüm 5'teki formülün
 * uygulamasıdır.
 */
export interface BattleOutcome {
  win: boolean;
  ratio: number;
  /** Saldıran taraftaki asker kaybı oranı (0-1) */
  attackerLossRate: number;
  /** Savunan taraftaki asker kaybı oranı (0-1) */
  defenderLossRate: number;
  /** Kazanılırsa hedefin kaynaklarından yağmalanacak oran (0-1) */
  lootPercent: number;
  xpGained: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function resolveBattle(attackPower: number, defensePower: number): BattleOutcome {
  const safeDefense = Math.max(defensePower, 1);
  const ratio = attackPower / safeDefense;
  const win = ratio >= 1;

  const attackerLossRate = win ? clamp(0.4 / ratio, 0.05, 0.4) : clamp(0.4 + ratio * 0.3, 0.4, 0.9);
  const defenderLossRate = win ? clamp(0.5 + ratio * 0.1, 0.5, 0.95) : clamp(ratio * 0.25, 0.02, 0.3);
  const lootPercent = win ? clamp(0.15 + ratio * 0.1, 0.15, 0.5) : 0;
  const xpGained = win ? Math.round(20 + attackPower * 0.3) : Math.round(5 + attackPower * 0.05);

  return { win, ratio, attackerLossRate, defenderLossRate, lootPercent, xpGained };
}

/** Kesin zafer eşiği — fetih için gereken minimum güç oranı. */
export function isDecisiveVictory(outcome: BattleOutcome): boolean {
  return outcome.win && outcome.ratio >= 1.5;
}

export function applyLossRate(count: number, lossRate: number): number {
  return Math.max(0, count - Math.round(count * lossRate));
}
