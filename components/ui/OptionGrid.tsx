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
              "flex flex-col items-center justify-center p-3 rounded-xl transition-all border text-center",
              isActive
                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-100 ring-1 ring-emerald-500/20"
                : "bg-neutral-950/50 border-white/5 text-neutral-500 hover:border-white/20 hover:text-neutral-300"
            )}
          >
            <span className="text-[11px] font-bold line-clamp-1">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default OptionGrid;
