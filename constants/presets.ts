
export type BrandKit = {
  id: string;
  name: string;
  description: string;
  promptFragment: string;
  colorAccent: string;
};

export const BRAND_KITS: BrandKit[] = [
  {
    id: 'rustic',
    name: 'Rustic Warm',
    description: 'Natural textures, warm wood, and organic lighting.',
    promptFragment: 'warm natural lighting, rustic wooden textures, organic earth tones, soft shadows',
    colorAccent: '#D46E11',
  },
  {
    id: 'minimal',
    name: 'Clean Minimal',
    description: 'Modern, bright, and distraction-free composition.',
    promptFragment: 'bright airy lighting, minimalist white background, clean lines, high key photography',
    colorAccent: '#4EC7B2',
  },
];

export type ShotRecipe = {
  id: string;
  name: string;
  description: string;
  promptFragment: string;
  defaultPerspective: 'flat' | 'diner' | 'hero';
  defaultSetting: 'rustic' | 'beach' | 'marble' | 'minimal';
};

export const SHOT_RECIPES: ShotRecipe[] = [
  {
    id: 'menu-hero',
    name: 'Menu Hero',
    description: 'Perfect for website headers and menu cards.',
    promptFragment: 'centered hero composition, shallow depth of field, appetizing close-up',
    defaultPerspective: 'hero',
    defaultSetting: 'marble',
  },
  {
    id: 'social-vertical',
    name: 'Social Vertical',
    description: 'Optimized for Instagram and TikTok stories.',
    promptFragment: 'vertical-first composition, dynamic angle, lifestyle elements in periphery',
    defaultPerspective: 'diner',
    defaultSetting: 'minimal',
  },
  {
    id: 'ecomm-white',
    name: 'E-comm White',
    description: 'Standard product shot for marketplaces.',
    promptFragment: 'pure studio white background, even clinical lighting, no distractions',
    defaultPerspective: 'diner',
    defaultSetting: 'minimal',
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle Context',
    description: 'Natural setting with props and environment.',
    promptFragment: 'natural cafe environment, lifestyle props like napkins and utensils, authentic vibe',
    defaultPerspective: 'flat',
    defaultSetting: 'rustic',
  },
];
