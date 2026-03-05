export interface Perspective { id: string; name: string; value: string; }
export interface Setting { id: string; name: string; value: string; }
export interface BrandKit { id: string; name: string; promptFragment: string; colorAccent: string; }
export interface ShotRecipe { id: string; name: string; promptFragment: string; defaultPerspective: string; defaultSetting: string; }

export const PRESETS = {
    perspectives: [
        { id: 'menu-standard', name: 'Menu Standard', value: 'Top-down flat lay photography, 90-degree angle directly overhead, centered composition, even soft lighting, no depth of field, sharp focus from edge to edge' },
        { id: 'hero-shot', name: 'Hero Shot', value: 'Straight-on eye-level view, 0-degree angle, camera placed at table height, showcasing vertical layers and height, shallow depth of field, blurry background (bokeh), heroic stature' },
        { id: 'diners-view', name: "Diner's View", value: "45-degree isometric perspective, natural diner's point of view sitting at a table, medium depth of field, focus on the front face of the food" },
        { id: 'close-up', name: 'Crave Close-Up', value: 'Macro close-up photography, 100mm lens style, tight framing on the most appetizing texture, extreme shallow depth of field, focus on details like droplets or steam' },
        { id: 'lifestyle', name: 'Lifestyle Spread', value: 'Wide angle lifestyle table setting, food placed in context with blurred dining environment in background, napkins and cutlery visible, natural window lighting' },
        { id: 'packaging', name: 'Packaging Pop', value: 'Dynamic product shot, slightly low angle, high contrast commercial lighting, vibrant colors, food styling emphasizes packaging and portability' },
    ] as Perspective[],
    settings: [
        { id: 'rustic-wood', name: 'Rustic Wood', value: 'on a rustic dark wooden bakery board' },
        { id: 'sand-beach', name: 'Sand Beach', value: 'on a tropical beach background with warm sand' },
        { id: 'marble', name: 'Marble Deck', value: 'on a clean polished marble kitchen counter' },
        { id: 'minimalist', name: 'Minimalist', value: 'against a clean, minimalist solid cream backdrop' },
        { id: 'cafe', name: 'Cafe Bokeh', value: 'in a bright, modern cafe with a soft blurred background' },
        { id: 'fine-dining', name: 'Fine Dining', value: 'on a white tablecloth in a dimly lit fine dining restaurant' },
    ] as Setting[],
    brandKits: [
        { id: 'rustic', name: 'Rustic Warm', promptFragment: 'warm natural lighting, rustic wooden textures, organic earth tones, soft shadows', colorAccent: '#D46E11' },
        { id: 'minimal', name: 'Clean Minimal', promptFragment: 'bright airy lighting, minimalist white background, clean lines, high key photography', colorAccent: '#4EC7B2' },
    ] as BrandKit[],
    shotRecipes: [
        { id: 'menu-hero', name: 'Menu Hero', promptFragment: 'centered hero composition, shallow depth of field, appetizing close-up', defaultPerspective: 'hero-shot', defaultSetting: 'marble' },
        { id: 'social-vertical', name: 'Social Vertical', promptFragment: 'vertical-first composition, dynamic angle, lifestyle elements in periphery', defaultPerspective: 'diners-view', defaultSetting: 'minimalist' },
        { id: 'ecomm-white', name: 'E-comm White', promptFragment: 'pure studio white background, even clinical lighting, no distractions', defaultPerspective: 'diners-view', defaultSetting: 'minimalist' },
        { id: 'lifestyle', name: 'Lifestyle Context', promptFragment: 'natural cafe environment, lifestyle props like napkins and utensils, authentic vibe', defaultPerspective: 'menu-standard', defaultSetting: 'rustic-wood' },
    ] as ShotRecipe[]
};

export const getPreset = (type: string, id: string) => {
    const list = PRESETS[type as keyof typeof PRESETS];
    if (!list) return null;
    return list.find((p: any) => p.id === id) || null;
};

export const applyPreset = (presetId: string) => {
    const recipe = getPreset('shotRecipes', presetId) as ShotRecipe;
    const perspective = recipe ? getPreset('perspectives', recipe.defaultPerspective) as Perspective : null;
    const setting = recipe ? getPreset('settings', recipe.defaultSetting) as Setting : null;

    return {
        perspective: perspective?.value || '',
        setting: setting?.value || '',
        shotRecipePrompt: recipe?.promptFragment || '',
    };
};
