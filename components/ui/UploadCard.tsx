import React, { useRef } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface UploadCardProps {
    imageUrl: string | null;
    onFileSelect: (file: File) => void;
    onClear: () => void;
    isLoading?: boolean;
}

const UploadCard: React.FC<UploadCardProps> = ({ imageUrl, onFileSelect, onClear, isLoading }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleContainerClick = () => {
        if (!imageUrl) fileInputRef.current?.click();
    };

    return (
        <div className="space-y-3">
            <div
                onClick={handleContainerClick}
                className={cn(
                    "relative group cursor-pointer aspect-video rounded-xl border border-dashed transition-all overflow-hidden flex flex-col items-center justify-center",
                    imageUrl
                        ? "border-white/20 bg-black/40"
                        : "border-white/10 bg-neutral-950 hover:bg-neutral-900 hover:border-emerald-500/30",
                    isLoading && "animate-pulse pointer-events-none"
                )}
            >
                {imageUrl ? (
                    <>
                        <img src={imageUrl} alt="Source" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={(e) => { e.stopPropagation(); onClear(); }}
                                className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/40 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center space-y-2 py-6">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload size={18} className="text-neutral-400 group-hover:text-emerald-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-[11px] font-bold text-neutral-300">Drop source photo</p>
                            <p className="text-[10px] text-neutral-500 font-medium">PNG, JPG up to 10MB</p>
                        </div>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onFileSelect(file);
                    }}
                />
            </div>

            {imageUrl && (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 text-[10px] font-bold text-neutral-400 hover:text-neutral-200 border border-white/5 rounded-lg hover:bg-white/5 transition-all uppercase tracking-wider"
                >
                    Replace Image
                </button>
            )}
        </div>
    );
};

export default UploadCard;
