"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { RackGrid } from "@/components/rack-grid"
import { RackDetailModal } from "@/components/rack-detail-modal"
import { DataCenterConfigModal } from "@/components/data-center-config-modal"
import { useDataCenterStore } from "@/lib/data-center-store"

export default function RackManagement() {
  const { dataCenters } = useDataCenterStore()

  const [selectedRack, setSelectedRack] = useState<string | null>(null)
  const [isRackModalOpen, setIsRackModalOpen] = useState(false)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [selectedDataCenter, setSelectedDataCenter] = useState("")
  const [selectedRoom, setSelectedRoom] = useState("")

  // Initialize selections when data is available
  useEffect(() => {
    if (dataCenters.length > 0) {
      // If current selection is invalid, reset it
      if (!dataCenters.find((dc) => dc.id === selectedDataCenter)) {
        setSelectedDataCenter(dataCenters[0].id)
      }
    } else {
      setSelectedDataCenter("")
      setSelectedRoom("")
    }
  }, [dataCenters, selectedDataCenter])

  // Update room selection when data center changes
  useEffect(() => {
    const currentDc = dataCenters.find((dc) => dc.id === selectedDataCenter)
    if (currentDc && currentDc.rooms.length > 0) {
      // If current room selection is invalid, reset it
      if (!currentDc.rooms.find((room) => room.id === selectedRoom)) {
        setSelectedRoom(currentDc.rooms[0].id)
      }
    } else {
      setSelectedRoom("")
    }
  }, [selectedDataCenter, dataCenters, selectedRoom])

  const handleRackClick = (rackId: string) => {
    setSelectedRack(rackId)
    setIsRackModalOpen(true)
  }

  const currentDataCenter = dataCenters.find((dc) => dc.id === selectedDataCenter)
  const currentRoom = currentDataCenter?.rooms.find((room) => room.id === selectedRoom)

  if (dataCenters.length === 0) {
    return (
      <div className="space-y-4 w-full max-w-none">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Rack Management</h1>
          <Button onClick={() => setIsConfigModalOpen(true)} className="gap-2">
            <Settings className="h-4 w-4" />
            Configure Data Center
          </Button>
        </div>

        <Card className="bg-card w-full">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No data centers configured yet.</p>
            <Button onClick={() => setIsConfigModalOpen(true)}>Configure Data Centers</Button>
          </CardContent>
        </Card>

        <DataCenterConfigModal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} />
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full max-w-none">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Rack Management</h1>
        <Button onClick={() => setIsConfigModalOpen(true)} className="gap-2">
          <Settings className="h-4 w-4" />
          Configure Data Center
        </Button>
      </div>

      <Card className="bg-card w-full">
        <CardContent className="p-4">
          <div className="mb-4">
            <Tabs
              defaultValue={selectedDataCenter}
              value={selectedDataCenter}
              onValueChange={(value) => {
                setSelectedDataCenter(value)
                const dc = dataCenters.find((dc) => dc.id === value)
                if (dc && dc.rooms.length > 0) {
                  setSelectedRoom(dc.rooms[0].id)
                } else {
                  setSelectedRoom("")
                }
              }}
            >
              <TabsList>
                {dataCenters.map((dc) => (
                  <TabsTrigger key={dc.id} value={dc.id}>
                    {dc.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {currentDataCenter && currentDataCenter.rooms.length > 0 ? (
            <Tabs defaultValue={selectedRoom} value={selectedRoom} onValueChange={setSelectedRoom}>
              <TabsList>
                {currentDataCenter.rooms.map((room) => (
                  <TabsTrigger key={room.id} value={room.id}>
                    {room.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {currentDataCenter.rooms.map((room) => (
                <TabsContent key={room.id} value={room.id} className="w-full">
                  {room.racks.length > 0 ? (
                    <RackGrid racks={room.racks} onRackClick={handleRackClick} />
                  ) : (
                    <div className="text-center p-6">
                      <p className="text-muted-foreground mb-4">No racks in this room.</p>
                      <Button onClick={() => setIsConfigModalOpen(true)}>Add Racks</Button>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center p-6">
              <p className="text-muted-foreground mb-4">No rooms in this data center.</p>
              <Button onClick={() => setIsConfigModalOpen(true)}>Add Rooms</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <RackDetailModal isOpen={isRackModalOpen} onClose={() => setIsRackModalOpen(false)} rackId={selectedRack} />

      <DataCenterConfigModal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} />
    </div>
  )
}
