import type { Meta, StoryObj } from "@storybook/react-native"
import { View } from "react-native"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Text } from "@/components/ui/text"

function EditProfileContent() {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>
          Make changes to your profile here. Tap save when you&apos;re done.
        </DialogDescription>
      </DialogHeader>
      <View className="gap-4">
        <View className="gap-2">
          <Label nativeID="dialog-name">Name</Label>
          <Input aria-labelledby="dialog-name" defaultValue="Pedro Duarte" />
        </View>
        <View className="gap-2">
          <Label nativeID="dialog-username">Username</Label>
          <Input
            aria-labelledby="dialog-username"
            defaultValue="@peduarte"
            autoCapitalize="none"
          />
        </View>
      </View>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">
            <Text>Cancel</Text>
          </Button>
        </DialogClose>
        <Button>
          <Text>Save changes</Text>
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

const meta = {
  title: "Components/Dialog",
  component: Dialog,
} satisfies Meta<typeof Dialog>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <View className="items-start">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Text>Edit profile</Text>
          </Button>
        </DialogTrigger>
        <EditProfileContent />
      </Dialog>
    </View>
  ),
}

export const OpenByDefault: Story = {
  render: () => (
    <View className="items-start">
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Text>Edit profile</Text>
          </Button>
        </DialogTrigger>
        <EditProfileContent />
      </Dialog>
    </View>
  ),
}

export const Destructive: Story = {
  render: () => (
    <View className="items-start">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <Text>Delete account</Text>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all of its data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                <Text>Cancel</Text>
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="destructive">
                <Text>Delete</Text>
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  ),
}
