
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold text-neutral-100 tracking-wide">{getLabel(value)}</span>
        <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full ring-1 ring-emerald-500/20">{value}%</span>
      </div>

      <div className="relative h-8 flex items-center group">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className={cn(
            "w-full h-1.5 rounded-full appearance-none bg-neutral-900 border border-white/5 cursor-pointer outline-none transition-all",
            "group-hover:bg-neutral-800",
            "accent-emerald-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:border-[3px]",
            "[&::-webkit-slider-thumb]:border-neutral-950 [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(16,185,129,0.4)]",
            "[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110",
            "focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          )}
        />
      </div>

      <p className="text-[10px] text-neutral-500 leading-relaxed italic">
        {getDescription(value)}
      </p>
    </div>
  );
}
