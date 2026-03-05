import { GoogleGenAI, Modality } from '@google/genai';
import { MockupConfig, QualityTier } from '../../services/geminiService.js';
import { jobDb } from './supabaseService.js';

export const getAi = () => {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API_KEY environment variable is not set.");
    return new GoogleGenAI({ apiKey });
}

export const generateBackendImage = async (promptParts: any[]): Promise<string> => {
    const response = await getAi().models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
            parts: promptParts,
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
};

export const generateWithRetry = async (
    base64ImageData: string,
    mimeType: string,
    config: MockupConfig,
    maxRetries: number = 3,
    promptParts?: any[]
): Promise<string> => {
    let lastError: Error | null = null;
    const parts = promptParts || [
        { text: `You are a professional food photographer. Transform this photo into a premium mockup. STYLE: ${config.brandKitPrompt || 'commercial'} SETTING: ${config.shotRecipePrompt || 'studio'} INSTRUCTIONS: ${config.prompt}` },
        { inlineData: { data: base64ImageData, mimeType: mimeType } }
    ];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Generation attempt ${attempt}/${maxRetries}`);
            return await generateBackendImage(parts);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            console.warn(`Attempt ${attempt} failed:`, lastError.message);
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError || new Error("Max retries exceeded");
};

export const callWebhook = async (webhookUrl: string, data: any) => {
    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Webhook failed:', error);
    }
};

export const processGenerationInBackground = async (
    jobId: string,
    image: { base64: string; mimeType: string },
    config: MockupConfig,
    webhookUrl?: string,
    isInpaintingMode: boolean = false,
    maskImage?: string
) => {
    try {
        await jobDb.updateJob(jobId, { status: 'processing' });

        const promptParts: any[] = [
            { inlineData: { data: image.base64, mimeType: image.mimeType } }
        ];

        if (isInpaintingMode && maskImage) {
            const maskData = maskImage.includes(',') ? maskImage.split(',')[1] : maskImage;
            promptParts.push({ inlineData: { data: maskData, mimeType: 'image/png' } });

            const inpaintingPrompt = `INPAINTING MODE ACTIVE. Use the provided MASK to identify the area to modify in the SOURCE photo.
        TASK: ${config.prompt}
        STRICT REQUIREMENTS: Preserve pixels outside the mask, match lighting/shadows.`;
            promptParts.unshift({ text: inpaintingPrompt });
        } else {
            const systemPrompt = `You are a professional food photographer. Transform this photo into a premium mockup.
        STYLE: ${config.brandKitPrompt || 'commercial'}
        SETTING: ${config.shotRecipePrompt || 'studio'}
        INSTRUCTIONS: ${config.prompt}`;
            promptParts.unshift({ text: systemPrompt });
        }

        const resultBase64 = await generateWithRetry(image.base64, image.mimeType, config, 3, promptParts);

        // Upload generated image to Supabase Storage or just return Base64 based on existing logic
        // Returning huge base64 to DB/JSON might be heavy but consistent with existing logic.
        // Ideally, upload to Storage, but will keep as Base64 format for simplicity per current reqs
        const imageResult = `data:image/png;base64,${resultBase64}`;

        const resultObj = { success: true, image: imageResult, requestId: jobId };
        await jobDb.updateJob(jobId, {
            status: 'success',
            result: resultObj
        });

        if (webhookUrl) {
            callWebhook(webhookUrl, resultObj);
        }
    } catch (error) {
        console.error('Job Error:', error);
        await jobDb.updateJob(jobId, {
            status: 'error',
            error: error instanceof Error ? error.message : 'Generation failed'
        });
    }
};
