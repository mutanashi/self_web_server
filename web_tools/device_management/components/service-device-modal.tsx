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
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDataCenterStore } from "@/lib/data-center-store"
import { ExternalLink } from "lucide-react"

interface ServiceDevicesModalProps {
  isOpen: boolean
  onClose: () => void
  serviceId: string | null
  serviceName: string
}

export function ServiceDevicesModal({ isOpen, onClose, serviceId, serviceName }: ServiceDevicesModalProps) {
  const { getAllDevices, dataCenters } = useDataCenterStore()

  // Get all devices associated with this service
  const allDevices = getAllDevices()
  const serviceDevices = allDevices.filter((device) => device.serviceId === serviceId)

  // Get device location information
  const getDeviceLocation = (deviceId: string) => {
    for (const dc of dataCenters) {
      for (const room of dc.rooms) {
        for (const rack of room.racks) {
          const unit = rack.units.find((u) => u.deviceId === deviceId)
          if (unit) {
            return `${dc.name} ${room.name} ${rack.name}`
          }
        }
      }
    }
    return "Unknown Location"
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

  const handleViewAllInDeviceManagement = () => {
    // This would typically navigate to the device management page with a filter
    // For now, we'll just close the modal
    onClose()
    // In a real implementation, you might use router.push('/dashboard/device-management?service=' + serviceId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{serviceName} - Associated Devices</DialogTitle>
          <DialogDescription>Devices currently associated with this service</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {serviceDevices.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device Name</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.name}</TableCell>
                      <TableCell>{device.model || "-"}</TableCell>
                      <TableCell>{device.type}</TableCell>
                      <TableCell>{getDeviceLocation(device.id)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(device.status || "Unknown")}>
                          {device.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>{device.ips && device.ips.length > 0 ? device.ips[0].address : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No devices are currently associated with this service.</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            Total: {serviceDevices.length} device{serviceDevices.length !== 1 ? "s" : ""}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleViewAllInDeviceManagement} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View All in Device Management
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
