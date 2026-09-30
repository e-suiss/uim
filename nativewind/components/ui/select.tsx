import * as SelectPrimitive from "@rn-primitives/select"
import { cn } from "cn"
import { CaretDownIcon, CaretUpIcon, CheckIcon } from "phosphor-react-native"
import * as React from "react"
import { Platform, StyleSheet, View } from "react-native"
import { FadeIn, FadeOut, ReduceMotion } from "react-native-reanimated"
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens"
import { Icon } from "@/components/ui/icon"
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view"
import { TextClassContext } from "@/components/ui/text"

type Option = SelectPrimitive.Option

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

function SelectValue({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value> & {
  className?: string
}) {
  const { value } = SelectPrimitive.useRootContext()
  return (
    <SelectPrimitive.Value
      ref={ref}
      className={cn(
        "line-clamp-1 flex flex-row items-center gap-1.5 text-sm text-foreground",
        !value && "text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function SelectTrigger({
  ref,
  className,
  children,
  size = "default",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  children?: React.ReactNode
  size?: "default" | "sm"
}) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "h-9 flex-row items-center justify-between gap-1.5 rounded-3xl border border-transparent bg-input-50 px-3 py-2",
        Platform.select({
          web: "w-fit whitespace-nowrap text-sm outline-none transition-[color,box-shadow,background-color] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring-30 disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive-20 dark:aria-invalid:border-destructive-50 dark:aria-invalid:ring-destructive-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        }),
        props.disabled && "opacity-50",
        size === "sm" && "h-8",
        className
      )}
      {...props}
    >
      {children}
      <Icon
        as={CaretDownIcon}
        aria-hidden={true}
        className="size-4 text-muted-foreground"
      />
    </SelectPrimitive.Trigger>
  )
}

const FullWindowOverlay =
  Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment

function SelectContent({
  className,
  children,
  position = "popper",
  portalHost,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & {
  className?: string
  portalHost?: string
}) {
  return (
    <SelectPrimitive.Portal hostName={portalHost}>
      <FullWindowOverlay>
        <SelectPrimitive.Overlay
          style={Platform.select({ native: StyleSheet.absoluteFill })}
          asChild={Platform.OS !== "web"}
        >
          <NativeOnlyAnimatedView
            className="z-50"
            entering={FadeIn.reduceMotion(ReduceMotion.System)}
            exiting={FadeOut.reduceMotion(ReduceMotion.System)}
            as="Pressable"
          >
            <TextClassContext.Provider value="text-sm text-popover-foreground">
              <SelectPrimitive.Content
                className={cn(
                  "relative z-50 min-w-36 rounded-3xl border border-foreground-5 bg-popover shadow-lg dark:border-foreground-10",
                  Platform.select({
                    web: cn(
                      "animate-in fade-in-0 zoom-in-95 origin-(--radix-select-content-transform-origin) max-h-52 overflow-y-auto overflow-x-hidden duration-100",
                      props.side === "bottom" && "slide-in-from-top-2",
                      props.side === "top" && "slide-in-from-bottom-2"
                    ),
                  }),
                  position === "popper" &&
                    Platform.select({
                      web: cn(
                        props.side === "bottom" && "translate-y-1",
                        props.side === "top" && "-translate-y-1"
                      ),
                    }),
                  className
                )}
                position={position}
                {...props}
              >
                <SelectScrollUpButton />
                <SelectPrimitive.Viewport
                  className={cn(
                    "p-1.5",
                    position === "popper" &&
                      cn(
                        "w-full",
                        Platform.select({
                          web: "h-[var(--radix-select-trigger-height)] min-w-[var(--radix-select-trigger-width)]",
                        })
                      )
                  )}
                >
                  {children}
                </SelectPrimitive.Viewport>
                <SelectScrollDownButton />
              </SelectPrimitive.Content>
            </TextClassContext.Provider>
          </NativeOnlyAnimatedView>
        </SelectPrimitive.Overlay>
      </FullWindowOverlay>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn("px-3 py-2.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  ...props
}: Omit<React.ComponentProps<typeof SelectPrimitive.Item>, "children">) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative w-full flex-row items-center gap-2.5 rounded-2xl py-2 pr-8 pl-3 active:bg-accent",
        Platform.select({
          web: "group cursor-default outline-hidden select-none hover:bg-accent focus:bg-accent data-[disabled]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
        }),
        props.disabled && "opacity-50",
        className
      )}
      {...props}
    >
      <View className="absolute right-2 size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Icon as={CheckIcon} className="size-4 shrink-0 text-foreground" />
        </SelectPrimitive.ItemIndicator>
      </View>
      <SelectPrimitive.ItemText
        className={cn(
          "select-none text-sm font-medium text-foreground",
          Platform.select({
            web: "group-hover:text-accent-foreground group-focus:text-accent-foreground",
          })
        )}
      />
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn(
        "-mx-1.5 my-1.5 h-px bg-border",
        Platform.select({ web: "pointer-events-none" }),
        className
      )}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  if (Platform.OS !== "web") {
    return null
  }
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn(
        "z-10 flex w-full cursor-default items-center justify-center bg-popover py-1",
        className
      )}
      {...props}
    >
      <Icon as={CaretUpIcon} className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  if (Platform.OS !== "web") {
    return null
  }
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn(
        "z-10 flex w-full cursor-default items-center justify-center bg-popover py-1",
        className
      )}
      {...props}
    >
      <Icon as={CaretDownIcon} className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  type Option,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
