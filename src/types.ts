
export interface BaseProduct {
  id: string;
  Name: string;
  Size: string;
  Shade: string;
  Brand?: string;
  'Product Type'?: string;
}

export interface EnrichedProduct extends BaseProduct {
  'Top Notes': string;
  'Middle Notes': string;
  'Base Notes': string;
  'Fragrance Family': string;
  Occasion: string;
  Gender: string;
  'Intent of Use': string;
  Finish: string;
  Consistency: string;
  'Sun Protection': string;
  'How to Apply': string;
  'Skin Type': string;
  'Skincare Concern': string;
  'What it Treats / Solves': string;
  'Key Ingredients': string;
  'Product Category': string;
  'Short Description': string;
  'Detailed Description': string;
  Image: string;
  Gallery: string;
  Sources: string;
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
  // FIX: Removed geminiApiKey to enforce using environment variables per Gemini API guidelines.
  normalizationRules: NormalizationRule[];
  aiInstructions: AiInstruction[];
}