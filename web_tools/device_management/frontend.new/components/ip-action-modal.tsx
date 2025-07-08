"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useDataCenterStore } from "@/lib/data-center-store"
import type { IPAddress } from "@/models/data-center"

interface IPActionModalProps {
  isOpen: boolean
  onClose: () => void
  ipId: string | null
  ipAddresses: IPAddress[]
}

export function IPActionModal({ isOpen, onClose, ipId, ipAddresses }: IPActionModalProps) {
  const { devices, updateDevice } = useDataCenterStore()

  const [ipAddress, setIpAddress] = useState("")
  const [subnet, setSubnet] = useState("")
  const [gateway, setGateway] = useState("")
  const [status, setStatus] = useState("Assigned")
  const [selectedDevice, setSelectedDevice] = useState("")

  // 獲取當前 IP 地址
  const currentIP = ipId ? ipAddresses.find((ip) => ip.id === ipId) : null

  // 重置表單
  useEffect(() => {
    if (isOpen && currentIP) {
      setIpAddress(currentIP.address)
      setSubnet(currentIP.subnet)
      setGateway(currentIP.gateway || "")
      setStatus(currentIP.status)
      setSelectedDevice(currentIP.deviceId || "")
    } else {
      setIpAddress("")
      setSubnet("")
      setGateway("")
      setStatus("Assigned")
      setSelectedDevice("")
    }
  }, [isOpen, currentIP])

  // 處理表單提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!ipAddress || !subnet) {
      toast({
        title: "Error",
        description: "IP address and subnet are required",
        variant: "destructive",
      })
      return
    }

    try {
      // 如果是更新現有 IP
      if (currentIP && currentIP.deviceId) {
        const device = devices[currentIP.deviceId]
        if (device) {
          // 更新設備的 IP 地址
          const updatedIps = device.ips.map((ip) =>
            ip.id === ipId
              ? {
                  ...ip,
                  address: ipAddress,
                  subnet,
                  gateway: gateway || null,
                  status: status as "Assigned" | "Available" | "Reserved" | "Deprecated",
                }
              : ip,
          )

          // 更新設備
          updateDevice(
            "", // 這些參數在這裡不重要，因為我們只是更新設備的 IP 地址
            "",
            "",
            currentIP.deviceId,
            { ips: updatedIps },
          )

          toast({
            title: "Success",
            description: "IP address updated successfully",
          })

          onClose()
        }
      }
      // 如果是分配 IP 到設備
      else if (selectedDevice) {
        const device = devices[selectedDevice]
        if (device) {
          // 創建新的 IP 地址
          const newIp: IPAddress = {
            id: `ip-${Date.now()}`,
            address: ipAddress,
            subnet,
            gateway: gateway || null,
            status: status as "Assigned" | "Available" | "Reserved" | "Deprecated",
            deviceId: selectedDevice,
            deviceName: device.name,
            serviceId: device.serviceId,
            serviceName: device.serviceName,
            lastUpdated: new Date().toISOString().split("T")[0],
          }

          // 更新設備的 IP 地址
          const updatedIps = [...device.ips, newIp]

          // 更新設備
          updateDevice(
            "", // 這些參數在這裡不重要，因為我們只是更新設備的 IP 地址
            "",
            "",
            selectedDevice,
            { ips: updatedIps },
          )

          toast({
            title: "Success",
            description: "IP address assigned successfully",
          })

          onClose()
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update IP address",
        variant: "destructive",
      })
      console.error(error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{currentIP?.status === "Available" ? "Assign IP Address" : "Manage IP Address"}</DialogTitle>
          <DialogDescription>
            {currentIP?.status === "Available" ? "Assign this IP address to a device" : "Update IP address information"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ipAddress">IP Address</Label>
            <Input
              id="ipAddress"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="e.g. 192.168.1.10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subnet">Subnet</Label>
            <Input
              id="subnet"
              value={subnet}
              onChange={(e) => setSubnet(e.target.value)}
              placeholder="e.g. 192.168.1.0/24"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gateway">Gateway (Optional)</Label>
            <Input
              id="gateway"
              value={gateway}
              onChange={(e) => setGateway(e.target.value)}
              placeholder="e.g. 192.168.1.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Assigned">Assigned</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
                <SelectItem value="Deprecated">Deprecated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(currentIP?.status === "Available" || !currentIP) && (
            <div className="space-y-2">
              <Label htmlFor="device">Assign to Device</Label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger id="device">
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {Object.values(devices).map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{currentIP?.status === "Available" ? "Assign" : "Update"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
