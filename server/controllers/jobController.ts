import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { jobDb, MockupJob } from '../services/supabaseService.js';
import { processGenerationInBackground } from '../services/generationService.js';
import { applyPreset, getPreset, BrandKit } from '../services/presetService.js';
import { MockupConfig, QualityTier } from '../../services/geminiService.js';
import { getImageFromRequest } from '../utils/requestUtils.js';

export const createGenerationJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const jobId = uuidv4();
        const {
            prompt, brandKitPrompt, brandKit, shotRecipePrompt, shotRecipe,
            strictness, perspective, setting, plating, instructions,
            preset, webhookUrl, quality = 'standard', dishName,
            isInpaintingMode, maskImage
        } = req.body;

        const image = await getImageFromRequest(req);
        if (!image) {
            res.status(400).json({ error: 'No image provided' });
            return;
        }

        let finalPerspective = perspective || '';
        let finalSetting = setting || '';
        let finalShotRecipePrompt = shotRecipePrompt || '';

        if (preset) {
            const pConfig = applyPreset(preset);
            finalPerspective = finalPerspective || pConfig.perspective;
            finalSetting = finalSetting || pConfig.setting;
            finalShotRecipePrompt = finalShotRecipePrompt || pConfig.shotRecipePrompt;
        }

        let finalBrandKitPrompt = brandKitPrompt || '';
        if (brandKit) {
            const kit = getPreset('brandKits', brandKit) as BrandKit;
            if (kit) finalBrandKitPrompt = finalBrandKitPrompt || kit.promptFragment;
        }

        const config: MockupConfig = {
            prompt: [finalPerspective, plating, finalSetting, instructions, prompt].filter(Boolean).join(', '),
            brandKitPrompt: finalBrandKitPrompt,
            shotRecipePrompt: finalShotRecipePrompt,
            strictness: strictness ? parseInt(strictness) : 50,
            quality: quality as QualityTier,
            dishName: dishName || 'the dish'
        };

        const newJob: MockupJob = {
            id: jobId,
            status: 'pending',
            config,
            is_inpainting_mode: !!isInpaintingMode
        };

        const savedJob = await jobDb.createJob(newJob);
        if (!savedJob) {
            res.status(500).json({ error: 'Failed to save job to database' });
            return;
        }

        // Process asynchronously without waiting
        processGenerationInBackground(jobId, image, config, webhookUrl, !!isInpaintingMode, maskImage);

        res.status(202).json({ success: true, jobId, pollUrl: `/api/jobs/${jobId}` });
    } catch (error) {
        next(error);
    }
};

export const getJobStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const job = await jobDb.getJob(req.params.id);
        if (!job) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }

        // Convert to legacy shape to not break the frontend right now
        const legacyShape = {
            id: job.id,
            status: job.status,
            config: job.config,
            result: job.result,
            error: job.error,
            isInpaintingMode: job.is_inpainting_mode,
            createdAt: job.created_at,
            updatedAt: job.updated_at
        };

        res.json(legacyShape);
    } catch (error) {
        next(error);
    }
};

export const createBatchVariants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const variants = Math.min(parseInt(req.body.variants) || 4, 10);
        const { quality = 'standard', strictness = '50', basePrompt, webhookUrl } = req.body;

        const image = await getImageFromRequest(req);
        if (!image) {
            res.status(400).json({ error: 'No image provided' });
            return;
        }

        const jobIds: string[] = [];

        // Create a job for each variant
        for (let i = 0; i < variants; i++) {
            const jobId = uuidv4();
            const config: MockupConfig = {
                prompt: basePrompt || 'professional food shot',
                strictness: parseInt(strictness),
                quality: quality as QualityTier,
                dishName: `Variant ${i + 1}`
            };

            const newJob: MockupJob = {
                id: jobId,
                status: 'pending',
                config,
                is_inpainting_mode: false
            };

            const saved = await jobDb.createJob(newJob);
            if (saved) {
                jobIds.push(jobId);
                // Start processing each variant independently in the background
                processGenerationInBackground(jobId, image, config, webhookUrl);
            }
        }

        if (jobIds.length === 0) {
            res.status(500).json({ error: 'Failed to create batch jobs' });
            return;
        }

        res.status(202).json({
            success: true,
            message: `Started ${jobIds.length} variants async`,
            jobIds
        });
    } catch (error) {
        next(error);
    }
};
