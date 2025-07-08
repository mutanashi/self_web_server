"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Filter, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useDataCenterStore } from "@/lib/data-center-store"
import { UserDeviceDetailModal } from "@/components/user-device-detail-modal"
import { UserDeviceActionModal } from "@/components/user-device-action-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DeviceManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<"install" | "uninstall" | "move">("install")
  const [refreshKey, setRefreshKey] = useState(0)

  // 篩選器
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")

  // 獲取數據
  const dataStore = useDataCenterStore()
  const storeDevices = dataStore.devices || {}
  const dataCenters = dataStore.dataCenters || []
  const services = dataStore.getAllServices ? dataStore.getAllServices() : []

  // 將設備對象轉換為數組
  const devices = Object.values(storeDevices)

  // 設置定期刷新以確保數據同步
  useEffect(() => {
    const unsubscribe = useDataCenterStore.subscribe(() => {
      setRefreshKey((prev) => prev + 1)
    })

    return () => unsubscribe()
  }, [])

  // 篩選設備
  const filteredDevices = devices.filter((device) => {
    // 搜索匹配
    const matchesSearch =
      searchQuery === "" ||
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (device.model && device.model.toLowerCase().includes(searchQuery.toLowerCase())) ||
      device.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(device.ips) && device.ips.some((ip) => ip.address.includes(searchQuery)))

    // 狀態篩選
    const matchesStatus = statusFilter === "all" || device.status === statusFilter

    // 類型篩選
    const matchesType = typeFilter === "all" || device.type === typeFilter

    // 服務篩選
    const matchesService = serviceFilter === "all" || device.serviceId === serviceFilter

    return matchesSearch && matchesStatus && matchesType && matchesService
  })

  // 處理設備點擊
  const handleDeviceClick = (deviceId: string) => {
    setSelectedDevice(deviceId)
    setIsDetailModalOpen(true)
  }

  // 處理設備操作
  const handleDeviceAction = (action: "install" | "uninstall" | "move") => {
    setActionType(action)
    setIsActionModalOpen(true)
  }

  // 處理操作成功
  const handleActionSuccess = () => {
    setIsActionModalOpen(false)
    setRefreshKey((prev) => prev + 1)
  }

  // 獲取狀態徽章顏色
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

  // 獲取設備類型列表
  const getDeviceTypes = () => {
    const types = new Set<string>()
    devices.forEach((device) => {
      if (device.type) {
        types.add(device.type)
      }
    })
    return Array.from(types)
  }

  // 獲取設備位置
  const getDeviceLocation = (deviceId: string) => {
    for (const dc of dataCenters) {
      for (const room of dc.rooms) {
        for (const rack of room.racks) {
          for (const unit of rack.units) {
            if (unit.deviceId === deviceId) {
              return `${dc.name}, ${room.name}, ${rack.name}, U${unit.position}`
            }
          }
        }
      }
    }
    return "Not installed"
  }

  // 清除篩選器
  const clearFilters = () => {
    setStatusFilter("all")
    setTypeFilter("all")
    setServiceFilter("all")
    setSearchQuery("")
  }

  return (
    <div className="space-y-4 w-full max-w-none">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Device Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => handleDeviceAction("install")}>
            <Plus className="mr-2 h-4 w-4" /> Add Device
          </Button>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle>Device Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search device name, model or IP address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {getDeviceTypes().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device Name</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Location</TableHead>
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
                      <TableCell>{device.model}</TableCell>
                      <TableCell>{getDeviceLocation(device.id)}</TableCell>
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
                        {Array.isArray(device.ips) && device.ips.length > 0 ? (
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleDeviceClick(device.id)}>
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDevice(device.id)
                              handleDeviceAction("move")
                            }}
                          >
                            Move
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => {
                              setSelectedDevice(device.id)
                              handleDeviceAction("uninstall")
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Uninstall
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
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
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        deviceId={selectedDevice}
        devices={devices}
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
