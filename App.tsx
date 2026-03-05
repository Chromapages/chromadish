import React from 'react';
import {
  Sparkles,
  MessageSquare,
  Zap,
  Target,
  Palette,
  Box,
  Download,
  Grid,
  Layers
} from 'lucide-react';

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
import ExportModal from './components/ui/ExportModal';
import ImageStitcher from './components/ui/ImageStitcher';
import MediaGalleryModal from './components/ui/MediaGalleryModal';

// Custom Hooks
import { useMediaState, PERSPECTIVE_OPTIONS, SETTING_OPTIONS, PLATING_OPTIONS } from './hooks/useMediaState';
import { useGenerationFlow } from './hooks/useGenerationFlow';

import { BRAND_KITS, SHOT_RECIPES } from './constants/presets';

const App: React.FC = () => {
  const media = useMediaState();
  const generation = useGenerationFlow();

  const handleFileSelect = (file: File) => {
    media.handleFileSelect(
      file,
      () => {
        generation.setGeneratedUrl(null);
        generation.setStatus('ready');
        generation.setError(null);
      },
      (msg) => {
        generation.setError(msg);
        generation.setStatus('error');
      }
    );
  };

  const handleGallerySelect = (asset: { public_url: string }) => {
    media.handleGallerySelect(asset, () => {
      generation.setGeneratedUrl(null);
      generation.setStatus('ready');
      generation.setError(null);
    });
  };

  const handleClear = () => {
    media.handleClear();
    generation.resetFlow();
  };

  const handleMultiFileSelect = (files: File[]) => {
    media.handleMultiFileSelect(
      files,
      () => {
        generation.setGeneratedUrl(null);
        generation.setStatus('ready');
        generation.setError(null);
      },
      (msg) => generation.setError(msg)
    );
  };

  const handleStitch = async (layout: 'horizontal' | 'vertical' | 'grid', spacing: number) => {
    return generation.handleStitch(media.sourceUrls, layout, spacing, {
      perspective: media.perspective,
      plating: media.plating,
      setting: media.setting,
      instructions: media.instructions,
      selectedBrandKit: media.selectedBrandKit,
      selectedShotRecipe: media.selectedShotRecipe,
      strictness: media.strictness
    });
  };

  const generate = () => {
    generation.handleGenerate({
      sourceFile: media.sourceFile,
      sourceUrl: media.sourceUrl,
      perspective: media.perspective,
      plating: media.plating,
      setting: media.setting,
      instructions: media.instructions,
      selectedBrandKit: media.selectedBrandKit,
      selectedShotRecipe: media.selectedShotRecipe,
      strictness: media.strictness,
      maskData: media.maskData,
      isInpaintingMode: media.isInpaintingMode
    });
  };

  const sidebarContent = (
    <div className="space-y-4 pb-20">
      <div className="flex gap-2 p-1 bg-neutral-900/50 rounded-xl">
        <button
          onClick={() => media.isMultiImageMode && media.toggleMultiImageMode()}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${!media.isMultiImageMode
            ? 'bg-emerald-500 text-neutral-950'
            : 'text-neutral-400 hover:text-neutral-200'
            }`}
        >
          Single
        </button>
        <button
          onClick={() => !media.isMultiImageMode && media.toggleMultiImageMode()}
          className={`flex-1 py-2 px-3 flex items-center justify-center gap-1 rounded-lg text-xs font-bold transition-all ${media.isMultiImageMode
            ? 'bg-emerald-500 text-neutral-950'
            : 'text-neutral-400 hover:text-neutral-200'
            }`}
        >
          <Layers size={12} />
          Panoramic
        </button>
      </div>

      {media.isMultiImageMode ? (
        <SidebarSection title="Multi-Image" description="Upload up to 6 images" icon={<Grid size={14} />}>
          <UploadCard
            imageUrl={null}
            onFileSelect={() => { }}
            onClear={handleClear}
            isLoading={generation.status === 'generating'}
            multiple
            onMultipleSelect={handleMultiFileSelect}
            onBrowseGallery={() => media.setShowMediaGallery(true)}
          />

          {media.sourceUrls.length >= 2 && (
            <button
              onClick={() => media.setShowPanoramicSheet(true)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl transition-all"
            >
              <Grid size={14} className="inline mr-2" />
              Create Panoramic
            </button>
          )}
        </SidebarSection>
      ) : (
        <SidebarSection title="Source" description="Upload or choose from gallery" icon={<Box size={14} />}>
          <UploadCard
            imageUrl={media.sourceUrl}
            onFileSelect={handleFileSelect}
            onClear={handleClear}
            onBrowseGallery={() => media.setShowMediaGallery(true)}
            isLoading={generation.status === 'generating'}
          />
        </SidebarSection>
      )}

      <SidebarSection title="Brand Kit" description="Apply consistent visual identity" icon={<Palette size={14} />}>
        <BrandKitPicker value={media.selectedBrandKit} onChange={media.setSelectedBrandKit} />
      </SidebarSection>

      <SidebarSection title="Setting" description="The surface for your product" icon={<Box size={14} />}>
        <OptionGrid
          options={SETTING_OPTIONS}
          value={media.setting}
          onChange={media.setSetting}
        />
      </SidebarSection>

      <SidebarSection title="Plating" description="Serve on a dish or direct on surface" icon={<Target size={14} />}>
        <SegmentedControl
          options={PLATING_OPTIONS}
          value={media.plating}
          onChange={media.setPlating}
        />
      </SidebarSection>

      <SidebarSection title="Shot Recipe" description="Predefined composition presets" icon={<Target size={14} />}>
        <OptionGrid
          options={SHOT_RECIPES.map(r => ({ label: r.name, value: r.id, description: r.description }))}
          value={media.selectedShotRecipe}
          onChange={(id) => {
            media.setSelectedShotRecipe(id);
            const r = SHOT_RECIPES.find(recipe => recipe.id === id);
            if (r) {
              const p = PERSPECTIVE_OPTIONS.find(opt => opt.value.includes(r.defaultPerspective) || opt.label.toLowerCase().includes(r.defaultPerspective));
              if (p) media.setPerspective(p.value);
            }
          }}
        />
      </SidebarSection>

      <SidebarSection title="Fidelity" description="Control AI adherence to instructions">
        <StrictnessSlider value={media.strictness} onChange={media.setStrictness} />
      </SidebarSection>

      <SidebarSection title="Perspective" description="Camera angle for your product">
        <div className="space-y-4">
          <div className="space-y-2">
            <OptionGrid
              options={PERSPECTIVE_OPTIONS}
              value={media.perspective}
              onChange={media.setPerspective}
            />
          </div>
        </div>
      </SidebarSection>

      <SidebarSection title="Magic Eraser" description="Brush over areas to modify" icon={<Sparkles size={14} className="text-emerald-400" />}>
        <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-neutral-200">Magic Brush</span>
            <span className="text-[10px] text-neutral-500 font-medium">{media.isInpaintingMode ? 'Drawing enabled' : 'Toggle to edit'}</span>
          </div>
          <button
            onClick={() => media.setIsInpaintingMode(!media.isInpaintingMode)}
            className={`w-10 h-6 rounded-full transition-all relative ${media.isInpaintingMode ? 'bg-emerald-500' : 'bg-neutral-800'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${media.isInpaintingMode ? 'left-5' : 'left-1'}`} />
          </button>
        </div>
      </SidebarSection>

      <SidebarSection title="Refinement" description="Add specific details or mood" icon={<MessageSquare size={14} />}>
        <textarea
          value={media.instructions}
          onChange={(e) => media.setInstructions(e.target.value)}
          placeholder={media.isInpaintingMode ? "Describe what to add/change in the masked area..." : "e.g. dramatic lighting, steam rising..."}
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
        {(generation.generatedUrl || generation.stitchedUrl) && (
          <button
            onClick={() => media.setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg border border-emerald-500/30 transition-colors"
          >
            <Download size={14} className="text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Export</span>
          </button>
        )}

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
    <>
      <AppShell
        topBar={topBarContent}
        sidebar={sidebarContent}
        canvas={
          <CanvasStage
            sourceImageUrl={media.sourceUrl}
            generatedImageUrl={generation.generatedUrl}
            isLoading={generation.status === 'generating'}
            onUploadClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            isInpaintingMode={media.isInpaintingMode}
            onMaskChange={media.setMaskData}
          />
        }
        actionBar={
          <BottomActionBar
            onGenerate={generate}
            isLoading={generation.status === 'generating'}
            disabled={!media.sourceUrl}
            statusText={
              generation.status === 'idle' ? 'Upload content to start' :
                generation.status === 'ready' ? 'Ready to generate' :
                  generation.status === 'generating' ? 'AI is painting...' :
                    generation.status === 'success' ? 'Generation complete' :
                      'Ready to retry'
            }
          />
        }
        mobileNav={
          <MobileBottomNav
            activeTab={media.activeMobileTab || ''}
            onTabSelect={(id) => media.setActiveMobileTab(media.activeMobileTab === id ? null : id)}
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
            isOpen={!!media.activeMobileTab}
            onClose={() => media.setActiveMobileTab(null)}
            title={
              media.activeMobileTab === 'source' ? 'Source Image' :
                media.activeMobileTab === 'style' ? 'Brand & Atmosphere' :
                  media.activeMobileTab === 'shot' ? 'Camera & Composition' :
                    'Refinement'
            }
          >
            {media.activeMobileTab === 'source' && (
              <div className="space-y-4">
                <p className="text-sm text-neutral-400">Upload and manage your product image.</p>
                <UploadCard
                  imageUrl={media.sourceUrl}
                  onFileSelect={handleFileSelect}
                  onClear={handleClear}
                  onBrowseGallery={() => media.setShowMediaGallery(true)}
                  isLoading={generation.status === 'generating'}
                />
              </div>
            )}

            {media.activeMobileTab === 'style' && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Brand Identity</span>
                  <BrandKitPicker value={media.selectedBrandKit} onChange={media.setSelectedBrandKit} />
                </div>
                <div className="space-y-3">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Setting</span>
                  <OptionGrid
                    options={SETTING_OPTIONS}
                    value={media.setting}
                    onChange={media.setSetting}
                  />
                </div>
              </div>
            )}

            {media.activeMobileTab === 'shot' && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Perspective</span>
                  <OptionGrid
                    options={PERSPECTIVE_OPTIONS}
                    value={media.perspective}
                    onChange={media.setPerspective}
                  />
                </div>
                <div className="space-y-3">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Plating</span>
                  <SegmentedControl
                    options={PLATING_OPTIONS}
                    value={media.plating}
                    onChange={media.setPlating}
                  />
                </div>
                <div className="space-y-3">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Shot Recipe</span>
                  <OptionGrid
                    options={SHOT_RECIPES.map(r => ({ label: r.name, value: r.id, description: r.description }))}
                    value={media.selectedShotRecipe}
                    onChange={(id) => {
                      media.setSelectedShotRecipe(id);
                      const r = SHOT_RECIPES.find(recipe => recipe.id === id);
                      if (r) {
                        const p = PERSPECTIVE_OPTIONS.find(opt => opt.value.includes(r.defaultPerspective) || opt.label.toLowerCase().includes(r.defaultPerspective));
                        if (p) media.setPerspective(p.value);
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {media.activeMobileTab === 'refine' && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Fidelity Control</span>
                  <StrictnessSlider value={media.strictness} onChange={media.setStrictness} />
                </div>
                <div className="space-y-3">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Custom Instructions</span>
                  <textarea
                    value={media.instructions}
                    onChange={(e) => media.setInstructions(e.target.value)}
                    placeholder="e.g. dramatic lighting, steam rising..."
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 min-h-[120px] resize-none"
                  />
                </div>
              </div>
            )}
          </BottomSheet>
        }
      />

      <ExportModal
        isOpen={media.showExportModal}
        onClose={() => media.setShowExportModal(false)}
        imageUrl={generation.generatedUrl || generation.stitchedUrl}
        filename="chromadish-export"
      />

      <BottomSheet
        isOpen={media.showPanoramicSheet}
        onClose={() => media.setShowPanoramicSheet(false)}
        title="Create Panoramic"
        showOnDesktop
      >
        <div className="pb-8">
          <ImageStitcher
            images={media.sourceUrls}
            onStitch={handleStitch}
            isProcessing={generation.isStitching}
          />
        </div>
      </BottomSheet>

      <MediaGalleryModal
        isOpen={media.showMediaGallery}
        onClose={() => media.setShowMediaGallery(false)}
        onSelect={handleGallerySelect}
      />
    </>
  );
};

export default App;
