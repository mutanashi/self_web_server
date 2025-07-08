"use client"

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
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Device } from "@/models/data-center"
import { useState, useEffect } from "react"
import { useDataCenterStore } from "@/lib/data-center-store"

interface UserDeviceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  deviceId: string | null
  devices: Device[]
}

export function UserDeviceDetailModal({ isOpen, onClose, deviceId, devices }: UserDeviceDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [deviceData, setDeviceData] = useState<Device | null>(null)
  const dataStore = useDataCenterStore()
  const dataCenters = dataStore.dataCenters || []

  useEffect(() => {
    if (deviceId) {
      const device = devices.find((d) => d.id === deviceId) || null
      setDeviceData(device)
    }
  }, [deviceId, devices])

  if (!deviceData) return null

  // Find device location
  let deviceLocation = { datacenter: "Not installed", room: "", rack: "", position: "" }
  for (const dc of dataCenters) {
    for (const room of dc.rooms) {
      for (const rack of room.racks) {
        for (const unit of rack.units) {
          if (unit.deviceId === deviceData.id) {
            deviceLocation = {
              datacenter: dc.name,
              room: room.name,
              rack: rack.name,
              position: `U${unit.position}`,
            }
            break
          }
        }
      }
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-900/30 text-green-200"
      case "Inactive":
        return "bg-gray-700 text-gray-200"
      case "Maintenance":
        return "bg-yellow-900/30 text-yellow-200"
      case "Decommissioned":
        return "bg-red-900/30 text-red-200"
      default:
        return "bg-gray-700 text-gray-200"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{deviceData.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge className={`${getStatusBadgeColor(deviceData.status)}`}>{deviceData.status}</Badge>
            <span>{deviceData.type}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Device Name</p>
                      <p>{deviceData.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Model</p>
                      <p>{deviceData.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge className={`${getStatusBadgeColor(deviceData.status)}`}>{deviceData.status}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Service</p>
                      <p>{deviceData.serviceName || "-"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Location Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Data Center</p>
                      <p>{deviceLocation.datacenter}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Room</p>
                      <p>{deviceLocation.room || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rack</p>
                      <p>{deviceLocation.rack || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Position</p>
                      <p>{deviceLocation.position || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                <p className="text-sm">{deviceData.notes || "No notes"}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="network">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">IP Addresses</h3>
              <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Subnet</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(deviceData.ips) && deviceData.ips.length > 0 ? (
                      deviceData.ips.map((ip) => (
                        <TableRow key={ip.id}>
                          <TableCell className="font-medium">{ip.address}</TableCell>
                          <TableCell>{ip.subnet}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-900/30 text-blue-200">{ip.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                          No IP addresses assigned
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specs">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Hardware Specifications</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">CPU</p>
                      <p>Intel Xeon E5-2680 v4</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Memory</p>
                      <p>128GB DDR4</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Storage</p>
                      <p>2 x 1TB SSD</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Network</p>
                      <p>4 x 10GbE</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Power Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Power Consumption</p>
                      <p>{deviceData.powerConsumption || "-"} W</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Power Supply</p>
                      <p>Redundant Power</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
