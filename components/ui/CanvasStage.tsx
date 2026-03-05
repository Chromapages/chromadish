import React, { useRef, useState } from 'react';
import { Sparkles, MousePointerClick, Image as ImageIcon, Wand2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import ImageCompare from './ImageCompare';
import { MaskCanvas } from './MaskCanvas';

interface CanvasStageProps {
    sourceImageUrl: string | null;
    generatedImageUrl: string | null;
    isLoading: boolean;
    onUploadClick: () => void;
    isInpaintingMode?: boolean;
    onMaskChange?: (maskBase64: string | null) => void;
}

const CanvasStage: React.FC<CanvasStageProps> = ({
    sourceImageUrl,
    generatedImageUrl,
    isLoading,
    onUploadClick,
    isInpaintingMode = false,
    onMaskChange = () => { }
}) => {
    const imgRef = React.useRef<HTMLImageElement>(null);
    const [imgDims, setImgDims] = React.useState({ width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState(false);

    const handleImageLoad = () => {
        if (imgRef.current) {
            setImgDims({
                width: imgRef.current.clientWidth,
                height: imgRef.current.clientHeight
            });
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            // Re-use the onUploadClick behavior by dispatching to the input, 
            // but it's cleaner to just get the file and trigger the input manually
            // Wait, we don't have onFileSelect. Let's just simulate the input change or pass the file.
            // Since we don't have onFileDrop here, the easiest way without changing props is to assign it to the first input we find.
            const input = document.querySelector<HTMLInputElement>('input[type="file"]');
            if (input) {
                const dt = new DataTransfer();
                dt.items.add(files[0]);
                input.files = dt.files;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    };

    if (!sourceImageUrl && !generatedImageUrl && !isLoading) {
        return (
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-8 rounded-3xl border-2 border-dashed transition-all",
                    isDragging ? "border-emerald-500 bg-emerald-500/10 scale-105" : "border-transparent"
                )}
            >
                <div className="space-y-2 pointer-events-none">
                    <div className={cn(
                        "inline-flex p-3 rounded-2xl ring-1 transition-all",
                        isDragging ? "bg-emerald-500 text-neutral-950 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" : "bg-emerald-500/10 ring-emerald-500/20 text-emerald-400 mb-4"
                    )}>
                        <Sparkles size={32} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">
                        {isDragging ? "Drop your photo" : "ChromaDish Studio"}
                    </h2>
                    <p className="text-neutral-400 text-sm font-medium">
                        {isDragging ? "Release to upload image" : "Transform basic product photos into professional studio assets."}
                    </p>
                </div>

                {!isDragging && (
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
                )}

                {!isDragging && (
                    <button
                        onClick={onUploadClick}
                        className="w-full py-4 bg-white text-neutral-950 font-bold rounded-2xl hover:bg-neutral-100 transition-all shadow-xl shadow-black/20"
                    >
                        Bring your first photo
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-[4/3] max-h-[60vh] rounded-3xl overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl flex items-center justify-center">
            {/* Transparent Checkerboard Background */}
            <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] [background-size:20px_20px] [background-position:0_0,0_10px,10px_-10px,-10px_0px]" />

            {isLoading ? (
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
                    {sourceImageUrl ? (
                        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            <img src={sourceImageUrl} alt="Processing" className="w-full h-full object-contain filter blur-[4px] scale-[1.02] opacity-50 transition-all duration-1000" />
                            <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />

                            {/* Scanning line animation */}
                            <div className="absolute left-0 right-0 h-[3px] bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,1)] animate-scan pointer-events-none z-10" />

                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
                                <div className="text-center p-6 bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl animate-pulse shadow-2xl">
                                    <div className="flex items-center justify-center gap-3 mb-2 text-emerald-400">
                                        <Wand2 className="animate-spin" size={20} />
                                        <p className="text-[12px] font-bold tracking-widest uppercase">Rendering Scene</p>
                                    </div>
                                    <p className="text-[11px] text-neutral-400 font-medium tracking-wide">Applying studio lighting and perspective</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                            <div className="text-center">
                                <p className="text-sm font-bold text-white tracking-wider">Crafting Studio Scene</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : sourceImageUrl && generatedImageUrl ? (
                <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                    <ImageCompare
                        beforeImage={sourceImageUrl}
                        afterImage={generatedImageUrl}
                    />
                </div>
            ) : (
                <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                    <div className="relative max-w-full max-h-full">
                        <img
                            ref={imgRef}
                            src={generatedImageUrl || sourceImageUrl || ''}
                            alt="Preview"
                            onLoad={handleImageLoad}
                            className="w-full h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-500"
                        />

                        {isInpaintingMode && imgDims.width > 0 && (
                            <MaskCanvas
                                width={imgDims.width}
                                height={imgDims.height}
                                onMaskChange={onMaskChange}
                            />
                        )}
                    </div>

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
