import { GoogleGenAI, Modality, Type } from "@google/genai";

let API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

// Logging utility
const log = {
  info: (msg: string, data?: any) => console.log(`[INFO] ${msg}`, data || ''),
  error: (msg: string, data?: any) => console.error(`[ERROR] ${msg}`, data || ''),
  warn: (msg: string, data?: any) => console.warn(`[WARN] ${msg}`, data || ''),
};

const getApiKey = () => {
  if (!API_KEY) {
    try {
      require('dotenv').config();
      API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;
    } catch { }
  }
  if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return API_KEY;
}

const getAi = () => {
  return new GoogleGenAI({ apiKey: getApiKey() });
}

export type QualityTier = 'draft' | 'standard' | 'franchise';

export interface MockupConfig {
  prompt: string;
  brandKitPrompt?: string;
  shotRecipePrompt?: string;
  strictness?: number; // 0-100
  maskImage?: string; // Base64 encoded mask
  isInpaintingMode?: boolean;
  foodName?: string;
  quality?: QualityTier;
  dishName?: string;
}

// Franchise-quality prompt template
const FRANCHISE_PROMPT_TEMPLATE = `
A photorealistic, ultra-high-resolution food photograph of {DISH_NAME}, styled for a national franchise restaurant campaign.

Shot Details:
- Camera: Canon EOS R5 or Hasselblad H6D, 100mm macro lens, f/2.8
- Lighting: Three-point studio lighting setup — soft key light from upper-left at 45°,
  fill light to eliminate harsh shadows, backlight to create rim glow and food depth
- Style: Commercial fast-casual franchise advertising photography —
  think McDonald's, Chick-fil-A, Shake Shack visual standards
- Plating: Perfect, intentional styling — sauces drizzled with precision,
  proteins stacked to show texture layers, fresh garnishes placed by a food stylist
- Background: Clean, minimal — neutral matte surface (slate, light wood grain,
  or brushed concrete), no distracting elements
- Color Grade: Warm and vibrant — rich golden browns, deep saturated greens,
  glossy sauces that catch the light
- Angle: Hero 3/4 angle shot (45° above) or straight overhead flat-lay depending on dish type
- Details: Visible steam wisps, glistening glaze, sesame seeds, fresh herbs,
  condensation on cold items — all the appetite-appeal micro-details
  a food stylist adds on set
- Quality Tags: photorealistic, 4K, commercial food photography,
  Michelin-level plating, clean image suitable for app/menu use

NO TEXT. NO LOGOS. NO WATERMARKS. NO TEXT OVERLAYS. NO BRANDING.
Pure food photography only - the image will be used in a food app.
`;

// Quality tier configurations
const QUALITY_CONFIGS: Record<QualityTier, {
  promptComplexity: string;
  steps?: number;
  guidanceScale?: number;
  description: string;
}> = {
  draft: {
    promptComplexity: "Quick draft - basic professional look, minimal details",
    description: "Fast generation for testing"
  },
  standard: {
    promptComplexity: "Standard professional quality with good lighting and plating",
    description: "Balanced quality and speed"
  },
  franchise: {
    promptComplexity: FRANCHISE_PROMPT_TEMPLATE,
    steps: 50,
    guidanceScale: 7.5,
    description: "National franchise campaign quality"
  }
};

/**
 * Build the quality-tier prompt based on configuration
 */
const buildQualityPrompt = (config: MockupConfig): string => {
  const { quality = 'standard', dishName = 'the dish', prompt } = config;
  const qualityConfig = QUALITY_CONFIGS[quality];

  if (quality === 'franchise') {
    // Use full franchise template with dish name injected
    return FRANCHISE_PROMPT_TEMPLATE.replace('{DISH_NAME}', dishName);
  } else if (quality === 'draft') {
    return `Professional food photography, clean background, good lighting, ${prompt || ' appetizing presentation'}`;
  } else {
    // Standard quality
    return `Professional food photography, three-point lighting, clean matte background, 
    professional food styling, vibrant colors, ${prompt || 'commercial quality'}`;
  }
};

/**
 * Takes a simple user prompt and elevates it into a detailed, professional
 * photography prompt using the Creative Director AI persona.
 */
