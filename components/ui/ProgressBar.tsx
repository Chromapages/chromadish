import React from 'react';
import { cn } from '../../lib/utils';

type ProgressBarProps = {
  value?: number;
  indeterminate?: boolean;
};

export default function ProgressBar({ value = 0, indeterminate }: ProgressBarProps) {
  return (
    <div className="h-2 rounded-full bg-neutral-900/70 overflow-hidden border border-neutral-800/70">
      <div
        className={cn('h-full rounded-full bg-emerald-400', indeterminate ? 'progress-indeterminate' : '')}
        style={indeterminate ? undefined : { width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
