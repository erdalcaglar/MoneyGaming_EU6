import { describe, expect, it } from "vitest";
import { applyLossRate, isDecisiveVictory, resolveBattle } from "./combat";

describe("resolveBattle", () => {
  it("saldırı gücü savunmadan büyükse kazanır", () => {
    const outcome = resolveBattle(100, 50);
    expect(outcome.win).toBe(true);
    expect(outcome.ratio).toBe(2);
    expect(outcome.lootPercent).toBeGreaterThan(0);
  });

  it("saldırı gücü savunmadan küçükse kaybeder", () => {
    const outcome = resolveBattle(30, 100);
    expect(outcome.win).toBe(false);
    expect(outcome.lootPercent).toBe(0);
  });

  it("savunma gücü sıfır olsa bile bölme hatası oluşmaz", () => {
    const outcome = resolveBattle(50, 0);
    expect(outcome.win).toBe(true);
    expect(Number.isFinite(outcome.ratio)).toBe(true);
  });

  it("kazanınca saldıran daha az, kaybedince daha çok kayıp verir (aynı oran mertebesinde)", () => {
    const win = resolveBattle(100, 50); // ratio 2
    const loss = resolveBattle(50, 100); // ratio 0.5
    expect(win.attackerLossRate).toBeLessThan(loss.attackerLossRate);
  });

  it("ezici galibiyette savunan ağır kayıp verir", () => {
    const outcome = resolveBattle(1000, 10);
    expect(outcome.defenderLossRate).toBeGreaterThanOrEqual(0.9);
  });
});

describe("isDecisiveVictory", () => {
  it("oran 1.5 altındaysa kesin zafer sayılmaz", () => {
    expect(isDecisiveVictory(resolveBattle(120, 100))).toBe(false);
  });

  it("oran 1.5 ve üzerindeyse kesin zafer sayılır", () => {
    expect(isDecisiveVictory(resolveBattle(200, 100))).toBe(true);
  });

  it("kaybedilen savaş asla kesin zafer sayılmaz", () => {
    expect(isDecisiveVictory(resolveBattle(10, 1000))).toBe(false);
  });
});

describe("applyLossRate", () => {
  it("kayıp oranı 0 ise birim sayısı değişmez", () => {
    expect(applyLossRate(10, 0)).toBe(10);
  });

  it("kayıp oranı 1 ise tüm birimler kaybedilir", () => {
    expect(applyLossRate(10, 1)).toBe(0);
  });

  it("negatif sonuç üretmez", () => {
    expect(applyLossRate(0, 1)).toBe(0);
  });
});
