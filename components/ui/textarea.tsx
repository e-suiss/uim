import { cn } from "cn"
import { Platform, TextInput } from "react-native"

function Textarea({
  className,
  multiline = true,
  numberOfLines = Platform.select({ web: 2, native: 8 }),
  ...props
}: React.ComponentProps<typeof TextInput> & React.RefAttributes<TextInput>) {
  return (
    <TextInput
      className={cn(
        "min-h-16 w-full flex-row rounded-2xl border border-transparent bg-input/50 px-3 py-3 text-base text-foreground focus:border-ring md:text-sm",
        Platform.select({
          web: "field-sizing-content resize-none outline-none transition-[color,box-shadow,background-color] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        }),
        props.editable === false && "opacity-50",
        className
      )}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      placeholderTextColorClassName="accent-muted-foreground"
      {...props}
    />
  )
}

export { Textarea }
