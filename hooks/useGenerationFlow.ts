import { useState, useCallback } from 'react';
import { generateFoodMockup, MockupConfig } from '../services/geminiService';
import { processImageForGemini } from '../utils/fileUtils';
import { stitchImages } from '../components/ui/ImageStitcher';
import { BRAND_KITS, SHOT_RECIPES } from '../constants/presets';
import { AppStatus } from '../types/app';

interface GenerationConfig {
    sourceFile: File | null;
    sourceUrl: string | null;
    perspective: string;
    plating: string;
    setting: string;
    instructions: string;
    selectedBrandKit: string;
    selectedShotRecipe: string;
    strictness: number;
    maskData: string | null;
    isInpaintingMode: boolean;
}

export function useGenerationFlow() {
    const [status, setStatus] = useState<AppStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
    const [stitchedUrl, setStitchedUrl] = useState<string | null>(null);
    const [isStitching, setIsStitching] = useState(false);

    const handleGenerate = useCallback(async (config: GenerationConfig) => {
        if (!config.sourceUrl) return;

        setStatus('generating');
        setError(null);

        try {
            let base64: string;
            let mimeType: string;

            if (config.sourceFile) {
                const processed = await processImageForGemini(config.sourceFile);
                base64 = processed.base64;
                mimeType = processed.mimeType;
            } else {
                const response = await fetch(config.sourceUrl);
                const blob = await response.blob();
                mimeType = blob.type;
                const reader = new FileReader();
                base64 = await new Promise((resolve) => {
                    reader.onloadend = () => {
                        const result = reader.result as string;
                        resolve(result.split(',')[1]);
                    };
                    reader.readAsDataURL(blob);
                });
            }

            const brandKit = BRAND_KITS.find(k => k.id === config.selectedBrandKit);
            const recipe = SHOT_RECIPES.find(r => r.id === config.selectedShotRecipe);

            const mockupConfig: MockupConfig = {
                prompt: [config.perspective, config.plating, config.setting, config.instructions].filter(Boolean).join(', '),
                brandKitPrompt: brandKit?.promptFragment,
                shotRecipePrompt: recipe?.promptFragment,
                strictness: config.strictness,
                maskImage: config.maskData || undefined,
                isInpaintingMode: config.isInpaintingMode,
                foodName: config.sourceFile?.name?.split('.')[0] || 'food'
            };

            const resultBase64 = await generateFoodMockup(base64, mimeType, mockupConfig);
            const resultUrl = `data:image/png;base64,${resultBase64}`;

            setGeneratedUrl(resultUrl);
            setStatus('success');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Generation failed');
            setStatus('error');
        }
    }, []);

    const handleStitch = useCallback(async (
        sourceUrls: string[],
        layout: 'horizontal' | 'vertical' | 'grid',
        spacing: number,
        config: Omit<GenerationConfig, 'sourceFile' | 'sourceUrl' | 'maskData' | 'isInpaintingMode'>
    ) => {
        setIsStitching(true);
        try {
            const rawStitchedUrl = await stitchImages(sourceUrls, layout, spacing);
            const [header, base64] = rawStitchedUrl.split(',');
            const mimeType = header.split(':')[1].split(';')[0];

            const brandKit = BRAND_KITS.find(k => k.id === config.selectedBrandKit);
            const recipe = SHOT_RECIPES.find(r => r.id === config.selectedShotRecipe);

            const mockupConfig: MockupConfig = {
                prompt: `Create a seamless, cohesive panoramic food photography shot blending these images together naturally. Remove the visible borders and create a single unified scene. ${[config.perspective, config.plating, config.setting, config.instructions].filter(Boolean).join(', ')}`,
                brandKitPrompt: brandKit?.promptFragment,
                shotRecipePrompt: recipe?.promptFragment,
                strictness: Math.max(config.strictness, 30),
                foodName: 'panoramic dish'
            };

            const aiResultBase64 = await generateFoodMockup(base64, mimeType, mockupConfig);
            const aiResultUrl = `data:image/png;base64,${aiResultBase64}`;

            setStitchedUrl(aiResultUrl);
            setGeneratedUrl(aiResultUrl);
            setStatus('success');
            return aiResultUrl;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'AI Stitch failed';
            setError(msg);
            setStatus('error');
            return '';
        } finally {
            setIsStitching(false);
        }
    }, []);

    const resetFlow = useCallback(() => {
        setGeneratedUrl(null);
        setStitchedUrl(null);
        setStatus('idle');
        setError(null);
    }, []);

    return {
        status, setStatus,
        error, setError,
        generatedUrl, setGeneratedUrl,
        stitchedUrl, setStitchedUrl,
        isStitching,
        handleGenerate,
        handleStitch,
        resetFlow
    };
}
