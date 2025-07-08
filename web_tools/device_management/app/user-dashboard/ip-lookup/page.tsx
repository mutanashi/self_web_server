"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useDataCenterStore } from "@/lib/data-center-store"
import { UserIPDetailModal } from "@/components/user-ip-detail-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UserIPLookup() {
  const [searchQuery, setSearchQuery] = useState("")
  const [subnetFilter, setSubnetFilter] = useState("all")
  const [selectedIP, setSelectedIP] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [ipAddresses, setIpAddresses] = useState<any[]>([])
  const [ipSubnets, setIpSubnets] = useState<any[]>([])

  // Get data from store
  const dataStore = useDataCenterStore()
  const storeDevices = dataStore.devices || {}
  const storeSubnets = dataStore.ipSubnets || []

  // Extract IP addresses from devices
  useEffect(() => {
    const devices = Object.values(storeDevices)
    const extractedIPs = devices.flatMap((device) =>
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
    setIpAddresses(extractedIPs)

    // Extract unique subnets
    const uniqueSubnets = Array.from(new Set(extractedIPs.map((ip) => ip.subnet))).map((subnet) => ({
      id: subnet,
      subnet: subnet,
    }))
    setIpSubnets(uniqueSubnets)
  }, [storeDevices, storeSubnets])

  // Filter IP addresses
  const filteredIPs = ipAddresses.filter((ip) => {
    const matchesSearch =
      ip.address.includes(searchQuery) ||
      ip.deviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ip.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ip.subnet.includes(searchQuery)

    const matchesSubnet = subnetFilter === "all" || ip.subnet === subnetFilter

    return matchesSearch && matchesSubnet
  })

  const handleIPClick = (ipId: string) => {
    setSelectedIP(ipId)
    setIsModalOpen(true)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Assigned":
        return "bg-blue-900/30 text-blue-200"
      case "Available":
        return "bg-green-900/30 text-green-200"
      case "Reserved":
        return "bg-yellow-900/30 text-yellow-200"
      case "Deprecated":
        return "bg-red-900/30 text-red-200"
      default:
        return "bg-gray-700 text-gray-200"
    }
  }

  return (
    <div className="space-y-4 w-full max-w-none">
      <h1 className="text-2xl font-bold text-foreground">IP Address Lookup</h1>

      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle>IP Address List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search IP address, device or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={subnetFilter} onValueChange={setSubnetFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Subnet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subnets</SelectItem>
                  {ipSubnets.map((subnet) => (
                    <SelectItem key={subnet.id} value={subnet.subnet}>
                      {subnet.subnet}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleIPClick(ip.id)}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No IP addresses found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UserIPDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ipId={selectedIP}
        ipAddresses={ipAddresses}
      />
    </div>
  )
}
