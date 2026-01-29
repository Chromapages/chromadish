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
    <div className={cn("flex p-1 bg-black/40 rounded-xl ring-1 ring-white/5", className)}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all",
              isActive
                ? "bg-neutral-800 text-neutral-50 shadow-sm shadow-black/50 ring-1 ring-white/10"
                : "text-neutral-500 hover:text-neutral-300"
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
