import { useState, useCallback } from 'react';
import { BRAND_KITS, SHOT_RECIPES } from '../constants/presets';

export const PERSPECTIVE_OPTIONS = [
    {
        label: 'The Menu Standard',
        value: 'Top-down flat lay photography, 90-degree angle directly overhead, centered composition, even soft lighting, no depth of field, sharp focus from edge to edge, isolated on surface.',
        description: 'Best for: Menu grids, printed menus, ingredients.'
    },
    {
        label: 'The Hero Shot',
        value: 'Straight-on eye-level view, 0-degree angle, camera placed at table height, showcasing vertical layers and height, shallow depth of field, blurry background (bokeh), heroic stature.',
        description: 'Best for: Burgers, sandwiches, stacked pancakes.'
    },
    {
        label: "The Diner's View",
        value: '45-degree isometric perspective, natural diner\'s point of view sitting at a table, medium depth of field, focus on the front face of the food, inviting and accessible composition.',
        description: 'Best for: General website headers, social media.'
    },
    {
        label: 'The Crave Close-Up',
        value: 'Macro close-up photography, 100mm lens style, tight framing on the most appetizing texture, extreme shallow depth of field, focus on details like droplets or steam, mouth-watering aesthetic.',
        description: 'Best for: Ads, highlighting texture, glaze, detail.'
    },
    {
        label: 'The Lifestyle Spread',
        value: 'Wide angle lifestyle table setting, food placed in context with blurred dining environment in background, napkins and cutlery visible, natural window lighting, candid dining atmosphere.',
        description: 'Best for: Brand storytelling, "About Us" sections.'
    },
    {
        label: 'The Packaging Pop',
        value: 'Dynamic product shot, slightly low angle, high contrast commercial lighting, vibrant colors, food styling emphasizes packaging and portability, clean modern background, high energy.',
        description: 'Best for: Fast food promos, delivery apps.'
    },
];

export const SETTING_OPTIONS = [
    { label: 'Rustic Wood', value: 'on a rustic dark wooden bakery board' },
    { label: 'Sand Beach', value: 'on a tropical beach background with warm sand' },
    { label: 'Marble Deck', value: 'on a clean polished marble kitchen counter' },
    { label: 'Minimalist', value: 'against a clean, minimalist solid cream backdrop' },
    { label: 'Cafe Bokeh', value: 'in a bright, modern cafe with a soft blurred background' },
    { label: 'Fine Dining', value: 'on a white tablecloth in a dimly lit fine dining restaurant' },
];

export const PLATING_OPTIONS = [
    { label: 'On Plate', value: 'served on a clean professional ceramic plate' },
    { label: 'No Plate', value: 'placed directly on the surface' },
];

export function useMediaState() {
    // Assets & Inputs
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [sourceUrl, setSourceUrl] = useState<string | null>(null);
    const [sourceFiles, setSourceFiles] = useState<File[]>([]);
    const [sourceUrls, setSourceUrls] = useState<string[]>([]);

    // Gallery & UI Visibility
    const [showMediaGallery, setShowMediaGallery] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showPanoramicSheet, setShowPanoramicSheet] = useState(false);
    const [activeMobileTab, setActiveMobileTab] = useState<string | null>(null);

    // Configuration
    const [perspective, setPerspective] = useState<string>(PERSPECTIVE_OPTIONS[1].value);
    const [setting, setSetting] = useState<string>(SETTING_OPTIONS[0].value);
    const [plating, setPlating] = useState<string>(PLATING_OPTIONS[0].value);
    const [instructions, setInstructions] = useState<string>('');
    const [selectedBrandKit, setSelectedBrandKit] = useState<string>(BRAND_KITS[0].id);
    const [selectedShotRecipe, setSelectedShotRecipe] = useState<string>(SHOT_RECIPES[0].id);
    const [strictness, setStrictness] = useState<number>(50);

    // Modes
    const [isMultiImageMode, setIsMultiImageMode] = useState(false);
    const [isInpaintingMode, setIsInpaintingMode] = useState(false);
    const [maskData, setMaskData] = useState<string | null>(null);

    const handleFileSelect = useCallback((file: File, onSuccess: () => void, onError: (msg: string) => void) => {
        if (file.size > 10 * 1024 * 1024) {
            onError('Image too large (>10MB)');
            return;
        }
        setSourceFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setSourceUrl(reader.result as string);
            onSuccess();
        };
        reader.readAsDataURL(file);
    }, []);

    const handleGallerySelect = useCallback((asset: { public_url: string }, onSuccess: () => void) => {
        setSourceUrl(asset.public_url);
        setSourceFile(null);
        onSuccess();
        setShowMediaGallery(false);
    }, []);

    const handleMultiFileSelect = useCallback((files: File[], onSuccess: () => void, onError: (msg: string) => void) => {
        const oversizedFiles = files.filter(f => f.size > 10 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            onError('Some images too large (>10MB)');
        }
        setSourceFiles(files);
        Promise.all(files.map(file => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        })).then(urls => {
            setSourceUrls(urls);
            onSuccess();
        });
    }, []);

    const handleClear = useCallback(() => {
        setSourceFile(null);
        setSourceUrl(null);
        setSourceFiles([]);
        setSourceUrls([]);
        setIsInpaintingMode(false);
        setMaskData(null);
    }, []);

    const toggleMultiImageMode = useCallback(() => {
        setIsMultiImageMode(prev => {
            if (!prev) handleClear();
            return !prev;
        });
    }, [handleClear]);

    return {
        // State
        sourceFile, setSourceFile,
        sourceUrl, setSourceUrl,
        sourceFiles, setSourceFiles,
        sourceUrls, setSourceUrls,
        showMediaGallery, setShowMediaGallery,
        showExportModal, setShowExportModal,
        showPanoramicSheet, setShowPanoramicSheet,
        activeMobileTab, setActiveMobileTab,
        perspective, setPerspective,
        setting, setSetting,
        plating, setPlating,
        instructions, setInstructions,
        selectedBrandKit, setSelectedBrandKit,
        selectedShotRecipe, setSelectedShotRecipe,
        strictness, setStrictness,
        isMultiImageMode, setIsMultiImageMode,
        isInpaintingMode, setIsInpaintingMode,
        maskData, setMaskData,

        // Actions
        handleFileSelect,
        handleGallerySelect,
        handleMultiFileSelect,
        handleClear,
        toggleMultiImageMode
    };
}