const elevatePrompt = async (config: MockupConfig): Promise<string> => {
  const { prompt, brandKitPrompt, shotRecipePrompt, strictness, quality = 'standard' } = config;

  log.info('Elevating prompt', { quality, strictness });

  // Get quality-based prompt base
  const qualityPrompt = buildQualityPrompt(config);

  // ADJUSTED GUIDANCE: Focus on style, not subject hallucination
  const strictnessGuidance = strictness && strictness > 75
    ? "STRICT MODE: PRESERVE the exact food from the source image. Only change background, lighting, surface. Do NOT add/remove ingredients, change plating, or modify the dish."
    : strictness && strictness > 50
      ? "BALANCED MODE: Keep the food identity consistent. You may enhance lighting, clean up minor imperfections, but maintain core plating and ingredients."
      : "CREATIVE MODE: You have freedom to reimagine the presentation, add garnishes, adjust plating to match the style while keeping core dish recognizable.";

  const creativeDirectorSystemInstruction = `You are an expert creative director for food photography. Your goal is to write a Style & Composition Prompt for an AI that will process a user's uploaded image.

CRITICAL RULES:
1. You are transforming an EXISTING food image - preserve the main dish identity
2. Focus on LIGHTING, COMPOSITION, BACKGROUND, and SURFACE - not inventing new food
3. ${strictnessGuidance}

Your Output:
A single, rich paragraph describing the visual style, lighting, surface, and background.
- Use the quality tier to determine complexity: ${QUALITY_CONFIGS[quality].description}
- ${strictnessGuidance}
- Always prioritize appetizing, commercial-food-photography standards`;

  const userContext = `
[USER PROMPT]: "${prompt || 'professional food photography'}"
[BRAND KIT]: "${brandKitPrompt || ''}"
[SHOT RECIPE]: "${shotRecipePrompt || ''}"
[QUALITY TIER]: ${quality.toUpperCase()}
`.trim();

  try {
    log.info('Calling Gemini with elevated prompt');
    const response = await getAi().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userContext,
      config: {
        systemInstruction: creativeDirectorSystemInstruction
      }
    });

    const elevated = response.text.trim();
    log.info('Prompt elevated successfully');
    return elevated;
  } catch (error) {
    log.error('Error elevating prompt', error);
    return `${brandKitPrompt || ''} ${shotRecipePrompt || ''} ${prompt}`;
  }
}


// @ts-ignore
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3005';

/**
 * Frontend entry point for image generation.
 * Now calls the local backend and polls for completion (Phase 2).
 */
export const generateFoodMockup = async (
  base64ImageData: string,
  mimeType: string,
  config: MockupConfig
): Promise<string> => {
  log.info('Starting generation via backend API', { quality: config.quality });

  try {
    // 1. Kick off the job
    const body: any = {
      imageBase64: `data:${mimeType};base64,${base64ImageData}`,
      prompt: config.prompt,
      brandKitPrompt: config.brandKitPrompt,
      shotRecipePrompt: config.shotRecipePrompt,
      strictness: config.strictness,
      foodName: config.foodName,
      isInpaintingMode: config.isInpaintingMode,
      quality: config.quality,
      dishName: config.dishName,
    };

    if (config.isInpaintingMode && config.maskImage) {
      body.maskImage = config.maskImage;
    }

    const response = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to start generation job');
    }

    const { jobId } = await response.json();
    log.info('Job started', { jobId });

    // 2. Poll for results
    return await pollJobStatus(jobId);

  } catch (error) {
    log.error('Generation error', error);
    throw error;
  }
};

/**
 * Polls the backend for job status until completion
 */
