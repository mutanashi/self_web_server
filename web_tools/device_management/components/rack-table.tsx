"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash, Info } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useDataCenterStore } from "@/lib/data-center-store"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Rack } from "@/models/data-center"

interface RackTableProps {
  rack: Rack
  onDeviceChange?: () => void
}

export function RackTable({ rack, onDeviceChange }: RackTableProps) {
  const { findRack, deleteDevice, getDevice, services } = useDataCenterStore()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  // 獲取所有已安裝的設備
  const getInstalledDevices = () => {
    const devices = new Map()

    rack.units.forEach((unit) => {
      if (unit.deviceId && !devices.has(unit.deviceId)) {
        // 找到設備佔用的所有單元
        const occupiedUnits = rack.units.filter((u) => u.deviceId === unit.deviceId)
        const positions = occupiedUnits.map((u) => u.position).sort((a, b) => a - b)

        // 獲取完整的設備信息
        const deviceDetails = getDevice(unit.deviceId)

        devices.set(unit.deviceId, {
          id: unit.deviceId,
          name: unit.deviceName || "Unknown Device",
          ip: unit.deviceIp,
          startPosition: Math.min(...positions),
          size: unit.deviceSize || positions.length,
          type: deviceDetails?.type || "Unknown",
          status: deviceDetails?.status || "Active",
          powerConsumption: deviceDetails?.powerConsumption,
          ips: deviceDetails?.ips || [],
          installationDate: deviceDetails?.installationDate,
          serviceId: deviceDetails?.serviceId,
          serviceName: deviceDetails?.serviceName,
        })
      }
    })

    return Array.from(devices.values())
  }

  const installedDevices = getInstalledDevices()

  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm("Are you sure you want to remove this device from the rack?")) {
      return
    }

    setIsDeleting(deviceId)

    try {
      const rackInfo = findRack(rack.id)

      if (!rackInfo) {
        throw new Error("Rack not found")
      }

      const { datacenter, room } = rackInfo

      deleteDevice(datacenter.id, room.id, rack.id, deviceId)

      toast({
        title: "Success",
        description: "Device has been removed from the rack.",
      })

      // 通知父組件
      if (onDeviceChange) {
        onDeviceChange()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove device. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsDeleting(null)
    }
  }

  // 獲取狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500"
      case "Inactive":
        return "bg-red-500"
      case "Maintenance":
        return "bg-yellow-500"
      case "Decommissioned":
        return "bg-gray-500"
      default:
        return "bg-blue-500"
    }
  }

  // 獲取選中的設備
  const selectedDevice = selectedDeviceId ? installedDevices.find((d) => d.id === selectedDeviceId) : null

  // 獲取服務信息
  const getServiceInfo = (serviceId: string | undefined) => {
    if (!serviceId) return null
    return services.find((service) => service.id === serviceId)
  }

  return (
    <div>
      {installedDevices.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Device Name</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {installedDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>U{device.startPosition}</TableCell>
                  <TableCell>{device.name}</TableCell>
                  <TableCell>
                    {device.ips && device.ips.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        <span>{device.ips[0].address}</span>
                        {device.ips.length > 1 && (
                          <Badge variant="outline" className="w-fit">
                            +{device.ips.length - 1} more
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No IP</span>
                    )}
                  </TableCell>
                  <TableCell>{device.type}</TableCell>
                  <TableCell>
                    {device.serviceId ? (
                      <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-700">
                        {device.serviceName || getServiceInfo(device.serviceId)?.name || "Unknown Service"}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(device.status)} mr-2`} />
                      {device.status}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedDeviceId(device.id)}>
                            <Info className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>{selectedDevice?.name}</DialogTitle>
                            <DialogDescription>Device details and statistics</DialogDescription>
                          </DialogHeader>
                          {selectedDevice && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Type</p>
                                  <p className="text-sm">{selectedDevice.type}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Status</p>
                                  <div className="flex items-center">
                                    <div
                                      className={`w-2 h-2 rounded-full ${getStatusColor(selectedDevice.status)} mr-2`}
                                    />
                                    <p className="text-sm">{selectedDevice.status}</p>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Position</p>
                                  <p className="text-sm">U{selectedDevice.startPosition}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Size</p>
                                  <p className="text-sm">{selectedDevice.size}U</p>
                                </div>
                                {selectedDevice.serviceId && (
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium">Service</p>
                                    <p className="text-sm">
                                      {selectedDevice.serviceName ||
                                        getServiceInfo(selectedDevice.serviceId)?.name ||
                                        "Unknown Service"}
                                    </p>
                                  </div>
                                )}
                                {selectedDevice.powerConsumption && (
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium">Power Consumption</p>
                                    <p className="text-sm">{selectedDevice.powerConsumption}W</p>
                                  </div>
                                )}
                                {selectedDevice.installationDate && (
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium">Installation Date</p>
                                    <p className="text-sm">{selectedDevice.installationDate}</p>
                                  </div>
                                )}
                              </div>

                              {selectedDevice.ips && selectedDevice.ips.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">IP Addresses</p>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead>Subnet</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedDevice.ips.map((ip, index) => (
                                        <TableRow key={index}>
                                          <TableCell>{ip.address}</TableCell>
                                          <TableCell>{ip.subnet}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDevice(device.id)}
                        disabled={isDeleting === device.id}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No devices installed in this rack.</p>
        </div>
      )}
    </div>
  )
}
