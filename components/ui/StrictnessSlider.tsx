
import React from 'react';
import { cn } from '../../lib/utils';

type StrictnessSliderProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function StrictnessSlider({ value, onChange }: StrictnessSliderProps) {
  const getLabel = (v: number) => {
    if (v < 25) return 'Creative';
    if (v < 50) return 'Balanced';
    if (v < 75) return 'Directed';
    return 'Strict';
  };

  const getDescription = (v: number) => {
    if (v < 25) return 'AI has high freedom to interpret the scene.';
    if (v < 50) return 'Equal weight to user input and AI creativity.';
    if (v < 75) return 'AI follows instructions closely.';
    return 'AI adheres strictly to the defined parameters.';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-neutral-100">{getLabel(value)}</span>
        <span className="text-[10px] text-neutral-500 font-mono">{value}%</span>
      </div>
      
      <div className="relative h-6 flex items-center">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className={cn(
            "w-full h-1.5 rounded-full appearance-none bg-neutral-800 cursor-pointer outline-none",
            "accent-emerald-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:border-2",
            "[&::-webkit-slider-thumb]:border-neutral-950 [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(52,211,153,0.3)]"
          )}
        />
      </div>
      
      <p className="text-[10px] text-neutral-500 leading-relaxed italic">
        {getDescription(value)}
      </p>
    </div>
  );
}
