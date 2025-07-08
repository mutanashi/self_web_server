"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Generate personnel usage data for the past 30 days
const generatePersonnelData = () => {
  const data = []
  const now = new Date()

  // Simulate personnel usage for different departments
  const departments = {
    "IT Department": { base: 15, variance: 5 },
    Operations: { base: 10, variance: 3 },
    Network: { base: 8, variance: 2 },
    Security: { base: 5, variance: 1 },
  }

  // Generate data for the past 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const dayData = {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      total: 0,
    }

    // Generate data for each department
    Object.entries(departments).forEach(([dept, { base, variance }]) => {
      // Generate a random number based on the base value, simulating daily fluctuations
      // Add weekend effect: lower usage on weekends
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const weekendFactor = isWeekend ? 0.6 : 1

      // Add some random variance
      const randomVariance = Math.floor(Math.random() * variance * 2) - variance

      // Calculate final value
      const value = Math.max(0, Math.floor((base + randomVariance) * weekendFactor))

      dayData[dept] = value
      dayData.total += value
    })

    data.push(dayData)
  }

  return data
}

// Pre-generate data
const personnelData = generatePersonnelData()

export function PersonnelUsageChart() {
  const [timeRange, setTimeRange] = useState("30")

  // Filter data based on selected time range
  const filteredData = personnelData.slice(-Number.parseInt(timeRange))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Personnel Usage Trend</h3>
          <p className="text-xs text-muted-foreground">Data center personnel usage over time</p>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="timeRange" className="text-xs">
            Time Range:
          </Label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger id="timeRange" className="h-8 w-[110px]">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="14">Last 14 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <Card className="p-2 bg-background border border-border shadow-lg">
                      <p className="text-sm font-medium">{label}</p>
                      {payload.map((entry, index) => (
                        <p key={`item-${index}`} className="text-xs" style={{ color: entry.color }}>
                          {entry.name}: {entry.value} people
                        </p>
                      ))}
                    </Card>
                  )
                }
                return null
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
            />
            <Line type="monotone" dataKey="IT Department" stroke="#4CAF50" />
            <Line type="monotone" dataKey="Operations" stroke="#2196F3" />
            <Line type="monotone" dataKey="Network" stroke="#FF9800" />
            <Line type="monotone" dataKey="Security" stroke="#F44336" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
