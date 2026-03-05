import React, { useRef, useState } from 'react';
import { Upload, X, ImageIcon, Grid, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface UploadCardProps {
    imageUrl: string | null;
    onFileSelect: (file: File) => void;
    onClear: () => void;
    onBrowseGallery?: () => void;
    isLoading?: boolean;
    multiple?: boolean;
    onMultipleSelect?: (files: File[]) => void;
}

const UploadCard: React.FC<UploadCardProps> = ({
    imageUrl,
    onFileSelect,
    onClear,
    onBrowseGallery,
    isLoading,
    multiple = false,
    onMultipleSelect
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [thumbnails, setThumbnails] = useState<string[]>(imageUrl ? [imageUrl] : []);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleContainerClick = (e: React.MouseEvent) => {
        // Only trigger file input if clicking the main container area and not an internal button
        if (!imageUrl && !multiple) {
            fileInputRef.current?.click();
        }
    };

    const processFiles = (files: File[]) => {
        if (multiple && files.length > 0 && onMultipleSelect) {
            // Append new files to existing ones (up to 6 max)
            const allFiles = [...selectedFiles, ...files].slice(0, 6);
            setSelectedFiles(allFiles);

            // Store thumbnails for preview
            const newThumbnailsPromises = allFiles.map(file => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                return new Promise<string>((resolve) => {
                    reader.onload = () => resolve(reader.result as string);
                });
            });

            Promise.all(newThumbnailsPromises).then(thumbs => {
                setThumbnails(thumbs);
            });
            onMultipleSelect(allFiles);
        } else if (files.length > 0) {
            onFileSelect(files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []) as File[];
        processFiles(files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoading && !imageUrl) {
            setIsDragging(true);
        }
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
        if (isLoading) return;

        const files = Array.from(e.dataTransfer.files || []) as File[];
        // Only accept image files
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length > 0) {
            processFiles(imageFiles);
        }
    };

    return (
        <div className="space-y-3">
            <div
                onClick={handleContainerClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative group cursor-pointer rounded-xl border border-dashed transition-all duration-300 overflow-hidden flex flex-col items-center justify-center min-h-[160px] outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
                    isDragging && "border-emerald-500 bg-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.2)]",
                    !isDragging && (imageUrl || thumbnails.length > 0) && "border-white/10 bg-black/60 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]",
                    !isDragging && !(imageUrl || thumbnails.length > 0) && "border-white/[0.08] bg-neutral-950/50 hover:bg-neutral-900/50 hover:border-emerald-500/40 hover:shadow-[0_0_24px_rgba(16,185,129,0.1)]",
                    isLoading && "animate-pulse pointer-events-none"
                )}
            >
                {multiple ? (
                    // Multi-image mode
                    <div className="w-full h-full p-2">
                        {thumbnails.length > 0 ? (
                            <div className="grid grid-cols-3 gap-1 h-full">
                                {thumbnails.map((thumb, idx) => (
                                    <div key={idx} className="relative rounded-lg overflow-hidden aspect-square">
                                        <img src={thumb} alt="" className="w-full h-full object-cover" />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newThumbs = thumbnails.filter((_, i) => i !== idx);
                                                const newFiles = selectedFiles.filter((_, i) => i !== idx);

                                                setThumbnails(newThumbs);
                                                setSelectedFiles(newFiles);

                                                if (onMultipleSelect) {
                                                    onMultipleSelect(newFiles);
                                                }
                                            }}
                                            className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full"
                                        >
                                            <X size={10} className="text-white" />
                                        </button>
                                    </div>
                                ))}
                                {thumbnails.length < 6 && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                        className="flex items-center justify-center aspect-square rounded-lg border-2 border-dashed border-white/20 hover:border-emerald-500/50"
                                    >
                                        <Plus size={16} className="text-neutral-500" />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-6">
                                <Grid size={24} className="text-neutral-500 mb-2" />
                                <p className="text-[11px] font-bold text-neutral-300">Add Multiple Images</p>
                                <p className="text-[10px] text-neutral-500 font-medium">Up to 6 images</p>
                                {onBrowseGallery && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onBrowseGallery(); }}
                                        className="mt-3 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20 transition-all uppercase tracking-wider"
                                    >
                                        Browse Gallery
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    // Single image mode
                    imageUrl ? (
                        <>
                            <img src={imageUrl} alt="Source" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onClear(); setThumbnails([]); }}
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
                            <div className="text-center px-4">
                                <p className="text-[11px] font-bold text-neutral-300">Drop source photo</p>
                                <p className="text-[10px] text-neutral-500 font-medium mb-3">PNG, JPG up to 10MB</p>
                                <div className="flex gap-2 justify-center">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 text-[10px] font-bold rounded-lg border border-white/10 transition-all uppercase tracking-wider"
                                    >
                                        Upload
                                    </button>
                                    {onBrowseGallery && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onBrowseGallery(); }}
                                            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20 transition-all uppercase tracking-wider"
                                        >
                                            Gallery
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple={multiple}
                    onChange={handleFileChange}
                />
            </div>

            {(imageUrl || thumbnails.length > 0) && !multiple && (
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => { fileInputRef.current?.click(); setThumbnails([]); }}
                        className="py-2 text-[10px] font-bold text-neutral-400 hover:text-neutral-200 border border-white/5 rounded-lg hover:bg-white/5 transition-all uppercase tracking-wider"
                    >
                        Replace
                    </button>
                    {onBrowseGallery && (
                        <button
                            onClick={onBrowseGallery}
                            className="py-2 text-[10px] font-bold text-emerald-500/80 hover:text-emerald-400 border border-emerald-500/10 rounded-lg hover:bg-emerald-500/5 transition-all uppercase tracking-wider"
                        >
                            Gallery
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default UploadCard;
