import React, { useState } from 'react';
import { Download, X, Check, Image as ImageIcon, FileImage, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string | null;
    filename?: string;
}

type ExportFormat = 'png' | 'jpeg' | 'webp';
type ExportQuality = '1x' | '2x' | '4x';

const QUALITY_OPTIONS: { value: ExportQuality; label: string; description: string }[] = [
    { value: '1x', label: 'Standard', description: 'Original size' },
    { value: '2x', label: 'High', description: '2x resolution' },
    { value: '4x', label: 'Ultra', description: '4x resolution (slow)' },
];

const FORMAT_OPTIONS: { value: ExportFormat; label: string; icon: React.ReactNode }[] = [
    { value: 'png', label: 'PNG', icon: <ImageIcon size={18} /> },
    { value: 'jpeg', label: 'JPEG', icon: <FileImage size={18} /> },
    { value: 'webp', label: 'WebP', icon: <Zap size={18} /> },
];

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, imageUrl, filename = 'chromadish' }) => {
    const [format, setFormat] = useState<ExportFormat>('png');
    const [quality, setQuality] = useState<ExportQuality>('1x');
    const [isExporting, setIsExporting] = useState(false);

    if (!isOpen) return null;

    const handleExport = async () => {
        if (!imageUrl) return;

        setIsExporting(true);

        try {
            // Load the image
            const img = new Image();
            img.crossOrigin = 'anonymous';

            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = reject;
                img.src = imageUrl;
            });

            // Calculate new dimensions
            let width = img.width;
            let height = img.height;

            if (quality === '2x') {
                width *= 2;
                height *= 2;
            } else if (quality === '4x') {
                width *= 4;
                height *= 4;
            }

            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d')!;

            // Use high-quality scaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Export based on format
            let mimeType: string;
            let qualityValue: number | undefined;

            switch (format) {
                case 'jpeg':
                    mimeType = 'image/jpeg';
                    qualityValue = 0.92;
                    break;
                case 'webp':
                    mimeType = 'image/webp';
                    qualityValue = 0.9;
                    break;
                default:
                    mimeType = 'image/png';
                    break;
            }

            // For PNG, we need to handle transparency
            if (format === 'jpeg' || format === 'webp') {
                // Fill white background for JPEG (no transparency)
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
            }

            const dataUrl = canvas.toDataURL(mimeType, qualityValue);

            // Download
            const link = document.createElement('a');
            link.download = `${filename}-${quality}.${format}`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            onClose();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white">Export Image</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-neutral-400" />
                    </button>
                </div>

                {/* Preview */}
                {imageUrl && (
                    <div className="p-4 border-b border-white/10">
                        <div className="aspect-video rounded-xl overflow-hidden bg-black/50">
                            <img
                                src={imageUrl}
                                alt="Preview"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>
                )}

                {/* Options */}
                <div className="p-4 space-y-6">
                    {/* Format */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                            Format
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {FORMAT_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setFormat(opt.value)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                                        format === opt.value
                                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                                            : "border-white/10 hover:border-white/30 text-neutral-400 hover:text-neutral-200"
                                    )}
                                >
                                    {opt.icon}
                                    <span className="text-xs font-bold">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quality */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                            Resolution
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {QUALITY_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setQuality(opt.value)}
                                    className={cn(
                                        "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-center",
                                        quality === opt.value
                                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                                            : "border-white/10 hover:border-white/30 text-neutral-400 hover:text-neutral-200"
                                    )}
                                >
                                    <span className="text-sm font-bold">{opt.label}</span>
                                    <span className="text-[10px] opacity-60">{opt.description}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* File info */}
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex justify-between text-xs">
                            <span className="text-neutral-500">Output:</span>
                            <span className="text-neutral-300 font-mono">
                                {filename}-{quality}.{format}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleExport}
                        disabled={isExporting || !imageUrl}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all",
                            isExporting
                                ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                                : "bg-emerald-500 hover:bg-emerald-400 text-neutral-950"
                        )}
                    >
                        {isExporting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                                <span>Exporting...</span>
                            </>
                        ) : (
                            <>
                                <Download size={18} />
                                <span>Download</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
