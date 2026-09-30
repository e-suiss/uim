import * as RadioGroupPrimitive from "@rn-primitives/radio-group"
import { cn } from "cn"
import { Platform, View } from "react-native"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root className={cn("gap-3", className)} {...props} />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        "aspect-square size-4 shrink-0 items-center justify-center rounded-full border border-transparent bg-input-90",
        Platform.select({
          web: "outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring-30 disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive-20 dark:aria-invalid:border-destructive-50 dark:aria-invalid:ring-destructive-40",
        }),
        props.disabled && "opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="size-4 items-center justify-center rounded-full bg-primary">
        <View className="size-2 rounded-full bg-primary-foreground dark:size-2.5" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
