import * as SwitchPrimitives from "@rn-primitives/switch"
import { cn } from "cn"
import { Platform } from "react-native"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitives.Root>) {
  return (
    <SwitchPrimitives.Root
      className={cn(
        "h-5 w-11 shrink-0 flex-row items-center rounded-full border-2",
        Platform.select({
          web: "focus-visible:border-ring focus-visible:ring-ring/50 peer inline-flex outline-none transition-all focus-visible:ring-[3px] disabled:cursor-not-allowed",
        }),
        props.checked
          ? "border-primary bg-primary"
          : "border-transparent bg-input/90",
        props.disabled && "opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "h-4 w-6 rounded-full bg-background shadow-sm transition-transform",
          Platform.select({
            web: "pointer-events-none block ring-0",
          }),
          props.checked
            ? "translate-x-4 dark:bg-primary-foreground"
            : "dark:bg-foreground translate-x-0"
        )}
      />
    </SwitchPrimitives.Root>
  )
}

export { Switch }
