"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useDataCenterStore } from "@/lib/data-center-store"

export function UserServiceStatus() {
  // Get services from store
  const dataStore = useDataCenterStore()
  const services = dataStore.getAllServices ? dataStore.getAllServices() : []

  // Only show active services
  const activeServices = services.filter((service) => service.status === "Active")

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500"
      case "Maintenance":
        return "bg-yellow-500"
      case "Inactive":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      {activeServices.map((service) => (
        <Card key={service.id} className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${getStatusIndicator(service.status)}`}></div>
            <div>
              <div className="font-medium">{service.name}</div>
              <div className="text-xs text-muted-foreground">{service.description}</div>
            </div>
          </div>
          <Badge className="bg-green-900/30 text-green-200">Running Normally</Badge>
        </Card>
      ))}
    </div>
  )
}
