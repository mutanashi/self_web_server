"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useDataCenterStore } from "@/lib/data-center-store"
import { UserServiceDetailModal } from "@/components/user-service-detail-modal"

export default function UserServices() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Get services from store
  const dataStore = useDataCenterStore()
  const services = dataStore.getAllServices ? dataStore.getAllServices() : []

  // Filter services based on search query
  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.owner && service.owner.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (service.department && service.department.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleServiceClick = (serviceId: string) => {
    setSelectedService(serviceId)
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

  return (
    <div className="space-y-4 w-full max-w-none">
      <h1 className="text-2xl font-bold text-foreground">Service Status</h1>

      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle>Service List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search service name or description..."
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
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criticality</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>{service.description}</TableCell>
                      <TableCell>{service.department || "-"}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeColor(service.status)}`}>{service.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getCriticalityBadgeColor(service.criticality)}`}>
                          {service.criticality}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleServiceClick(service.id)}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No services found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UserServiceDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceId={selectedService}
        services={services}
      />
    </div>
  )
}
