import React, { useState, useRef } from 'react';
import { Grid, Rows, Columns, X, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ImageStitcherProps {
    images: string[]; // Array of base64 image URLs
    onStitch: (layout: 'horizontal' | 'vertical' | 'grid', spacing: number) => Promise<string>;
    isProcessing?: boolean;
}

type StitchLayout = 'horizontal' | 'vertical' | 'grid';

const LayoutButton: React.FC<{
    layout: StitchLayout;
    currentLayout: StitchLayout;
    onSelect: (layout: StitchLayout) => void;
    icon: React.ReactNode;
    label: string;
}> = ({ layout, currentLayout, onSelect, icon, label }) => (
    <button
        onClick={() => onSelect(layout)}
        className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all flex-1",
            currentLayout === layout
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-white/10 hover:border-white/30 text-neutral-400 hover:text-neutral-200"
        )}
    >
        {icon}
        <span className="text-xs font-bold">{label}</span>
    </button>
);

const ImageStitcher: React.FC<ImageStitcherProps> = ({ images, onStitch, isProcessing }) => {
    const [layout, setLayout] = useState<StitchLayout>('horizontal');
    const [spacing, setSpacing] = useState(20);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handlePreview = async () => {
        setIsGenerating(true);
        try {
            const result = await onStitch(layout, spacing);
            setPreviewUrl(result);
        } catch (error) {
            console.error('Stitch failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Calculate grid dimensions
    const getGridDims = () => {
        const count = images.length;
        if (count <= 1) return { cols: 1, rows: 1 };
        if (count === 2) return { cols: 2, rows: 1 };
        if (count <= 4) return { cols: 2, rows: 2 };
        if (count <= 6) return { cols: 3, rows: 2 };
        return { cols: 3, rows: Math.ceil(count / 3) };
    };

    return (
        <div className="space-y-4">
            {/* Layout Selection */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Layout
                </label>
                <div className="grid grid-cols-3 gap-2">
                    <LayoutButton
                        layout="horizontal"
                        currentLayout={layout}
                        onSelect={setLayout}
                        icon={<ArrowRight size={18} />}
                        label="Side by Side"
                    />
                    <LayoutButton
                        layout="vertical"
                        currentLayout={layout}
                        onSelect={setLayout}
                        icon={<Columns size={18} />}
                        label="Stacked"
                    />
                    <LayoutButton
                        layout="grid"
                        currentLayout={layout}
                        onSelect={setLayout}
                        icon={<Grid size={18} />}
                        label="Grid"
                    />
                </div>
            </div>

            {/* Spacing */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Gap: {spacing}px
                </label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={spacing}
                    onChange={(e) => setSpacing(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                />
            </div>

            {/* Preview thumbnails */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Source Images ({images.length})
                </label>
                <div className={cn(
                    "grid gap-2",
                    layout === 'grid'
                        ? `grid-cols-${Math.min(images.length, 3)}`
                        : "grid-cols-2"
                )}>
                    {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                {idx + 1}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Generate Button */}
            <button
                onClick={handlePreview}
                disabled={isGenerating || images.length < 2}
                className={cn(
                    "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all",
                    isGenerating || images.length < 2
                        ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                        : "bg-emerald-500 hover:bg-emerald-400 text-neutral-950"
                )}
            >
                {isGenerating ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Stitching...</span>
                    </>
                ) : (
                    <>
                        <Grid size={18} />
                        <span>Create Panoramic</span>
                    </>
                )}
            </button>

            {/* Result Preview */}
            {previewUrl && (
                <div className="space-y-3">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        Result
                    </label>
                    <div className="rounded-xl overflow-hidden border border-white/10">
                        <img src={previewUrl} alt="Stitched" className="w-full" />
                    </div>
                </div>
            )}
        </div>
    );
};

// Utility function to stitch images on canvas
export const stitchImages = async (
    images: string[],
    layout: 'horizontal' | 'vertical' | 'grid',
    spacing: number
): Promise<string> => {
    // Load all images first
    const loadedImages: HTMLImageElement[] = await Promise.all(
        images.map(src => new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        }))
    );

    if (loadedImages.length === 0) return '';

    // Use the first image as the reference dimension for all slots
    const cellWidth = loadedImages[0].width;
    const cellHeight = loadedImages[0].height;

    let totalWidth = 0;
    let totalHeight = 0;

    if (layout === 'horizontal') {
        totalWidth = loadedImages.length * cellWidth + (loadedImages.length - 1) * spacing;
        totalHeight = cellHeight;
    } else if (layout === 'vertical') {
        totalWidth = cellWidth;
        totalHeight = loadedImages.length * cellHeight + (loadedImages.length - 1) * spacing;
    } else {
        // Grid - calculate cols/rows
        const count = loadedImages.length;
        const cols = Math.min(count, 3);
        const rows = Math.ceil(count / cols);
        totalWidth = cols * cellWidth + (cols - 1) * spacing;
        totalHeight = rows * cellHeight + (rows - 1) * spacing;
    }

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d')!;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Draw images with object-fit: cover behavior
    loadedImages.forEach((img, idx) => {
        let x = 0;
        let y = 0;

        if (layout === 'horizontal') {
            x = idx * (cellWidth + spacing);
            y = 0;
        } else if (layout === 'vertical') {
            x = 0;
            y = idx * (cellHeight + spacing);
        } else {
            const cols = Math.min(loadedImages.length, 3);
            x = (idx % cols) * (cellWidth + spacing);
            y = Math.floor(idx / cols) * (cellHeight + spacing);
        }

        // Calculate aspect ratio crop (object-fit: cover)
        const imgRatio = img.width / img.height;
        const cellRatio = cellWidth / cellHeight;

        let drawWidth = cellWidth;
        let drawHeight = cellHeight;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > cellRatio) {
            // Image is wider than cell, scale to height
            drawHeight = cellHeight;
            drawWidth = cellHeight * imgRatio;
            offsetX = -(drawWidth - cellWidth) / 2;
        } else {
            // Image is taller than cell, scale to width
            drawWidth = cellWidth;
            drawHeight = cellWidth / imgRatio;
            offsetY = -(drawHeight - cellHeight) / 2;
        }

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, cellWidth, cellHeight);
        ctx.clip();
        ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight);
        ctx.restore();
    });

    return canvas.toDataURL('image/jpeg', 0.8);
};

export default ImageStitcher;
