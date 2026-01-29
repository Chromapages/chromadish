import React from 'react';
import { Sparkles, MousePointerClick, Image as ImageIcon, Wand2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CanvasStageProps {
    sourceImageUrl: string | null;
    generatedImageUrl: string | null;
    isLoading: boolean;
    onUploadClick: () => void;
}

const CanvasStage: React.FC<CanvasStageProps> = ({
    sourceImageUrl,
    generatedImageUrl,
    isLoading,
    onUploadClick
}) => {
    if (!sourceImageUrl && !generatedImageUrl && !isLoading) {
        return (
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-2">
                    <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-400 mb-4">
                        <Sparkles size={32} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">ChromaDish Studio</h2>
                    <p className="text-neutral-400 text-sm font-medium">Transform basic product photos into professional studio assets.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 text-left">
                    {[
                        { icon: <MousePointerClick size={16} />, title: "1. Upload Subject", desc: "Start with a photo of your food or beverage." },
                        { icon: <Wand2 size={16} />, title: "2. Set Scene", desc: "Choose your perspective and environment settings." },
                        { icon: <Sparkles size={16} />, title: "3. Generate", desc: "Our AI Creative Director builds the final studio asset." },
                    ].map((step, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors">
                            <div className="mt-1 text-emerald-400 group-hover:scale-110 transition-transform">
                                {step.icon}
                            </div>
                            <div>
                                <h4 className="text-[13px] font-bold text-neutral-200">{step.title}</h4>
                                <p className="text-[11px] text-neutral-500 font-medium">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onUploadClick}
                    className="w-full py-4 bg-white text-neutral-950 font-bold rounded-2xl hover:bg-neutral-100 transition-all shadow-xl shadow-black/20"
                >
                    Bring your first photo
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-[4/3] max-h-[60vh] rounded-3xl overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl flex items-center justify-center">
            {/* Transparent Checkerboard Background */}
            <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] [background-size:20px_20px] [background-position:0_0,0_10px,10px_-10px,-10px_0px]" />

            {isLoading ? (
                <div className="relative z-10 flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    <div className="text-center">
                        <p className="text-sm font-bold text-white">Crafting Studio Scene</p>
                        <p className="text-[11px] text-neutral-500">This usually takes 8-12 seconds...</p>
                    </div>
                </div>
            ) : (
                <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                    <img
                        src={generatedImageUrl || sourceImageUrl || ''}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-500"
                    />

                    {generatedImageUrl && (
                        <div className="absolute top-4 right-4 flex gap-2">
                            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-bold text-emerald-400 tracking-wider uppercase">
                                Generated Asset
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CanvasStage;
