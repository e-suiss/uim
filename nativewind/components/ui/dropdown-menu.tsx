import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu"
import { cn } from "cn"
import {
  CaretDownIcon,
  CaretRightIcon,
  CaretUpIcon,
  CheckIcon,
} from "phosphor-react-native"
import * as React from "react"
import {
  Platform,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native"
import { FadeIn, ReduceMotion } from "react-native-reanimated"
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens"
import { Icon } from "@/components/ui/icon"
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view"
import { TextClassContext } from "@/components/ui/text"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  iconClassName,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  children?: React.ReactNode
  iconClassName?: string
  inset?: boolean
}) {
  const { open } = DropdownMenuPrimitive.useSubContext()
  const icon =
    Platform.OS === "web" ? CaretRightIcon : open ? CaretUpIcon : CaretDownIcon
  return (
    <TextClassContext.Provider
      value={cn(
        "select-none text-sm font-medium text-popover-foreground",
        open && "text-accent-foreground"
      )}
    >
      <DropdownMenuPrimitive.SubTrigger
        className={cn(
          "group flex-row items-center gap-2 rounded-2xl px-3 py-2 active:bg-accent",
          Platform.select({
            web: "cursor-default outline-hidden hover:bg-accent focus:bg-accent [&_svg]:pointer-events-none [&_svg]:shrink-0",
          }),
          className,
          open && "bg-accent",
          inset && "pl-9.5"
        )}
        {...props}
      >
        {children}
        <Icon
          as={icon}
          className={cn(
            "ml-auto size-4 shrink-0 text-foreground",
            iconClassName
          )}
        />
      </DropdownMenuPrimitive.SubTrigger>
    </TextClassContext.Provider>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <NativeOnlyAnimatedView entering={FadeIn.reduceMotion(ReduceMotion.System)}>
      <DropdownMenuPrimitive.SubContent
        className={cn(
          "min-w-36 rounded-3xl border border-foreground-5 bg-popover p-1.5 shadow-lg dark:border-foreground-10",
          Platform.select({
            web: "animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 fade-in-0 data-[state=closed]:zoom-out-95 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-context-menu-content-transform-origin) z-50 overflow-hidden duration-100",
          }),
          className
        )}
        {...props}
      />
    </NativeOnlyAnimatedView>
  )
}

const FullWindowOverlay =
  Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment

function DropdownMenuContent({
  className,
  overlayClassName,
  overlayStyle,
  portalHost,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & {
  overlayStyle?: StyleProp<ViewStyle>
  overlayClassName?: string
  portalHost?: string
}) {
  return (
    <DropdownMenuPrimitive.Portal hostName={portalHost}>
      <FullWindowOverlay>
        <DropdownMenuPrimitive.Overlay
          style={Platform.select({
            web: overlayStyle ?? undefined,
            native: overlayStyle
              ? StyleSheet.flatten([
                  StyleSheet.absoluteFill,
                  overlayStyle as typeof StyleSheet.absoluteFill,
                ])
              : StyleSheet.absoluteFill,
          })}
          className={overlayClassName}
          asChild={Platform.OS !== "web"}
        >
          <NativeOnlyAnimatedView
            entering={FadeIn.reduceMotion(ReduceMotion.System)}
            as="Pressable"
          >
            <TextClassContext.Provider value="text-sm text-popover-foreground">
              <DropdownMenuPrimitive.Content
                className={cn(
                  "min-w-48 rounded-3xl border border-foreground-5 bg-popover p-1.5 shadow-lg dark:border-foreground-10",
                  Platform.select({
                    web: cn(
                      "animate-in fade-in-0 zoom-in-95 max-h-(--radix-context-menu-content-available-height) origin-(--radix-context-menu-content-transform-origin) z-50 cursor-default overflow-y-auto overflow-x-hidden outline-none duration-100",
                      props.side === "bottom" && "slide-in-from-top-2",
                      props.side === "top" && "slide-in-from-bottom-2"
                    ),
                  }),
                  className
                )}
                {...props}
              />
            </TextClassContext.Provider>
          </NativeOnlyAnimatedView>
        </DropdownMenuPrimitive.Overlay>
      </FullWindowOverlay>
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  className?: string
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <TextClassContext.Provider
      value={cn(
        "select-none text-sm font-medium text-popover-foreground",
        variant === "destructive" && "text-destructive"
      )}
    >
      <DropdownMenuPrimitive.Item
        className={cn(
          "group relative flex-row items-center gap-2.5 rounded-2xl px-3 py-2 active:bg-accent",
          Platform.select({
            web: cn(
              "cursor-default outline-hidden hover:bg-accent focus:bg-accent data-[disabled]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
              variant === "destructive" &&
                "hover:bg-destructive-10 focus:bg-destructive-10 dark:hover:bg-destructive-20 dark:focus:bg-destructive-20"
            ),
          }),
          variant === "destructive" &&
            "active:bg-destructive-10 dark:active:bg-destructive-20",
          props.disabled && "opacity-50",
          inset && "pl-9.5",
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & {
  children?: React.ReactNode
}) {
  return (
    <TextClassContext.Provider value="select-none text-sm font-medium text-popover-foreground">
      <DropdownMenuPrimitive.CheckboxItem
        className={cn(
          "group relative flex-row items-center gap-2.5 rounded-2xl py-2 pr-8 pl-3 active:bg-accent",
          Platform.select({
            web: "cursor-default outline-hidden hover:bg-accent focus:bg-accent data-[disabled]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
          }),
          props.disabled && "opacity-50",
          className
        )}
        {...props}
      >
        <View className="absolute right-2 size-4 items-center justify-center">
          <DropdownMenuPrimitive.ItemIndicator>
            <Icon
              as={CheckIcon}
              className={cn(
                "size-4 text-foreground",
                Platform.select({ web: "pointer-events-none" })
              )}
            />
          </DropdownMenuPrimitive.ItemIndicator>
        </View>
        {children}
      </DropdownMenuPrimitive.CheckboxItem>
    </TextClassContext.Provider>
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
  children?: React.ReactNode
}) {
  return (
    <TextClassContext.Provider value="select-none text-sm font-medium text-popover-foreground">
      <DropdownMenuPrimitive.RadioItem
        className={cn(
          "group relative flex-row items-center gap-2.5 rounded-2xl py-2 pr-8 pl-3 active:bg-accent",
          Platform.select({
            web: "cursor-default outline-hidden hover:bg-accent focus:bg-accent data-[disabled]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
          }),
          props.disabled && "opacity-50",
          className
        )}
        {...props}
      >
        <View className="absolute right-2 size-4 items-center justify-center">
          <DropdownMenuPrimitive.ItemIndicator>
            <Icon
              as={CheckIcon}
              className={cn(
                "size-4 text-foreground",
                Platform.select({ web: "pointer-events-none" })
              )}
            />
          </DropdownMenuPrimitive.ItemIndicator>
        </View>
        {children}
      </DropdownMenuPrimitive.RadioItem>
    </TextClassContext.Provider>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  className?: string
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn(
        "px-3 py-2.5 text-xs text-muted-foreground",
        inset && "pl-9.5",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("-mx-1.5 my-1.5 h-px bg-border-50", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
}
