"use client"

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

interface SearchResultModalProps {
  isOpen: boolean
  onClose: () => void
  result: any | null
}

export function SearchResultModal({ isOpen, onClose, result }: SearchResultModalProps) {
  if (!result) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {result.type === "Device"
              ? result.name
              : result.type === "Rack"
                ? `Rack ${result.name}`
                : `IP ${result.address}`}
          </DialogTitle>
          <DialogDescription>
            {result.type === "Device"
              ? `${result.model} - ${result.location}`
              : result.type === "Rack"
                ? `${result.location} - ${result.usage} used`
                : `${result.subnet} - ${result.status}`}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            {result.type === "Device" && <TabsTrigger value="connections">Connections</TabsTrigger>}
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="rounded-md border p-4">
              {result.type === "Device" && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Name</div>
                    <div>{result.name}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Model</div>
                    <div>{result.model}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">IP Address</div>
                    <div>{result.ip}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Location</div>
                    <div>{result.location}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <div>{result.status}</div>
                  </div>
                </div>
              )}

              {result.type === "Rack" && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Name</div>
                    <div>{result.name}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Location</div>
                    <div>{result.location}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Usage</div>
                    <div>{result.usage}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Devices</div>
                    <div>{result.devices}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <div>{result.status}</div>
                  </div>
                </div>
              )}

              {result.type === "IP" && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">IP Address</div>
                    <div>{result.address}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Subnet</div>
                    <div>{result.subnet}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Device</div>
                    <div>{result.device || "-"}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <div>{result.status}</div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="location">
            <div className="rounded-md border p-4">
              <div className="flex h-[200px] items-center justify-center bg-muted">
                <div className="text-center text-muted-foreground">
                  {result.type === "Device" ? (
                    <div>
                      <div className="mb-2 text-lg font-medium">{result.location}</div>
                      <div>Visual representation of device location would appear here</div>
                    </div>
                  ) : result.type === "Rack" ? (
                    <div>
                      <div className="mb-2 text-lg font-medium">
                        {result.location} - {result.name}
                      </div>
                      <div>Visual representation of rack location would appear here</div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-2 text-lg font-medium">Network Topology</div>
                      <div>Visual representation of IP in network would appear here</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {result.type === "Device" && (
            <TabsContent value="connections">
              <div className="rounded-md border p-4">
                <div className="mb-4 text-sm">Connected devices and network interfaces</div>
                <div className="flex h-[200px] items-center justify-center bg-muted">
                  <div className="text-center text-muted-foreground">
                    <div>Network connection diagram would appear here</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