async function pollJobStatus(jobId: string, maxAttempts = 60): Promise<string> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    const response = await fetch(`${API_URL}/api/jobs/${jobId}`);
    if (!response.ok) {
      throw new Error('Failed to check job status');
    }

    const job = await response.json();

    if (job.status === 'success') {
      log.info('Job completed successfully');
      // The backend returns the full data URL in result.image
      return job.result.image.split(',')[1]; // Return only the base64 part to match the original signature
    }

    if (job.status === 'error') {
      throw new Error(job.error || 'Generation failed');
    }

    // Still processing, wait 2 seconds
    log.info(`Job ${jobId} status: ${job.status} (Attempt ${attempts}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Generation timed out. Please try again.');
}

// Keep original logic for reference or internal backend use if needed
// In a real project, we'd move this to a separate file for the backend only.
export const generateFoodMockupOriginal = async (
  base64ImageData: string,
  mimeType: string,
  config: MockupConfig
): Promise<string> => {
  const { prompt, brandKitPrompt, shotRecipePrompt, strictness = 50, quality = 'standard' } = config;

  log.info('Starting internal generation', { quality, strictness, mimeType });

  try {
    // 1. Get the Style/Environment description
    const environmentalPrompt = await elevatePrompt(config);

    // 2. Construct the Subject Preservation instruction based on strictness
    let subjectInstruction = "";
    if (strictness >= 90) {
      subjectInstruction = "CRITICAL: PRESERVE THE EXACT FOOD ITEM FROM THE SOURCE IMAGE. Do not change the food's shape, ingredients, plating, or garnishes. Only change the background, lighting, and surface. The food should be IDENTICAL.";
    } else if (strictness >= 80) {
      subjectInstruction = "CRITICAL: PRESERVE THE EXACT FOOD ITEM FROM THE SOURCE IMAGE. Do not change the food's shape, ingredients, or plating. Only change the background, lighting, and surface.";
    } else if (strictness >= 60) {
      subjectInstruction = "Keep the main food identity consistent. You may clean up minor imperfections and enhance lighting but keep the core plating and ingredients recognizable.";
    } else {
      subjectInstruction = "You have creative freedom to reimagine the food presentation. You can adjust the plating and add garnishes to match the style, but keep the core dish identity.";
    }

    // 3. Build quality-specific instructions
    const qualityInstructions = quality === 'franchise'
      ? "FRANCHISE QUALITY: Apply professional food styling, commercial lighting, appetizing presentation. Think national QSR chain (McDonald's, Chick-fil-A, Shake Shack) standards."
      : quality === 'draft'
        ? "DRAFT QUALITY: Basic professional look, acceptable for testing/preview."
        : "STANDARD QUALITY: Good professional photography, proper lighting and composition.";

    // 4. The final prompt combines Subject Instruction + Style Description
    const fullPrompt = `Task: Generate a professional food photography mockup using the provided image as the reference.
    
    SUBJECT RULES:
    ${subjectInstruction}
    
    QUALITY TIER:
    ${qualityInstructions}
    
    STYLE & ENVIRONMENT:
    ${environmentalPrompt}
    
    Output: Photorealistic, high-resolution, commercial food photography suitable for ${quality === 'franchise' ? 'national franchise menu boards and advertising' : quality === 'draft' ? 'draft/preview purposes' : 'professional food marketing'}.`;

    log.info('Calling Gemini for image generation');

    const response = await getAi().models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
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
        log.info('Image generated successfully');
        return part.inlineData.data;
      }
    }

    throw new Error("No image was generated. The response may have been blocked.");
  } catch (error) {
    log.error('Error calling Gemini API', error);
    if (error instanceof Error) {
      if (error.message.includes('response was blocked')) {
        throw new Error("Image generation failed. Your prompt might violate safety policies. Please try a different prompt.");
      }
      if (error.message.includes('quota')) {
        throw new Error("API quota exceeded. Please try again later.");
      }
    }
    throw new Error("Failed to generate food mockup image.");
  }
};

/**
 * Uses Google Search grounding to find and suggest creative variations
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
    const response = await getAi().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The user's initial idea is: "${basePrompt}"`,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

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
    log.error('Error fetching creative variations', error);
    throw new Error("Could not fetch creative variations.");
  }
};

/**
 * Retry wrapper for generation with exponential backoff
 */
export const generateWithRetry = async (
  base64ImageData: string,
  mimeType: string,
  config: MockupConfig,
  maxRetries: number = 3
): Promise<string> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      log.info(`Generation attempt ${attempt}/${maxRetries}`);
      return await generateFoodMockup(base64ImageData, mimeType, config);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      log.warn(`Attempt ${attempt} failed:`, lastError.message);

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        log.info(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
};
