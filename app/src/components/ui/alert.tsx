import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "src/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg px-4 py-3 text-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        primary: "bg-primary text-white",
        secondary:"bg-secondary text-white",
        success:"bg-success text-white",
        error:"border border-error bg-red-50 text-red-600 dark:border-error/30 dark:bg-error/15 dark:text-red-400",
        warning:"bg-warning text-white",
        info:"bg-info text-white",
        lightprimary:"bg-lightprimary text-primary [&>svg]:text-primary",
        lightsecondary:"bg-lightsecondary text-secondary [&>svg]:text-secondary",
        // DESIGN.md §6 banners: 1px border + tinted bg + coloured text.
        lightsuccess:"border border-success bg-success/10 text-green-700 dark:border-success/30 dark:bg-success/15 dark:text-success [&>svg]:text-current",
        lightwarning:"border border-warning bg-amber-50 text-amber-700 dark:border-warning/30 dark:bg-warning/15 dark:text-amber-400 [&>svg]:text-current",
        lighterror:"border border-error bg-red-50 text-red-600 dark:border-error/30 dark:bg-error/15 dark:text-red-400 [&>svg]:text-current",
        lightinfo:"border border-primary/30 bg-primary/5 light-text-navy dark:border-white/20 dark:bg-white/5 [&>svg]:text-current",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
