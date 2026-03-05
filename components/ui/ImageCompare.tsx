import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface ImageCompareProps {
    beforeImage: string;
    afterImage: string;
    className?: string;
}

const ImageCompare: React.FC<ImageCompareProps> = ({ beforeImage, afterImage, className }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMove = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        let clientX = 0;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = (e as React.MouseEvent | MouseEvent).clientX;
        }

        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
        setSliderPosition(percent);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Global event listeners for smooth dragging outside the container
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleMove, { passive: false });
            window.addEventListener('touchend', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div
            ref={containerRef}
            className={cn("relative w-full h-full select-none overflow-hidden rounded-xl bg-neutral-900 shadow-2xl animate-in zoom-in-95 duration-500", className)}
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
        >
            {/* Checkerboard Pattern for Transparent Images */}
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(45deg,#000_25%,transparent_25%),linear-gradient(-45deg,#000_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#000_75%),linear-gradient(-45deg,transparent_75%,#000_75%)] [background-size:20px_20px] [background-position:0_0,0_10px,10px_-10px,-10px_0px]" />

            {/* Before Image (Background) */}
            <div className="absolute inset-0">
                <img src={beforeImage} alt="Original" className="w-full h-full object-contain pointer-events-none" draggable={false} />
            </div>

            {/* After Image (Foreground, Clipped) */}
            <div
                className="absolute inset-0 border-r-2 border-emerald-500 shadow-[2px_0_12px_rgba(0,0,0,0.5)] bg-neutral-900"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            >
                {/* Checkerboard inside clipped area too */}
                <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(45deg,#000_25%,transparent_25%),linear-gradient(-45deg,#000_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#000_75%),linear-gradient(-45deg,transparent_75%,#000_75%)] [background-size:20px_20px] [background-position:0_0,0_10px,10px_-10px,-10px_0px]" />
                <img src={afterImage} alt="Enhanced" className="relative z-10 w-full h-full object-contain pointer-events-none" draggable={false} />

                {/* Embedded Labels (Clipped to ensure they don't leak) */}
                <div className="absolute top-4 right-4 bg-emerald-500/20 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] uppercase font-bold text-emerald-400 tracking-widest border border-emerald-500/30 z-20">Enhanced</div>
            </div>

            {/* Before Label (always rendered but underneath the after image) */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] uppercase font-bold text-white/70 tracking-widest border border-white/10 z-10 pointer-events-none">Original</div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-8 -ml-4 flex items-center justify-center cursor-ew-resize z-30"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="w-8 h-12 bg-white rounded-full flex flex-col items-center justify-center shadow-2xl ring-4 ring-black/10 text-neutral-950 transition-transform hover:scale-105 active:scale-95 space-y-1">
                    <div className="w-1 h-1 bg-neutral-400 rounded-full" />
                    <div className="w-1 h-1 bg-neutral-400 rounded-full" />
                    <div className="w-1 h-1 bg-neutral-400 rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default ImageCompare;
