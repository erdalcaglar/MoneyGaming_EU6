import { describe, expect, it } from "vitest";
import { computeProduction, getAttackPower, getDefensePower, getPopulationCap, getStorageCap } from "./service";

describe("computeProduction", () => {
  it("bina üretmiyor türünde ise kaynak eklemez", () => {
    const gain = computeProduction([{ type: "TOWN_HALL", level: 1, workersAssigned: 0 }], 1);
    expect(gain).toEqual({ gold: 0, food: 0, wood: 0 });
  });

  it("işçi atanmamışsa üretim olmaz", () => {
    const gain = computeProduction([{ type: "GOLD_MINE", level: 1, workersAssigned: 0 }], 5);
    expect(gain.gold).toBe(0);
  });

  it("geçen süre ve işçi sayısıyla orantılı altın üretir", () => {
    const gain = computeProduction([{ type: "GOLD_MINE", level: 1, workersAssigned: 2 }], 1);
    // seviye 1 GOLD_MINE effectValue = 20 altın/saat/işçi
    expect(gain.gold).toBeCloseTo(40, 5);
    expect(gain.food).toBe(0);
    expect(gain.wood).toBe(0);
  });

  it("süre sıfırsa üretim olmaz", () => {
    const gain = computeProduction([{ type: "FARM", level: 1, workersAssigned: 3 }], 0);
    expect(gain.food).toBe(0);
  });

  it("birden fazla üretim binasını birlikte hesaplar", () => {
    const gain = computeProduction(
      [
        { type: "GOLD_MINE", level: 1, workersAssigned: 1 },
        { type: "FARM", level: 1, workersAssigned: 1 },
        { type: "LUMBER_CAMP", level: 1, workersAssigned: 1 },
      ],
      2
    );
    expect(gain.gold).toBeGreaterThan(0);
    expect(gain.food).toBeGreaterThan(0);
    expect(gain.wood).toBeGreaterThan(0);
  });
});

describe("getPopulationCap", () => {
  it("bina yoksa taban değeri döner", () => {
    expect(getPopulationCap([])).toBe(10);
  });

  it("ev seviyesi arttıkça kapasite artar", () => {
    const capLevel1 = getPopulationCap([{ type: "HOUSE", level: 1 } as any]);
    const capLevel3 = getPopulationCap([{ type: "HOUSE", level: 3 } as any]);
    expect(capLevel3).toBeGreaterThan(capLevel1);
    expect(capLevel1).toBeGreaterThan(10);
  });
});

describe("getStorageCap", () => {
  it("bina yoksa taban depo kapasitesi döner", () => {
    expect(getStorageCap([])).toBe(1000);
  });
});

describe("getDefensePower", () => {
  it("sur ve kule savunma gücü ekler", () => {
    const power = getDefensePower([{ type: "WALL", level: 1 } as any], []);
    expect(power).toBeGreaterThan(0);
  });

  it("garnizon birimleri savunma gücüne eklenir", () => {
    const noUnits = getDefensePower([], []);
    const withUnits = getDefensePower([], [{ type: "MILITIA", count: 10 } as any]);
    expect(withUnits).toBeGreaterThan(noUnits);
  });
});

describe("getAttackPower", () => {
  it("bilinmeyen birim tipini yok sayar", () => {
    expect(getAttackPower([{ type: "UNKNOWN", count: 5 }])).toBe(0);
  });

  it("birim sayısıyla orantılı saldırı gücü hesaplar", () => {
    const power5 = getAttackPower([{ type: "MILITIA", count: 5 }]);
    const power10 = getAttackPower([{ type: "MILITIA", count: 10 }]);
    expect(power10).toBe(power5 * 2);
    expect(power5).toBeGreaterThan(0);
  });
});
