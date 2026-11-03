import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs sm:text-sm font-heading font-bold transition-all focus-tactical disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-zinc-200 shadow-sm",
        amber: "bg-amber-400 text-black hover:bg-amber-300 shadow-sm",
        secondary:
          "bg-[#18181b] text-zinc-200 hover:text-white hover:bg-[#202025] border border-[#27272a] hover:border-zinc-500",
        outline:
          "border border-[#27272a] bg-transparent text-zinc-200 hover:bg-[#18181b] hover:text-white",
        destructive:
          "bg-red-600 text-white hover:bg-red-500",
        ghost: "text-zinc-300 hover:bg-white/10 hover:text-white",
        link: "text-amber-400 hover:text-amber-300 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "px-4 py-2.5",
        sm: "px-3.5 py-2 text-xs",
        lg: "px-5 py-3.5",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
