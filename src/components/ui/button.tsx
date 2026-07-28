// src/components/ui/button.tsx
// Minimal version, same reasoning as card.tsx — only plain
// onClick + className usage appears in the ported components, no
// variant/size prop system in use, so no cva dependency needed.

import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors',
        className
      )}
      {...props}
    />
  );
}
