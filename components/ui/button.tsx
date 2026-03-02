import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
type ButtonSize = "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-primary text-primary-foreground hover:bg-indigo-600 active:bg-indigo-700",
  destructive:
    "bg-destructive text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-destructive/30",
  outline:
    "border border-primary text-primary bg-transparent hover:bg-primary/8 active:bg-primary/15",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-indigo-100 active:bg-indigo-200",
  ghost:
    "text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
  link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
}

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-9 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs gap-1.5",
  lg: "h-10 px-6 text-sm",
  icon: "size-9",
  "icon-sm": "size-8",
  "icon-lg": "size-10",
}

interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-150",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 shrink-0",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        variantClasses[variant ?? "default"],
        sizeClasses[size ?? "default"],
        className
      )}
      {...props}
    />
  )
}

// Kept for alert-dialog.tsx which imports buttonVariants
function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-150",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 shrink-0",
    "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
    variantClasses[variant],
    sizeClasses[size],
    className
  )
}

export { Button, buttonVariants }
