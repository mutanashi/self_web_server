"use client"

import { useState, useEffect } from "react"
import { useDataCenterStore } from "@/lib/data-center-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { RackVisualizer } from "@/components/rack-visualizer"
import { RackTable } from "@/components/rack-table"
import { UserDeviceDetailModal } from "@/components/user-device-detail-modal"
import { UserDeviceActionModal } from "@/components/user-device-action-modal"
import { Trash2, MoveVertical, Plus } from "lucide-react"

export default function UserRackManagement() {
  const [selectedDataCenter, setSelectedDataCenter] = useState<string>("")
  const [selectedRoom, setSelectedRoom] = useState<string>("")
  const [selectedRack, setSelectedRack] = useState<string>("")
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<"install" | "uninstall" | "move">("install")
  const [refreshKey, setRefreshKey] = useState(0)

  const { dataCenters, devices } = useDataCenterStore()

  // 設置定期刷新以確保數據同步
  useEffect(() => {
    const unsubscribe = useDataCenterStore.subscribe(() => {
      setRefreshKey((prev) => prev + 1)
    })

    return () => unsubscribe()
  }, [])

  // 當組件加載時，預設選擇第一個數據中心
  useEffect(() => {
    if (dataCenters.length > 0 && !selectedDataCenter) {
      setSelectedDataCenter(dataCenters[0].id)
    }
  }, [dataCenters, selectedDataCenter])

  // 當選擇數據中心時，預設選擇第一個房間
  useEffect(() => {
    if (selectedDataCenter) {
      const dc = dataCenters.find((dc) => dc.id === selectedDataCenter)
      if (dc && dc.rooms.length > 0) {
        setSelectedRoom(dc.rooms[0].id)
      }
    }
  }, [selectedDataCenter, dataCenters])

  // 當選擇房間時，預設選擇第一個機櫃
  useEffect(() => {
    if (selectedDataCenter && selectedRoom) {
      const dc = dataCenters.find((dc) => dc.id === selectedDataCenter)
      const room = dc?.rooms.find((r) => r.id === selectedRoom)
      if (room && room.racks.length > 0) {
        setSelectedRack(room.racks[0].id)
      }
    }
  }, [selectedRoom, selectedDataCenter, dataCenters])

  // 獲取選中的機櫃
  const getSelectedRack = () => {
    const dc = dataCenters.find((dc) => dc.id === selectedDataCenter)
    const room = dc?.rooms.find((r) => r.id === selectedRoom)
    return room?.racks.find((r) => r.id === selectedRack)
  }

  // 處理設備點擊
  const handleDeviceClick = (deviceId: string) => {
    setSelectedDevice(deviceId)
    setIsDetailModalOpen(true)
  }

  // 處理設備操作
  const handleDeviceAction = (action: "install" | "uninstall" | "move", deviceId?: string) => {
    if (deviceId) {
      setSelectedDevice(deviceId)
    }
    setActionType(action)
    setIsActionModalOpen(true)
  }

  // 處理操作成功
  const handleActionSuccess = () => {
    setIsActionModalOpen(false)
    setRefreshKey((prev) => prev + 1)
  }

  const rack = getSelectedRack()

  return (
    <div className="space-y-4 w-full max-w-none">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Rack Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => handleDeviceAction("install")}>
            <Plus className="mr-2 h-4 w-4" /> Install Device
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Select value={selectedDataCenter} onValueChange={setSelectedDataCenter}>
            <SelectTrigger>
              <SelectValue placeholder="Select data center" />
            </SelectTrigger>
            <SelectContent>
              {dataCenters.map((dc) => (
                <SelectItem key={dc.id} value={dc.id}>
                  {dc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger>
              <SelectValue placeholder="Select room" />
            </SelectTrigger>
            <SelectContent>
              {dataCenters
                .find((dc) => dc.id === selectedDataCenter)
                ?.rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select value={selectedRack} onValueChange={setSelectedRack}>
            <SelectTrigger>
              <SelectValue placeholder="Select rack" />
            </SelectTrigger>
            <SelectContent>
              {dataCenters
                .find((dc) => dc.id === selectedDataCenter)
                ?.rooms.find((room) => room.id === selectedRoom)
                ?.racks.map((rack) => (
                  <SelectItem key={rack.id} value={rack.id}>
                    {rack.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle>Rack View</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="visual" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="visual">Visual</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
            <TabsContent value="visual" className="w-full">
              {rack ? (
                <div className="flex flex-col items-center">
                  <RackVisualizer
                    rack={rack}
                    onUnitClick={(unit) => {
                      if (unit.deviceId) {
                        handleDeviceClick(unit.deviceId)
                      }
                    }}
                    showDeviceActions
                    onDeviceAction={(action, deviceId) => {
                      if (action === "move") {
                        handleDeviceAction("move", deviceId)
                      } else if (action === "uninstall") {
                        handleDeviceAction("uninstall", deviceId)
                      }
                    }}
                  />
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">Select a rack to view</p>
              )}
            </TabsContent>
            <TabsContent value="table" className="w-full">
              {rack ? (
                <RackTable
                  rack={rack}
                  onDeviceClick={handleDeviceClick}
                  showActions
                  actionButtons={(deviceId) => (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeviceAction("move", deviceId)
                        }}
                      >
                        <MoveVertical className="h-4 w-4 mr-1" /> Move
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeviceAction("uninstall", deviceId)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Uninstall
                      </Button>
                    </>
                  )}
                />
              ) : (
                <p className="text-center py-8 text-muted-foreground">Select a rack to view</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <UserDeviceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        deviceId={selectedDevice}
        devices={Object.values(devices)}
        showLocation={true}
      />

      <UserDeviceActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        actionType={actionType}
        onSuccess={handleActionSuccess}
        dataCenters={dataCenters}
        deviceId={selectedDevice}
      />
    </div>
  )
}
