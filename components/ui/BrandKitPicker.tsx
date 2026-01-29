
import React from 'react';
import { cn } from '../../lib/utils';
import { BRAND_KITS, BrandKit } from '../../constants/presets';
import { Check } from 'lucide-react';

type BrandKitPickerProps = {
  value: string;
  onChange: (id: string) => void;
};

export default function BrandKitPicker({ value, onChange }: BrandKitPickerProps) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {BRAND_KITS.map((kit) => {
        const active = kit.id === value;
        return (
          <button
            key={kit.id}
            type="button"
            onClick={() => onChange(kit.id)}
            className={cn(
              'relative text-left rounded-2xl border p-3 transition overflow-hidden group',
              active
                ? 'border-emerald-400/50 bg-emerald-400/10'
                : 'border-neutral-800/70 bg-neutral-950/30 hover:bg-neutral-900/40'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: kit.colorAccent }}
                />
                <span className="text-[12px] font-semibold text-neutral-100">{kit.name}</span>
              </div>
              {active && <Check className="w-3 h-3 text-emerald-400" />}
            </div>
            <div className="mt-1 text-[10px] text-neutral-500 line-clamp-1">{kit.description}</div>
            
            {/* Visual accent bar */}
            {active && (
              <div 
                className="absolute left-0 top-0 bottom-0 w-1" 
                style={{ backgroundColor: kit.colorAccent }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
