"use client"

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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDataCenterStore } from "@/lib/data-center-store"
import { toast } from "@/components/ui/use-toast"
import type { Service } from "@/models/data-center"

interface UserServiceActionModalProps {
  isOpen: boolean
  onClose: () => void
  actionType: "create" | "edit" | "delete"
  onSuccess?: () => void
  serviceId?: string | null
  services: Service[]
}

export function UserServiceActionModal({
  isOpen,
  onClose,
  actionType,
  onSuccess,
  serviceId,
  services,
}: UserServiceActionModalProps) {
  const { createService, updateService, deleteService } = useDataCenterStore()

  // 表單狀態
  const [serviceName, setServiceName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("Active")
  const [criticality, setCriticality] = useState("Medium")
  const [owner, setOwner] = useState("")
  const [department, setDepartment] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // 重置表單
  const resetForm = () => {
    setServiceName("")
    setDescription("")
    setStatus("Active")
    setCriticality("Medium")
    setOwner("")
    setDepartment("")
    setIsProcessing(false)
  }

  // 當模態框打開時重置表單
  useEffect(() => {
    if (isOpen) {
      resetForm()

      // 如果是編輯或刪除，預填表單
      if ((actionType === "edit" || actionType === "delete") && serviceId) {
        const service = services.find((s) => s.id === serviceId)
        if (service) {
          setServiceName(service.name)
          setDescription(service.description)
          setStatus(service.status)
          setCriticality(service.criticality)
          setOwner(service.owner || "")
          setDepartment(service.department || "")
        }
      }
    }
  }, [isOpen, actionType, serviceId, services])

  // 處理創建服務
  const handleCreateService = async () => {
    if (!serviceName || !description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const newService: Service = {
        id: `svc-${Date.now()}`,
        name: serviceName,
        description: description,
        devices: [],
        ips: [],
        status: status as "Active" | "Inactive" | "Maintenance" | "Planned",
        owner: owner || null,
        department: department || null,
        criticality: criticality as "Low" | "Medium" | "High" | "Critical",
      }

      createService(newService)

      toast({
        title: "Success",
        description: "Service has been created successfully",
      })

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create service. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  // 處理更新服務
  const handleUpdateService = async () => {
    if (!serviceId || !serviceName || !description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const service = services.find((s) => s.id === serviceId)

      if (!service) {
        throw new Error("Service not found")
      }

      const updatedService: Service = {
        ...service,
        name: serviceName,
        description: description,
        status: status as "Active" | "Inactive" | "Maintenance" | "Planned",
        owner: owner || null,
        department: department || null,
        criticality: criticality as "Low" | "Medium" | "High" | "Critical",
      }

      updateService(updatedService)

      toast({
        title: "Success",
        description: "Service has been updated successfully",
      })

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update service. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  // 處理刪除服務
  const handleDeleteService = async () => {
    if (!serviceId) {
      toast({
        title: "Error",
        description: "No service selected",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      deleteService(serviceId)

      toast({
        title: "Success",
        description: "Service has been deleted successfully",
      })

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
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
      case "create":
        return "Create Service"
      case "edit":
        return "Edit Service"
      case "delete":
        return "Delete Service"
    }
  }

  // 獲取模態框描述
  const getModalDescription = () => {
    switch (actionType) {
      case "create":
        return "Create a new service"
      case "edit":
        return "Edit an existing service"
      case "delete":
        return "Delete an existing service"
    }
  }

  // 渲染創建/編輯服務表單
  const renderServiceForm = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="service-name">
            Service Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="service-name"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            placeholder="Enter service name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter service description"
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Planned">Planned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="criticality">Criticality</Label>
            <Select value={criticality} onValueChange={setCriticality}>
              <SelectTrigger id="criticality">
                <SelectValue placeholder="Select criticality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="owner">Owner</Label>
            <Input
              id="owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="Enter service owner"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Enter department"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={actionType === "create" ? handleCreateService : handleUpdateService}
            disabled={isProcessing || !serviceName || !description}
          >
            {isProcessing
              ? actionType === "create"
                ? "Creating..."
                : "Updating..."
              : actionType === "create"
                ? "Create Service"
                : "Update Service"}
          </Button>
        </DialogFooter>
      </div>
    )
  }

  // 渲染刪除服務表單
  const renderDeleteForm = () => {
    const service = services.find((s) => s.id === serviceId)

    return (
      <div className="space-y-4">
        <div className="p-4 border rounded-md bg-gray-800">
          <div className="space-y-2">
            <p className="text-sm font-medium">Service Name</p>
            <p className="text-lg">{service?.name}</p>
          </div>
          <div className="space-y-2 mt-2">
            <p className="text-sm font-medium">Description</p>
            <p className="text-sm">{service?.description}</p>
          </div>
        </div>

        <p className="text-amber-400">
          Warning: Deleting this service will remove all associations with devices and IP addresses. This action cannot
          be undone.
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteService} disabled={isProcessing}>
            {isProcessing ? "Deleting..." : "Delete Service"}
          </Button>
        </DialogFooter>
      </div>
    )
  }

  // 根據操作類型渲染不同的表單
  const renderForm = () => {
    switch (actionType) {
      case "create":
      case "edit":
        return renderServiceForm()
      case "delete":
        return renderDeleteForm()
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
