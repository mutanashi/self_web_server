"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import type { IPSubnet, Service } from "@/models/data-center"

interface UserSubnetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  existingSubnets: IPSubnet[]
  services: Service[]
}

export function UserSubnetModal({ isOpen, onClose, onSuccess, existingSubnets, services }: UserSubnetModalProps) {
  const { addSubnet } = useDataCenterStore()

  // 表單狀態
  const [subnet, setSubnet] = useState("")
  const [cidr, setCidr] = useState("24")
  const [description, setDescription] = useState("")
  const [serviceId, setServiceId] = useState<string>("none")
  const [reservedIPs, setReservedIPs] = useState("10")
  const [isProcessing, setIsProcessing] = useState(false)
  const [formErrors, setFormErrors] = useState<{
    subnet?: string
    cidr?: string
    description?: string
    reservedIPs?: string
    overlap?: string
  }>({})

  // 重置表單
  const resetForm = () => {
    setSubnet("")
    setCidr("24")
    setDescription("")
    setServiceId("none")
    setReservedIPs("10")
    setIsProcessing(false)
    setFormErrors({})
  }

  // 當模態框打開時重置表單
  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
  }, [isOpen])

  // 驗證 CIDR 格式
  const validateCIDR = (subnet: string, cidr: string): boolean => {
    // 驗證 IP 地址格式
    const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
    const match = subnet.match(ipRegex)
    if (!match) {
      setFormErrors((prev) => ({ ...prev, subnet: "Invalid IP address format" }))
      return false
    }

    // 驗證每個八位位組是否在 0-255 範圍內
    for (let i = 1; i <= 4; i++) {
      const octet = Number.parseInt(match[i], 10)
      if (octet < 0 || octet > 255) {
        setFormErrors((prev) => ({ ...prev, subnet: "IP address octets must be between 0 and 255" }))
        return false
      }
    }

    // 驗證 CIDR 值
    const cidrValue = Number.parseInt(cidr, 10)
    if (isNaN(cidrValue) || cidrValue < 0 || cidrValue > 32) {
      setFormErrors((prev) => ({ ...prev, cidr: "CIDR must be between 0 and 32" }))
      return false
    }

    return true
  }

  // 檢查子網重疊
  const checkSubnetOverlap = (newSubnet: string, newCidr: string): boolean => {
    const newPrefix = newSubnet.split(".").map(Number)
    const newCidrValue = Number.parseInt(newCidr, 10)

    // 計算新子網的網絡地址
    const newNetworkAddress = calculateNetworkAddress(newPrefix, newCidrValue)

    for (const existingSubnet of existingSubnets) {
      const [existingAddress, existingCidr] = existingSubnet.subnet.split("/")
      const existingPrefix = existingAddress.split(".").map(Number)
      const existingCidrValue = Number.parseInt(existingCidr, 10)

      // 計算現有子網的網絡地址
      const existingNetworkAddress = calculateNetworkAddress(existingPrefix, existingCidrValue)

      // 檢查子網是否重疊
      if (subnetsOverlap(newNetworkAddress, newCidrValue, existingNetworkAddress, existingCidrValue)) {
        setFormErrors((prev) => ({
          ...prev,
          overlap: `Overlaps with existing subnet ${existingSubnet.subnet}`,
        }))
        return true
      }
    }

    return false
  }

  // 計算網絡地址
  const calculateNetworkAddress = (prefix: number[], cidr: number): number => {
    let address = 0
    for (let i = 0; i < 4; i++) {
      address = (address << 8) | prefix[i]
    }

    // 應用網絡掩碼
    const mask = ~((1 << (32 - cidr)) - 1)
    return address & mask
  }

  // 檢查子網是否重疊
  const subnetsOverlap = (network1: number, cidr1: number, network2: number, cidr2: number): boolean => {
    const mask1 = ~((1 << (32 - cidr1)) - 1)
    const mask2 = ~((1 << (32 - cidr2)) - 1)

    // 計算兩個子網的起始和結束地址
    const start1 = network1 & mask1
    const end1 = start1 | ~mask1
    const start2 = network2 & mask2
    const end2 = start2 | ~mask2

    // 檢查是否有重疊
    return start1 <= end2 && start2 <= end1
  }

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})

    // 驗證必填字段
    if (!subnet) {
      setFormErrors((prev) => ({ ...prev, subnet: "Subnet is required" }))
      return
    }

    if (!description) {
      setFormErrors((prev) => ({ ...prev, description: "Description is required" }))
      return
    }

    // 驗證 CIDR 格式
    if (!validateCIDR(subnet, cidr)) {
      return
    }

    // 檢查子網重疊
    if (checkSubnetOverlap(subnet, cidr)) {
      return
    }

    // 驗證保留 IP 數量
    const reservedCount = Number.parseInt(reservedIPs, 10)
    if (isNaN(reservedCount) || reservedCount < 0) {
      setFormErrors((prev) => ({ ...prev, reservedIPs: "Reserved IPs must be a positive number" }))
      return
    }

    setIsProcessing(true)

    try {
      // 模擬 API 調用
      // 實際應用中，這裡應該調用真實的 API
      // await fetch('/api/create-subnet', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     subnet,
      //     cidr,
      //     description,
      //     serviceId: serviceId === 'none' ? null : serviceId,
      //     reservedIPs: reservedCount
      //   })
      // });

      // 使用 Zustand store 添加子網
      const gateway = `${subnet.split(".").slice(0, 3).join(".")}.1`
      addSubnet(subnet, description, cidr, gateway, reservedCount)

      toast({
        title: "Success",
        description: "Subnet has been created successfully",
      })

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subnet. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Subnet</DialogTitle>
          <DialogDescription>Add a new subnet to the IP management system.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="subnet">
                Network Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subnet"
                value={subnet}
                onChange={(e) => setSubnet(e.target.value)}
                placeholder="e.g. 192.168.1.0"
                className={formErrors.subnet ? "border-red-500" : ""}
              />
              {formErrors.subnet && <p className="text-sm text-red-500 mt-1">{formErrors.subnet}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidr">
                CIDR <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center">
                <span className="mr-2">/</span>
                <Input
                  id="cidr"
                  value={cidr}
                  onChange={(e) => setCidr(e.target.value)}
                  placeholder="24"
                  className={formErrors.cidr ? "border-red-500" : ""}
                />
              </div>
              {formErrors.cidr && <p className="text-sm text-red-500 mt-1">{formErrors.cidr}</p>}
            </div>
          </div>

          {formErrors.overlap && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formErrors.overlap}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Primary Network"
              className={formErrors.description ? "border-red-500" : ""}
            />
            {formErrors.description && <p className="text-sm text-red-500 mt-1">{formErrors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Service Tag (Optional)</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
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

          <div className="space-y-2">
            <Label htmlFor="reservedIPs">Reserved IPs (Optional)</Label>
            <Input
              id="reservedIPs"
              type="number"
              min="0"
              value={reservedIPs}
              onChange={(e) => setReservedIPs(e.target.value)}
              placeholder="10"
              className={formErrors.reservedIPs ? "border-red-500" : ""}
            />
            {formErrors.reservedIPs && <p className="text-sm text-red-500 mt-1">{formErrors.reservedIPs}</p>}
            <p className="text-xs text-muted-foreground">
              Number of IP addresses to reserve for infrastructure use (e.g., gateways, DNS servers)
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create Subnet"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
