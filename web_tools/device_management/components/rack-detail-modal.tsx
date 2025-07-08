"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RackVisualizer } from "@/components/rack-visualizer"
import { RackTable } from "@/components/rack-table"
import { AddDeviceForm } from "@/components/add-device-form"
import { useDataCenterStore } from "@/lib/data-center-store"

interface RackDetailModalProps {
  isOpen: boolean
  onClose: () => void
  rackId: string | null
}

export function RackDetailModal({ isOpen, onClose, rackId }: RackDetailModalProps) {
  const { findRack } = useDataCenterStore()
  const [activeTab, setActiveTab] = useState("visualizer")
  const [refreshKey, setRefreshKey] = useState(0)

  // 當設備添加或刪除時刷新組件
  const handleDeviceChange = () => {
    setRefreshKey((prev) => prev + 1)
  }

  // 找到機架信息
  const rackInfo = rackId ? findRack(rackId) : null
  const rack = rackInfo?.rack

  if (!rack) {
    return null
  }

  // 計算機架使用率
  const usedUnits = rack.units.filter((unit) => unit.deviceId !== null).length
  const usagePercentage = Math.round((usedUnits / rack.totalUnits) * 100)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {rackInfo?.datacenter.name} &gt; {rackInfo?.room.name} &gt; {rack.name}
          </DialogTitle>
          <DialogDescription>
            {rack.totalUnits}U Rack - {usagePercentage}% Used ({usedUnits}/{rack.totalUnits} Units)
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="visualizer">Rack Visualizer</TabsTrigger>
            <TabsTrigger value="table">Device Table</TabsTrigger>
            <TabsTrigger value="add">Add Device</TabsTrigger>
          </TabsList>

          <TabsContent value="visualizer" key={`visualizer-${refreshKey}`}>
            <RackVisualizer rack={rack} />
          </TabsContent>

          <TabsContent value="table" key={`table-${refreshKey}`}>
            <RackTable rack={rack} onDeviceChange={handleDeviceChange} />
          </TabsContent>

          <TabsContent value="add">
            <AddDeviceForm rack={rack} onSuccess={handleDeviceChange} />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
