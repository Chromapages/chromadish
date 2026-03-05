import React from 'react';
import { cn } from '../../utils/cn';

interface Option {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange, className }) => {
  return (
    <div className={cn("flex p-1.5 bg-neutral-950/50 rounded-xl border border-white/5", className)}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 py-2 text-[12px] font-bold rounded-lg transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
              isActive
                ? "bg-neutral-800 text-white shadow-[0_2px_8px_rgba(0,0,0,0.5)] border border-white/10"
                : "text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.02]"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
