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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDataCenterStore } from "@/lib/data-center-store"
import { toast } from "@/components/ui/use-toast"
import { AddDeviceForm } from "@/components/add-device-form"
import type { DataCenter } from "@/models/data-center"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Download, FileText, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserDeviceActionModalProps {
  isOpen: boolean
  onClose: () => void
  actionType: "install" | "uninstall" | "move"
  onSuccess?: () => void
  dataCenters: DataCenter[]
  deviceId?: string | null
}

export function UserDeviceActionModal({
  isOpen,
  onClose,
  actionType,
  onSuccess,
  dataCenters,
  deviceId,
}: UserDeviceActionModalProps) {
  const {
    findRack,
    getDevice,
    getAllDevices,
    moveDevice,
    deleteDevice,
    addDevice,
    getAllServices,
    assignDeviceToService,
  } = useDataCenterStore()

  // 選擇的數據中心、房間和機櫃
  const [selectedDataCenter, setSelectedDataCenter] = useState<string>("")
  const [selectedRoom, setSelectedRoom] = useState<string>("")
  const [selectedRack, setSelectedRack] = useState<string>("")

  // 選擇的設備
  const [selectedDevice, setSelectedDevice] = useState<string>("")

  // 目標位置（用於移動設備）
  const [targetDataCenter, setTargetDataCenter] = useState<string>("")
  const [targetRoom, setTargetRoom] = useState<string>("")
  const [targetRack, setTargetRack] = useState<string>("")
  const [targetPosition, setTargetPosition] = useState<string>("")

  // 處理中狀態
  const [isProcessing, setIsProcessing] = useState(false)

  // Batch import related states
  const [activeTab, setActiveTab] = useState("single")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // 所有設備列表
  const allDevices = getAllDevices ? getAllDevices() : []

  // Get all services for dropdown
  const services = getAllServices()
  const activeServices = services
    .filter((service) => service.status === "Active")
    .sort((a, b) => a.name.localeCompare(b.name))

  // 重置表單
  const resetForm = () => {
    setSelectedDataCenter("")
    setSelectedRoom("")
    setSelectedRack("")
    setSelectedDevice("")
    setTargetDataCenter("")
    setTargetRoom("")
    setTargetRack("")
    setTargetPosition("")
    setIsProcessing(false)

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
Server-001,Dell R740,Server,2,DC-A Room 1 Rack 2,1,Active,Web Service,Web Server,192.168.1.100,Management
Switch-001,Cisco 2960,Switch,1,DC-A Room 1 Rack 2,3,Active,,Core Switch,192.168.1.101,Management`

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

        // Validate Location
        if (!row["Location"]) {
          errors.push(`Row ${i + 1}: Location cannot be empty`)
        }

        // Validate Start Position
        if (!row["Start Position (U)"] || isNaN(Number(row["Start Position (U)"]))) {
          errors.push(`Row ${i + 1}: Start Position must be a number`)
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
        // Parse location information
        const locationParts = row["Location"].split(" ")
        let dcName = "",
          roomName = "",
          rackName = ""

        if (locationParts.length >= 3) {
          dcName = locationParts[0]
          roomName = locationParts[1] + " " + locationParts[2]
          rackName = locationParts[3] + " " + locationParts[4]
        }

        // Find corresponding data center, room and rack
        const dc = dataCenters.find((d) => d.name === dcName)
        if (!dc) continue

        const room = dc.rooms.find((r) => r.name === roomName)
        if (!room) continue

        const rack = room.racks.find((r) => r.name === rackName)
        if (!rack) continue

        // Find service if specified
        let serviceId = null
        let serviceName = null
        if (row["Service"] && row["Service"].trim() !== "") {
          const foundService = services.find((s) => s.name === row["Service"].trim())
          if (foundService) {
            serviceId = foundService.id
            serviceName = foundService.name
          }
        }

        // Use specified position
        const deviceSize = Number(row["Device Size (U)"])
        const availablePosition = Number(row["Start Position (U)"])

        let canFit = true
        for (let j = 0; j < deviceSize; j++) {
          if (
            rack.units[availablePosition + j - 1] === undefined ||
            rack.units[availablePosition + j - 1].deviceId !== null
          ) {
            canFit = false
            break
          }
        }

        if (!canFit) continue

        const newDeviceId = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

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
                  serviceId: serviceId,
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
          serviceId: serviceId,
          serviceName: serviceName,
        }

        addDevice(dc.id, room.id, rack.id, availablePosition, deviceInfo)

        // Assign device to service if specified
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

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Batch import failed",
        variant: "destructive",
      })
    }
  }

  // 當模態框打開時重置表單
  useEffect(() => {
    if (isOpen) {
      resetForm()

      // 如果有數據中心，預設選擇第一個
      if (dataCenters.length > 0) {
        setSelectedDataCenter(dataCenters[0].id)

        if (actionType === "move") {
          setTargetDataCenter(dataCenters[0].id)
        }
      }

      // 如果有傳入設備ID，則設置為選中的設備
      if (deviceId) {
        setSelectedDevice(deviceId)

        // 如果是卸載或移動操作，需要找到設備所在的機櫃
        if (actionType === "uninstall" || actionType === "move") {
          // 查找設備所在的機櫃
          for (const dc of dataCenters) {
            let found = false
            for (const room of dc.rooms) {
              for (const rack of room.racks) {
                for (const unit of rack.units) {
                  if (unit.deviceId === deviceId) {
                    setSelectedDataCenter(dc.id)
                    setSelectedRoom(room.id)
                    setSelectedRack(rack.id)
                    found = true
                    break
                  }
                }
                if (found) break
              }
              if (found) break
            }
            if (found) break
          }
        }
      }
    }
  }, [isOpen, dataCenters, actionType, deviceId])

  // 當選擇數據中心時，預設選擇第一個房間
  useEffect(() => {
    if (selectedDataCenter) {
      const dc = dataCenters.find((dc) => dc.id === selectedDataCenter)
      if (dc && dc.rooms.length > 0) {
        setSelectedRoom(dc.rooms[0].id)
      }
    }
  }, [selectedDataCenter, dataCenters])

  // 當選擇房間時，預設選擇第一個機櫃
  useEffect(() => {
    if (selectedDataCenter && selectedRoom) {
      const dc = dataCenters.find((dc) => dc.id === selectedDataCenter)
      const room = dc?.rooms.find((r) => r.id === selectedRoom)
      if (room && room.racks.length > 0) {
        setSelectedRack(room.racks[0].id)
      }
    }
  }, [selectedRoom, selectedDataCenter, dataCenters])

  // 當選擇目標數據中心時，預設選擇第一個房間
  useEffect(() => {
    if (targetDataCenter) {
      const dc = dataCenters.find((dc) => dc.id === targetDataCenter)
      if (dc && dc.rooms.length > 0) {
        setTargetRoom(dc.rooms[0].id)
      }
    }
  }, [targetDataCenter, dataCenters])

  // 當選擇目標房間時，預設選擇第一個機櫃
  useEffect(() => {
    if (targetDataCenter && targetRoom) {
      const dc = dataCenters.find((dc) => dc.id === targetDataCenter)
      const room = dc?.rooms.find((r) => r.id === targetRoom)
      if (room && room.racks.length > 0) {
        setTargetRack(room.racks[0].id)
      }
    }
  }, [targetRoom, targetDataCenter, dataCenters])

  // 獲取選中的機櫃
  const getSelectedRack = () => {
    const dc = dataCenters.find((dc) => dc.id === selectedDataCenter)
    const room = dc?.rooms.find((r) => r.id === selectedRoom)
    return room?.racks.find((r) => r.id === selectedRack)
  }

  // 獲取目標機櫃
  const getTargetRack = () => {
    const dc = dataCenters.find((dc) => dc.id === targetDataCenter)
    const room = dc?.rooms.find((r) => r.id === targetRoom)
    return room?.racks.find((r) => r.id === targetRack)
  }

  // 獲取機櫃中的設備
  const getDevicesInRack = () => {
    const rack = getSelectedRack()
    if (!rack) return []

    const deviceIds = new Set<string>()
    rack.units.forEach((unit) => {
      if (unit.deviceId) {
        deviceIds.add(unit.deviceId)
      }
    })

    return Array.from(deviceIds).map((id) => {
      const device = getDevice(id)
      return {
        id,
        name: device?.name || rack.units.find((u) => u.deviceId === id)?.deviceName || "Unknown Device",
      }
    })
  }

  // 獲取目標機櫃的可用位置
  const getAvailablePositions = () => {
    const rack = getTargetRack()
    if (!rack) return []

    const device = getDevice(selectedDevice)
    const deviceSize = device?.size || 1

    const availablePositions: number[] = []
    for (let i = 1; i <= rack.totalUnits - deviceSize + 1; i++) {
      let available = true

      // 檢查從 i 開始的 deviceSize 個單元是否都可用
      for (let j = 0; j < deviceSize; j++) {
        const unit = rack.units[i + j - 1]
        if (!unit || (unit.deviceId !== null && unit.deviceId !== selectedDevice)) {
          available = false
          break
        }
      }

      if (available) {
        availablePositions.push(i)
      }
    }

    return availablePositions
  }

  // 處理卸載設備
  const handleUninstallDevice = async () => {
    if (!selectedDevice) {
      toast({
        title: "Error",
        description: "Please select a device to uninstall",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const rackInfo = findRack(selectedRack)

      if (!rackInfo) {
        throw new Error("Rack not found")
      }

      const { datacenter, room } = rackInfo

      deleteDevice(datacenter.id, room.id, selectedRack, selectedDevice)

      toast({
        title: "Success",
        description: "Device has been uninstalled successfully",
      })

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to uninstall device. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  // 處理移動設備
  const handleMoveDevice = async () => {
    if (!selectedDevice || !targetPosition) {
      toast({
        title: "Error",
        description: "Please select a device and target position",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // 獲取源機櫃信息
      const sourceRackInfo = findRack(selectedRack)

      if (!sourceRackInfo) {
        throw new Error("Source rack not found")
      }

      // 獲取目標機櫃信息
      const targetRackInfo = findRack(targetRack)

      if (!targetRackInfo) {
        throw new Error("Target rack not found")
      }

      // 移動設備
      moveDevice(
        sourceRackInfo.datacenter.id,
        sourceRackInfo.room.id,
        selectedRack,
        selectedDevice,
        targetRackInfo.datacenter.id,
        targetRackInfo.room.id,
        targetRack,
        Number.parseInt(targetPosition),
      )

      toast({
        title: "Success",
        description: "Device has been moved successfully",
      })

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to move device: ${(error as Error).message}`,
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
      case "install":
        return "Install New Device"
      case "uninstall":
        return "Uninstall Device"
      case "move":
        return "Move Device"
    }
  }

  // 獲取模態框描述
  const getModalDescription = () => {
    switch (actionType) {
      case "install":
        return "Add a new device to a rack"
      case "uninstall":
        return "Remove a device from a rack"
      case "move":
        return "Move a device to a different location"
    }
  }

  // 渲染安裝設備表單
  const renderInstallForm = () => {
    const rack = getSelectedRack()

    return (
      <div className="space-y-4">
        {actionType === "install" ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Device</TabsTrigger>
              <TabsTrigger value="batch">Batch Import</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="datacenter">Data Center</Label>
                  <Select value={selectedDataCenter} onValueChange={setSelectedDataCenter}>
                    <SelectTrigger id="datacenter">
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
                  <Label htmlFor="room">Room</Label>
                  <Select value={selectedRoom} onValueChange={setSelectedRoom} disabled={!selectedDataCenter}>
                    <SelectTrigger id="room">
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataCenters
                        .find((dc) => dc.id === selectedDataCenter)
                        ?.rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rack">Rack</Label>
                  <Select value={selectedRack} onValueChange={setSelectedRack} disabled={!selectedRoom}>
                    <SelectTrigger id="rack">
                      <SelectValue placeholder="Select rack" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataCenters
                        .find((dc) => dc.id === selectedDataCenter)
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

              {rack ? (
                <AddDeviceForm
                  rack={rack}
                  onSuccess={onSuccess}
                  dataCenterId={selectedDataCenter}
                  roomId={selectedRoom}
                  rackId={selectedRack}
                />
              ) : (
                <p className="text-muted-foreground">Please select a rack to install a device</p>
              )}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="datacenter">Data Center</Label>
              <Select value={selectedDataCenter} onValueChange={setSelectedDataCenter}>
                <SelectTrigger id="datacenter">
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
              <Label htmlFor="room">Room</Label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom} disabled={!selectedDataCenter}>
                <SelectTrigger id="room">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {dataCenters
                    .find((dc) => dc.id === selectedDataCenter)
                    ?.rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rack">Rack</Label>
              <Select value={selectedRack} onValueChange={setSelectedRack} disabled={!selectedRoom}>
                <SelectTrigger id="rack">
                  <SelectValue placeholder="Select rack" />
                </SelectTrigger>
                <SelectContent>
                  {dataCenters
                    .find((dc) => dc.id === selectedDataCenter)
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
        )}

        {rack && actionType !== "install" ? (
          <AddDeviceForm
            rack={rack}
            onSuccess={onSuccess}
            dataCenterId={selectedDataCenter}
            roomId={selectedRoom}
            rackId={selectedRack}
          />
        ) : null}
      </div>
    )
  }

  // 渲染卸載設備表單
  const renderUninstallForm = () => {
    const devices = getDevicesInRack()
    const selectedDeviceInfo = devices.find((d) => d.id === selectedDevice)

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="datacenter">Data Center</Label>
          <Select value={selectedDataCenter} onValueChange={setSelectedDataCenter}>
            <SelectTrigger id="datacenter">
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
          <Label htmlFor="room">Room</Label>
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger id="room">
              <SelectValue placeholder="Select room" />
            </SelectTrigger>
            <SelectContent>
              {dataCenters
                .find((dc) => dc.id === selectedDataCenter)
                ?.rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rack">Rack</Label>
          <Select value={selectedRack} onValueChange={setSelectedRack}>
            <SelectTrigger id="rack">
              <SelectValue placeholder="Select rack" />
            </SelectTrigger>
            <SelectContent>
              {dataCenters
                .find((dc) => dc.id === selectedDataCenter)
                ?.rooms.find((room) => room.id === selectedRoom)
                ?.racks.map((rack) => (
                  <SelectItem key={rack.id} value={rack.id}>
                    {rack.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="device">Device</Label>
          <Select value={selectedDevice} onValueChange={setSelectedDevice}>
            <SelectTrigger id="device">
              <SelectValue placeholder="Select device" />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.id} value={device.id}>
                  {device.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedDeviceInfo && (
          <div className="p-4 border rounded-md bg-red-900/20 border-red-800 text-red-100">
            <p className="font-medium">Warning: You are about to uninstall the following device:</p>
            <p className="mt-2">{selectedDeviceInfo.name}</p>
            <p className="mt-4 text-sm">This action cannot be undone. The device will be removed from the rack.</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleUninstallDevice} disabled={isProcessing || !selectedDevice}>
            {isProcessing ? "Uninstalling..." : "Uninstall Device"}
          </Button>
        </DialogFooter>
      </div>
    )
  }

  // 渲染移動設備表單
  const renderMoveForm = () => {
    const devices = getDevicesInRack()
    const availablePositions = getAvailablePositions()

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="font-medium">Source Location</h3>

            <div className="space-y-2">
              <Label htmlFor="source-datacenter">Data Center</Label>
              <Select value={selectedDataCenter} onValueChange={setSelectedDataCenter}>
                <SelectTrigger id="source-datacenter">
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
              <Label htmlFor="source-room">Room</Label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger id="source-room">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {dataCenters
                    .find((dc) => dc.id === selectedDataCenter)
                    ?.rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source-rack">Rack</Label>
              <Select value={selectedRack} onValueChange={setSelectedRack}>
                <SelectTrigger id="source-rack">
                  <SelectValue placeholder="Select rack" />
                </SelectTrigger>
                <SelectContent>
                  {dataCenters
                    .find((dc) => dc.id === selectedDataCenter)
                    ?.rooms.find((room) => room.id === selectedRoom)
                    ?.racks.map((rack) => (
                      <SelectItem key={rack.id} value={rack.id}>
                        {rack.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="device">Device</Label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger id="device">
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Target Location</h3>

            <div className="space-y-2">
              <Label htmlFor="target-datacenter">Data Center</Label>
              <Select value={targetDataCenter} onValueChange={setTargetDataCenter}>
                <SelectTrigger id="target-datacenter">
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
              <Label htmlFor="target-room">Room</Label>
              <Select value={targetRoom} onValueChange={setTargetRoom}>
                <SelectTrigger id="target-room">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {dataCenters
                    .find((dc) => dc.id === targetDataCenter)
                    ?.rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-rack">Rack</Label>
              <Select value={targetRack} onValueChange={setTargetRack}>
                <SelectTrigger id="target-rack">
                  <SelectValue placeholder="Select rack" />
                </SelectTrigger>
                <SelectContent>
                  {dataCenters
                    .find((dc) => dc.id === targetDataCenter)
                    ?.rooms.find((room) => room.id === targetRoom)
                    ?.racks.map((rack) => (
                      <SelectItem key={rack.id} value={rack.id}>
                        {rack.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-position">Position</Label>
              <Select
                value={targetPosition}
                onValueChange={setTargetPosition}
                disabled={!selectedDevice || availablePositions.length === 0}
              >
                <SelectTrigger id="target-position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {availablePositions.map((pos) => (
                    <SelectItem key={pos} value={pos.toString()}>
                      U{pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availablePositions.length === 0 && (
                <p className="text-xs text-red-500">No available positions in the target rack</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleMoveDevice} disabled={isProcessing || !selectedDevice || !targetPosition}>
            {isProcessing ? "Moving..." : "Move Device"}
          </Button>
        </DialogFooter>
      </div>
    )
  }

  // 根據操作類型渲染不同的表單
  const renderForm = () => {
    switch (actionType) {
      case "install":
        return renderInstallForm()
      case "uninstall":
        return renderUninstallForm()
      case "move":
        return renderMoveForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
          <DialogDescription>{getModalDescription()}</DialogDescription>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  )
}
