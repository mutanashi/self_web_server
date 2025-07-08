"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Card } from "@/components/ui/card"

// Resource usage data
const resourceUsageData = [
  { name: "CPU", usage: 45, color: "#4CAF50" },
  { name: "Memory", usage: 65, color: "#2196F3" },
  { name: "Storage", usage: 30, color: "#9C27B0" },
  { name: "Network", usage: 20, color: "#FF9800" },
]

// Service usage data
const serviceUsageData = [
  { name: "Web Services", value: 40, color: "#4CAF50" },
  { name: "Database", value: 30, color: "#2196F3" },
  { name: "Application Services", value: 30, color: "#9C27B0" },
]

export function UserDashboardCharts() {
  const [activeTab, setActiveTab] = useState("bar")

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-2 bg-background border border-border shadow-lg">
          <p className="text-sm font-medium">{`${payload[0].name}: ${payload[0].value}${
            activeTab === "pie" ? "%" : "%"
          }`}</p>
        </Card>
      )
    }
    return null
  }

  return (
    <Tabs defaultValue="bar" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="bar">Resource Usage</TabsTrigger>
        <TabsTrigger value="pie">Service Distribution</TabsTrigger>
      </TabsList>
      <TabsContent value="bar" className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={resourceUsageData}
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
            <Bar dataKey="usage" name="Usage (%)" radius={[4, 4, 0, 0]}>
              {resourceUsageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>
      <TabsContent value="pie" className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={serviceUsageData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {serviceUsageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </TabsContent>
    </Tabs>
  )
}
