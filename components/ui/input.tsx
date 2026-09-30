import { cn } from "cn"
import { Platform, TextInput } from "react-native"

function Input({
  className,
  ...props
}: React.ComponentProps<typeof TextInput> & React.RefAttributes<TextInput>) {
  return (
    <TextInput
      className={cn(
        "h-9 w-full min-w-0 flex-row items-center rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-base leading-5 text-foreground focus:border-ring",
        props.editable === false &&
          cn(
            "opacity-50",
            Platform.select({
              web: "disabled:pointer-events-none disabled:cursor-not-allowed",
            })
          ),
        Platform.select({
          web: cn(
            "outline-none transition-[color,box-shadow,background-color] placeholder:text-muted-foreground md:text-sm",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
            "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
          ),
        }),
        className
      )}
      placeholderTextColorClassName="accent-muted-foreground"
      {...props}
    />
  )
}

export { Input }
