import * as TabsPrimitive from "@rn-primitives/tabs"
import { cn } from "cn"
import { Platform } from "react-native"
import { TextClassContext } from "@/components/ui/text"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "h-9 flex-row items-center justify-center rounded-full bg-muted p-1",
        Platform.select({ web: "inline-flex w-fit", native: "self-start" }),
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { value } = TabsPrimitive.useRootContext()
  return (
    <TextClassContext.Provider
      value={cn(
        "text-sm font-medium text-foreground-60 dark:text-muted-foreground",
        value === props.value && "text-foreground dark:text-foreground"
      )}
    >
      <TabsPrimitive.Trigger
        className={cn(
          "flex-row items-center justify-center gap-2 rounded-full border border-transparent px-3 py-1",
          Platform.select({
            web: "inline-flex h-full flex-1 cursor-default whitespace-nowrap transition-all hover:text-foreground focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring-50 disabled:pointer-events-none dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
          }),
          props.disabled && "opacity-50",
          props.value === value && "bg-background dark:bg-input-30",
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(Platform.select({ web: "flex-1 outline-none" }), className)}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
