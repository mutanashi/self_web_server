"use client"

import type React from "react"

import { useState } from "react"
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
import { toast } from "@/components/ui/use-toast"
import { useDataCenterStore } from "@/lib/data-center-store"

interface IPSubnetModalProps {
  isOpen: boolean
  onClose: () => void
}

export function IPSubnetModal({ isOpen, onClose }: IPSubnetModalProps) {
  const { addSubnet } = useDataCenterStore()

  const [networkAddress, setNetworkAddress] = useState("")
  const [cidr, setCidr] = useState("24")
  const [description, setDescription] = useState("")
  const [reservedIPs, setReservedIPs] = useState("10")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!networkAddress || !cidr || !description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      // 添加子網
      addSubnet(
        networkAddress,
        description,
        cidr,
        `${networkAddress.split(".").slice(0, 3).join(".")}.1`,
        Number.parseInt(reservedIPs),
      )

      toast({
        title: "Success",
        description: "Subnet added successfully",
      })

      // 重置表單
      setNetworkAddress("")
      setCidr("24")
      setDescription("")
      setReservedIPs("10")

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add subnet",
        variant: "destructive",
      })
      console.error(error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subnet</DialogTitle>
          <DialogDescription>Add a new subnet to the IP management system.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="networkAddress">Network Address</Label>
              <Input
                id="networkAddress"
                value={networkAddress}
                onChange={(e) => setNetworkAddress(e.target.value)}
                placeholder="e.g. 192.168.1.0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidr">CIDR</Label>
              <div className="flex items-center">
                <span className="mr-2">/</span>
                <Input id="cidr" value={cidr} onChange={(e) => setCidr(e.target.value)} placeholder="24" required />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Primary Network"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reservedIPs">Reserved IPs</Label>
            <Input
              id="reservedIPs"
              type="number"
              min="0"
              value={reservedIPs}
              onChange={(e) => setReservedIPs(e.target.value)}
              placeholder="10"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Subnet</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
