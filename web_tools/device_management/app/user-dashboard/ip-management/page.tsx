"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Filter, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useDataCenterStore } from "@/lib/data-center-store"
import { UserIPDetailModal } from "@/components/user-ip-detail-modal"
import { UserIPActionModal } from "@/components/user-ip-action-modal"
import { UserSubnetModal } from "@/components/user-subnet-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

export default function UserIPManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIP, setSelectedIP] = useState<string | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isSubnetModalOpen, setIsSubnetModalOpen] = useState(false)
  const [actionType, setActionType] = useState<"assign" | "release" | "reserve">("assign")
  const [activeTab, setActiveTab] = useState("addresses")
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedSubnet, setSelectedSubnet] = useState<string | null>(null)

  // 篩選器
  const [statusFilter, setStatusFilter] = useState("all")
  const [subnetFilter, setSubnetFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")

  // 獲取數據
  const dataStore = useDataCenterStore()
  const storeDevices = dataStore.devices || {}
  const ipSubnets = dataStore.ipSubnets || []
  const services = dataStore.getAllServices ? dataStore.getAllServices() : []

  // 將設備對象轉換為數組
  const devices = Object.values(storeDevices)

  // 獲取所有IP地址
  const ipAddresses = devices.flatMap((device) =>
    Array.isArray(device.ips)
      ? device.ips.map((ip) => ({
          ...ip,
          deviceName: device.name,
          deviceId: device.id,
          serviceId: device.serviceId,
          serviceName: device.serviceName,
        }))
      : [],
  )

  // 設置定期刷新以確保數據同步
  useEffect(() => {
    const unsubscribe = useDataCenterStore.subscribe(() => {
      setRefreshKey((prev) => prev + 1)
    })

    return () => unsubscribe()
  }, [])

  // 篩選IP地址
  const filteredIPs = ipAddresses.filter((ip) => {
    // 搜索匹配
    const matchesSearch =
      searchQuery === "" ||
      ip.address.includes(searchQuery) ||
      ip.subnet.includes(searchQuery) ||
      (ip.deviceName && ip.deviceName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ip.serviceName && ip.serviceName.toLowerCase().includes(searchQuery.toLowerCase()))

    // 狀態篩選
    const matchesStatus = statusFilter === "all" || ip.status === statusFilter

    // 子網篩選
    const matchesSubnet = subnetFilter === "all" || ip.subnet === subnetFilter

    // 服務篩選
    const matchesService = serviceFilter === "all" || ip.serviceId === serviceFilter

    return matchesSearch && matchesStatus && matchesSubnet && matchesService
  })

  // 處理IP點擊
  const handleIPClick = (ipId: string) => {
    setSelectedIP(ipId)
    setIsDetailModalOpen(true)
  }

  // 處理IP操作
  const handleIPAction = (action: "assign" | "release" | "reserve", subnetId?: string) => {
    setActionType(action)
    if (subnetId) {
      const subnet = ipSubnets.find((s) => s.id === subnetId)
      if (subnet) {
        setSelectedSubnet(subnet.subnet)
      }
    } else {
      setSelectedSubnet(null)
    }
    setIsActionModalOpen(true)
  }

  // 處理操作成功
  const handleActionSuccess = () => {
    setIsActionModalOpen(false)
    setRefreshKey((prev) => prev + 1)
    toast({
      title: "操作成功",
      description:
        actionType === "assign" ? "IP 已成功分配" : actionType === "reserve" ? "IP 已成功保留" : "IP 已成功釋放",
    })
  }

  // 處理子網創建成功
  const handleSubnetSuccess = () => {
    setIsSubnetModalOpen(false)
    setRefreshKey((prev) => prev + 1)
    toast({
      title: "子網創建成功",
      description: "新的子網已成功添加到系統中",
    })
  }

  // 獲取狀態徽章顏色
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Assigned":
        return "bg-green-900/30 text-green-200"
      case "Available":
        return "bg-blue-900/30 text-blue-200"
      case "Reserved":
        return "bg-yellow-900/30 text-yellow-200"
      case "Deprecated":
        return "bg-red-900/30 text-red-200"
      default:
        return "bg-gray-700 text-gray-200"
    }
  }

  // 獲取子網列表
  const getSubnets = () => {
    const subnets = new Set<string>()
    ipAddresses.forEach((ip) => {
      if (ip.subnet) {
        subnets.add(ip.subnet)
      }
    })
    return Array.from(subnets)
  }

  // 清除篩選器
  const clearFilters = () => {
    setStatusFilter("all")
    setSubnetFilter("all")
    setServiceFilter("all")
    setSearchQuery("")
  }

  // 查看子網的所有 IP
  const handleViewSubnetIPs = (subnet: string) => {
    setActiveTab("addresses")
    setSubnetFilter(subnet)
  }

  return (
    <div className="space-y-4 w-full max-w-none">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">IP Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => handleIPAction("assign")}>
            <Plus className="mr-2 h-4 w-4" /> Assign IP
          </Button>
          <Button variant="outline" onClick={() => handleIPAction("reserve")}>
            Reserve IP
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="addresses">IP Addresses</TabsTrigger>
          <TabsTrigger value="subnets">Subnets</TabsTrigger>
        </TabsList>

        <TabsContent value="addresses">
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle>IP Address Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search IP address, subnet or device..."
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
                      <SelectItem value="Assigned">Assigned</SelectItem>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Reserved">Reserved</SelectItem>
                      <SelectItem value="Deprecated">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={subnetFilter} onValueChange={setSubnetFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Subnet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subnets</SelectItem>
                      {getSubnets().map((subnet) => (
                        <SelectItem key={subnet} value={subnet}>
                          {subnet}
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
                      <TableHead>IP Address</TableHead>
                      <TableHead>Subnet</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIPs.length > 0 ? (
                      filteredIPs.map((ip) => (
                        <TableRow key={ip.id}>
                          <TableCell className="font-medium">{ip.address}</TableCell>
                          <TableCell>{ip.subnet}</TableCell>
                          <TableCell>{ip.deviceName || "-"}</TableCell>
                          <TableCell>
                            {ip.serviceName ? (
                              <Badge className="bg-purple-900/30 text-purple-200">{ip.serviceName}</Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusBadgeColor(ip.status)}`}>{ip.status}</Badge>
                          </TableCell>
                          <TableCell>{ip.lastUpdated || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleIPClick(ip.id)}>
                                View Details
                              </Button>
                              {ip.status === "Assigned" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedIP(ip.id)
                                    handleIPAction("release")
                                  }}
                                >
                                  Release
                                </Button>
                              )}
                              {ip.status === "Reserved" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedIP(ip.id)
                                    handleIPAction("assign")
                                  }}
                                >
                                  Assign
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                          No IP addresses found matching your criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subnets">
          <Card className="w-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle>Subnet Management</CardTitle>
              <Button onClick={() => setIsSubnetModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Subnet
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-[hsl(224,50%,18%)] w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subnet</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Total IPs</TableHead>
                      <TableHead>Used</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Reserved</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ipSubnets.length > 0 ? (
                      ipSubnets.map((subnet) => (
                        <TableRow key={subnet.id}>
                          <TableCell className="font-medium">{subnet.subnet}</TableCell>
                          <TableCell>{subnet.description}</TableCell>
                          <TableCell>{subnet.totalIPs}</TableCell>
                          <TableCell>{subnet.usedIPs}</TableCell>
                          <TableCell>{subnet.availableIPs}</TableCell>
                          <TableCell>{subnet.reservedIPs}</TableCell>
                          <TableCell>
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${(subnet.usedIPs / subnet.totalIPs) * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-xs mt-1">
                              {Math.round((subnet.usedIPs / subnet.totalIPs) * 100)}% used
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewSubnetIPs(subnet.subnet)}
                                className="flex items-center"
                              >
                                View IPs <ArrowRight className="ml-1 h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleIPAction("assign", subnet.id)}>
                                <Plus className="mr-1 h-3 w-3" /> Assign IP
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                          No subnets found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <UserIPDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        ipId={selectedIP}
        ipAddresses={ipAddresses}
      />

      <UserIPActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        actionType={actionType}
        onSuccess={handleActionSuccess}
        selectedIpId={selectedIP}
        ipAddresses={ipAddresses}
        devices={devices}
        services={services}
        preselectedSubnet={selectedSubnet}
      />

      <UserSubnetModal
        isOpen={isSubnetModalOpen}
        onClose={() => setIsSubnetModalOpen(false)}
        onSuccess={handleSubnetSuccess}
        existingSubnets={ipSubnets}
        services={services}
      />
    </div>
  )
}
