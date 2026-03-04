import * as React from "react"

import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "border-transparent bg-primary text-primary-foreground",
  secondary:
    "border-transparent bg-secondary text-secondary-foreground",
  destructive:
    "border-transparent bg-destructive/10 text-destructive border-destructive/20",
  outline:
    "text-foreground border-border",
}

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & { variant?: BadgeVariant }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5",
        "text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1",
        "[&>svg]:size-3 [&>svg]:pointer-events-none",
        "transition-colors duration-150",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
