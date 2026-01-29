import { GoogleGenAI, Modality, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export type MockupConfig = {
  prompt: string;
  brandKitPrompt?: string;
  shotRecipePrompt?: string;
  strictness: number; // 0-100
};

/**
 * Takes a simple user prompt and elevates it into a detailed, professional
 * photography prompt using the Creative Director AI persona.
 * @param config The mockup configuration.
 * @returns A detailed, professional prompt.
 */
const elevatePrompt = async (config: MockupConfig): Promise<string> => {
  const { prompt, brandKitPrompt, shotRecipePrompt, strictness } = config;

  // ADJUSTED GUIDANCE: Focus on style, not subject hallucination
  const strictnessGuidance = strictness > 75
    ? "STRICT MODE: Focus ONLY on lighting, composition, and background. Do NOT invent or describe specific food items unless the user explicitly names them. Refer to the subject generically as 'the food product'."
    : "CREATIVE MODE: You may enhance the description of the food to make it sound more appetizing, but ensure it aligns with the user's general intent.";

  const creativeDirectorSystemInstruction = `You are an expert creative director for food photography. Your goal is to write a Style & Composition Prompt for an AI that will process a user's uploaded image.

CRITICAL RULE: You generally DO NOT KNOW what distinct food is in the image. Do not guess "burger" or "steak" unless the user's prompt mentions it. Instead, describe the *scene*, the *lighting*, the *surface*, and the *mood*.

Your Inputs:
1. User Prompt: (e.g., "rustic wood", "diner view")
2. Brand Kit: (e.g., "Dark & Moody")
3. Shot Recipe: (e.g., "Menu Hero")

Your Output:
A single, rich paragraph describing the visual style, lighting, surface, and background.
- If the user prompt is empty/vague, describe a professional studio setup suitable for *any* food.
- Use the Brand Kit and Shot Recipe to inform the mood.
- ${strictnessGuidance}`;

  const userContext = `
[USER PROMPT]: "${prompt}"
[BRAND KIT]: "${brandKitPrompt || ''}"
[SHOT RECIPE]: "${shotRecipePrompt || ''}"
    `.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userContext,
      config: {
        systemInstruction: creativeDirectorSystemInstruction
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error elevating prompt:", error);
    return `${brandKitPrompt || ''} ${shotRecipePrompt || ''} ${prompt}`;
  }
}


export const generateFoodMockup = async (
  base64ImageData: string,
  mimeType: string,
  config: MockupConfig
): Promise<string> => {
  try {
    // 1. Get the Style/Environment description
    const environmentalPrompt = await elevatePrompt(config);

    // 2. Construct the Subject Preservation instruction based on strictness
    let subjectInstruction = "";
    if (config.strictness >= 80) {
      subjectInstruction = "CRITICAL: PRESERVE THE EXACT FOOD ITEM FROM THE SOURCE IMAGE. Do not change the food's shape, ingredients, or plating. Only change the background, lighting, and surface.";
    } else if (config.strictness >= 50) {
      subjectInstruction = "Keep the main food identity consistent. You may clean up minor imperfections but keep the core plating and ingredients recognizable.";
    } else {
      subjectInstruction = "You have creative freedom to reimagine the food presentation. You can adjust the plating and adding garnishes to match the style, but keep the core dish identity.";
    }

    // 3. The final prompt combines Subject Instruction + Style Description
    const fullPrompt = `Task: Generate a professional food photography mockup using the provided image as the reference.
    
    SUBJECT RULES:
    ${subjectInstruction}
    
    STYLE & ENVIRONMENT:
    ${environmentalPrompt}
    
    Output: Photorealistic, high-resolution, commercial food photography.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: fullPrompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    throw new Error("No image was generated. The response may have been blocked.");
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      if (error.message.includes('response was blocked')) {
        throw new Error("Image generation failed. Your prompt might violate safety policies. Please try a different prompt.");
      }
    }
    throw new Error("Failed to generate food mockup image.");
  }
};

/**
 * Uses Google Search grounding to find and suggest creative variations
 * for a given food photography prompt.
 * @param basePrompt The initial prompt from the user's selections.
 * @returns An array of three string suggestions.
 */
export const getCreativeVariations = async (basePrompt: string): Promise<string[]> => {
  const systemInstruction = `You are a creative director for a food photoshoot. Based on the user's initial idea, use Google Search to find 3 current, distinct, and trendy food photography concepts to suggest as alternatives. Return ONLY a valid JSON object with a single key "variations" which is an array of 3 strings. Each string is a concise, actionable prompt for an AI image generator. Do not include any other text, markdown, or JSON formatting backticks.

Example:
- User's idea: "a burger on a wooden table"
- Your JSON output:
{
  "variations": [
    "A deconstructed, messy-chic version of the burger with ingredients artfully scattered around it on crumpled butcher paper.",
    "A shot with a 'hard flash' photography style, creating sharp shadows and a trendy, high-contrast look.",
    "A vibrant, colorful scene with the burger surrounded by fresh, brightly colored ingredients like heirloom tomatoes and microgreens."
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `The user's initial idea is: "${basePrompt}"`,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    // FIX: Implement robust JSON extraction to handle conversational model responses.
    const responseText = response.text.trim();
    const jsonStartIndex = responseText.indexOf('{');
    const jsonEndIndex = responseText.lastIndexOf('}');

    if (jsonStartIndex === -1 || jsonEndIndex === -1 || jsonEndIndex < jsonStartIndex) {
      throw new Error("Valid JSON object not found in the model's response.");
    }

    const jsonString = responseText.substring(jsonStartIndex, jsonEndIndex + 1);

    const parsed = JSON.parse(jsonString);

    if (parsed.variations && Array.isArray(parsed.variations) && parsed.variations.length > 0) {
      return parsed.variations;
    }

    return [];
  } catch (error) {
    console.error("Error fetching creative variations:", error);
    throw new Error("Could not fetch creative variations.");
  }
};