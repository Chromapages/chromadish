import React from 'react';
import { cn } from '../../utils/cn';

interface Option {
  label: string;
  value: string;
}

interface OptionGridProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  columns?: 2 | 3;
}

const OptionGrid: React.FC<OptionGridProps> = ({ options, value, onChange, columns = 2 }) => {
  return (
    <div className={cn(
      "grid gap-2",
      columns === 2 ? "grid-cols-2" : "grid-cols-3"
    )}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-col items-center justify-center p-3 min-h-[56px] rounded-xl transition-all duration-300 border text-center relative overflow-hidden group outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
              isActive
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                : "bg-neutral-950/50 border-white/[0.05] text-neutral-400 hover:border-white/15 hover:text-neutral-200 hover:bg-white/[0.02]"
            )}
          >
            <span className="text-[12px] font-bold line-clamp-1 relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default OptionGrid;
