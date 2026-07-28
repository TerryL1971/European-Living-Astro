// src/components/ui/card.tsx
// Minimal version — the original codebase likely has a fuller shadcn/ui
// Card (with CardHeader, CardTitle, CardFooter, etc.), but only <Card>
// and <CardContent> with plain className props are actually used by the
// components being ported here. Built lightweight rather than pulling in
// the full shadcn/radix machinery for two className-merging wrappers.

import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border bg-[var(--brand-bg-card)] text-[var(--brand-text)] shadow', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6', className)} {...props} />;
}
