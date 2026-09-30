import * as DialogPrimitive from "@rn-primitives/dialog"
import { cn } from "cn"
import { XIcon } from "phosphor-react-native"
import * as React from "react"
import {
  type GestureResponderEvent,
  Platform,
  Text,
  View,
  type ViewProps,
} from "react-native"
import { FadeIn, FadeOut, ReduceMotion } from "react-native-reanimated"
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens"
import { Icon } from "@/components/ui/icon"
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const FullWindowOverlay =
  Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment

function DialogOverlay({
  className,
  children,
  onPress,
  ...props
}: Omit<React.ComponentProps<typeof DialogPrimitive.Overlay>, "asChild"> & {
  children?: React.ReactNode
}) {
  const { onOpenChange } = DialogPrimitive.useRootContext()

  function onOverlayPress(event: GestureResponderEvent) {
    onPress?.(event)
    if (event.target === event.currentTarget && !event.isDefaultPrevented()) {
      onOpenChange(false)
    }
  }

  return (
    <FullWindowOverlay>
      <DialogPrimitive.Overlay
        className={cn(
          "absolute top-0 right-0 bottom-0 left-0 z-50 flex items-center justify-center bg-black/30 p-4",
          Platform.select({
            web: "animate-in fade-in-0 fixed cursor-default [&>*]:cursor-auto",
          }),
          className
        )}
        {...props}
        onPress={Platform.select({ web: onOverlayPress, native: onPress })}
        asChild={Platform.OS !== "web"}
      >
        <NativeOnlyAnimatedView
          entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)}
          exiting={FadeOut.duration(150).reduceMotion(ReduceMotion.System)}
          as="Pressable"
        >
          <NativeOnlyAnimatedView
            entering={FadeIn.delay(50).reduceMotion(ReduceMotion.System)}
            exiting={FadeOut.duration(150).reduceMotion(ReduceMotion.System)}
            style={{ width: "100%", maxWidth: 448, paddingHorizontal: 16 }}
          >
            {children}
          </NativeOnlyAnimatedView>
        </NativeOnlyAnimatedView>
      </DialogPrimitive.Overlay>
    </FullWindowOverlay>
  )
}
function DialogContent({
  className,
  portalHost,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  portalHost?: string
}) {
  return (
    <DialogPortal hostName={portalHost}>
      <DialogOverlay>
        <DialogPrimitive.Content
          className={cn(
            "z-50 mx-auto flex w-full flex-col gap-6 rounded-4xl border border-foreground/5 bg-popover p-6 shadow-xl sm:max-w-md dark:border-foreground/10",
            Platform.select({
              web: "animate-in fade-in-0 zoom-in-95 outline-none duration-100",
            }),
            className
          )}
          {...props}
        >
          {children}
          <DialogPrimitive.Close
            className={cn(
              "absolute top-4 right-4 size-8 items-center justify-center rounded-full bg-secondary active:bg-muted dark:active:bg-muted/50",
              Platform.select({
                web: "outline-none transition-all hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 dark:hover:bg-muted/50",
              })
            )}
            hitSlop={12}
          >
            <Icon
              as={XIcon}
              className={cn(
                "web:pointer-events-none size-4 shrink-0 text-foreground"
              )}
            />
            <Text className="sr-only">Close</Text>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogOverlay>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: ViewProps) {
  return <View className={cn("flex flex-col gap-1.5", className)} {...props} />
}

function DialogFooter({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "text-base font-medium leading-none text-foreground",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
