"use client"

import * as React from "react"
import { ResponsiveContainer, Tooltip } from "recharts"

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    children: React.ReactElement
  }
>(({ id, className = "", children, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
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
  )
})
ChartContainer.displayName = "ChartContainer"

export const ChartTooltip = Tooltip
