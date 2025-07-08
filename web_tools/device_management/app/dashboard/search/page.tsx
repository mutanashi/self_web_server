"use client"

import { useState, useEffect } from "react"
import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useDataCenterStore } from "@/lib/data-center-store"
import { SearchResultModal } from "@/components/search-result-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedResult, setSelectedResult] = useState<any | null>(null)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Advanced search filters
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("any")
  const [locationFilter, setLocationFilter] = useState("any")
  const [ipRangeFilter, setIpRangeFilter] = useState("any")
  const [statusFilter, setStatusFilter] = useState("any")

  // 從 store 獲取數據
  const dataStore = useDataCenterStore()
  const storeDevices = dataStore?.devices || {}
  const storeServices = dataStore?.getAllServices ? dataStore.getAllServices() : []
  const dataCenters = dataStore?.dataCenters || []

  // 將 devices 對象轉換為數組
  const devices = Object.values(storeDevices)
  const services = Array.isArray(storeServices) ? storeServices : []

  // 從設備中獲取所有 IP 地址
  const ipAddresses = devices.flatMap((device) =>
    Array.isArray(device?.ips)
      ? device.ips.map((ip) => ({
          ...ip,
          deviceName: device?.name || "",
          deviceId: device?.id || "",
          serviceId: device?.serviceId || "",
          serviceName: device?.serviceName || "",
        }))
      : [],
  )

  // 設置定期刷新，確保數據同步
  useEffect(() => {
    // 創建一個訂閱，當 store 數據變化時更新頁面
    const unsubscribe = useDataCenterStore.subscribe(() => {
      setRefreshKey((prev) => prev + 1)
    })

    return () => unsubscribe()
  }, [])

  // 安全的字符串包含檢查函數
  const safeIncludes = (str: any, searchStr: string): boolean => {
    if (typeof str !== "string") return false
    return str.toLowerCase().includes(searchStr.toLowerCase())
  }

  // 安全的 IP 地址檢查函數
  const safeIpCheck = (ip: any, searchStr: string): boolean => {
    if (!ip || !ip.address) return false
    return ip.address.includes(searchStr)
  }

  // Filter results based on search query and advanced filters
  const filteredDevices = devices.filter((device) => {
    if (!device) return false

    const searchLower = searchQuery.toLowerCase()

    const matchesSearch =
      searchQuery === "" ||
      safeIncludes(device.name, searchLower) ||
      safeIncludes(device.type, searchLower) ||
      safeIncludes(device.serviceName, searchLower) ||
      (Array.isArray(device.ips) && device.ips.some((ip) => safeIpCheck(ip, searchQuery)))

    // Apply advanced filters if they are set
    const matchesType =
      deviceTypeFilter === "any" ||
      (device.type && typeof device.type === "string" && device.type.includes(deviceTypeFilter))

    const matchesStatus = statusFilter === "any" || device.status === statusFilter

    // 查找設備位置
    let deviceLocation = ""
    for (const dc of dataCenters) {
      if (!dc || !Array.isArray(dc.rooms)) continue

      for (const room of dc.rooms) {
        if (!room || !Array.isArray(room.racks)) continue

        for (const rack of room.racks) {
          if (!rack || !Array.isArray(rack.units)) continue

          for (const unit of rack.units) {
            if (unit && unit.deviceId === device.id) {
              deviceLocation = `${dc.name || ""} ${room.name || ""}`
              break
            }
          }
        }
      }
    }

    const matchesLocation =
      locationFilter === "any" ||
      (deviceLocation && deviceLocation.toLowerCase().includes(locationFilter.toLowerCase()))

    const matchesIpRange =
      ipRangeFilter === "any" ||
      (Array.isArray(device.ips) &&
        device.ips.some((ip) => {
          if (!ip || !ip.address) return false

          // Simple implementation - would need more sophisticated IP range checking in production
          if (ipRangeFilter === "10.0.0.0") return ip.address.startsWith("10.")
          if (ipRangeFilter === "192.168.0.0") return ip.address.startsWith("192.168.")
          return true
        }))

    return matchesSearch && matchesType && matchesStatus && matchesLocation && matchesIpRange
  })

  const filteredServices = services.filter((service) => {
    if (!service) return false

    const searchLower = searchQuery.toLowerCase()

    const matchesSearch =
      searchQuery === "" ||
      safeIncludes(service.name, searchLower) ||
      safeIncludes(service.description, searchLower) ||
      safeIncludes(service.owner, searchLower) ||
      safeIncludes(service.department, searchLower)

    // Apply advanced filters
    const matchesStatus = statusFilter === "any" || service.status === statusFilter
    const matchesLocation = locationFilter === "any" || true // Would need location data

    return matchesSearch && matchesStatus && matchesLocation
  })

  const filteredIPs = ipAddresses.filter((ip) => {
    if (!ip) return false

    const searchLower = searchQuery.toLowerCase()

    const matchesSearch =
      searchQuery === "" ||
      safeIpCheck(ip, searchQuery) ||
      (ip.subnet && typeof ip.subnet === "string" && ip.subnet.includes(searchQuery)) ||
      safeIncludes(ip.deviceName, searchLower) ||
      safeIncludes(ip.serviceName, searchLower)

    // Apply advanced filters
    const matchesStatus = statusFilter === "any" || ip.status === statusFilter
    const matchesIpRange =
      ipRangeFilter === "any" ||
      (() => {
        if (!ip.address) return false

        // Simple implementation - would need more sophisticated IP range checking in production
        if (ipRangeFilter === "10.0.0.0") return ip.address.startsWith("10.")
        if (ipRangeFilter === "192.168.0.0") return ip.address.startsWith("192.168.")
        return true
      })()

    return matchesSearch && matchesStatus && matchesIpRange
  })

  // 查找設備位置
  function getDeviceLocation(deviceId: string): string {
    if (!deviceId) return "Not installed"

    for (const dc of dataCenters) {
      if (!dc || !Array.isArray(dc.rooms)) continue

      for (const room of dc.rooms) {
        if (!room || !Array.isArray(room.racks)) continue

        for (const rack of room.racks) {
          if (!rack || !Array.isArray(rack.units)) continue

          for (const unit of rack.units) {
            if (unit && unit.deviceId === deviceId) {
              return `${dc.name || ""} > ${room.name || ""} > ${rack.name || ""} > U${unit.position || ""}`
            }
          }
        }
      }
    }
    return "Not installed"
  }

  const handleResultClick = (type: string, id: string) => {
    if (!id) return

    let result = null

    if (type === "Device") {
      const device = storeDevices[id]
      if (device) {
        result = {
          ...device,
          type: "Device",
          location: getDeviceLocation(device.id),
        }
      }
    } else if (type === "Service") {
      const service = dataStore?.getService ? dataStore.getService(id) : services.find((s) => s.id === id)
      if (service) {
        result = {
          ...service,
          type: "Service",
        }
      }
    } else if (type === "IP") {
      const ip = ipAddresses.find((ip) => ip.id === id)
      if (ip) {
        result = {
          ...ip,
          type: "IP",
        }
      }
    }

    if (result) {
      setSelectedResult(result)
      setIsResultModalOpen(true)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    if (!status) return "bg-gray-700 text-gray-200"

    switch (status) {
      case "Active":
      case "Assigned":
        return "bg-green-900/30 text-green-200"
      case "Inactive":
      case "Available":
        return "bg-blue-900/30 text-blue-200"
      case "Maintenance":
      case "Reserved":
        return "bg-yellow-900/30 text-yellow-200"
      case "Decommissioned":
      case "Deprecated":
        return "bg-red-900/30 text-red-200"
      default:
        return "bg-gray-700 text-gray-200"
    }
  }

  const clearFilters = () => {
    setDeviceTypeFilter("any")
    setLocationFilter("any")
    setIpRangeFilter("any")
    setStatusFilter("any")
    setSearchQuery("")
  }

  return (
    <div className="space-y-4 w-full max-w-none">
      <h1 className="text-3xl font-bold text-foreground">Search Service</h1>

      <Card className="w-full bg-[#111827] border-0">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">Search</h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
            <div className="lg:col-span-7">
              <Input
                placeholder="Search by name, IP, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 bg-[#1a2035] border-[#2e3650]"
              />
            </div>

            <div className="lg:col-span-3">
              <div className="h-12 bg-[#1a2035] border border-[#2e3650] rounded-md flex items-center px-4 text-lg font-medium">
                Advanced Search
              </div>
            </div>

            <div className="lg:col-span-2">
              <Button className="w-full h-12 bg-[#3b82f6] hover:bg-[#2563eb] text-white">
                <SearchIcon className="mr-2 h-5 w-5" />
                Search
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Device Type</label>
              <Select value={deviceTypeFilter} onValueChange={setDeviceTypeFilter}>
                <SelectTrigger className="h-12 bg-[#1a2035] border-[#2e3650]">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="Dell">Dell</SelectItem>
                  <SelectItem value="HP">HP</SelectItem>
                  <SelectItem value="NetApp">NetApp</SelectItem>
                  <SelectItem value="Cisco">Cisco</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="h-12 bg-[#1a2035] border-[#2e3650]">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="DC-A">DC-A</SelectItem>
                  <SelectItem value="DC-B">DC-B</SelectItem>
                  <SelectItem value="Room 1">Room 1</SelectItem>
                  <SelectItem value="Room 2">Room 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">IP Range</label>
              <Select value={ipRangeFilter} onValueChange={setIpRangeFilter}>
                <SelectTrigger className="h-12 bg-[#1a2035] border-[#2e3650]">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="10.0.0.0">10.0.0.0/8</SelectItem>
                  <SelectItem value="192.168.0.0">192.168.0.0/16</SelectItem>
                  <SelectItem value="172.16.0.0">172.16.0.0/12</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 bg-[#1a2035] border-[#2e3650]">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={clearFilters} className="border-[#2e3650] hover:bg-[#1a2035]">
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {(searchQuery !== "" ||
        deviceTypeFilter !== "any" ||
        locationFilter !== "any" ||
        ipRangeFilter !== "any" ||
        statusFilter !== "any") && (
        <Card className="w-full">
          <CardContent className="p-6">
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">
                  All Results ({filteredDevices.length + filteredServices.length + filteredIPs.length})
                </TabsTrigger>
                <TabsTrigger value="devices">Devices ({filteredDevices.length})</TabsTrigger>
                <TabsTrigger value="services">Services ({filteredServices.length})</TabsTrigger>
                <TabsTrigger value="ips">IP Addresses ({filteredIPs.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {filteredDevices.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Devices</h3>
                    <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Device Name</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>IP Addresses</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredDevices.slice(0, 5).map((device) => (
                            <TableRow key={device.id || `device-${Math.random()}`}>
                              <TableCell className="font-medium">{device.name || "-"}</TableCell>
                              <TableCell>{device.type || "-"}</TableCell>
                              <TableCell>
                                {device.serviceName ? (
                                  <Badge className="bg-purple-900/30 text-purple-200">{device.serviceName}</Badge>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge className={`${getStatusBadgeColor(device.status)}`}>
                                  {device.status || "-"}
                                </Badge>
                              </TableCell>
                              <TableCell>{getDeviceLocation(device.id)}</TableCell>
                              <TableCell>
                                {Array.isArray(device.ips) && device.ips.length > 0
                                  ? device.ips.map((ip, ipIndex) => (
                                      <div key={`${device.id}-${ip?.id || ipIndex}-${ip?.address || ipIndex}`}>
                                        {ip?.address || "-"}
                                      </div>
                                    ))
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleResultClick("Device", device.id)}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {filteredDevices.length > 5 && (
                      <div className="mt-2 text-right">
                        <Button variant="link" onClick={() => setActiveTab("devices")}>
                          View all {filteredDevices.length} devices
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {filteredServices.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Services</h3>
                    <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Service Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Devices</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredServices.slice(0, 5).map((service) => (
                            <TableRow key={service.id || `service-${Math.random()}`}>
                              <TableCell className="font-medium">{service.name || "-"}</TableCell>
                              <TableCell>{service.description || "-"}</TableCell>
                              <TableCell>
                                <Badge className={`${getStatusBadgeColor(service.status)}`}>
                                  {service.status || "-"}
                                </Badge>
                              </TableCell>
                              <TableCell>{Array.isArray(service.devices) ? service.devices.length : 0}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleResultClick("Service", service.id)}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {filteredServices.length > 5 && (
                      <div className="mt-2 text-right">
                        <Button variant="link" onClick={() => setActiveTab("services")}>
                          View all {filteredServices.length} services
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {filteredIPs.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">IP Addresses</h3>
                    <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Subnet</TableHead>
                            <TableHead>Device</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredIPs.slice(0, 5).map((ip, index) => (
                            <TableRow key={ip.id || `ip-${index}-${ip.address || index}`}>
                              <TableCell className="font-medium">{ip.address || "-"}</TableCell>
                              <TableCell>{ip.subnet || "-"}</TableCell>
                              <TableCell>{ip.deviceName || "-"}</TableCell>
                              <TableCell>
                                {ip.serviceName ? (
                                  <Badge className="bg-purple-900/30 text-purple-200">{ip.serviceName}</Badge>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge className={`${getStatusBadgeColor(ip.status)}`}>{ip.status || "-"}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => (ip.id ? handleResultClick("IP", ip.id) : null)}
                                  disabled={!ip.id}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {filteredIPs.length > 5 && (
                      <div className="mt-2 text-right">
                        <Button variant="link" onClick={() => setActiveTab("ips")}>
                          View all {filteredIPs.length} IP addresses
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {filteredDevices.length === 0 && filteredServices.length === 0 && filteredIPs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No results found for "{searchQuery}"</div>
                )}
              </TabsContent>

              <TabsContent value="devices">
                <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Device Name</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>IP Addresses</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDevices.length > 0 ? (
                        filteredDevices.map((device) => (
                          <TableRow key={device.id || `device-${Math.random()}`}>
                            <TableCell className="font-medium">{device.name || "-"}</TableCell>
                            <TableCell>{device.type || "-"}</TableCell>
                            <TableCell>
                              {device.serviceName ? (
                                <Badge className="bg-purple-900/30 text-purple-200">{device.serviceName}</Badge>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusBadgeColor(device.status)}`}>{device.status || "-"}</Badge>
                            </TableCell>
                            <TableCell>{getDeviceLocation(device.id)}</TableCell>
                            <TableCell>
                              {Array.isArray(device.ips) && device.ips.length > 0
                                ? device.ips.map((ip, ipIndex) => (
                                    <div key={`${device.id}-${ip?.id || ipIndex}-${ip?.address || ipIndex}`}>
                                      {ip?.address || "-"}
                                    </div>
                                  ))
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleResultClick("Device", device.id)}>
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                            No devices found for "{searchQuery}"
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="services">
                <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Devices</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServices.length > 0 ? (
                        filteredServices.map((service) => (
                          <TableRow key={service.id || `service-${Math.random()}`}>
                            <TableCell className="font-medium">{service.name || "-"}</TableCell>
                            <TableCell>{service.description || "-"}</TableCell>
                            <TableCell>{service.owner || "-"}</TableCell>
                            <TableCell>{service.department || "-"}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusBadgeColor(service.status)}`}>
                                {service.status || "-"}
                              </Badge>
                            </TableCell>
                            <TableCell>{Array.isArray(service.devices) ? service.devices.length : 0}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResultClick("Service", service.id)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                            No services found for "{searchQuery}"
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="ips">
                <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Subnet</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIPs.length > 0 ? (
                        filteredIPs.map((ip, index) => (
                          <TableRow key={ip.id || `ip-${index}-${ip.address || index}`}>
                            <TableCell className="font-medium">{ip.address || "-"}</TableCell>
                            <TableCell>{ip.subnet || "-"}</TableCell>
                            <TableCell>{ip.deviceName || "-"}</TableCell>
                            <TableCell>
                              {ip.serviceName ? (
                                <Badge className="bg-purple-900/30 text-purple-200">{ip.serviceName}</Badge>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusBadgeColor(ip.status)}`}>{ip.status || "-"}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => (ip.id ? handleResultClick("IP", ip.id) : null)}
                                disabled={!ip.id}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                            No IP addresses found for "{searchQuery}"
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <SearchResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        result={selectedResult}
      />
    </div>
  )
}
