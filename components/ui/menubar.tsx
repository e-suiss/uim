import * as MenubarPrimitive from "@rn-primitives/menubar"
import { Portal } from "@rn-primitives/portal"
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
  Pressable,
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

const MenubarMenu = MenubarPrimitive.Menu

const MenubarGroup = MenubarPrimitive.Group

const MenubarPortal = MenubarPrimitive.Portal

const MenubarSub = MenubarPrimitive.Sub

const MenubarRadioGroup = MenubarPrimitive.RadioGroup

const FullWindowOverlay =
  Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment

type MenubarProps = Omit<
  React.ComponentProps<typeof MenubarPrimitive.Root>,
  "value" | "onValueChange"
> & {
  value?: string
  onValueChange?: (value: string | undefined) => void
}

function Menubar({
  className,
  value: valueProp,
  onValueChange: onValueChangeProp,
  ...props
}: MenubarProps) {
  const id = React.useId()
  const [uncontrolledValue, setUncontrolledValue] = React.useState<
    string | undefined
  >(undefined)
  const isControlled = onValueChangeProp !== undefined
  const value = isControlled ? valueProp : uncontrolledValue
  const onValueChange = onValueChangeProp ?? setUncontrolledValue

  return (
    <>
      {Platform.OS !== "web" && value ? (
        <Portal name={`menubar-overlay-${id}`}>
          <Pressable
            onPress={() => onValueChange(undefined)}
            style={StyleSheet.absoluteFill}
          />
        </Portal>
      ) : null}
      <MenubarPrimitive.Root
        className={cn(
          "h-9 flex-row items-center rounded-3xl border border-border p-1",
          className
        )}
        value={value}
        onValueChange={onValueChange}
        {...props}
      />
    </>
  )
}

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  const { value } = MenubarPrimitive.useRootContext()
  const { value: itemValue } = MenubarPrimitive.useMenuContext()

  return (
    <TextClassContext.Provider
      value={cn("select-none text-sm font-medium text-foreground")}
    >
      <MenubarPrimitive.Trigger
        className={cn(
          "group flex-row items-center rounded-2xl px-2 py-0.75 active:bg-muted",
          Platform.select({
            web: "cursor-default outline-hidden hover:bg-muted",
          }),
          value === itemValue && "bg-muted",
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  )
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  iconClassName,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  children?: React.ReactNode
  iconClassName?: string
  inset?: boolean
}) {
  const { open } = MenubarPrimitive.useSubContext()
  const icon =
    Platform.OS === "web" ? CaretRightIcon : open ? CaretUpIcon : CaretDownIcon
  return (
    <TextClassContext.Provider
      value={cn(
        "select-none text-sm font-medium text-popover-foreground",
        open && "text-accent-foreground"
      )}
    >
      <MenubarPrimitive.SubTrigger
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
      </MenubarPrimitive.SubTrigger>
    </TextClassContext.Provider>
  )
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <NativeOnlyAnimatedView entering={FadeIn.reduceMotion(ReduceMotion.System)}>
      <MenubarPrimitive.SubContent
        className={cn(
          "min-w-32 rounded-3xl border border-foreground/5 bg-popover p-1.5 shadow-lg dark:border-foreground/10",
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

function MenubarContent({
  className,
  overlayClassName,
  overlayStyle,
  portalHost,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content> & {
  overlayStyle?: StyleProp<ViewStyle>
  overlayClassName?: string
  portalHost?: string
}) {
  return (
    <MenubarPrimitive.Portal hostName={portalHost}>
      <FullWindowOverlay>
        <NativeOnlyAnimatedView
          as="Pressable"
          accessible={false}
          entering={FadeIn.reduceMotion(ReduceMotion.System)}
          style={StyleSheet.absoluteFill}
          pointerEvents="box-none"
        >
          <TextClassContext.Provider value="text-sm text-popover-foreground">
            <MenubarPrimitive.Content
              className={cn(
                "min-w-48 rounded-3xl border border-foreground/5 bg-popover p-1.5 shadow-lg dark:border-foreground/10",
                Platform.select({
                  web: cn(
                    "animate-in fade-in-0 zoom-in-95 max-h-(--radix-context-menu-content-available-height) origin-(--radix-context-menu-content-transform-origin) z-50 cursor-default overflow-y-auto overflow-x-hidden outline-none duration-100",
                    props.side === "bottom" && "slide-in-from-top-2",
                    props.side === "top" && "slide-in-from-bottom-2"
                  ),
                }),
                className
              )}
              align={align}
              alignOffset={alignOffset}
              sideOffset={sideOffset}
              {...props}
            />
          </TextClassContext.Provider>
        </NativeOnlyAnimatedView>
      </FullWindowOverlay>
    </MenubarPrimitive.Portal>
  )
}

function MenubarItem({
  className,
  inset,
  variant,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
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
      <MenubarPrimitive.Item
        className={cn(
          "group relative flex-row items-center gap-2.5 rounded-2xl px-3 py-2 active:bg-accent",
          Platform.select({
            web: cn(
              "cursor-default outline-hidden hover:bg-accent focus:bg-accent data-[disabled]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
              variant === "destructive" &&
                "hover:bg-destructive/10 focus:bg-destructive/10 dark:hover:bg-destructive/20 dark:focus:bg-destructive/20"
            ),
          }),
          variant === "destructive" &&
            "active:bg-destructive/10 dark:active:bg-destructive/20",
          props.disabled && "opacity-50",
          inset && "pl-9.5",
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  )
}

function MenubarCheckboxItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem> & {
  children?: React.ReactNode
}) {
  return (
    <TextClassContext.Provider value="select-none text-sm font-medium text-popover-foreground">
      <MenubarPrimitive.CheckboxItem
        className={cn(
          "group relative flex-row items-center gap-2.5 rounded-2xl py-2 pr-3 pl-9.5 active:bg-accent",
          Platform.select({
            web: "cursor-default outline-hidden hover:bg-accent focus:bg-accent data-[disabled]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
          }),
          props.disabled && "opacity-50",
          className
        )}
        {...props}
      >
        <View className="absolute left-3 size-4 items-center justify-center">
          <MenubarPrimitive.ItemIndicator>
            <Icon
              as={CheckIcon}
              className={cn(
                "size-4 text-foreground",
                Platform.select({ web: "pointer-events-none" })
              )}
            />
          </MenubarPrimitive.ItemIndicator>
        </View>
        {children}
      </MenubarPrimitive.CheckboxItem>
    </TextClassContext.Provider>
  )
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem> & {
  children?: React.ReactNode
}) {
  return (
    <TextClassContext.Provider value="select-none text-sm font-medium text-popover-foreground">
      <MenubarPrimitive.RadioItem
        className={cn(
          "group relative flex-row items-center gap-2.5 rounded-2xl py-2 pr-3 pl-9.5 active:bg-accent",
          Platform.select({
            web: "cursor-default outline-hidden hover:bg-accent focus:bg-accent data-[disabled]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
          }),
          props.disabled && "opacity-50",
          className
        )}
        {...props}
      >
        <View className="absolute left-3 size-4 items-center justify-center">
          <MenubarPrimitive.ItemIndicator>
            <Icon
              as={CheckIcon}
              className={cn(
                "size-4 text-foreground",
                Platform.select({ web: "pointer-events-none" })
              )}
            />
          </MenubarPrimitive.ItemIndicator>
        </View>
        {children}
      </MenubarPrimitive.RadioItem>
    </TextClassContext.Provider>
  )
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
  className?: string
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.Label
      className={cn(
        "px-3.5 py-2.5 text-xs text-muted-foreground",
        inset && "pl-9.5",
        className
      )}
      {...props}
    />
  )
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-border/50", className)}
      {...props}
    />
  )
}

function MenubarShortcut({
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
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
}
