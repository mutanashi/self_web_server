"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDataCenterStore } from "@/lib/data-center-store"
import { toast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Device, IPAddress, Service } from "@/models/data-center"

interface UserIPActionModalProps {
  isOpen: boolean
  onClose: () => void
  actionType: "assign" | "release" | "reserve"
  onSuccess?: () => void
  selectedIpId?: string | null
  ipAddresses: IPAddress[]
  devices: Device[]
  services: Service[]
  preselectedSubnet?: string | null
}

export function UserIPActionModal({
  isOpen,
  onClose,
  actionType,
  onSuccess,
  selectedIpId,
  ipAddresses,
  devices,
  services,
  preselectedSubnet,
}: UserIPActionModalProps) {
  const { assignIP, releaseIP, reserveIP } = useDataCenterStore()

  // 表單狀態
  const [ipAddress, setIpAddress] = useState("")
  const [subnet, setSubnet] = useState("")
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const [selectedService, setSelectedService] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [ipSuggestions, setIpSuggestions] = useState<string[]>([])
  const [isCheckingIP, setIsCheckingIP] = useState(false)
  const [ipExists, setIpExists] = useState(false)
  const [ipError, setIpError] = useState("")
  const [filteredSubnets, setFilteredSubnets] = useState<string[]>([])

  // 重置表單
  const resetForm = () => {
    setIpAddress("")
    setSubnet("")
    setSelectedDevice("")
    setSelectedService("")
    setIsProcessing(false)
    setIpSuggestions([])
    setIpExists(false)
    setIpError("")
  }

  // 當模態框打開時重置表單
  useEffect(() => {
    if (isOpen) {
      resetForm()

      // 如果有選中的IP，預填表單
      if (selectedIpId) {
        const ip = ipAddresses.find((ip) => ip.id === selectedIpId)
        if (ip) {
          setIpAddress(ip.address)
          setSubnet(ip.subnet)
          if (ip.deviceId) setSelectedDevice(ip.deviceId)
          if (ip.serviceId) setSelectedService(ip.serviceId)
        }
      }

      // 如果有預選的子網，設置子網
      if (preselectedSubnet) {
        setSubnet(preselectedSubnet)
        generateIpSuggestions(preselectedSubnet)
      }
    }
  }, [isOpen, selectedIpId, ipAddresses, preselectedSubnet])

  // 當選擇服務時，過濾子網
  useEffect(() => {
    if (selectedService && selectedService !== "none") {
      // 這裡模擬根據服務過濾子網的邏輯
      // 實際應用中，可能需要從API獲取或根據業務邏輯過濾
      const service = services.find((s) => s.id === selectedService)
      if (service) {
        // 假設高關鍵性服務需要特定子網
        if (service.criticality === "Critical" || service.criticality === "High") {
          const criticalSubnets = getAvailableSubnets().filter(
            (s) => s.includes("10.0.0.0") || s.includes("192.168.1.0"),
          )
          setFilteredSubnets(criticalSubnets.length > 0 ? criticalSubnets : getAvailableSubnets())
        } else {
          setFilteredSubnets(getAvailableSubnets())
        }
      }
    } else {
      setFilteredSubnets(getAvailableSubnets())
    }
  }, [selectedService, services])

  // 獲取可用的子網
  const getAvailableSubnets = () => {
    const subnets = new Set<string>()
    ipAddresses.forEach((ip) => {
      if (ip.subnet) {
        subnets.add(ip.subnet)
      }
    })
    return Array.from(subnets)
  }

  // 檢查IP是否已存在
  const checkIPExists = useCallback(
    async (ip: string) => {
      if (!ip) return false

      setIsCheckingIP(true)
      setIpError("")

      try {
        // 模擬API調用
        // 實際應用中，這裡應該調用真實的API
        // const response = await fetch(`/api/check-ip?ip=${ip}`);
        // const data = await response.json();
        // return data.exists;

        // 模擬檢查邏輯
        const exists = ipAddresses.some((address) => address.address === ip && address.id !== selectedIpId)
        setIpExists(exists)

        if (exists) {
          setIpError("This IP address is already in use")
        }

        return exists
      } catch (error) {
        console.error("Error checking IP:", error)
        return false
      } finally {
        setIsCheckingIP(false)
      }
    },
    [ipAddresses, selectedIpId],
  )

  // 當IP地址變更時檢查
  useEffect(() => {
    if (ipAddress) {
      const timer = setTimeout(() => {
        checkIPExists(ipAddress)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [ipAddress, checkIPExists])

  // 生成IP建議
  const generateIpSuggestions = (selectedSubnet: string) => {
    if (!selectedSubnet) return

    // 解析子網
    const [baseIP, cidr] = selectedSubnet.split("/")
    const baseIPParts = baseIP.split(".").map(Number)

    // 生成建議的IP
    const suggestions: string[] = []
    const usedIPs = new Set(ipAddresses.map((ip) => ip.address))

    // 簡單生成10個建議IP
    for (let i = 2; i <= 254 && suggestions.length < 10; i++) {
      const suggestedIP = `${baseIPParts[0]}.${baseIPParts[1]}.${baseIPParts[2]}.${i}`
      if (!usedIPs.has(suggestedIP)) {
        suggestions.push(suggestedIP)
      }
    }

    setIpSuggestions(suggestions)
  }

  // 處理子網變更
  const handleSubnetChange = (value: string) => {
    setSubnet(value)
    generateIpSuggestions(value)
  }

  // 處理分配IP
  const handleAssignIP = async () => {
    if (!ipAddress || !subnet || !selectedDevice) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // 檢查是否為 Reserved IP 轉換為 Assigned
    const isReservedToAssigned = selectedIpId && ipAddresses.find((ip) => ip.id === selectedIpId)?.status === "Reserved"

    // 如果不是 Reserved IP 轉換，則檢查 IP 是否已存在
    if (!isReservedToAssigned && (await checkIPExists(ipAddress))) {
      toast({
        title: "Error",
        description: "This IP address is already in use",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // 使用本地狀態管理
      const device = devices.find((d) => d.id === selectedDevice)
      const service = services.find((s) => s.id === selectedService)

      if (isReservedToAssigned) {
        // 處理 Reserved IP 轉換為 Assigned
        // 首先釋放原有的 Reserved IP
        releaseIP(selectedIpId!)

        // 然後創建新的 Assigned IP
        const newIP = {
          id: `ip-${Date.now()}`,
          address: ipAddress,
          subnet: subnet,
          gateway: subnet.split("/")[0].split(".").slice(0, 3).concat(["1"]).join("."),
          status: "Assigned" as const,
          deviceId: selectedDevice,
          deviceName: device?.name || null,
          serviceId: selectedService === "none" ? null : selectedService || null,
          serviceName: service?.name || null,
          lastUpdated: new Date().toISOString().split("T")[0],
        }

        assignIP(newIP)

        toast({
          title: "Success",
          description: "Reserved IP has been successfully assigned to a device",
        })
      } else {
        // 處理普通的 IP 分配
        const newIP = {
          id: `ip-${Date.now()}`,
          address: ipAddress,
          subnet: subnet,
          gateway: subnet.split("/")[0].split(".").slice(0, 3).concat(["1"]).join("."),
          status: "Assigned" as const,
          deviceId: selectedDevice,
          deviceName: device?.name || null,
          serviceId: selectedService === "none" ? null : selectedService || null,
          serviceName: service?.name || null,
          lastUpdated: new Date().toISOString().split("T")[0],
        }

        assignIP(newIP)

        toast({
          title: "Success",
          description: "IP address has been assigned successfully",
        })
      }

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign IP address. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  // 處理釋放IP
  const handleReleaseIP = async () => {
    if (!selectedIpId) {
      toast({
        title: "Error",
        description: "No IP address selected",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // 模擬API調用
      // 實際應用中，這裡應該調用真實的API
      // await fetch('/api/release-ip', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ipId: selectedIpId })
      // });

      releaseIP(selectedIpId)

      toast({
        title: "Success",
        description: "IP address has been released successfully",
      })

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to release IP address. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  // 處理預留IP
  const handleReserveIP = async () => {
    if (!ipAddress || !subnet) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (await checkIPExists(ipAddress)) {
      toast({
        title: "Error",
        description: "This IP address is already in use",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // 模擬API調用
      // 實際應用中，這裡應該調用真實的API
      // await fetch('/api/reserve-ip', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ipAddress,
      //     subnet,
      //     serviceId: selectedService === 'none' ? null : selectedService
      //   })
      // });

      const newIP = {
        id: `ip-${Date.now()}`,
        address: ipAddress,
        subnet: subnet,
        gateway: subnet.split("/")[0].split(".").slice(0, 3).concat(["1"]).join("."),
        status: "Reserved" as const,
        deviceId: null,
        deviceName: null,
        serviceId: selectedService === "none" ? null : selectedService || null,
        serviceName:
          selectedService && selectedService !== "none"
            ? services.find((s) => s.id === selectedService)?.name || null
            : null,
        lastUpdated: new Date().toISOString().split("T")[0],
      }

      reserveIP(newIP)

      toast({
        title: "Success",
        description: "IP address has been reserved successfully",
      })

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reserve IP address. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  // 獲取模態框標題
  const getModalTitle = () => {
    switch (actionType) {
      case "assign":
        return "Assign IP Address"
      case "release":
        return "Release IP Address"
      case "reserve":
        return "Reserve IP Address"
    }
  }

  // 獲取模態框描述
  const getModalDescription = () => {
    switch (actionType) {
      case "assign":
        return "Assign an IP address to a device"
      case "release":
        return "Release an IP address from a device"
      case "reserve":
        return "Reserve an IP address for future use"
    }
  }

  // 渲染分配IP表單
  const renderAssignForm = () => {
    // 檢查是否為 Reserved IP 轉換為 Assigned
    const isReservedToAssigned = selectedIpId && ipAddresses.find((ip) => ip.id === selectedIpId)?.status === "Reserved"

    return (
      <div className="space-y-4">
        {isReservedToAssigned && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>You are assigning a reserved IP address to a device.</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subnet">
              Subnet <span className="text-red-500">*</span>
            </Label>
            {isReservedToAssigned ? (
              <Input id="subnet" value={subnet} disabled />
            ) : (
              <Select value={subnet} onValueChange={handleSubnetChange}>
                <SelectTrigger id="subnet">
                  <SelectValue placeholder="Select subnet" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubnets.map((subnet) => (
                    <SelectItem key={subnet} value={subnet}>
                      {subnet}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ip-address">
              IP Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="ip-address"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="e.g. 192.168.1.10"
                required
                className={ipError ? "border-red-500" : ""}
                disabled={isReservedToAssigned}
              />
              {isCheckingIP && !isReservedToAssigned && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            {ipError && <p className="text-sm text-red-500 mt-1">{ipError}</p>}

            {ipSuggestions.length > 0 && !isReservedToAssigned && (
              <div className="mt-2">
                <Label>Suggested IPs:</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ipSuggestions.slice(0, 5).map((ip) => (
                    <Button
                      key={ip}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIpAddress(ip)}
                      className="text-xs"
                    >
                      {ip}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="device">
            Device <span className="text-red-500">*</span>
          </Label>
          <Select value={selectedDevice} onValueChange={setSelectedDevice}>
            <SelectTrigger id="device">
              <SelectValue placeholder="Select device" />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.id} value={device.id}>
                  {device.name} {device.model ? `(${device.model})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="service">Service (Optional)</Label>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger id="service">
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} ({service.criticality})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAssignIP}
            disabled={isProcessing || !ipAddress || !subnet || !selectedDevice || (ipExists && !isReservedToAssigned)}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Assigning...
              </>
            ) : isReservedToAssigned ? (
              "Assign Reserved IP"
            ) : (
              "Assign IP"
            )}
          </Button>
        </DialogFooter>
      </div>
    )
  }

  // 渲染釋放IP表單
  const renderReleaseForm = () => {
    const selectedIP = ipAddresses.find((ip) => ip.id === selectedIpId)

    return (
      <div className="space-y-4">
        <div className="p-4 border rounded-md bg-gray-800">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">IP Address</p>
              <p className="text-lg">{selectedIP?.address}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Subnet</p>
              <p className="text-lg">{selectedIP?.subnet}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Device</p>
              <p className="text-lg">{selectedIP?.deviceName || "None"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Service</p>
              <p className="text-lg">{selectedIP?.serviceName || "None"}</p>
            </div>
          </div>
        </div>

        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Releasing this IP address will make it available for other devices. This action cannot be undone.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleReleaseIP} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Releasing...
              </>
            ) : (
              "Release IP"
            )}
          </Button>
        </DialogFooter>
      </div>
    )
  }

  // 渲染預留IP表單
  const renderReserveForm = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subnet">
              Subnet <span className="text-red-500">*</span>
            </Label>
            <Select value={subnet} onValueChange={handleSubnetChange}>
              <SelectTrigger id="subnet">
                <SelectValue placeholder="Select subnet" />
              </SelectTrigger>
              <SelectContent>
                {filteredSubnets.length > 0
                  ? filteredSubnets.map((subnet) => (
                      <SelectItem key={subnet} value={subnet}>
                        {subnet}
                      </SelectItem>
                    ))
                  : getAvailableSubnets().map((subnet) => (
                      <SelectItem key={subnet} value={subnet}>
                        {subnet}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ip-address">
              IP Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="ip-address"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="e.g. 192.168.1.10"
                required
                className={ipError ? "border-red-500" : ""}
              />
              {isCheckingIP && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            {ipError && <p className="text-sm text-red-500 mt-1">{ipError}</p>}

            {ipSuggestions.length > 0 && (
              <div className="mt-2">
                <Label>Suggested IPs:</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ipSuggestions.slice(0, 5).map((ip) => (
                    <Button
                      key={ip}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIpAddress(ip)}
                      className="text-xs"
                    >
                      {ip}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="service">Service (Optional)</Label>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger id="service">
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} ({service.criticality})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleReserveIP} disabled={isProcessing || !ipAddress || !subnet || ipExists}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reserving...
              </>
            ) : (
              "Reserve IP"
            )}
          </Button>
        </DialogFooter>
      </div>
    )
  }

  // 根據操作類型渲染不同的表單
  const renderForm = () => {
    switch (actionType) {
      case "assign":
        return renderAssignForm()
      case "release":
        return renderReleaseForm()
      case "reserve":
        return renderReserveForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
          <DialogDescription>{getModalDescription()}</DialogDescription>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  )
}
