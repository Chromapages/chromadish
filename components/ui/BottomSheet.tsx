import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
    const [isVisible, setIsVisible] = useState(isOpen);

    useEffect(() => {
        if (isOpen) setIsVisible(true);
        else setTimeout(() => setIsVisible(false), 300); // Wait for animation
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
            {/* Backdrop */}
            <div
                className={cn(
                    "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className={cn(
                    "relative w-full bg-neutral-900 rounded-t-3xl border-t border-white/10 shadow-2xl transition-transform duration-300 ease-out max-h-[85vh] flex flex-col",
                    isOpen ? "translate-y-0" : "translate-y-full"
                )}
            >
                {/* Handle */}
                <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                    <div className="w-12 h-1.5 rounded-full bg-white/20" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 shrink-0">
                    <h3 className="text-sm font-bold text-neutral-200 tracking-wide">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar pb-safe">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default BottomSheet;
