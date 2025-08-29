import { GoogleGenAI, Type } from "@google/genai";
import { BaseProduct, AppSettings, EnrichedProduct } from '../types';

// Helper to parse complex error messages from the API
const parseGeminiError = (error: any): string => {
    let errorMessage = 'An unknown error occurred.';
    if (error.message) {
        try {
            // The actual error message from Gemini API is often a JSON string within the error object's message property.
            // Example: '... [429] ... {"error": {"code": 429, "message": "..."}}'
            const jsonStringMatch = error.message.match(/{.*}/);
            if (jsonStringMatch) {
                const errorJson = JSON.parse(jsonStringMatch[0]);
                errorMessage = errorJson.error?.message || error.message;
            } else {
                errorMessage = error.message;
            }
        } catch (e) {
            // Fallback if parsing fails
            errorMessage = error.message;
        }
    }
    return errorMessage;
};


// FIX: Update testApiKey to use process.env.API_KEY per Gemini API guidelines.
export const testApiKey = async (): Promise<{ ok: boolean; message: string }> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return { ok: false, message: 'API_KEY environment variable not set.' };
    }
    try {
        const ai = new GoogleGenAI({ apiKey });
        await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'hello',
            config: { thinkingConfig: { thinkingBudget: 0 } }
        });
        return { ok: true, message: 'API Key is valid.' };
    } catch (error: any) {
        console.error("Gemini API Key Test Failed:", error);
        // FIX: Parse the error to provide a cleaner, more specific message to the user.
        const message = parseGeminiError(error);
        return { ok: false, message };
    }
};

const buildPrompt = (product: BaseProduct, settings: AppSettings): string => {
    const instructions = settings.aiInstructions.reduce((acc, curr) => {
        acc[curr.tag] = curr.instruction;
        return acc;
    }, {} as Record<string, string>);

    return `
      You are an expert e-commerce data enricher for high-end beauty products.
      Your task is to find and provide detailed, accurate, and well-formatted information for the following product.

      Product Information:
      - Name: ${product.Name}
      - Brand: ${product.Brand || 'Not provided'}
      - Size: ${product.Size || 'Not provided'}
      - Shade: ${product.Shade || 'Not provided'}
      - Product Type: ${product['Product Type'] || 'Not provided'}

      Follow these instructions precisely:

      1.  **Data Sourcing:** Use trusted sources. ${instructions['[SOURCES_PRIORITY]']}
      2.  **Inapplicable Data:** For any field that does not apply to this product, you MUST return "${instructions['[INAPPLICABLE_DATA_HANDLER]']}".
      3.  **Field Formatting:**
          - **Key Ingredients:** ${instructions['[KEY_INGREDIENTS_FORMAT]']}
          - **Detailed Description:** ${instructions['[DETAILED_DESCRIPTION_FORMAT]']}
          - **Short Description:** ${instructions['[SHORT_DESCRIPTION_FORMAT]']}
          - **Fragrance Notes:** ${instructions['[FRAGRANCE_NOTES_FORMAT]']}
      4.  **Standardization:** For fields like 'Fragrance Family', 'Finish', 'Skin Type', etc., use standardized, commonly accepted industry terms.
      5.  **Output:** Provide the output ONLY in the requested JSON format. Do not add any extra text, commentary, or markdown.
      6.  **Source Logging:** In the "Sources" field, list the primary URL(s) you used to gather this information, separated by commas.
    `;
};


// FIX: Update enrichProductWithGemini to use process.env.API_KEY per Gemini API guidelines.
export const enrichProductWithGemini = async (product: BaseProduct, settings: AppSettings): Promise<Omit<EnrichedProduct, 'id' | 'status'>> => {
    if (!process.env.API_KEY) {
        throw new Error("Gemini API Key is not configured in environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = buildPrompt(product, settings);

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            'Name': { type: Type.STRING },
            'Size': { type: Type.STRING },
            'Shade': { type: Type.STRING },
            'Brand': { type: Type.STRING },
            'Top Notes': { type: Type.STRING },
            'Middle Notes': { type: Type.STRING },
            'Base Notes': { type: Type.STRING },
            'Fragrance Family': { type: Type.STRING },
            'Occasion': { type: Type.STRING },
            'Product Type': { type: Type.STRING },
            'Gender': { type: Type.STRING },
            'Intent of Use': { type: Type.STRING },
            'Finish': { type: Type.STRING },
            'Consistency': { type: Type.STRING },
            'Sun Protection': { type: Type.STRING },
            'How to Apply': { type: Type.STRING },
            'Skin Type': { type: Type.STRING },
            'Skincare Concern': { type: Type.STRING },
            'What it Treats / Solves': { type: Type.STRING },
            'Key Ingredients': { type: Type.STRING },
            'Product Category': { type: Type.STRING },
            'Short Description': { type: Type.STRING },
            'Detailed Description': { type: Type.STRING },
            'Image': { type: Type.STRING, description: "Leave this field empty. Do not source images." },
            'Gallery': { type: Type.STRING, description: "Leave this field empty. Do not source images." },
            'Sources': { type: Type.STRING, description: "List the URLs of the sources used, comma-separated." }
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            },
        });

        const jsonString = response.text.trim();
        const enrichedData = JSON.parse(jsonString);
        
        // Ensure all keys are present, even if AI omits them
        const finalData = { ...product, ...enrichedData };
        Object.keys(responseSchema.properties || {}).forEach(key => {
            if (!(key in finalData)) {
                (finalData as any)[key] = "N/A";
            }
        });

        return finalData as Omit<EnrichedProduct, 'id' | 'status'>;

    } catch (error: any) {
        console.error("Error enriching product with Gemini:", error);
        // FIX: Parse the error to propagate a cleaner, more specific message for better UI feedback.
        const message = parseGeminiError(error);
        throw new Error(message);
    }
};