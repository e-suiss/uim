import type { Meta, StoryObj } from "@storybook/react-native"
import {
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "phosphor-react-native"
import * as React from "react"
import { View } from "react-native"
import {
  ToggleGroup,
  ToggleGroupIcon,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

type Variant = "default" | "outline"
type Size = "default" | "sm" | "lg"

function FormattingDemo({
  variant,
  size,
  disabled = false,
}: {
  variant?: Variant
  size?: Size
  disabled?: boolean
}) {
  const [value, setValue] = React.useState<string[]>(["bold"])
  return (
    <ToggleGroup
      type="multiple"
      value={value}
      onValueChange={setValue}
      variant={variant}
      size={size}
      disabled={disabled}
    >
      <ToggleGroupItem value="bold" aria-label="Toggle bold" isFirst>
        <ToggleGroupIcon as={TextBIcon} />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <ToggleGroupIcon as={TextItalicIcon} />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline" isLast>
        <ToggleGroupIcon as={TextUnderlineIcon} />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

function AlignmentDemo() {
  const [value, setValue] = React.useState<string | undefined>("left")
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={setValue}
      variant="outline"
    >
      <ToggleGroupItem value="left" aria-label="Align left" isFirst>
        <ToggleGroupIcon as={TextAlignLeftIcon} />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <ToggleGroupIcon as={TextAlignCenterIcon} />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right" isLast>
        <ToggleGroupIcon as={TextAlignRightIcon} />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

const meta = {
  title: "Components/Toggle Group",
  component: ToggleGroup,
  args: {
    type: "multiple",
    value: [],
    onValueChange: () => {},
  },
} satisfies Meta<typeof ToggleGroup>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <FormattingDemo />,
}

export const Outline: Story = {
  render: () => <FormattingDemo variant="outline" />,
}

export const Sizes: Story = {
  render: () => (
    <View className="items-start gap-4">
      <FormattingDemo variant="outline" size="sm" />
      <FormattingDemo variant="outline" />
      <FormattingDemo variant="outline" size="lg" />
    </View>
  ),
}

export const SingleSelection: Story = {
  render: () => <AlignmentDemo />,
}

export const Disabled: Story = {
  render: () => <FormattingDemo variant="outline" disabled />,
}
