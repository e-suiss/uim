import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Platform, Pressable } from "react-native"
import { TextClassContext } from "@/components/ui/text"

const buttonVariants = cva(
  cn(
    "shrink-0 flex-row items-center justify-center rounded-full border border-transparent",
    Platform.select({
      web: "whitespace-nowrap outline-none transition-all select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none",
    })
  ),
  {
    variants: {
      variant: {
        default: cn(
          "bg-primary active:bg-primary/80",
          Platform.select({ web: "hover:bg-primary/80" })
        ),
        outline: cn(
          "border-border bg-background active:bg-muted dark:bg-transparent dark:active:bg-input/30",
          Platform.select({ web: "hover:bg-muted dark:hover:bg-input/30" })
        ),
        secondary: cn(
          "bg-secondary active:opacity-80",
          Platform.select({ web: "hover:opacity-80" })
        ),
        ghost: cn(
          "active:bg-muted dark:active:bg-muted/50",
          Platform.select({ web: "hover:bg-muted dark:hover:bg-muted/50" })
        ),
        destructive: cn(
          "bg-destructive/10 active:bg-destructive/20 dark:bg-destructive/20 dark:active:bg-destructive/30",
          Platform.select({
            web: "hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:hover:bg-destructive/30",
          })
        ),
        link: "",
      },
      size: {
        default: "h-9 gap-1.5 px-3",
        xs: "h-6 gap-1 px-2.5",
        sm: "h-8 gap-1 px-3",
        lg: "h-10 gap-1.5 px-4",
        icon: "size-9",
        "icon-xs": "size-6",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const buttonTextVariants = cva(
  cn(
    "text-sm font-medium text-foreground",
    Platform.select({ web: "pointer-events-none transition-colors" })
  ),
  {
    variants: {
      variant: {
        default: "text-primary-foreground",
        outline: "",
        secondary: "text-secondary-foreground",
        ghost: "",
        destructive: "text-destructive",
        link: cn(
          "text-primary",
          Platform.select({ web: "underline-offset-4 hover:underline" })
        ),
      },
      size: {
        default: "",
        xs: "text-xs",
        sm: "",
        lg: "",
        icon: "",
        "icon-xs": "text-xs",
        "icon-sm": "",
        "icon-lg": "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants>

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(
          props.disabled && "opacity-50",
          buttonVariants({ variant, size }),
          className
        )}
        role="button"
        {...props}
      />
    </TextClassContext.Provider>
  )
}

export type { ButtonProps }
export { Button, buttonTextVariants, buttonVariants }
