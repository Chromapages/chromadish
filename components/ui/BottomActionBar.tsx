import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from './Button';

interface BottomActionBarProps {
    onGenerate: () => void;
    isLoading: boolean;
    disabled: boolean;
    statusText?: string;
    error?: string | null;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({
    onGenerate,
    isLoading,
    disabled,
    statusText,
    error
}) => {
    return (
        <div className="w-full bg-neutral-900/80 backdrop-blur-xl border border-white/10 p-3 rounded-[24px] flex items-center justify-between shadow-2xl ring-1 ring-white/5 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4 px-3">
                <div className="flex flex-col">
                    <p className={cn(
                        "text-[10px] uppercase tracking-widest font-bold",
                        error ? "text-red-400" : "text-neutral-500"
                    )}>
                        {error ? "Error" : statusText || "Ready"}
                    </p>
                    <p className="text-[12px] font-bold text-neutral-300">
                        {error ? error : "1 Studio Credit"}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    onClick={onGenerate}
                    disabled={disabled || isLoading}
                    isLoading={isLoading}
                    variant="primary"
                    className="shadow-lg shadow-white/5 min-w-[160px]"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={16} />
                            Generating...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 font-black">
                            <Sparkles size={16} className="text-emerald-500" />
                            GENERATE
                        </span>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default BottomActionBar;
