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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useDataCenterStore } from "@/lib/data-center-store"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { IPAddress } from "@/models/data-center"

interface UserIPDetailModalProps {
  isOpen: boolean
  onClose: () => void
  ipId: string | null
  ipAddresses: IPAddress[]
}

export function UserIPDetailModal({ isOpen, onClose, ipId, ipAddresses }: UserIPDetailModalProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [ipData, setIpData] = useState<IPAddress | null>(null)
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false)
  const { releaseIP } = useDataCenterStore()

  useEffect(() => {
    if (ipId) {
      const ip = ipAddresses.find((ip) => ip.id === ipId) || null
      setIpData(ip)
    }
  }, [ipId, ipAddresses])

  if (!ipData) return null

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

  const handleReleaseIP = async () => {
    try {
      // 模擬API調用
      // 實際應用中，這裡應該調用真實的API
      // await fetch('/api/release-ip', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ipId: ipData.id })
      // });

      releaseIP(ipData.id)

      toast({
        title: "Success",
        description: "IP address has been released successfully",
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to release IP address. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{ipData.address}</DialogTitle>
          <DialogDescription>
            {ipData.subnet} - <Badge className={`${getStatusBadgeColor(ipData.status)}`}>{ipData.status}</Badge>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="network">Network Topology</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">IP Address</p>
                      <p>{ipData.address}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Subnet</p>
                      <p>{ipData.subnet}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gateway</p>
                      <p>{ipData.gateway || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge className={`${getStatusBadgeColor(ipData.status)}`}>{ipData.status}</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Association Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Device</p>
                      <p>{ipData.deviceName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Service</p>
                      <p>{ipData.serviceName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Updated</p>
                      <p>{ipData.lastUpdated || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {(ipData.status === "Assigned" || ipData.status === "Reserved") && !showReleaseConfirm && (
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={() => setShowReleaseConfirm(true)}>
                    Release IP
                  </Button>
                </div>
              )}

              {showReleaseConfirm && (
                <div className="mt-4 space-y-4">
                  <Alert variant="warning">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Are you sure you want to release this IP address? This will make it available for other devices
                      and remove all associations.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowReleaseConfirm(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleReleaseIP}>
                      Confirm Release
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="network">
            <div className="flex h-[200px] items-center justify-center bg-muted rounded-md">
              <div className="text-center text-muted-foreground">
                <div className="mb-2 text-lg font-medium">Network Topology</div>
                <div>Visual representation of the IP address in the network will be displayed here</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
