
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


export const testApiKey = async (): Promise<{ ok: boolean; message: string }> => {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
        return { ok: false, message: 'VITE_API_KEY environment variable not set.' };
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
      The output MUST be a single, valid JSON object that adheres to the provided schema.

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


export const enrichProductWithGemini = async (product: BaseProduct, settings: AppSettings): Promise<Omit<EnrichedProduct, 'id' | 'status'>> => {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API Key is not configured. Set VITE_API_KEY in your environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildPrompt(product, settings);

    // Dynamically build the response schema from settings
    const properties = settings.productFields.reduce((acc, field) => {
        let description = "";
        if (field === 'Image' || field === 'Gallery') {
            description = "Leave this field empty. Do not source images.";
        } else if (field === 'Sources') {
            description = "List the URLs of the sources used, comma-separated.";
        }
        acc[field] = { type: Type.STRING, description };
        return acc;
    }, {} as Record<string, { type: Type, description?: string }>);

    const responseSchema = {
        type: Type.OBJECT,
        properties: properties,
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

        const jsonString = (response.text ?? '').trim();
        const enrichedData = JSON.parse(jsonString);
        
        // Ensure all keys from the schema are present, even if AI omits them
        const finalData = { ...product, ...enrichedData };
        settings.productFields.forEach(key => {
            if (!(key in finalData)) {
                (finalData as any)[key] = "N/A";
            }
        });

        return finalData as Omit<EnrichedProduct, 'id' | 'status'>;

    } catch (error: any) {
        console.error("Error enriching product with Gemini:", error);
        const message = parseGeminiError(error);
        throw new Error(message);
    }
};
