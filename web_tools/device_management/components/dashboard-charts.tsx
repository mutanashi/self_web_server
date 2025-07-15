"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

// Rack usage data
const rackUsageData = [
  { name: "Available", value: 65, color: "#4CAF50" },
  { name: "Partially Used", value: 25, color: "#FFC107" },
  { name: "Full", value: 10, color: "#F44336" },
]

// Room usage data with distinct colors
const roomUsageData = [
  { name: "Room 1", usage: 75, capacity: 100, color: "#4CAF50" }, // Green
  { name: "Room 2", usage: 45, capacity: 100, color: "#2196F3" }, // Blue
  { name: "Room 3", usage: 60, capacity: 100, color: "#9C27B0" }, // Purple
  { name: "Room 4", usage: 30, capacity: 100, color: "#FF9800" }, // Orange
  { name: "Room 5", usage: 85, capacity: 100, color: "#F44336" }, // Red
  { name: "Room 6", usage: 50, capacity: 100, color: "#00BCD4" }, // Cyan
  { name: "Room 7", usage: 65, capacity: 100, color: "#FFEB3B" }, // Yellow
]

export function DashboardCharts() {
  const [activeTab, setActiveTab] = useState("pie")

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-2 bg-background border border-border shadow-lg">
          <p className="text-sm font-medium">{`${payload[0].name}: ${payload[0].value}${
            activeTab === "pie" ? "%" : " racks"
          }`}</p>
        </Card>
      )
    }
    return null
  }

  return (
    <Tabs defaultValue="pie" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="pie">Pie Chart</TabsTrigger>
        <TabsTrigger value="bar">Bar Chart</TabsTrigger>
      </TabsList>
      <TabsContent value="pie" className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rackUsageData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {rackUsageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </TabsContent>
      <TabsContent value="bar" className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={roomUsageData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="usage" name="Usage" radius={[4, 4, 0, 0]}>
              {roomUsageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>
    </Tabs>
  )
}
