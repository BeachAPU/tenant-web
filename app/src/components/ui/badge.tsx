import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'src/lib/utils';

// DESIGN.md §5: status pills. `success` = active/enabled, `light` = inactive/disabled,
// primary/info/warning/error = light-tinted pills for other statuses. Always size="sm" in tables.
const tintPrimary = 'border-0 bg-primary/10 text-primary dark:bg-white/10 dark:text-white';
const tintInfo = 'border-0 bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400';
const tintWarning = 'border-0 bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400';
const tintError = 'border-0 bg-error/10 text-error dark:bg-error/15 dark:text-red-400';
const tintSuccess = 'border-0 light-badge-active dark:bg-success/15 dark:text-success';
const tintLight = 'border-0 bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80';

const badgeVariants = cva(
  'inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: tintPrimary,
        primary: tintPrimary,
        secondary: tintInfo,
        success: tintSuccess,
        warning: tintWarning,
        info: tintInfo,
        error: tintError,
        light: tintLight,
        outline: 'border-primary text-primary',
        outlineSecondary: 'border-secondary text-secondary',
        outlineSuccess: 'border-success text-success',
        outlineWarning: 'border-warning text-warning',
        outlineError: 'border-error text-error',
        outlineInfo: 'border-info text-info',
        lightPrimary: tintPrimary,
        lightSecondary: tintInfo,
        lightSuccess: tintSuccess,
        lightError: tintError,
        lightInfo: tintInfo,
        lightWarning: tintWarning,
        destructive: tintError,
        gray: tintLight,
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };