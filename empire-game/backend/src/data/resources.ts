export interface ResourceDef {
  key: "gold" | "food" | "wood";
  name: string;
  colorKey: string;
}

export const RESOURCES: ResourceDef[] = [
  { key: "gold", name: "Altın", colorKey: "gold" },
  { key: "food", name: "Yiyecek", colorKey: "food" },
  { key: "wood", name: "Odun", colorKey: "wood" },
];
