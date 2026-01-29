import React from 'react';
import { cn } from '../../lib/utils';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: 'default' | 'subtle';
};

export default function Card({ className, tone = 'default', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        'rounded-2xl border border-neutral-800/70',
        tone === 'default' ? 'bg-neutral-900/40' : 'bg-neutral-950/40',
        className
      )}
    />
  );
}
