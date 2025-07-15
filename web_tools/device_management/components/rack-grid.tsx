"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Rack } from "@/models/data-center"

interface RackGridProps {
  racks: Rack[]
  onRackClick: (rackId: string) => void
}

export function RackGrid({ racks, onRackClick }: RackGridProps) {
  // 計算機架使用率
  const calculateUsage = (rack: Rack) => {
    const usedUnits = rack.units.filter((unit) => unit.deviceId !== null).length
    return Math.round((usedUnits / rack.totalUnits) * 100)
  }

  // 確定機架狀態顏色
  const getRackStatusColor = (usage: number) => {
    if (usage > 80) return "bg-red-500" // 已滿
    if (usage > 40) return "bg-yellow-500" // 部分使用
    return "bg-green-500" // 可用
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
      {racks.map((rack) => {
        const usagePercent = calculateUsage(rack)
        const statusColor = getRackStatusColor(usagePercent)

        return (
          <Card
            key={rack.id}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => onRackClick(rack.id)}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className={`w-4 h-4 rounded-full ${statusColor}`} />
              </div>
              <h3 className="text-2xl font-bold mb-2">{rack.name}</h3>
              <div className="text-lg text-muted-foreground">
                <p>{usagePercent}% Used</p>
                <p>{rack.totalUnits}U Total</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
