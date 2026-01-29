import React, { useState, useCallback, useRef } from 'react';
import { generateFoodMockup, MockupConfig } from './services/geminiService';
import { fileToBase64, processImageForGemini } from './utils/fileUtils';
import { Sparkles, MessageSquare, Zap, Target, Palette, Box } from 'lucide-react';

// UI Components
import AppShell from './components/layout/AppShell';
import SidebarSection from './components/ui/SidebarSection';
import SegmentedControl from './components/ui/SegmentedControl';
import OptionGrid from './components/ui/OptionGrid';
import UploadCard from './components/ui/UploadCard';
import CanvasStage from './components/ui/CanvasStage';
import BottomActionBar from './components/ui/BottomActionBar';
import MobileBottomNav from './components/layout/MobileBottomNav';
import BottomSheet from './components/ui/BottomSheet';
import BrandKitPicker from './components/ui/BrandKitPicker';
import StrictnessSlider from './components/ui/StrictnessSlider';

import { BRAND_KITS, SHOT_RECIPES } from './constants/presets';

const PERSPECTIVE_OPTIONS = [
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

const SETTING_OPTIONS = [
  { label: 'Rustic Wood', value: 'on a rustic dark wooden bakery board' },
  { label: 'Sand Beach', value: 'on a tropical beach background with warm sand' },
  { label: 'Marble Deck', value: 'on a clean polished marble kitchen counter' },
  { label: 'Minimalist', value: 'against a clean, minimalist solid cream backdrop' },
  { label: 'Cafe Bokeh', value: 'in a bright, modern cafe with a soft blurred background' },
  { label: 'Fine Dining', value: 'on a white tablecloth in a dimly lit fine dining restaurant' },
];

const PLATING_OPTIONS = [
  { label: 'On Plate', value: 'served on a clean professional ceramic plate' },
  { label: 'No Plate', value: 'placed directly on the surface' },
];

type AppStatus = 'idle' | 'ready' | 'generating' | 'success' | 'error';

const App: React.FC = () => {
  // Assets & Inputs
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  // Phase 1 Config
  const [perspective, setPerspective] = useState<string>(PERSPECTIVE_OPTIONS[1].value);
  const [setting, setSetting] = useState<string>(SETTING_OPTIONS[0].value);
  const [plating, setPlating] = useState<string>(PLATING_OPTIONS[0].value);
  const [instructions, setInstructions] = useState<string>('');

  // Phase 2 Config
  const [selectedBrandKit, setSelectedBrandKit] = useState<string>(BRAND_KITS[0].id);
  const [selectedShotRecipe, setSelectedShotRecipe] = useState<string>(SHOT_RECIPES[0].id);
  const [strictness, setStrictness] = useState<number>(50);

  // App State
  const [status, setStatus] = useState<AppStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Mobile Nav State
  const [activeMobileTab, setActiveMobileTab] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('Image too large (>10MB)');
      setStatus('error');
      return;
    }
    setSourceFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSourceUrl(reader.result as string);
      setGeneratedUrl(null);
      setStatus('ready');
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setSourceFile(null);
    setSourceUrl(null);
    setGeneratedUrl(null);
    setStatus('idle');
    setError(null);
  };

  const handleGenerate = async () => {
    if (!sourceFile) return;

    setStatus('generating');
    setError(null);

    try {
      const { base64, mimeType } = await processImageForGemini(sourceFile);

      const brandKit = BRAND_KITS.find(k => k.id === selectedBrandKit);
      const recipe = SHOT_RECIPES.find(r => r.id === selectedShotRecipe);

      const config: MockupConfig = {
        prompt: [perspective, plating, setting, instructions].filter(Boolean).join(', '),
        brandKitPrompt: brandKit?.promptFragment,
        shotRecipePrompt: recipe?.promptFragment,
        strictness: strictness,
      };

      const resultBase64 = await generateFoodMockup(base64, mimeType, config);
      const resultUrl = `data:image/png;base64,${resultBase64}`;

      setGeneratedUrl(resultUrl);
      setStatus('success');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setStatus('error');
    }
  };

  const sidebarContent = (
    <div className="space-y-4 pb-20">
      <SidebarSection title="Source" description="Upload a product photo" icon={<Box size={14} />}>
        <UploadCard
          imageUrl={sourceUrl}
          onFileSelect={handleFileSelect}
          onClear={handleClear}
          isLoading={status === 'generating'}
        />
      </SidebarSection>

      <SidebarSection title="Brand Kit" description="Apply consistent visual identity" icon={<Palette size={14} />}>
        <BrandKitPicker value={selectedBrandKit} onChange={setSelectedBrandKit} />
      </SidebarSection>

      <SidebarSection title="Setting" description="The surface for your product" icon={<Box size={14} />}>
        <OptionGrid
          options={SETTING_OPTIONS}
          value={setting}
          onChange={setSetting}
        />
      </SidebarSection>

      <SidebarSection title="Plating" description="Serve on a dish or direct on surface" icon={<Target size={14} />}>
        <SegmentedControl
          options={PLATING_OPTIONS}
          value={plating}
          onChange={setPlating}
        />
      </SidebarSection>

      <SidebarSection title="Shot Recipe" description="Predefined composition presets" icon={<Target size={14} />}>
        <OptionGrid
          options={SHOT_RECIPES.map(r => ({ label: r.name, value: r.id, description: r.description }))}
          value={selectedShotRecipe}
          onChange={(id) => {
            setSelectedShotRecipe(id);
            const r = SHOT_RECIPES.find(recipe => recipe.id === id);
            if (r) {
              const p = PERSPECTIVE_OPTIONS.find(opt => opt.value.includes(r.defaultPerspective) || opt.label.toLowerCase().includes(r.defaultPerspective));
              if (p) setPerspective(p.value);
            }
          }}
        />
      </SidebarSection>

      <SidebarSection title="Fidelity" description="Control AI adherence to instructions">
        <StrictnessSlider value={strictness} onChange={setStrictness} />
      </SidebarSection>

      <SidebarSection title="Perspective" description="Camera angle for your product">
        <div className="space-y-4">
          <div className="space-y-2">
            <OptionGrid
              options={PERSPECTIVE_OPTIONS}
              value={perspective}
              onChange={setPerspective}
            />
          </div>
        </div>
      </SidebarSection>

      <SidebarSection title="Refinement" description="Add specific details or mood" icon={<MessageSquare size={14} />}>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g. dramatic lighting, steam rising..."
          className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 min-h-[80px] resize-none"
        />
      </SidebarSection>

    </div>
  );

  const topBarContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-neutral-950 shadow-lg shadow-emerald-500/20">
          <Sparkles size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black tracking-tighter uppercase italic">CHROMA<span className="text-emerald-500">DISH</span></span>
          <span className="text-[9px] font-bold text-neutral-500 leading-none tracking-widest">STUDIO BUILDER</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10">
          <Zap size={12} className="text-emerald-400 fill-emerald-400" />
          <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">Premium Plan</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center overflow-hidden">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );

  return (
    <AppShell
      topBar={topBarContent}
      sidebar={sidebarContent}
      canvas={
        <CanvasStage
          sourceImageUrl={sourceUrl}
          generatedImageUrl={generatedUrl}
          isLoading={status === 'generating'}
          onUploadClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
        />
      }
      actionBar={
        <BottomActionBar
          onGenerate={handleGenerate}
          isLoading={status === 'generating'}
          disabled={!sourceUrl}
          error={error}
          statusText={
            status === 'idle' ? 'Upload content to start' :
              status === 'ready' ? 'Ready to generate' :
                status === 'generating' ? 'AI is painting...' :
                  status === 'success' ? 'Generation complete' :
                    'Ready to retry'
          }
        />
      }
      mobileNav={
        <MobileBottomNav
          activeTab={activeMobileTab || ''}
          onTabSelect={(id) => setActiveMobileTab(activeMobileTab === id ? null : id)}
          items={[
            { id: 'source', label: 'Source', icon: <Box size={20} /> },
            { id: 'style', label: 'Style', icon: <Palette size={20} /> },
            { id: 'shot', label: 'Shot', icon: <Target size={20} /> },
            { id: 'refine', label: 'Refine', icon: <MessageSquare size={20} /> },
          ]}
        />
      }
      bottomSheet={
        <BottomSheet
          isOpen={!!activeMobileTab}
          onClose={() => setActiveMobileTab(null)}
          title={
            activeMobileTab === 'source' ? 'Source Image' :
              activeMobileTab === 'style' ? 'Brand & Atmosphere' :
                activeMobileTab === 'shot' ? 'Camera & Composition' :
                  'Refinement'
          }
        >
          {activeMobileTab === 'source' && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-400">Upload and manage your product image.</p>
              <UploadCard
                imageUrl={sourceUrl}
                onFileSelect={handleFileSelect}
                onClear={handleClear}
                isLoading={status === 'generating'}
              />
            </div>
          )}

          {activeMobileTab === 'style' && (
            <div className="space-y-8">
              <div className="space-y-3">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Brand Identity</span>
                <BrandKitPicker value={selectedBrandKit} onChange={setSelectedBrandKit} />
              </div>
              <div className="space-y-3">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Setting</span>
                <OptionGrid
                  options={SETTING_OPTIONS}
                  value={setting}
                  onChange={setSetting}
                />
              </div>
            </div>
          )}

          {activeMobileTab === 'shot' && (
            <div className="space-y-8">
              <div className="space-y-3">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Perspective</span>
                <OptionGrid
                  options={PERSPECTIVE_OPTIONS}
                  value={perspective}
                  onChange={setPerspective}
                />
              </div>
              <div className="space-y-3">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Plating</span>
                <SegmentedControl
                  options={PLATING_OPTIONS}
                  value={plating}
                  onChange={setPlating}
                />
              </div>
              <div className="space-y-3">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Shot Recipe</span>
                <OptionGrid
                  options={SHOT_RECIPES.map(r => ({ label: r.name, value: r.id, description: r.description }))}
                  value={selectedShotRecipe}
                  onChange={(id) => {
                    setSelectedShotRecipe(id);
                    const r = SHOT_RECIPES.find(recipe => recipe.id === id);
                    if (r) {
                      const p = PERSPECTIVE_OPTIONS.find(opt => opt.value.includes(r.defaultPerspective) || opt.label.toLowerCase().includes(r.defaultPerspective));
                      if (p) setPerspective(p.value);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {activeMobileTab === 'refine' && (
            <div className="space-y-8">
              <div className="space-y-3">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Fidelity Control</span>
                <StrictnessSlider value={strictness} onChange={setStrictness} />
              </div>
              <div className="space-y-3">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Custom Instructions</span>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. dramatic lighting, steam rising..."
                  className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 min-h-[120px] resize-none"
                />
              </div>
            </div>
          )}
        </BottomSheet>
      }
    />
  );
};

export default App;
