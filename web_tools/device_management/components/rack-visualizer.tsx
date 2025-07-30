"use client"

import { useState } from "react"
import type { Unit } from "@/models/data-center"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MoreHorizontal, MoveVertical, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { JSX } from "react"

interface RackVisualizerProps {
  rack: {
    id: string
    name: string
    totalUnits: number
    units: Unit[]
  }
  onUnitClick?: (unit: Unit) => void
  showDeviceActions?: boolean
  onDeviceAction?: (action: "move" | "uninstall", deviceId: string) => void
}

export function RackVisualizer({ rack, onUnitClick, showDeviceActions, onDeviceAction }: RackVisualizerProps) {
  const [hoveredUnit, setHoveredUnit] = useState<number | null>(null)

  // 獲取設備佔用的單元
  const getDeviceUnits = (deviceId: string, position: number, size: number) => {
    const units: number[] = []
    for (let i = 0; i < size; i++) {
      units.push(position + i)
    }
    return units
  }

  // 渲染機架單元
  const renderUnits = () => {
    const unitElements: JSX.Element[] = []
    const processedDevices = new Set<string>()

    // 從底部到頂部渲染單元
    for (let i = rack.totalUnits; i >= 1; i--) {
      const unit = rack.units[i - 1]
      const isHovered = hoveredUnit === i

      // 如果單元有設備且尚未處理過該設備
      if (unit.deviceId && !processedDevices.has(unit.deviceId)) {
        const deviceSize = unit.deviceSize || 1
        const deviceUnits = getDeviceUnits(unit.deviceId, unit.position, deviceSize)
        const isAnyUnitHovered = deviceUnits.some((pos) => hoveredUnit === pos)

        // 標記設備為已處理
        processedDevices.add(unit.deviceId)

        // 渲染設備
        unitElements.push(
          <div
            key={`device-${unit.deviceId}`}
            className={`relative border-x border-t border-gray-700 ${
              isAnyUnitHovered ? "bg-blue-900/30" : "bg-gray-800"
            } rounded-t-sm`}
            style={{ height: `${deviceSize * 1.5}rem`, marginBottom: "-1px" }}
            onMouseEnter={() => setHoveredUnit(unit.position)}
            onMouseLeave={() => setHoveredUnit(null)}
            onClick={() => onUnitClick && onUnitClick(unit)}
          >
            <div className="absolute inset-0 flex items-center p-2">
              <div className="flex-1 truncate text-sm">{unit.deviceName}</div>
              {unit.serviceName && (
                <Badge className="ml-2 bg-purple-900/30 text-purple-200 text-xs">{unit.serviceName}</Badge>
              )}
              {showDeviceActions && onDeviceAction && (
                <TooltipProvider>
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Actions</p>
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeviceAction("move", unit.deviceId!)
                        }}
                      >
                        <MoveVertical className="mr-2 h-4 w-4" />
                        Move Device
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeviceAction("uninstall", unit.deviceId!)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Uninstall Device
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipProvider>
              )}
            </div>
          </div>,
        )

        // 跳過已經渲染的設備單元
        i -= deviceSize - 1
      } else if (!unit.deviceId) {
        // 渲染空單元
        unitElements.push(
          <div
            key={`unit-${i}`}
            className={`border border-gray-700 ${
              isHovered ? "bg-blue-900/10" : "bg-gray-900"
            } h-6 flex items-center px-2 text-xs`}
            onMouseEnter={() => setHoveredUnit(i)}
            onMouseLeave={() => setHoveredUnit(null)}
            onClick={() => onUnitClick && onUnitClick(unit)}
          >
            <div className="w-8 text-gray-500">U{i}</div>
            <div className="flex-1 text-center text-gray-500">Empty</div>
          </div>,
        )
      }
    }

    return unitElements
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4">
        <div className="bg-gray-950 border border-gray-700 rounded-md p-2 mb-2 text-center font-medium">
          {rack.name}
        </div>
        <div className="flex flex-col">{renderUnits()}</div>
        <div className="bg-gray-950 border border-gray-700 rounded-md p-2 mt-2 text-center font-medium">
          {rack.totalUnits}U
        </div>
      </CardContent>
    </Card>
  )
}
