"use client"

import * as React from "react"
import { ResponsiveContainer, Tooltip } from "recharts"

export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
    theme?: Record<string, string>
  }
}

const ChartContext = React.createContext<{
  config: ChartConfig
} | null>(null)

export function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ReactElement
  }
>(({ id, className = "", children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={`w-full ${className}`}
        {...props}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

export const ChartTooltip = Tooltip
