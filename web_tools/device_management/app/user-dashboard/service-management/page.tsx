"use client"

import { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ServiceDetailModal } from "@/components/service-detail-modal"
import { ServiceActionModal } from "@/components/service-action-modal"
import { useDataCenterStore } from "@/lib/data-center-store"

export default function UserServiceManagement() {
  const { getAllServices, getAllDevices } = useDataCenterStore()
  const services = getAllServices()
  const allDevices = getAllDevices()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [actionMode, setActionMode] = useState<"add" | "edit">("add")
  const [refreshKey, setRefreshKey] = useState(0)

  // Filter services based on search query
  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.owner?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.department?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get device count for a service
  const getDeviceCount = (serviceId: string) => {
    return allDevices.filter((device) => device.serviceId === serviceId).length
  }

  const handleServiceClick = (serviceId: string) => {
    setSelectedService(serviceId)
    setIsDetailModalOpen(true)
  }

  const handleDeviceCountClick = (serviceId: string) => {
    alert(`Service has ${getDeviceCount(serviceId)} devices`)
  }

  const handleAddService = () => {
    setActionMode("add")
    setSelectedService(null)
    setIsActionModalOpen(true)
  }

  const handleEditService = (serviceId: string) => {
    setActionMode("edit")
    setSelectedService(serviceId)
    setIsActionModalOpen(true)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-900/30 text-green-200"
      case "Inactive":
        return "bg-gray-700 text-gray-200"
      case "Maintenance":
        return "bg-yellow-900/30 text-yellow-200"
      case "Planned":
        return "bg-blue-900/30 text-blue-200"
      default:
        return "bg-gray-700 text-gray-200"
    }
  }

  const getCriticalityBadgeColor = (criticality: string) => {
    switch (criticality) {
      case "Low":
        return "bg-green-900/30 text-green-200"
      case "Medium":
        return "bg-blue-900/30 text-blue-200"
      case "High":
        return "bg-yellow-900/30 text-yellow-200"
      case "Critical":
        return "bg-red-900/30 text-red-200"
      default:
        return "bg-gray-700 text-gray-200"
    }
  }

  const closeModal = () => {
    setActionMode("add")
    setSelectedService(null)
    setIsActionModalOpen(false)
    // 刷新服務列表
    setRefreshKey((prev) => prev + 1)
  }

  // 使用 useEffect 來監聽數據變化
  useEffect(() => {
    // 這個 effect 會在 refreshKey 變化時重新獲取服務列表
  }, [refreshKey, getAllServices])

  return (
    <div className="space-y-4 w-full max-w-none">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Service Management</h1>
        <Button className="gap-2" onClick={handleAddService}>
          <Plus className="h-4 w-4" /> Add Service
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criticality</TableHead>
                  <TableHead>Devices</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>{service.description}</TableCell>
                      <TableCell>{service.owner || "-"}</TableCell>
                      <TableCell>{service.department || "-"}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeColor(service.status)}`}>{service.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getCriticalityBadgeColor(service.criticality)}`}>
                          {service.criticality}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          className="h-auto p-0 font-normal text-blue-400 hover:text-blue-300"
                          onClick={() => handleDeviceCountClick(service.id)}
                        >
                          {getDeviceCount(service.id)}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleServiceClick(service.id)}>
                            View
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditService(service.id)}>
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No services found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ServiceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        serviceId={selectedService}
      />

      <ServiceActionModal
        isOpen={isActionModalOpen}
        onClose={closeModal}
        serviceId={selectedService}
        mode={actionMode}
      />
    </div>
  )
}
