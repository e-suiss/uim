import type { Meta, StoryObj } from "@storybook/react-native"
import * as React from "react"
import { View } from "react-native"
import { Progress } from "@/components/ui/progress"
import { Text } from "@/components/ui/text"

const meta = {
  title: "Components/Progress",
  component: Progress,
  args: {
    value: 60,
  },
} satisfies Meta<typeof Progress>

export default meta

type Story = StoryObj<typeof meta>

function ProgressDemo() {
  const [value, setValue] = React.useState(13)
  React.useEffect(() => {
    const timer = setTimeout(() => setValue(66), 500)
    return () => clearTimeout(timer)
  }, [])
  return <Progress value={value} className="w-full" />
}

export const Default: Story = {
  render: () => <ProgressDemo />,
}

function WithLabelDemo() {
  const [value, setValue] = React.useState(0)
  React.useEffect(() => {
    const timer = setInterval(() => {
      setValue((current) => (current >= 100 ? 0 : current + 10))
    }, 600)
    return () => clearInterval(timer)
  }, [])
  return (
    <View className="w-full gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium">Uploading</Text>
        <Text variant="muted">{value}%</Text>
      </View>
      <Progress value={value} />
    </View>
  )
}

export const WithLabel: Story = {
  render: () => <WithLabelDemo />,
}

export const Complete: Story = {
  args: {
    value: 100,
  },
}

export const Values: Story = {
  render: () => (
    <View className="w-full gap-4">
      <Progress value={0} />
      <Progress value={25} />
      <Progress value={50} />
      <Progress value={75} />
      <Progress value={100} indicatorClassName="bg-primary" />
    </View>
  ),
}
