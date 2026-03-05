import React, { useState, useEffect } from 'react';
import {
    X,
    Search,
    Upload,
    Image as ImageIcon,
    Check,
    Loader2,
    AlertCircle,
    Trash2,
    ChevronDown,
} from 'lucide-react';
import {
    getMediaAssets,
    searchMediaAssets,
    uploadMediaAsset,
    deleteMediaAsset,
    MediaAsset
} from '../../lib/supabase/media';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MediaGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (asset: MediaAsset) => void;
}

export const MediaGalleryModal: React.FC<MediaGalleryModalProps> = ({
    isOpen,
    onClose,
    onSelect,
}) => {
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            resetAndLoad();
        }
    }, [isOpen]);

    const resetAndLoad = async () => {
        setPage(1);
        setAssets([]);
        setHasMore(false);
        setSearchQuery('');
        setIsSearching(false);
        setConfirmDeleteId(null);
        setLoading(true);
        setError(null);
        try {
            const { assets: data, hasMore: more } = await getMediaAssets(1);
            setAssets(data);
            setHasMore(more);
        } catch {
            setError('Failed to load images. Check your Supabase connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = async () => {
        const nextPage = page + 1;
        setLoadingMore(true);
        try {
            const { assets: data, hasMore: more } = await getMediaAssets(nextPage);
            setAssets((prev: MediaAsset[]) => [...prev, ...data]);
            setHasMore(more);
            setPage(nextPage);
        } catch {
            setError('Failed to load more images.');
        } finally {
            setLoadingMore(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            resetAndLoad();
            return;
        }
        setLoading(true);
        setIsSearching(true);
        setHasMore(false);
        try {
            const data = await searchMediaAssets(searchQuery);
            setAssets(data);
        } catch {
            setError('Search failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchClear = () => {
        setSearchQuery('');
        setIsSearching(false);
        resetAndLoad();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        try {
            const newAsset = await uploadMediaAsset(file, file.name);
            setAssets((prev: MediaAsset[]) => [newAsset, ...prev]);
            setSelectedAssetId(newAsset.id);
        } catch (err: any) {
            setError(err.message || 'Upload failed. Ensure storage bucket "food-assets" exists.');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteConfirm = async (asset: MediaAsset) => {
        setDeletingId(asset.id);
        setConfirmDeleteId(null);
        try {
            await deleteMediaAsset(asset.id, asset.storage_path);
            setAssets((prev: MediaAsset[]) => prev.filter((a: MediaAsset) => a.id !== asset.id));
            if (selectedAssetId === asset.id) setSelectedAssetId(null);
        } catch {
            setError('Failed to delete image.');
        } finally {
            setDeletingId(null);
        }
    };

    if (!isOpen) return null;

    const selectedAsset = assets.find(a => a.id === selectedAssetId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-4xl max-h-[90vh] glass-panel rounded-3xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-display font-bold premium-gradient-text">Media Gallery</h2>
                        <p className="text-surface-400 text-sm">Select a high-quality original image</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 glass-button text-surface-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-white/10 flex flex-wrap items-center gap-4">
                    <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search images..."
                                value={searchQuery}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-primary-500/50 transition-colors"
                            />
                        </div>
                        <button type="submit" className="glass-button px-4 py-2 text-sm">Search</button>
                        {isSearching && (
                            <button type="button" onClick={handleSearchClear} className="glass-button px-4 py-2 text-sm text-surface-400 hover:text-white">
                                Clear
                            </button>
                        )}
                    </form>

                    <label className="glass-button px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-primary-500/10 active:scale-95 transition-all">
                        {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                        <span>Upload New</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center text-surface-400 gap-4">
                            <Loader2 className="animate-spin text-primary-500" size={40} />
                            <p>Fetching your assets...</p>
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-surface-400 gap-4 border-2 border-dashed border-white/5 rounded-3xl">
                            <ImageIcon size={48} className="opacity-20" />
                            <p>{isSearching ? 'No results found.' : 'No images found. Upload your first one!'}</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {assets.map((asset: MediaAsset) => (
                                    <div
                                        key={asset.id}
                                        onClick={() => {
                                            if (confirmDeleteId === asset.id) return;
                                            setSelectedAssetId(asset.id);
                                        }}
                                        className={cn(
                                            "group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300",
                                            selectedAssetId === asset.id
                                                ? "border-primary-500 ring-4 ring-primary-500/20"
                                                : "border-transparent hover:border-white/20"
                                        )}
                                    >
                                        <img
                                            src={asset.public_url}
                                            alt={asset.alt_text || asset.filename}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                            <span className="text-[10px] text-white truncate w-full">{asset.filename}</span>
                                        </div>

                                        {/* Delete button / confirm overlay */}
                                        {deletingId === asset.id ? (
                                            <div className="absolute top-2 right-2 bg-black/70 rounded-full p-1.5">
                                                <Loader2 size={14} className="animate-spin text-white" />
                                            </div>
                                        ) : confirmDeleteId === asset.id ? (
                                            <div
                                                className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 p-2"
                                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                            >
                                                <p className="text-white text-xs font-semibold text-center">Delete image?</p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleDeleteConfirm(asset)}
                                                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDeleteId(null)}
                                                        className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                    e.stopPropagation();
                                                    setConfirmDeleteId(asset.id);
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                                                title="Delete image"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}

                                        {selectedAssetId === asset.id && confirmDeleteId !== asset.id && (
                                            <div className="absolute top-2 left-2 bg-primary-500 text-white p-1 rounded-full shadow-lg">
                                                <Check size={14} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {hasMore && (
                                <div className="mt-6 flex justify-center">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="glass-button px-6 py-2 flex items-center gap-2 hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {loadingMore ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : (
                                            <ChevronDown size={16} />
                                        )}
                                        <span>{loadingMore ? 'Loading...' : 'Load More'}</span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex items-center justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl text-surface-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!selectedAssetId}
                        onClick={() => selectedAsset && onSelect(selectedAsset)}
                        className="px-8 py-2 premium-gradient-bg rounded-xl font-bold disabled:opacity-50 disabled:grayscale transition-all active:scale-95 shadow-lg shadow-primary-500/20"
                    >
                        Select Image
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MediaGalleryModal;
