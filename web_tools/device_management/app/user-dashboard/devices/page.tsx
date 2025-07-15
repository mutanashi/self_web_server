"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useDataCenterStore } from "@/lib/data-center-store"
import { UserDeviceDetailModal } from "@/components/user-device-detail-modal"

export default function UserDevices() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Get devices from store
  const dataStore = useDataCenterStore()
  const storeDevices = dataStore.devices || {}

  // Convert devices object to array
  const devices = Object.values(storeDevices)

  // Filter devices based on search query
  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(device.ips) && device.ips.some((ip) => ip.address.includes(searchQuery))),
  )

  const handleDeviceClick = (deviceId: string) => {
    setSelectedDevice(deviceId)
    setIsModalOpen(true)
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
    <div className="space-y-4 w-full max-w-none">
      <h1 className="text-2xl font-bold text-foreground">Device Lookup</h1>

      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle>My Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search device name, model or IP address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device Name</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.length > 0 ? (
                  filteredDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.name}</TableCell>
                      <TableCell>{device.type}</TableCell>
                      <TableCell>
                        {device.serviceName ? (
                          <Badge className="bg-purple-900/30 text-purple-200">{device.serviceName}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeColor(device.status)}`}>{device.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {Array.isArray(device.ips) && device.ips.map((ip) => <div key={ip.id}>{ip.address}</div>)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDeviceClick(device.id)}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No devices found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UserDeviceDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deviceId={selectedDevice}
        devices={devices}
      />
    </div>
  )
}
