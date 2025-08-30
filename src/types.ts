
export interface BaseProduct {
  id: string;
  Name: string;
  Size: string;
  Shade: string;
  Brand?: string;
  'Product Type'?: string;
}

export interface EnrichedProduct extends BaseProduct {
  // All other fields are dynamic based on settings
  [key: string]: any;
  status: 'pending' | 'enriching' | 'enriched' | 'failed';
}

export interface NormalizationRule {
  id: string;
  from: string;
  to: string;
}

export interface AiInstruction {
  id: string;
  tag: string;
  label: string;
  instruction: string;
}

export interface AppSettings {
  normalizationRules: NormalizationRule[];
  aiInstructions: AiInstruction[];
  productFields: string[];
}

export interface HistoryBatch {
  id: string;
  date: string;
  totalProducts: number;
  enrichedCount: number;
  failedCount: number;
  products: EnrichedProduct[];
}

export type StandardizedValues = Record<string, string[]>;
