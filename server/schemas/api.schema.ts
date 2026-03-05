import { z } from 'zod';

export const generateSchema = z.object({
    prompt: z.string().min(1, "Prompt is required"),
    brandKitPrompt: z.string().optional(),
    brandKit: z.string().optional(),
    shotRecipePrompt: z.string().optional(),
    shotRecipe: z.string().optional(),
    strictness: z.union([z.string(), z.number()]).optional().transform(val => val ? Number(val) : 50),
    perspective: z.string().optional(),
    setting: z.string().optional(),
    plating: z.string().optional(),
    instructions: z.string().optional(),
    preset: z.string().optional(),
    webhookUrl: z.string().url().optional(),
    quality: z.enum(['standard', 'hd']).optional().default('standard'),
    dishName: z.string().optional(),
    isInpaintingMode: z.union([z.boolean(), z.string().transform(v => v === 'true')]).optional(),
    maskImage: z.string().optional(),
    imageBase64: z.string().optional(),
    imageUrl: z.string().url().optional()
}).refine(data => data.imageBase64 || data.imageUrl || true, { // The image is usually passed in formData or buffer
    message: "Either image file, imageBase64, or imageUrl must be provided",
    path: ["image"]
});

export const batchVariantsSchema = z.object({
    basePrompt: z.string().min(1, "Base prompt is required"),
    variants: z.union([z.string(), z.number()]).optional().transform(val => Math.min(Number(val) || 4, 10)),
    quality: z.enum(['standard', 'hd']).optional().default('standard'),
    strictness: z.union([z.string(), z.number()]).optional().transform(val => val ? Number(val) : 50),
    webhookUrl: z.string().url().optional(),
    imageBase64: z.string().optional(),
    imageUrl: z.string().url().optional()
}).refine(data => data.imageBase64 || data.imageUrl || true, {
    message: "Either image file, imageBase64, or imageUrl must be provided",
    path: ["image"]
});
