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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useDataCenterStore } from "@/lib/data-center-store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Download, FileText, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DeviceActionModalProps {
  isOpen: boolean
  onClose: () => void
  actionType: "install" | "uninstall" | "move" | null
  deviceId: string | null
}

export function DeviceActionModal({ isOpen, onClose, actionType, deviceId }: DeviceActionModalProps) {
  const {
    dataCenters,
    devices,
    getDevice,
    addDevice,
    deleteDevice,
    findRack,
    assignDeviceToService,
    removeDeviceFromService,
    getAllServices,
    getService,
  } = useDataCenterStore()

  // Form state
  const [deviceName, setDeviceName] = useState("")
  const [deviceModel, setDeviceModel] = useState("")
  const [ipAddress, setIpAddress] = useState("")
  const [subnet, setSubnet] = useState("192.168.1.0/24")
  const [deviceSize, setDeviceSize] = useState("1")
  const [deviceStatus, setDeviceStatus] = useState("Active")
  const [devicePower, setDevicePower] = useState("")
  const [deviceNotes, setDeviceNotes] = useState("")
  const [selectedService, setSelectedService] = useState<string | null>(null)

  // Location selection
  const [selectedDc, setSelectedDc] = useState("")
  const [selectedRoom, setSelectedRoom] = useState("")
  const [selectedRack, setSelectedRack] = useState("")
  const [startUnit, setStartUnit] = useState("")
  const [endUnit, setEndUnit] = useState("")

  // Batch import related states
  const [activeTab, setActiveTab] = useState("single")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Get all services for dropdown
  const services = getAllServices()
  const activeServices = services
    .filter((service) => service.status === "Active")
    .sort((a, b) => a.name.localeCompare(b.name))

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm()

      // If editing existing device, populate form
      if (deviceId && deviceId !== "new") {
        const device = getDevice(deviceId)
        if (device) {
          setDeviceName(device.name)
          setDeviceModel(device.type)
          setDeviceSize(device.size.toString())
          setDeviceStatus(device.status)
          setDevicePower(device.powerConsumption?.toString() || "")
          setDeviceNotes(device.description || "")
          setSelectedService(device.serviceId || null)

          if (device.ips && device.ips.length > 0) {
            setIpAddress(device.ips[0].address)
            setSubnet(device.ips[0].subnet)
          }
        }
      }
    }
  }, [isOpen, deviceId, getDevice])

  const resetForm = () => {
    setDeviceName("")
    setDeviceModel("")
    setIpAddress("")
    setSubnet("192.168.1.0/24")
    setDeviceSize("1")
    setDeviceStatus("Active")
    setDevicePower("")
    setDeviceNotes("")
    setSelectedService(null)
    setSelectedDc("")
    setSelectedRoom("")
    setSelectedRack("")
    setStartUnit("")
    setEndUnit("")

    // Reset batch import states
    setActiveTab("single")
    setCsvFile(null)
    setCsvData([])
    setCsvErrors([])
    setIsUploading(false)
    setDragActive(false)

    // 重置文件輸入元素
    const fileInput = document.getElementById("csv-upload") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  // CSV template download
  const downloadCSVTemplate = () => {
    const template = `Device Name,Model,Device Type,Device Size (U),Location,Start Position (U),Status,Service,Description,IP Address,Management Type
Server-001,Dell R740,Server,2,DC-A Room 1 Rack 2,5,Active,Web Service,Web Server,192.168.1.100,Management
Switch-001,Cisco 2960,Switch,1,DC-A Room 1 Rack 2,10,Active,,Core Switch,192.168.1.101,Management`

    const blob = new Blob([template], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "device_import_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Handle CSV file upload
  const handleCSVUpload = async (file: File) => {
    setIsUploading(true)
    setCsvErrors([])

    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())
      const headers = lines[0].split(",").map((h) => h.trim())

      const expectedHeaders = [
        "Device Name",
        "Model",
        "Device Type",
        "Device Size (U)",
        "Location",
        "Start Position (U)",
        "Status",
        "Service",
        "Description",
        "IP Address",
        "Management Type",
      ]

      // Check headers
      const missingHeaders = expectedHeaders.filter((h) => !headers.includes(h))
      if (missingHeaders.length > 0) {
        setCsvErrors([`Missing required columns: ${missingHeaders.join(", ")}`])
        setIsUploading(false)
        return
      }

      const data = []
      const errors = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim())
        const row: any = {}

        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })

        // Validate required fields
        if (!row["Device Name"]) {
          errors.push(`Row ${i + 1}: Device Name cannot be empty`)
        }
        if (!row["Model"]) {
          errors.push(`Row ${i + 1}: Model cannot be empty`)
        }
        if (!row["Device Type"]) {
          errors.push(`Row ${i + 1}: Device Type cannot be empty`)
        }
        if (!row["Device Size (U)"] || isNaN(Number(row["Device Size (U)"]))) {
          errors.push(`Row ${i + 1}: Device Size must be a number`)
        }

        // 在驗證循環中添加位置驗證
        if (!row["Start Position (U)"] || isNaN(Number(row["Start Position (U)"]))) {
          errors.push(`Row ${i + 1}: Start Position must be a number`)
        } else {
          const startPos = Number(row["Start Position (U)"])
          if (startPos < 1 || startPos > 42) {
            errors.push(`Row ${i + 1}: Start Position must be between 1 and 42`)
          }
        }

        // Validate Service if provided
        if (row["Service"] && row["Service"].trim() !== "") {
          const serviceName = row["Service"].trim()
          const foundService = services.find((s) => s.name === serviceName)
          if (!foundService) {
            // Find similar service names for suggestions
            const suggestions = services
              .filter((s) => s.name.toLowerCase().includes(serviceName.toLowerCase()))
              .map((s) => s.name)
              .slice(0, 3)

            let errorMsg = `Row ${i + 1}: Service - Cannot find service '${serviceName}'`
            if (suggestions.length > 0) {
              errorMsg += `. Did you mean: ${suggestions.join(", ")}?`
            }
            errors.push(errorMsg)
          }
        }

        // Validate IP address format
        if (row["IP Address"]) {
          const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
          if (!ipRegex.test(row["IP Address"])) {
            errors.push(`Row ${i + 1}: Invalid IP address format`)
          }
        }

        row.rowIndex = i + 1
        row.hasError = errors.some((error) => error.includes(`Row ${i + 1}`))
        data.push(row)
      }

      setCsvData(data)
      setCsvErrors(errors)
      setCsvFile(file)
    } catch (error) {
      setCsvErrors(["Failed to read file. Please check the file format."])
    }

    setIsUploading(false)

    // 重置文件輸入元素，確保可以重複選擇相同文件
    const fileInput = document.getElementById("csv-upload") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        handleCSVUpload(file)
      } else {
        setCsvErrors(["Please upload a CSV file"])
      }
    }
  }

  // Handle batch import
  const handleBatchImport = async () => {
    const validData = csvData.filter((row) => !row.hasError)

    try {
      for (const row of validData) {
        // 解析位置信息
        const locationParts = row["Location"].split(" ")
        let dcName = "",
          roomName = "",
          rackName = ""

        if (locationParts.length >= 3) {
          dcName = locationParts[0]
          roomName = locationParts[1] + " " + locationParts[2]
          rackName = locationParts[3] + " " + locationParts[4]
        }

        // 查找對應的數據中心、房間和機架
        const dc = dataCenters.find((d) => d.name === dcName)
        if (!dc) continue

        const room = dc.rooms.find((r) => r.name === roomName)
        if (!room) continue

        const rack = room.racks.find((r) => r.name === rackName)
        if (!rack) continue

        // 使用指定的位置而不是自動尋找
        const specifiedPosition = Number(row["Start Position (U)"])
        const deviceSize = Number(row["Device Size (U)"])

        // 檢查指定位置是否可用
        let positionAvailable = true
        for (let j = 0; j < deviceSize; j++) {
          const unitIndex = specifiedPosition + j - 1
          if (unitIndex >= rack.units.length || rack.units[unitIndex].deviceId !== null) {
            positionAvailable = false
            break
          }
        }

        if (!positionAvailable) {
          console.warn(`Position ${specifiedPosition} not available for device ${row["Device Name"]}`)
          continue
        }

        // 其餘邏輯保持不變...
        const newDeviceId = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

        const serviceName = null

        const deviceInfo = {
          id: newDeviceId,
          name: row["Device Name"],
          type: row["Device Type"],
          size: deviceSize,
          ips: row["IP Address"]
            ? [
                {
                  id: `ip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                  address: row["IP Address"],
                  subnet: "255.255.255.0",
                  gateway: "192.168.1.1",
                  status: "Assigned" as const,
                  deviceId: newDeviceId,
                  deviceName: row["Device Name"],
                  serviceId: null,
                  serviceName: serviceName,
                  lastUpdated: new Date().toISOString().split("T")[0],
                },
              ]
            : [],
          status: (row["Status"] || "Active") as "Active" | "Inactive" | "Maintenance" | "Decommissioned",
          powerConsumption: null,
          installationDate: new Date().toISOString().split("T")[0],
          description: row["Description"] || "",
          model: row["Model"],
          serviceId: null,
          serviceName: serviceName,
        }

        addDevice(dc.id, room.id, rack.id, specifiedPosition, deviceInfo)

        // 分配服務...
        let serviceId = null
        if (row["Service"] && row["Service"].trim() !== "") {
          const foundService = services.find((s) => s.name === row["Service"].trim())
          if (foundService) {
            serviceId = foundService.id
          }
        }
        if (serviceId) {
          assignDeviceToService(newDeviceId, serviceId)
        }
      }

      toast({
        title: "Success",
        description: `Successfully imported ${validData.length} devices`,
      })

      // 重置文件輸入和相關狀態
      const fileInput = document.getElementById("csv-upload") as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }

      setCsvFile(null)
      setCsvData([])
      setCsvErrors([])

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Batch import failed",
        variant: "destructive",
      })
    }
  }

  // Get available units for the selected rack
  const getAvailableUnits = () => {
    if (!selectedRack) return []

    const rackInfo = findRack(selectedRack)
    if (!rackInfo) return []

    const { rack } = rackInfo
    const size = Number.parseInt(deviceSize)
    const availableUnits = []

    for (let i = 1; i <= rack.totalUnits - size + 1; i++) {
      let canFit = true
      for (let j = 0; j < size; j++) {
        if (rack.units[i + j - 1].deviceId !== null) {
          canFit = false
          break
        }
      }
      if (canFit) {
        availableUnits.push(i)
      }
    }

    return availableUnits
  }

  // Update end unit when start unit or device size changes
  useEffect(() => {
    if (startUnit && deviceSize) {
      const start = Number.parseInt(startUnit)
      const size = Number.parseInt(deviceSize)
      setEndUnit((start + size - 1).toString())
    }
  }, [startUnit, deviceSize])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (actionType === "install" && deviceId === "new") {
      // Add new device
      if (!deviceName || !deviceModel || !ipAddress || !selectedDc || !selectedRoom || !selectedRack || !startUnit) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const newDeviceId = `dev-${Date.now()}`

      // Get service name if a service is selected
      const serviceName = selectedService ? getService(selectedService)?.name || null : null

      const deviceInfo = {
        id: newDeviceId,
        name: deviceName,
        type: deviceModel,
        size: Number.parseInt(deviceSize),
        ips: [
          {
            id: `ip-${Date.now()}`,
            address: ipAddress,
            subnet: subnet,
            gateway: subnet.split("/")[0].split(".").slice(0, 3).concat(["1"]).join("."),
            status: "Assigned" as const,
            deviceId: newDeviceId,
            deviceName: deviceName,
            serviceId: selectedService,
            serviceName: serviceName,
            lastUpdated: new Date().toISOString().split("T")[0],
          },
        ],
        status: deviceStatus as "Active" | "Inactive" | "Maintenance" | "Decommissioned",
        powerConsumption: devicePower ? Number.parseInt(devicePower) : null,
        serviceId: selectedService,
        serviceName: serviceName,
        installationDate: new Date().toISOString().split("T")[0],
        lastUpdated: new Date().toISOString().split("T")[0],
        notes: deviceNotes,
      }

      try {
        addDevice(selectedDc, selectedRoom, selectedRack, Number.parseInt(startUnit), deviceInfo)

        // 如果設備有關聯的服務，將設備添加到服務
        if (selectedService) {
          assignDeviceToService(newDeviceId, selectedService)
        }

        toast({
          title: "Success",
          description: "Device added successfully",
        })

        onClose()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add device",
          variant: "destructive",
        })
        console.error(error)
      }
    } else if (actionType === "install" && deviceId) {
      // Install existing device
      if (!selectedDc || !selectedRoom || !selectedRack || !startUnit) {
        toast({
          title: "Error",
          description: "Please select a location",
          variant: "destructive",
        })
        return
      }

      const device = getDevice(deviceId)
      if (!device) {
        toast({
          title: "Error",
          description: "Device not found",
          variant: "destructive",
        })
        return
      }

      try {
        // Update device with new service if changed
        const updatedDevice = { ...device }
        if (selectedService !== device.serviceId) {
          // Get service name if a service is selected
          const serviceName = selectedService ? getService(selectedService)?.name || null : null

          updatedDevice.serviceId = selectedService
          updatedDevice.serviceName = serviceName

          // Update IPs with new service info
          if (updatedDevice.ips && updatedDevice.ips.length > 0) {
            updatedDevice.ips = updatedDevice.ips.map((ip) => ({
              ...ip,
              serviceId: selectedService,
              serviceName: serviceName,
            }))
          }
        }

        addDevice(selectedDc, selectedRoom, selectedRack, Number.parseInt(startUnit), updatedDevice)

        // Handle service assignment
        if (device.serviceId && device.serviceId !== selectedService) {
          // Remove from old service
          removeDeviceFromService(deviceId, device.serviceId)
        }

        // Add to new service if selected
        if (selectedService) {
          assignDeviceToService(deviceId, selectedService)
        }

        toast({
          title: "Success",
          description: "Device installed successfully",
        })

        onClose()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to install device",
          variant: "destructive",
        })
        console.error(error)
      }
    } else if (actionType === "uninstall" && deviceId) {
      // Find device location
      let deviceLocation = null

      for (const dc of dataCenters) {
        for (const room of dc.rooms) {
          for (const rack of room.racks) {
            const unit = rack.units.find((u) => u.deviceId === deviceId)
            if (unit) {
              deviceLocation = { dcId: dc.id, roomId: room.id, rackId: rack.id }
              break
            }
          }
          if (deviceLocation) break
        }
        if (deviceLocation) break
      }

      if (!deviceLocation) {
        toast({
          title: "Error",
          description: "Device location not found",
          variant: "destructive",
        })
        return
      }

      const originalDevice = getDevice(deviceId)

      try {
        deleteDevice(deviceLocation.dcId, deviceLocation.roomId, deviceLocation.rackId, deviceId)

        // 如果設備之前有關聯的服務，從服務中移除設備
        if (originalDevice && originalDevice.serviceId) {
          removeDeviceFromService(deviceId, originalDevice.serviceId)
        }

        toast({
          title: "Success",
          description: "Device uninstalled successfully",
        })

        onClose()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to uninstall device",
          variant: "destructive",
        })
        console.error(error)
      }
    } else if (actionType === "move" && deviceId) {
      // Find current device location
      let currentLocation = null

      for (const dc of dataCenters) {
        for (const room of dc.rooms) {
          for (const rack of room.racks) {
            const unit = rack.units.find((u) => u.deviceId === deviceId)
            if (unit) {
              currentLocation = { dcId: dc.id, roomId: room.id, rackId: rack.id }
              break
            }
          }
          if (currentLocation) break
        }
        if (currentLocation) break
      }

      if (!currentLocation) {
        toast({
          title: "Error",
          description: "Current device location not found",
          variant: "destructive",
        })
        return
      }

      if (!selectedDc || !selectedRoom || !selectedRack || !startUnit) {
        toast({
          title: "Error",
          description: "Please select a new location",
          variant: "destructive",
        })
        return
      }

      const device = getDevice(deviceId)
      if (!device) {
        toast({
          title: "Error",
          description: "Device not found",
          variant: "destructive",
        })
        return
      }

      const originalDevice = getDevice(deviceId)

      try {
        // Update device with new service if changed
        const updatedDevice = { ...device }
        if (selectedService !== device.serviceId) {
          // Get service name if a service is selected
          const serviceName = selectedService ? getService(selectedService)?.name || null : null

          updatedDevice.serviceId = selectedService
          updatedDevice.serviceName = serviceName

          // Update IPs with new service info
          if (updatedDevice.ips && updatedDevice.ips.length > 0) {
            updatedDevice.ips = updatedDevice.ips.map((ip) => ({
              ...ip,
              serviceId: selectedService,
              serviceName: serviceName,
            }))
          }
        }

        // Remove from current location
        deleteDevice(currentLocation.dcId, currentLocation.roomId, currentLocation.rackId, deviceId)

        // Add to new location
        addDevice(selectedDc, selectedRoom, selectedRack, Number.parseInt(startUnit), updatedDevice)

        // Handle service assignment
        if (originalDevice && originalDevice.serviceId && originalDevice.serviceId !== selectedService) {
          // Remove from old service
          removeDeviceFromService(deviceId, originalDevice.serviceId)
        }

        // Add to new service if selected
        if (selectedService) {
          assignDeviceToService(deviceId, selectedService)
        }

        toast({
          title: "Success",
          description: "Device moved successfully",
        })

        onClose()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to move device",
          variant: "destructive",
        })
        console.error(error)
      }
    }
  }

  const getTitle = () => {
    switch (actionType) {
      case "install":
        return deviceId === "new" ? "Add New Device" : "Install Device"
      case "uninstall":
        return "Uninstall Device"
      case "move":
        return "Move Device"
      default:
        return ""
    }
  }

  const getDescription = () => {
    switch (actionType) {
      case "install":
        return deviceId === "new"
          ? "Add a new device to the inventory and install it in a rack."
          : "Install the device in a rack."
      case "uninstall":
        return "Remove the device from its current rack."
      case "move":
        return "Move the device to a different rack or position."
      default:
        return ""
    }
  }

  // Get available units for the selected rack
  const availableUnits = getAvailableUnits()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        {actionType === "install" && deviceId === "new" ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Device</TabsTrigger>
              <TabsTrigger value="batch">Batch Import</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4">
              <form onSubmit={handleSubmit}>
                <div className="mt-4 grid gap-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deviceName">
                        Device Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="deviceName"
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                        placeholder="Enter device name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deviceModel">
                        Device Type <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="deviceModel"
                        value={deviceModel}
                        onChange={(e) => setDeviceModel(e.target.value)}
                        placeholder="e.g. Server, Switch, Router"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deviceSize">
                        Device Size (U) <span className="text-red-500">*</span>
                      </Label>
                      <Select value={deviceSize} onValueChange={setDeviceSize}>
                        <SelectTrigger id="deviceSize">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                              {size}U
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startUnit">
                        Start Position <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={startUnit}
                        onValueChange={setStartUnit}
                        disabled={!selectedRack || availableUnits.length === 0}
                      >
                        <SelectTrigger id="startUnit">
                          <SelectValue
                            placeholder={availableUnits.length === 0 ? "No space available" : "Select position"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUnits.map((unit) => (
                            <SelectItem key={unit} value={unit.toString()}>
                              U{unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedRack && availableUnits.length === 0 && (
                        <p className="text-xs text-red-500">
                          No available space in this rack for the selected device size
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deviceModel">Model</Label>
                      <Input
                        id="deviceModel"
                        value={deviceModel}
                        onChange={(e) => setDeviceModel(e.target.value)}
                        placeholder="e.g. Dell R740"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deviceStatus">Status</Label>
                      <Select value={deviceStatus} onValueChange={setDeviceStatus}>
                        <SelectTrigger id="deviceStatus">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="selectedService">Service</Label>
                      <Select
                        value={selectedService || ""}
                        onValueChange={(value) => setSelectedService(value === "" || value === "none" ? null : value)}
                      >
                        <SelectTrigger id="selectedService">
                          <SelectValue placeholder="Select a service (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {activeServices.length > 0 ? (
                            activeServices.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name} ({service.department || "No Department"})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              No services available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="devicePower">Power Consumption (W)</Label>
                      <Input
                        id="devicePower"
                        type="number"
                        min="0"
                        value={devicePower}
                        onChange={(e) => setDevicePower(e.target.value)}
                        placeholder="e.g. 450"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deviceNotes">Description</Label>
                    <Textarea
                      id="deviceNotes"
                      value={deviceNotes}
                      onChange={(e) => setDeviceNotes(e.target.value)}
                      placeholder="Additional information about this device"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ipAddress">
                        IP Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="ipAddress"
                        value={ipAddress}
                        onChange={(e) => setIpAddress(e.target.value)}
                        placeholder="e.g. 192.168.1.10"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subnet">
                        Subnet <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="subnet"
                        value={subnet}
                        onChange={(e) => setSubnet(e.target.value)}
                        placeholder="e.g. 192.168.1.0/24"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="selectedDc">
                        Data Center <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedDc}
                        onValueChange={(value) => {
                          setSelectedDc(value)
                          setSelectedRoom("")
                          setSelectedRack("")
                          setStartUnit("")
                        }}
                      >
                        <SelectTrigger id="selectedDc">
                          <SelectValue placeholder="Select data center" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataCenters.map((dc) => (
                            <SelectItem key={dc.id} value={dc.id}>
                              {dc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="selectedRoom">
                        Room <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedRoom}
                        onValueChange={(value) => {
                          setSelectedRoom(value)
                          setSelectedRack("")
                          setStartUnit("")
                        }}
                        disabled={!selectedDc}
                      >
                        <SelectTrigger id="selectedRoom">
                          <SelectValue placeholder="Select room" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDc &&
                            dataCenters
                              .find((dc) => dc.id === selectedDc)
                              ?.rooms.map((room) => (
                                <SelectItem key={room.id} value={room.id}>
                                  {room.name}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="selectedRack">
                        Rack <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedRack}
                        onValueChange={(value) => {
                          setSelectedRack(value)
                          setStartUnit("")
                        }}
                        disabled={!selectedRoom}
                      >
                        <SelectTrigger id="selectedRack">
                          <SelectValue placeholder="Select rack" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedRoom &&
                            dataCenters
                              .find((dc) => dc.id === selectedDc)
                              ?.rooms.find((room) => room.id === selectedRoom)
                              ?.racks.map((rack) => (
                                <SelectItem key={rack.id} value={rack.id}>
                                  {rack.name}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit">Add & Install</Button>
                </DialogFooter>
              </form>
            </TabsContent>

            <TabsContent value="batch" className="space-y-4">
              {/* CSV Template Download Area */}
              <div className="space-y-4">
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Download CSV template, fill in device information and upload. Ensure it follows the correct format.
                  </AlertDescription>
                </Alert>

                <Button onClick={downloadCSVTemplate} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </div>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg mb-2">Drag CSV file here or click to select file</p>
                <p className="text-sm text-muted-foreground mb-4">Only .csv format files are supported</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleCSVUpload(e.target.files[0])
                    }
                  }}
                  className="hidden"
                  id="csv-upload"
                />
                <Button asChild variant="outline">
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    Select File
                  </label>
                </Button>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Processing file...</span>
                </div>
              )}

              {/* Preview Table Area */}
              {csvData.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Data Preview</h3>
                    <div className="flex space-x-2">
                      <Badge variant="outline">Total {csvData.length} records</Badge>
                      <Badge variant="default">{csvData.filter((row) => !row.hasError).length} correct</Badge>
                      {csvErrors.length > 0 && (
                        <Badge variant="destructive">{csvData.filter((row) => row.hasError).length} errors</Badge>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-x-auto max-h-96">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Device Name</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Size(U)</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvData.map((row, index) => (
                          <TableRow key={index} className={row.hasError ? "bg-destructive/10" : ""}>
                            <TableCell>{row["Device Name"]}</TableCell>
                            <TableCell>{row["Model"]}</TableCell>
                            <TableCell>{row["Device Type"]}</TableCell>
                            <TableCell>{row["Device Size (U)"]}</TableCell>
                            <TableCell>{row["Location"]}</TableCell>
                            <TableCell>{row["Start Position (U)"]}</TableCell>
                            <TableCell>{row["Service"] || "-"}</TableCell>
                            <TableCell>{row["IP Address"]}</TableCell>
                            <TableCell>{row["Status"]}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Error List */}
              {csvErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-semibold">Found the following errors:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {csvErrors.map((error, index) => (
                          <li key={index} className="text-sm">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleBatchImport} disabled={csvData.length === 0 || csvErrors.length > 0}>
                  Import {csvData.filter((row) => !row.hasError).length} Devices
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        ) : (
          /* Other action types form */
          <form onSubmit={handleSubmit}>
            <div className="mt-4 grid gap-4 py-4">
              {((actionType === "install" && deviceId !== "new") || actionType === "move") && (
                <>
                  {/* Service Selection for existing device */}
                  <div className="space-y-2">
                    <Label htmlFor="selectedService">Service</Label>
                    <Select
                      value={selectedService || ""}
                      onValueChange={(value) => setSelectedService(value === "" || value === "none" ? null : value)}
                    >
                      <SelectTrigger id="selectedService">
                        <SelectValue placeholder="Select a service (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {activeServices.length > 0 ? (
                          activeServices.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} ({service.department || "No Department"})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            No services available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {(actionType === "install" || actionType === "move") && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="selectedDc">
                        Data Center <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedDc}
                        onValueChange={(value) => {
                          setSelectedDc(value)
                          setSelectedRoom("")
                          setSelectedRack("")
                          setStartUnit("")
                        }}
                      >
                        <SelectTrigger id="selectedDc">
                          <SelectValue placeholder="Select data center" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataCenters.map((dc) => (
                            <SelectItem key={dc.id} value={dc.id}>
                              {dc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="selectedRoom">
                        Room <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedRoom}
                        onValueChange={(value) => {
                          setSelectedRoom(value)
                          setSelectedRack("")
                          setStartUnit("")
                        }}
                        disabled={!selectedDc}
                      >
                        <SelectTrigger id="selectedRoom">
                          <SelectValue placeholder="Select room" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDc &&
                            dataCenters
                              .find((dc) => dc.id === selectedDc)
                              ?.rooms.map((room) => (
                                <SelectItem key={room.id} value={room.id}>
                                  {room.name}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="selectedRack">
                        Rack <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedRack}
                        onValueChange={(value) => {
                          setSelectedRack(value)
                          setStartUnit("")
                        }}
                        disabled={!selectedRoom}
                      >
                        <SelectTrigger id="selectedRack">
                          <SelectValue placeholder="Select rack" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedRoom &&
                            dataCenters
                              .find((dc) => dc.id === selectedDc)
                              ?.rooms.find((room) => room.id === selectedRoom)
                              ?.racks.map((rack) => (
                                <SelectItem key={rack.id} value={rack.id}>
                                  {rack.name}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startUnit">
                        Start Position <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={startUnit}
                        onValueChange={setStartUnit}
                        disabled={!selectedRack || availableUnits.length === 0}
                      >
                        <SelectTrigger id="startUnit">
                          <SelectValue
                            placeholder={availableUnits.length === 0 ? "No space available" : "Select position"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUnits.map((unit) => (
                            <SelectItem key={unit} value={unit.toString()}>
                              U{unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedRack && availableUnits.length === 0 && (
                        <p className="text-xs text-red-500">
                          No available space in this rack for the selected device size
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endUnit">End Position</Label>
                      <Input id="endUnit" value={endUnit} readOnly disabled className="bg-muted" />
                    </div>
                  </div>
                </>
              )}

              {actionType === "uninstall" && deviceId && (
                <div className="py-4 text-center">
                  <p className="mb-2">Are you sure you want to uninstall this device?</p>
                  <p className="font-medium">{getDevice(deviceId)?.name}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    The device will be removed from its current rack but will remain in the inventory.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant={actionType === "uninstall" ? "destructive" : "default"}>
                {actionType === "install" && (deviceId === "new" ? "Add & Install" : "Install")}
                {actionType === "uninstall" && "Uninstall"}
                {actionType === "move" && "Move"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
