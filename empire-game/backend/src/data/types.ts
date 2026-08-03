// Oyun içeriği için ortak tipler. Yeni bina/birim eklerken bu tiplere
// uyan bir kayıt eklemek yeterlidir — kod tarafında değişiklik gerekmez.

export type ResourceKey = "gold" | "food" | "wood";

export interface ResourceCost {
  gold?: number;
  food?: number;
  wood?: number;
}

export interface BuildingLevelDef {
  level: number;
  cost: ResourceCost;
  buildSeconds: number;
  /** Bu binanın türüne göre anlamı değişir: üretim/saat, nüfus kapasitesi, savunma bonusu, depo kapasitesi... */
  effectValue: number;
  requiresTownHallLevel: number;
}

export type BuildingCategory =
  | "HEADQUARTERS"
  | "HOUSING"
  | "PRODUCTION"
  | "STORAGE"
  | "DEFENSE"
  | "MILITARY";

export interface BuildingDef {
  type: string;
  name: string;
  description: string;
  category: BuildingCategory;
  /** Bu bina hangi kaynağı üretir (varsa) */
  producesResource?: ResourceKey;
  /** Bu bina bir işçi ile mi çalıştırılır (üretim binaları) */
  workable: boolean;
  maxWorkers: number;
  levels: BuildingLevelDef[];
  /** Placeholder görsel için renk anahtarı (theme.buildingColors ile eşleşir) */
  colorKey: string;
}

export interface UnitDef {
  type: string;
  name: string;
  description: string;
  trainedAt: string; // building type
  requiresBuildingLevel: number;
  cost: ResourceCost;
  trainSeconds: number;
  attack: number;
  defense: number;
  populationCost: number;
  colorKey: string;
}

export interface LevelDef {
  level: number;
  xpRequired: number;
  unlocksBuildings: string[];
  unlocksUnits: string[];
  resourceCapBonus: number;
}
