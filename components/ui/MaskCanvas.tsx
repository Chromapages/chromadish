import React, { useRef, useEffect, useState } from 'react';

interface MaskCanvasProps {
    width: number;
    height: number;
    onMaskChange: (maskBase64: string | null) => void;
    brushSize?: number;
}

export const MaskCanvas: React.FC<MaskCanvasProps> = ({
    width,
    height,
    onMaskChange,
    brushSize = 40
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Initialize canvas with transparency
        ctx.clearRect(0, 0, width, height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'white'; // Mask color
        ctx.lineWidth = brushSize;
    }, [width, height, brushSize]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            // Export mask: Convert to black (background) and white (masked area)
            const maskData = canvas.toDataURL('image/png');
            onMaskChange(maskData);
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clearMask = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        onMaskChange(null);
    };

    return (
        <div className="absolute inset-0 z-10 cursor-crosshair group">
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
                className="block w-full h-full mix-blend-screen opacity-60"
                style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }}
            />

            <div className="absolute bottom-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={clearMask}
                    className="px-3 py-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-lg text-xs font-medium backdrop-blur-sm transition-colors shadow-lg"
                >
                    Clear Mask
                </button>
                <div className="px-3 py-1.5 bg-white/10 text-white/70 rounded-lg text-xs font-medium backdrop-blur-sm border border-white/10 shadow-lg">
                    Brush: {brushSize}px
                </div>
            </div>
        </div>
    );
};
