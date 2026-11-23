export type DimensionKey = "price" | "ingredients" | "benefits" | "reputation";

export type DimensionGroup = "价格与定位" | "成分与功效" | "体验与口碑";

export type ComparisonTone = "pink" | "sand" | "sage" | "blue";

export interface ProductProfile {
  name: string;
  brand: string;
  category: string;
  tone: ComparisonTone;
  currentPrice: string;
  regularPrice: string;
  promotion: string;
  positioning: string;
  audience: string;
  ingredients: string[];
  formula: string;
  benefits: string[];
  pros: string[];
  cons: string[];
  scenarios: string[];
  skinTypes: string[];
  praise: string[];
  complaints: string[];
  tags: string[];
}

export interface ComparisonRow {
  id: string;
  group: DimensionGroup;
  dimension: DimensionKey;
  label: string;
  a: string;
  b: string;
  different: boolean;
}

export interface SourceLink {
  title: string;
  url: string;
}

export interface PriceTrend {
  status: "近期低价" | "正常价" | "价格偏高";
  summary: string;
  checkedAt: string;
}

export interface ComparisonData {
  id: string;
  createdAt: string;
  mode: "live" | "demo";
  links: {
    a: string;
    b: string;
  };
  products: {
    a: ProductProfile;
    b: ProductProfile;
  };
  verdict: string;
  whoBuys: {
    a: string;
    b: string;
  };
  priceTrend: PriceTrend;
  rows: ComparisonRow[];
  sources: SourceLink[];
  disclaimer: string;
}

export interface HistoryEntry {
  id: string;
  createdAt: string;
  aName: string;
  bName: string;
  data: ComparisonData;
}
