
// FIX: Import EnrichedProduct type to be used in ENRICHED_PRODUCT_COLUMNS.
import { AiInstruction, AppSettings, EnrichedProduct } from './types';

export const NAV_LINKS = [
  { name: 'Dashboard', path: '/' },
  { name: 'Upload New', path: '/upload' },
  { name: 'Enriched Listings History', path: '/history' },
  { name: 'Data Library', path: '/library' },
  { name: 'Settings', path: '/settings' },
];

export const DEFAULT_AI_INSTRUCTIONS: AiInstruction[] = [
    { id: 'KEY_INGREDIENTS_FORMAT', tag: '[KEY_INGREDIENTS_FORMAT]', label: 'Key Ingredients Format', instruction: '3-4 key items in bullet format with brief benefits. Example: • Ingredient Name – Brief benefit.' },
    { id: 'DETAILED_DESCRIPTION_FORMAT', tag: '[DETAILED_DESCRIPTION_FORMAT]', label: 'Detailed Description Format', instruction: '500-700 word engaging paragraph + 3-6 bullet Benefits & Effects. Include bundle list names info if applicable.' },
    { id: 'SHORT_DESCRIPTION_FORMAT', tag: '[SHORT_DESCRIPTION_FORMAT]', label: 'Short Description Format', instruction: '1-2 factual sentences. Must include the product type and/or features and/or uses.' },
    { id: 'FRAGRANCE_NOTES_FORMAT', tag: '[FRAGRANCE_NOTES_FORMAT]', label: 'Fragrance Notes Format', instruction: 'Top/Middle/Base/Fragrance Family for perfumes only, comma-separated, standardized spelling.' },
    { id: 'SOURCES_PRIORITY', tag: '[SOURCES_PRIORITY]', label: 'Sources Priority', instruction: 'Prioritize official brand websites (e.g., dior.com), then major retailers (Sephora.com, Ulta.com), then specialized databases (Fragrantica.com for perfumes).' },
    { id: 'INAPPLICABLE_DATA_HANDLER', tag: '[INAPPLICABLE_DATA_HANDLER]', label: 'Inapplicable Data Handler', instruction: 'Use "N/A" for fields that do not apply to the product (e.g., fragrance notes for a lipstick).' },
    { id: 'VARIATIONS_COMBINATION_LOGIC', tag: '[VARIATIONS_COMBINATION_LOGIC]', label: 'Variations Combination Logic', instruction: 'If multiple rows represent the same product with different shades or sizes, combine them into one. List the different values in their respective fields, separated by commas.' },
];


export const DEFAULT_SETTINGS: AppSettings = {
  // FIX: Removed geminiApiKey to enforce using environment variables per Gemini API guidelines.
  normalizationRules: [
    { id: '1', from: 'citrus note', to: 'Citrus' },
    { id: '2', from: 'citrus plant', to: 'Citrus' },
    { id: '3', from: 'woody note', to: 'Woody' },
    { id: '4', from: 'dry', to: 'Dry' },
    { id: '5', from: 'oily skin', to: 'Oily' },
  ],
  aiInstructions: DEFAULT_AI_INSTRUCTIONS,
};

// FIX: Narrow the type of column keys to string to prevent type errors with React keys and children.
export const ENRICHED_PRODUCT_COLUMNS: Extract<keyof Omit<EnrichedProduct, 'id' | 'status'>, string>[] = [
    'Name',
    'Size',
    'Shade',
    'Brand',
    'Product Type',
    'Product Category',
    'Short Description',
    'Detailed Description',
    'Key Ingredients',
    'How to Apply',
    'Top Notes',
    'Middle Notes',
    'Base Notes',
    'Fragrance Family',
    'Occasion',
    'Gender',
    'Intent of Use',
    'Finish',
    'Consistency',
    'Sun Protection',
    'Skin Type',
    'Skincare Concern',
    'What it Treats / Solves',
    'Image',
    'Gallery',
    'Sources',
];