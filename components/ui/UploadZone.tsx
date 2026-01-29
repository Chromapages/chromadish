import React, { useCallback, useMemo, useState } from 'react';
import { cn } from '../../lib/utils';

type UploadZoneProps = {
  value?: { name: string; previewUrl: string } | null;
  onFile: (file: File) => void;
  accept?: string;
  maxBytes?: number;
  disabled?: boolean;
  hint?: string;
};

export default function UploadZone({
  value,
  onFile,
  accept = 'image/*',
  maxBytes = 10 * 1024 * 1024,
  disabled,
  hint,
}: UploadZoneProps) {
  const [drag, setDrag] = useState(false);

  const onPick = useCallback(
    (f?: File | null) => {
      if (!f) return;
      if (f.size > maxBytes) return;
      onFile(f);
    },
    [maxBytes, onFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      setDrag(false);
      const f = e.dataTransfer.files?.[0];
      onPick(f);
    },
    [disabled, onPick]
  );

  const maxLabel = useMemo(() => `${Math.round(maxBytes / (1024 * 1024))}MB max`, [maxBytes]);

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      className={cn(
        'block cursor-pointer select-none rounded-2xl border border-dashed p-3 transition',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        drag
          ? 'border-emerald-400/60 bg-emerald-400/10'
          : 'border-neutral-800/70 bg-neutral-950/30 hover:bg-neutral-900/40'
      )}
    >
      <input
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(e) => onPick(e.target.files?.[0])}
      />

      {value ? (
        <div className="flex items-center gap-3">
          <img
            src={value.previewUrl}
            alt="Uploaded"
            className="h-14 w-14 rounded-xl object-cover border border-neutral-800/70"
          />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-neutral-100 truncate">{value.name}</div>
            <div className="mt-0.5 text-[10px] text-neutral-500 truncate">Drop to replace - {maxLabel}</div>
          </div>
        </div>
      ) : (
        <div className="py-3">
          <div className="text-xs font-semibold text-neutral-100">Upload image</div>
          <div className="mt-1 text-[10px] text-neutral-500">Drag & drop or click - {hint ?? maxLabel}</div>
        </div>
      )}
    </label>
  );
}
