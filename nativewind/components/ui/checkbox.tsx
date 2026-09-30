import * as CheckboxPrimitive from "@rn-primitives/checkbox"
import { cn } from "cn"
import { CheckIcon } from "phosphor-react-native"
import { Platform } from "react-native"
import { Icon } from "@/components/ui/icon"

const DEFAULT_HIT_SLOP = 24

function Checkbox({
  className,
  checkedClassName,
  indicatorClassName,
  iconClassName,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  checkedClassName?: string
  indicatorClassName?: string
  iconClassName?: string
}) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "size-4 shrink-0 items-center justify-center rounded-[5px] border border-transparent bg-input-90",
        Platform.select({
          web: "peer cursor-default outline-none transition-shadow focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring-30 disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive-20 dark:aria-invalid:border-destructive-50 dark:aria-invalid:ring-destructive-40",
          native: "overflow-hidden",
        }),
        props.checked && cn("border-primary bg-primary", checkedClassName),
        props.disabled && "opacity-50",
        className
      )}
      hitSlop={DEFAULT_HIT_SLOP}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn(
          "h-full w-full items-center justify-center bg-primary",
          indicatorClassName
        )}
      >
        <Icon
          as={CheckIcon}
          size={14}
          weight="bold"
          className={cn("text-primary-foreground", iconClassName)}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
