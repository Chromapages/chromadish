import React from 'react';
import { DownloadIcon, ExpandIcon, LayoutIcon } from './icons';

interface ResultDisplayProps {
  isLoading: boolean;
  generatedImage: string | null;
  sourceImage: string | null;
  onImageClick: () => void;
  onAspectRatioChange: (ratio: string) => void;
  selectedAspectRatio: string;
  aspectRatios: { value: string; label: string }[];
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  isLoading,
  generatedImage,
  sourceImage,
  onImageClick,
  onAspectRatioChange,
  selectedAspectRatio,
  aspectRatios
}) => {

  const downloadImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!generatedImage) return;
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `mockup-${selectedAspectRatio}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="relative w-full flex-1 flex items-center justify-center min-h-[400px]">
            
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-base-100/40 backdrop-blur-sm rounded-2xl animate-fade-in">
                     <div className="w-12 h-12 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4"></div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Processing</p>
                </div>
            )}

            <div className={`transition-all duration-700 ${isLoading ? 'scale-[0.98] opacity-20 blur-sm' : 'scale-100 opacity-100'}`}>
                {generatedImage ? (
                    <div className="relative group border border-base-border p-2 bg-white rounded-2xl soft-shadow overflow-hidden">
                        <img 
                            src={generatedImage} 
                            alt="Mockup" 
                            className="max-h-[60vh] lg:max-h-[75vh] w-auto object-contain rounded-xl cursor-zoom-in"
                            onClick={onImageClick}
                        />
                        
                        {/* Discreet Floating Controls */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                                onClick={onImageClick} 
                                className="w-8 h-8 bg-white/90 backdrop-blur border border-base-border rounded-lg flex items-center justify-center hover:bg-white text-text-primary transition-all"
                            >
                                <ExpandIcon className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={downloadImage} 
                                className="w-8 h-8 bg-brand-primary shadow-sm rounded-lg flex items-center justify-center hover:bg-brand-secondary text-white transition-all"
                            >
                                <DownloadIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : sourceImage ? (
                     <div className="relative p-8 border border-base-border border-dashed rounded-2xl opacity-50 bg-white">
                         <img 
                            src={sourceImage} 
                            alt="Source" 
                            className="max-h-[50vh] w-auto object-contain rounded-lg" 
                         />
                         <div className="absolute inset-0 flex items-center justify-center">
                             <div className="bg-white/80 px-6 py-3 rounded-full border border-base-border">
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Awaiting Action</p>
                             </div>
                         </div>
                     </div>
                ) : null}
            </div>
        </div>

        {/* Minimal Aspect Ratio Selector */}
        {generatedImage && !isLoading && (
            <div className="mt-8">
                <div className="flex items-center gap-1 p-1 bg-white border border-base-border rounded-full soft-shadow">
                    <div className="pl-4 pr-3 text-[9px] font-bold text-text-muted uppercase tracking-wider border-r border-base-border mr-1 hidden sm:block">
                        Crop
                    </div>
                    {aspectRatios.map((ratio) => (
                        <button
                            key={ratio.value}
                            onClick={() => onAspectRatioChange(ratio.value)}
                            className={`px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                                selectedAspectRatio === ratio.value
                                    ? 'bg-base-200 text-brand-primary'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-base-100'
                            }`}
                        >
                            {ratio.label}
                        </button>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};

export default ResultDisplay;