import { Slot } from "@rn-primitives/slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Platform, View } from "react-native"
import { TextClassContext } from "@/components/ui/text"

const badgeVariants = cva(
  cn(
    "h-5 shrink-0 flex-row items-center justify-center gap-1 self-start overflow-hidden rounded-3xl border border-transparent px-2 py-0.5",
    Platform.select({
      web: "focus-visible:border-ring focus-visible:ring-ring-50 aria-invalid:ring-destructive-20 dark:aria-invalid:ring-destructive-40 aria-invalid:border-destructive w-fit whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3",
    })
  ),
  {
    variants: {
      variant: {
        default: cn(
          "bg-primary",
          Platform.select({ web: "[a&]:hover:bg-primary-80" })
        ),
        secondary: cn(
          "bg-secondary",
          Platform.select({ web: "[a&]:hover:bg-secondary-80" })
        ),
        destructive: cn(
          "bg-destructive-10 dark:bg-destructive-20",
          Platform.select({ web: "[a&]:hover:bg-destructive-20" })
        ),
        outline: cn(
          "border-border",
          Platform.select({ web: "[a&]:hover:bg-muted" })
        ),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const badgeTextVariants = cva("text-xs font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      destructive: "text-destructive",
      outline: "text-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

type BadgeProps = React.ComponentProps<typeof View> &
  React.RefAttributes<View> & {
    asChild?: boolean
  } & VariantProps<typeof badgeVariants>

function Badge({ className, variant, asChild, ...props }: BadgeProps) {
  const Component = asChild ? Slot : View
  return (
    <TextClassContext.Provider value={badgeTextVariants({ variant })}>
      <Component
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    </TextClassContext.Provider>
  )
}

export type { BadgeProps }
export { Badge, badgeTextVariants, badgeVariants }
